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

export function parseBody(req: any): Record<string, unknown> | null {
  // `req.bodyJson` throws when the body isn't valid JSON
  try {
    const body = req.bodyJson;
    return body && typeof body === 'object' && !Array.isArray(body)
      ? body
      : null;
  } catch {
    return null;
  }
}

export function parseTitle(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const title = value.trim();
  return title.length > 0 && title.length <= 255 ? title : null;
}

// IDs are decimal digits within the range of a Postgres `integer`
export function parseId(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }
  const id = Number(value);
  return id >= 1 && id <= 2147483647 ? id : null;
}
