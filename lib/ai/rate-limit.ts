import "server-only";

// Simple in-memory rate limiter — 10 req/min per IP per route (assignment requirement)
const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit = 10, windowMs = 60_000): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  // Fallback for local dev
  return "127.0.0.1";
}

// Cleanup old entries every 5 min to prevent memory leak
if (typeof globalThis !== "undefined" && !(globalThis as unknown as { __rateLimitCleanup?: boolean }).__rateLimitCleanup) {
  (globalThis as unknown as { __rateLimitCleanup: boolean }).__rateLimitCleanup = true;
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store.entries()) if (now > v.resetAt) store.delete(k);
  }, 5 * 60_000).unref?.();
}
