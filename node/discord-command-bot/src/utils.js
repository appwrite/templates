import { verifyKey } from 'discord-interactions';

/**
 * Throws an error if any of the keys are missing from the object
 * @param {*} obj
 * @param {string[]} keys
 * @throws {Error}
 */
export function throwIfMissing(obj, keys) {
  const missing = [];
  for (let key of keys) {
    if (!(key in obj) || !obj[key]) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * @param {*} req
 * @returns {Promise<boolean>}
 */
export async function verifyWebhookRequest(req) {
  return await verifyKey(
    req.bodyString,
    req.headers['x-signature-ed25519'],
    req.headers['x-signature-timestamp'],
    process.env.DISCORD_PUBLIC_KEY
  );
}
