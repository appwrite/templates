import crypto from 'crypto';

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
 * Throws an error if incoming request is not valid
 * @param {*} req
 * @throws {Error}
 */
export function throwIfRequestNotValid(req) {
  const timestamp = req.headers['x-slack-request-timestamp'];
  const signature = req.headers['x-slack-signature'];

  if (Math.abs(Date.now() / 1000 - timestamp) > 60 * 5) {
    throw new Error('Invalid request: replay attack');
  }

  const signatureBaseString = `v0:${timestamp}:${req.bodyText}`;
  const hmac = crypto.createHmac('sha256', process.env['SLACK_SIGNING_SECRET']);
  hmac.update(signatureBaseString);

  const expectedSignature = `v0=${hmac.digest('hex')}`;
  if (expectedSignature !== signature) {
    throw new Error('Invalid request: incorrect signature');
  }
}
