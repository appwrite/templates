/**
 * Returns a date subtracted by the retention period from the current date.
 * The retention period is fetched from the RETENTION_PERIOD_DAYS environment variable.
 * Defaults to 30 days if the environment variable is not set or invalid.
 * @returns {Date} The calculated expiry date.
 */
export function getExpiryDate() {
  const retentionPeriod = Number(process.env.RETENTION_PERIOD_DAYS ?? 30);
  return new Date(
    Date.now() - retentionPeriod * 24 * 60 * 60 * 1000
  ).toISOString();
}

/**
 * Throws an error if any of the keys are missing from the object
 * @param {*} obj
 * @param {string[]} keys
 * @throws {Error}
 */
export function throwIfMissing(obj, keys) {
  const missing = [];
  for (let key of keys) {
    if (!(key in obj) || obj[key] == null || obj[key] == undefined) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}
