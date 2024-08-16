import { throwIfMissing } from "./utils.js";
import { getClient, insertTestData, listWarehouses, prepareTables } from "./neon.js";

/**
 * Global connection. Reused between executions
 */
let client;

/**
 * Global cache to improve performance. Skip preparations if not needed
 */
let schemaPrepared = false;

export default async ({ req, res, log, error }) => {
    throwIfMissing(process.env, [
        'PGHOST',
        'PGDATABASE',
        'PGUSER',
        'PGPASSWORD',
        'ENDPOINT_ID'
    ]);

    if(req.method !== 'GET') {
        return res.text('Not found.', 404);
    }

    if (!client) {
        client = await getClient();
    }

    if (!schemaPrepared) {
        await prepareTables(client);
        schemaPrepared = true;
    }

    await insertTestData(client);

    const warehouses = await listWarehouses(client);

    return res.json(warehouses);
}