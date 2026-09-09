import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const requests = new Map<string, RateLimitEntry>();

function getHashedIdentifier(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function getRequestIdentifier() {
  const requestHeaders = await headers();

  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();
  const realIp = requestHeaders.get("x-real-ip");

  // In local development these headers may not exist. A stable fallback is
  // sufficient for this assignment branch; production can use a durable
  // provider-backed limiter if the feature is ever shipped at scale.
  const identifier = forwardedIp || realIp || "local-development";

  // Avoid retaining a raw IP address in memory.
  return getHashedIdentifier(identifier);
}

function pruneExpiredEntries(now: number) {
  for (const [key, entry] of requests) {
    if (entry.resetAt <= now) {
      requests.delete(key);
    }
  }
}

export async function checkAiCarRecommendationRateLimit() {
  const now = Date.now();
  pruneExpiredEntries(now);

  const key = await getRequestIdentifier();
  const current = requests.get(key);

  if (!current || current.resetAt <= now) {
    requests.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    return {
      allowed: true as const,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      retryAfterSeconds: 0,
    };
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false as const,
      remaining: 0,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((current.resetAt - now) / 1000),
      ),
    };
  }

  current.count += 1;

  return {
    allowed: true as const,
    remaining: MAX_REQUESTS_PER_WINDOW - current.count,
    retryAfterSeconds: 0,
  };
}
