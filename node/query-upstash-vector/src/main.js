import { throwIfMissing } from "./utils.js";
import { getIndex, getRecommendedProduct, insertTestData } from "./upstash.js";

/**
 * Global index connection. Reused between executions
 */
let index;

export default async ({ req, res, log, error }) => {
    throwIfMissing(process.env, [
        'UPSTASH_URL',
        'UPSTASH_TOKEN'
    ]);

    if(req.method !== 'GET') {
        return res.text('Not found.', 404);
    }

    if (!index) {
        index = await getIndex();
    }

    await insertTestData(index);

    const product = `product name Airpods in category electronics priced at 36€`;
    const recommended = await getRecommendedProduct(index, product);

    return res.json(recommended);
}