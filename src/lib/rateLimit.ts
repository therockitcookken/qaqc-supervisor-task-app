const map = new Map<string, { count: number; ts: number }>();
export function hit(key: string, max = 20, windowMs = 60000) {
  const now = Date.now();
  const cur = map.get(key);
  if (!cur || now - cur.ts > windowMs) {
    map.set(key, { count: 1, ts: now });
    return true;
  }
  if (cur.count >= max) return false;
  cur.count += 1;
  return true;
}
