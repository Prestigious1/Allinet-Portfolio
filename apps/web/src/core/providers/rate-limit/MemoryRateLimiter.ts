import { RateLimiterProvider, RateLimitConfig, RateLimitResult } from './RateLimiter'

interface RateLimitRecord {
  count: number
  windowStart: number
}

export class MemoryRateLimiter implements RateLimiterProvider {
  private store = new Map<string, RateLimitRecord>()

  async check(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now()
    const record = this.store.get(key)

    if (!record || now - record.windowStart > config.windowMs) {
      // New window
      this.store.set(key, { count: 1, windowStart: now })
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

  getClientIp(req: Request): string {
    return (
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown'
    )
  }

  getHeaders(remaining: number, resetAt: number): Record<string, string> {
    return {
      'X-RateLimit-Limit': 'true',
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': Math.floor(resetAt / 1000).toString(),
    }
  }
}
