import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'node:fs';

/**
 * Throws an error if any of the keys are missing from the object
 * @param {*} obj
 * @param {string[]} keys
 * @throws {Error}
 */
export function throwIfMissing(obj: Record<string, any>, keys: string[]) {
  const missing = [];
  for (let key of keys) {
    if (!(key in obj) || !obj[key]) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment vairables: ${missing.join(', ')}`
    );
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticFolder = path.join(__dirname, '../static');

/**
 * Returns the contents of a file in the static folder
 * @param {string} fileName
 * @returns {string} Contents of static/{fileName}
 */
export function getStaticFile(fileName: string) {
  return fs.readFileSync(path.join(staticFolder, fileName)).toString();
}