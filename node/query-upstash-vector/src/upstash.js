import { Index } from "@upstash/vector"

/**
 * Throws an error if any of the keys are missing from the object
 */
export async function getIndex() {
    const { UPSTASH_URL, UPSTASH_TOKEN } = process.env;

    return new Index({
        url: UPSTASH_URL,
        token: UPSTASH_TOKEN
    });
}

/**
 * Insert a sample warehouse
 */
export async function insertTestData(index) {
    const categories = ['electronics', 'fashion', 'furniture', 'cars'];

    const category = categories[Math.floor(Math.random() * categories.length)]; // Random category
    const name = `Product #${Math.round(Math.random() * 1000)}`; // Random name
    const price = 10 + Math.round(Math.random() * 90); // Random number between 10 and 100

    // Generate ID as combination of time and randomness
    const id = `${new Date().getTime().toString(16)}${Math.round(Math.random() * 1000000000).toString(16)}`;

    await index.upsert({
        id,
        data: `product name ${name} in category ${category} priced at ${price}€`,
        metadata: {
            name,
            category,
            price
        },
    });
}

/**
 * Find related product to original
 */
export async function getRecommendedProduct(index, product) {
    return await index.query({
        data: product,
        topK: 1,
        includeVectors: true,
        includeMetadata: true,
    });
}