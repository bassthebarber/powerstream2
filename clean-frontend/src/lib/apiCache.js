const memoryCache = new Map();

export async function cachedJsonFetch(url, options = {}, ttlMs = 10000) {
  const key = `${url}::${JSON.stringify(options || {})}`;
  const now = Date.now();
  const cached = memoryCache.get(key);
  if (cached && now - cached.time < ttlMs) return cached.value;

  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  memoryCache.set(key, { value: json, time: now });
  return json;
}

export function clearApiCache(prefix = "") {
  for (const key of memoryCache.keys()) {
    if (!prefix || key.startsWith(prefix)) memoryCache.delete(key);
  }
}
