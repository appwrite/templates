import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

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

export function getStaticFile(fileName: string): string {
  return fs.readFileSync(path.join(staticFolder, fileName)).toString();
}

export function interpolate(template: string, values: Record<string, string | undefined>): string {
  return template.replace(/{{([^}]+)}}/g, (_, key) => values[key] || "");
}
