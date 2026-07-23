/**
 * lib/rate-limit.ts
 *
 * In-memory IP-based rate limiter.
 * Works without any external dependencies (no Upstash needed for local dev).
 * In production, swap the underlying store for Upstash Redis for multi-instance support.
 */

interface RateLimitRecord {
  count: number
  windowStart: number
}

interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

const store = new Map<string, RateLimitRecord>()

/**
 * Check and increment a rate limit counter for a given key.
 * Returns { success, remaining, resetAt }
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const record = store.get(key)

  if (!record || now - record.windowStart > config.windowMs) {
    // New window
    store.set(key, { count: 1, windowStart: now })
    return {
      success: true,
      remaining: config.limit - 1,
      resetAt: now + config.windowMs,
    }
  }

  if (record.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: record.windowStart + config.windowMs,
    }
  }

  record.count++
  return {
    success: true,
    remaining: config.limit - record.count,
    resetAt: record.windowStart + config.windowMs,
  }
}

// ── Preset Rate Limiters ───────────────────────────────────────────────────

/** AI chat: 20 requests / minute per IP */
export const aiChatRateLimit = (ip: string) =>
  checkRateLimit(`rl:ai:${ip}`, { limit: 20, windowMs: 60_000 })

/** Contact form: 3 requests / hour per IP */
export const contactRateLimit = (ip: string) =>
  checkRateLimit(`rl:contact:${ip}`, { limit: 3, windowMs: 3_600_000 })

/** General API: 100 requests / minute per IP */
export const apiRateLimit = (ip: string) =>
  checkRateLimit(`rl:api:${ip}`, { limit: 100, windowMs: 60_000 })

/**
 * Extract the real client IP from Next.js request headers.
 * Falls back to 'unknown' if not available.
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

/**
 * Build rate limit response headers.
 */
export function rateLimitHeaders(remaining: number, resetAt: number): Record<string, string> {
  return {
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.floor(resetAt / 1000).toString(),
  }
}
