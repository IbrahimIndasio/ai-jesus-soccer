import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
let limiter: Ratelimit | null = null;
export async function checkRateLimit(ip: string) {
  const url = process.env.UPSTASH_REDIS_REST_URL,
    token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return { success: true, reset: 0 };
  if (!limiter)
    limiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      prefix: "aij:prophecy",
      analytics: false,
    });
  try {
    return await limiter.limit(ip);
  } catch {
    throw new Error("Rate limit service unavailable");
  }
}
