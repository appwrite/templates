/**
 *
 * @param {*} obj
 * @param {string[]} keys
 */
export function throwIfMissing(obj, keys) {
  for (let key of keys) {
    if (!(key in obj) || !obj[key]) {
      throw new Error(`Missing required value: ${key}`);
    }
  }
}
