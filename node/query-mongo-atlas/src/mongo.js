import { MongoClient, ServerApiVersion } from 'mongodb';

/**
 * Throws an error if any of the keys are missing from the object
 */
export async function getClient() {
    const client = new MongoClient(process.env.MONGO_URI, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    await client.connect();

    return client;
}

/**
 * Insert a sample warehouse
 */
export async function insertTestData(client) {
    const location = `Street ${Math.round(Math.random() * 1000)}, Earth`; // Random address
    const capacity = 10 + Math.round(Math.random() * 10) * 10; // Random number: 10,20,30,...,90,100

    await client.db("main").collection("warehouses").insertOne({
        location,
        capacity
    });
}

/**
 * Get all warehouses
 */
export async function listWarehouses(client, page = 1) {
    const limit = 100;
    const cursor = client.db("main").collection("warehouses").find().limit(limit).skip((page - 1) * limit);

    const documents = [];
    for await (const doc of cursor) {
        documents.push(doc);
    }

    return documents;
}