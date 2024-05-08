/**
 * Throws an error if any of the keys are missing from the object.
 */
export function throwIfMissing(obj: any, keys: string[]): void {
  const missing: string[] = [];
  for (let key of keys) {
    if (!(key in obj) || !obj[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}
