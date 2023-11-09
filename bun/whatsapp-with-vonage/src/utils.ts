// Throws an error if any of the keys are missing from the object

export async function getStaticFiles(fileName: string) {
  const filePath = Bun.resolveSync(`../static/${fileName}`, import.meta.dir);
  const html = await Bun.file(filePath).text();
  return html;
}

//  Returns the contents of a file in the static folder

export function throwIfMissing(object: any, keys: string[]) {
  const missing: string[] = [];
  for (let key of keys) {
    if (!(key in object) || !object[key]) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Parameters are missing :${missing.join(", ")}`);
  }
}
