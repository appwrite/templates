/**
 * Calculate and return the expiry date based on the retention period.
 * @returns {Date} The calculated expiry date.
 */
export function getExpiryDate() {
  const retentionPeriod = +(process.env.RETENTION_PERIOD_DAYS ?? 30);
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() - retentionPeriod);
  return expiryDate;
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
    // using obj[key] != 0 for case when the value of key will be 0
    if (!(key in obj) || (!obj[key] && obj[key] != 0)) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}
