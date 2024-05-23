import * as neo4j from 'neo4j-driver';

/**
 * Throws an error if any of the keys are missing from the object
 */
export async function getClient() {
    const { NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD } = process.env;
    return neo4j.default.driver(NEO4J_URI, neo4j.default.auth.basic(NEO4J_USER, NEO4J_PASSWORD))
}

/**
 * Insert a sample warehouse
 */
export async function insertTestData(client) {
    const categories = [ 'electronics', 'fashion', 'furniture', 'cars' ];

    const category = categories[Math.floor(Math.random() * categories.length)]; // Random category
    const location = `Street ${Math.round(Math.random() * 1000)}, Earth`; // Random address
    const capacity = 10 + Math.round(Math.random() * 10) * 10; // Random number: 10,20,30,...,90,100

    await client.executeQuery(
        `
            MERGE (c:Category {name: $category})
            CREATE (w:Warehouse {location: $location, capacity: $capacity})
            CREATE (w)-[:STORES]->(c)
        `,
        { location, capacity, category },
        { database: 'neo4j' }
    );
}

/**
 * Get all warehouses
 */
export async function listWarehouses(client, page = 1) {
    const limit = 100;
    const offset = (page - 1) * limit;

    return await client.executeQuery(
        `
            MATCH (w:Warehouse)-[:STORES]->(c:Category)
            RETURN w, c
            SKIP $offset
            LIMIT $limit
        `,
        {
            limit: neo4j.default.int(limit),
            offset: neo4j.default.int(offset)
        },
        { database: 'neo4j' }
    );
}