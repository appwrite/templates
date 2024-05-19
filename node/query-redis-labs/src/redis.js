import { createClient } from 'redis';
import { createHash } from 'node:crypto';

/**
 * Throws an error if any of the keys are missing from the object
 */
export async function getClient() {
    const { REDIS_PASSWORD, REDIS_HOST } = process.env;

   const client = createClient({
        password: REDIS_PASSWORD,
        socket: {
            host: REDIS_HOST,
            port: 14714
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

    const hash = createHash('md5').update(location).digest('hex');
    await client.hSet(`warehouses:${hash}`, {
        location,
        capacity
    });

    return hash;
}

/**
 * Get all details about a warehouse
 */
export async function getWarehouse(client, hash) {
    return await client.hGetAll(`warehouses:${hash}`);
}