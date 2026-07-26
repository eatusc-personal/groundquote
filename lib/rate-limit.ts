type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();
const WINDOW_MS = 10 * 60 * 1_000;
const MAX_REQUESTS = 20;

export function checkRateLimit(key: string) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (current.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1_000),
    };
  }

  current.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - current.count };
}
