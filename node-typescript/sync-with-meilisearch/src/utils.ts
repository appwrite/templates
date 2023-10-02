import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

/**
 * Throws an error if any of the keys are missing from the object 
 */

export function throwIfMissing(obj: any, keys: string[]): void {
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticFolder = path.join(__dirname, "../static");

/** 
 * Returns the contents of a file in the static folder.
 */

export function getStaticFile(fileName: string): string {
  return fs.readFileSync(path.join(staticFolder, fileName)).toString();
}

/**
 *  Replaces all instances of {{key}} in the template with the value of the key in the values object.
 */

export function interpolate(template: string, values: Record<string, string | undefined>): string {
  return template.replace(/{{([^}]+)}}/g, (_, key) => values[key] || "");
}
