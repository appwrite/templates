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
 * Throws an error if any of the keys are missing from the object
 * @param {string} timestamp
 * @param {string} bodyRaw
 * @param {string} signature
 * @throws {Error}
 */
export function throwIfRequestNotVerified(timestamp, bodyRaw, signature){
  const sig_basestring = 'v0:' + timestamp + ':' + bodyRaw;
  const hmac = crypto.createHmac('sha256', process.env['SLACK_SIGNING_SECRET']);
  hmac.update(sig_basestring);
  const mySignature = 'v0=' + hmac.digest('hex');
  if(!mySignature === signature){
    throw new Error("Invalid Request : Signature Not Matched");
  }
};

/**
 * Throws an error if any of the keys are missing from the object
 * @param {string} timestamp
 * @param {string} bodyRaw
 * @param {string} signature
 * @throws {Error}
 */
export function throwIfReplayAttack(timestamp){
  if (Math.abs(Date.now() / 1000 - timestamp) > 60 * 5) {
    error('Replay Attack');
    throw new Error("Invalid Request : Replay Attack");
  }
};