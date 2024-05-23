import postgres from 'postgres';

/**
 * Throws an error if any of the keys are missing from the object
 */
export async function getClient() {
    const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

    return postgres({
        host: PGHOST,
        database: PGDATABASE,
        username: PGUSER,
        password: PGPASSWORD,
        port: 5432,
        ssl: 'require',
        connection: {
            options: `project=${ENDPOINT_ID}`,
        },
    });
}

/**
 * Ensure table of warehouses exist
 */
export async function prepareTables(client) {
    return await client`CREATE TABLE IF NOT EXISTS warehouses (
        id SERIAL PRIMARY KEY,
        location VARCHAR(255),
        capacity INT
    );`;
}

/**
 * Insert a sample warehouse
 */
export async function insertTestData(client) {
    const location = `Street ${Math.round(Math.random() * 1000)}, Earth`; // Random address
    const capacity = 10 + Math.round(Math.random() * 10) * 10; // Random number: 10,20,30,...,90,100
    await client`INSERT INTO warehouses (location, capacity) VALUES (${location}, ${capacity});`;
}

/**
 * Get all warehouses
 */
export async function listWarehouses(client, page = 1) {
    const limit = 100;
    return await client`SELECT * FROM warehouses LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
}