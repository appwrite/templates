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
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Returns the contents of a file in the static folder
 */
export async function getStaticFile(fileName: string): Promise<string> {
    const staticFolder = "../static/"
    const filePath = new URL(fileName, `${import.meta.url}/../${staticFolder}`);
    try {
        const data = await Deno.readFile(filePath);
        return new TextDecoder().decode(data);
    } catch (error) {
        throw new Error(`Error reading file: ${error.message}`);
    }
}

export function interpolate(template: string, values: Record<string, string | undefined>) : string {
  return template.replace(/{{([^}]+)}}/g, (_, key) => values[key] || '');
}