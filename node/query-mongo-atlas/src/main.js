import { throwIfMissing } from "./utils.js";
import { getClient, insertTestData, listWarehouses } from "./mongo.js";

/**
 * Global connection. Reused between executions
 */
let client;

export default async ({ req, res, log, error }) => {
    throwIfMissing(process.env, ['MONGO_URI']);

    if (!client) {
        client = await getClient();
    }

    await insertTestData(client);

    const warehouses = await listWarehouses(client);

    return res.json(warehouses);
}