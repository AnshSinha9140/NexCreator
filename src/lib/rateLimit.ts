interface RateLimitEntry {
  timestamps: number[];
}

const globalWithRateLimit = global as typeof globalThis & {
  _rateLimitStore?: Map<string, RateLimitEntry>;
};

if (!globalWithRateLimit._rateLimitStore) {
  globalWithRateLimit._rateLimitStore = new Map();
}

export class RateLimiter {
  /**
   * Checks if an IP or action key has exceeded max requests in windowMs
   */
  public static check(
    key: string,
    maxRequests: number = 5,
    windowMs: number = 60000
  ): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
    const store = globalWithRateLimit._rateLimitStore!;
    const now = Date.now();
    const cutoff = now - windowMs;

    let entry = store.get(key);
    if (!entry) {
      entry = { timestamps: [] };
      store.set(key, entry);
    }

    // Prune timestamps outside current sliding window
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

    if (entry.timestamps.length >= maxRequests) {
      const oldestInWindow = entry.timestamps[0];
      const retryAfterSeconds = Math.ceil((oldestInWindow + windowMs - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, retryAfterSeconds),
      };
    }

    // Add current timestamp
    entry.timestamps.push(now);

    return {
      allowed: true,
      remaining: maxRequests - entry.timestamps.length,
      retryAfterSeconds: 0,
    };
  }

  /**
   * Extract client IP address from Next.js request headers
   */
  public static getClientIp(request: Request): string {
    const xForwardedFor = request.headers.get("x-forwarded-for");
    if (xForwardedFor) {
      return xForwardedFor.split(",")[0].trim();
    }
    const xRealIp = request.headers.get("x-real-ip");
    if (xRealIp) return xRealIp.trim();
    return "127.0.0.1";
  }
}
