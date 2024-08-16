import { throwIfMissing } from "./utils.js";
import { getClient, getWarehouse, insertTestData } from "./redis.js";

/**
 * Global connection. Reused between executions
 */
let client;

export default async ({ req, res, log, error }) => {
    throwIfMissing(process.env, ['REDIS_HOST', 'REDIS_PASSWORD']);

    if(req.method !== 'GET') {
        return res.text('Not found.', 404);
    }

    if (!client) {
        client = await getClient();
    }

    const hash = await insertTestData(client);

    const warehouse = await getWarehouse(client, hash);

    return res.json(warehouse);
}