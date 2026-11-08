import { createClient } from 'redis';
import { createHash } from 'node:crypto';
import { isIP } from 'node:net';

/**
 * Throws an error if any of the keys are missing from the object
 */
export async function getClient() {
    const { REDIS_PASSWORD, REDIS_HOST, REDIS_PORT, REDIS_URL } = process.env;

    if (REDIS_URL) {
        const client = createClient({
            url: REDIS_URL,
        });

        await client.connect();

        return client;
    }

    let host = REDIS_HOST;
    let port = REDIS_PORT ? parseInt(REDIS_PORT, 10) : 6379;

    if (host) {
        if (isIP(host) === 6) {
            // Bare IPv6 address, keep host intact without extracting port
        } else if (host.startsWith('[')) {
            const match = host.match(/^\[([^\]]+)\](?::(\d+))?$/);
            if (match) {
                host = match[1];
                if (!REDIS_PORT && match[2]) {
                    port = parseInt(match[2], 10);
                }
            }
        } else {
            const match = host.match(/^([^:]+):(\d+)$/);
            if (match) {
                host = match[1];
                if (!REDIS_PORT && match[2]) {
                    port = parseInt(match[2], 10);
                }
            }
        }
    }

    const client = createClient({
        password: REDIS_PASSWORD,
        socket: {
            host,
            port,
        },
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