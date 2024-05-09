import { Env } from "bun";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

/**
 * Throws an error if any of the keys are missing from the object
 */
export function throwIfMissing(obj: Env, keys: string[]) {
  const missing = [];
  for (let key of keys) {
    if (!(key in obj) || !obj[key]) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticFolder = join(__dirname, "../static");

/**
 * Returns the contents of a file in the static folder
 */
export async function getStaticFile(fileName: string): Promise<string> {
  return await Bun.file(join(staticFolder, fileName)).text();
}

/**
 * Inserts the values into the template
 */
export function interpolate(
  template: string,
  values: Record<string, string | undefined>,
): string {
  return template.replace(/{{([^}]+)}}/g, (_, key) => values[key] || "");
}
