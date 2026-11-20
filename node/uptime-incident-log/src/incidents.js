const COLUMNS = [
  { key: 'monitorId', type: 'varchar', size: 36, required: true },
  { key: 'name', type: 'varchar', size: 128, required: true },
  { key: 'type', type: 'varchar', size: 16, required: true },
  { key: 'status', type: 'varchar', size: 16, required: true },
  { key: 'severity', type: 'varchar', size: 16, required: false },
  { key: 'result', type: 'varchar', size: 64, required: false },
  { key: 'startedAt', type: 'datetime', required: true },
  { key: 'resolvedAt', type: 'datetime', required: false },
  { key: 'downtimeSeconds', type: 'integer', required: false },
];

async function ignoreConflict(promise) {
  try {
    return await promise;
  } catch (err) {
    if (err.code !== 409) {
      throw err;
    }
  }
}

/**
 * Creates the database and the incidents table on the first alert.
 */
export async function ensureTable(tablesDB, databaseId, tableId) {
  try {
    await tablesDB.getTable({ databaseId, tableId });
    return;
  } catch (err) {
    if (err.code !== 404) {
      throw err;
    }
  }

  await ignoreConflict(tablesDB.create({ databaseId, name: 'Status' }));
  await ignoreConflict(
    tablesDB.createTable({
      databaseId,
      tableId,
      name: 'Incidents',
      columns: COLUMNS,
    })
  );
}

/**
 * Keeps one row per alert, under the alert's ID, so a repeated event updates
 * the same incident instead of opening another.
 */
export async function recordIncident(tablesDB, databaseId, tableId, alert) {
  const rowId = alert.$id;
  const data = {
    monitorId: alert.monitorId,
    name: alert.name,
    type: alert.type,
    severity: alert.severity ?? null,
    result: alert.result ?? null,
    startedAt: alert.$createdAt,
  };

  if (alert.status === 'resolved') {
    const downtime = Math.round(
      (new Date(alert.resolvedAt) - new Date(alert.$createdAt)) / 1000
    );
    return tablesDB.upsertRow({
      databaseId,
      tableId,
      rowId,
      data: {
        ...data,
        status: 'resolved',
        resolvedAt: alert.resolvedAt,
        downtimeSeconds: Math.max(0, downtime),
      },
    });
  }

  // A late or repeated firing event must not reopen a resolved incident.
  const created = await ignoreConflict(
    tablesDB.createRow({
      databaseId,
      tableId,
      rowId,
      data: { ...data, status: 'firing' },
    })
  );
  return created ?? tablesDB.getRow({ databaseId, tableId, rowId });
}
