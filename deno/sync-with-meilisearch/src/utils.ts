/**
 * Throws an error if any of the keys are missing from the object
 */
export function throwIfMissing(obj: any, keys: string[]) {
  const missing: string[] = [];
  for (let key of keys) {
    if (!(key in obj) || !obj[key]) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }
}

/**
 * Returns the contents of a file in the static folder
 */
export function getStaticFile(fileName: string): string {
  return Deno.readTextFileSync(
    new URL(import.meta.resolve(`../static/${fileName}`)),
  );
}

/**
 * Returns the template with the values interpolated.
 */
export function interpolate(
  template: string,
  values: Record<string, string | undefined>,
): string {
  return template.replace(/{{([^}]+)}}/g, (_, key) => values[key] || "");
}
