import { Client, Messaging, TablesDB } from 'node-appwrite';
import { ensureTable, recordIncident } from './incidents.js';
import { notifySubscribers } from './notify.js';

const PROBES = ['http', 'dns', 'tcp', 'smtp'];

export default async ({ req, res, log }) => {
  // Only alert events carry a real alert. Refuse HTTP calls, which anyone
  // who can reach the function's domain could forge.
  if (req.headers['x-appwrite-trigger'] !== 'event') {
    return res.json(
      { ok: false, message: 'Only alert events trigger this function.' },
      403
    );
  }

  const alert = req.bodyJson;

  if (
    !PROBES.includes(alert?.type) ||
    !['firing', 'resolved'].includes(alert.status)
  ) {
    log('Ignored: not a firing or resolved uptime alert.');
    return res.json({ recorded: false });
  }

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key']);

  const tablesDB = new TablesDB(client);
  const databaseId = process.env.APPWRITE_DATABASE_ID || 'status';
  const tableId = process.env.APPWRITE_TABLE_ID || 'incidents';

  await ensureTable(tablesDB, databaseId, tableId);
  const incident = await recordIncident(tablesDB, databaseId, tableId, alert);
  log(`Incident ${incident.$id} for "${alert.name}" is ${incident.status}.`);

  const topicId = process.env.MESSAGING_TOPIC_ID;
  const sent = topicId
    ? await notifySubscribers(new Messaging(client), topicId, alert, incident)
    : [];
  if (sent.length > 0) {
    log(`Notified topic ${topicId} by ${sent.join(', ')}.`);
  }

  return res.json({ recorded: true, incident: incident.$id, notified: sent });
};
