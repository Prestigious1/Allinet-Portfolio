import { RateLimiterProvider, RateLimitConfig, RateLimitResult } from './RateLimiter'

export class UpstashRateLimiter implements RateLimiterProvider {
  private url: string
  private token: string

  constructor() {
    this.url = process.env.UPSTASH_REDIS_REST_URL || ''
    this.token = process.env.UPSTASH_REDIS_REST_TOKEN || ''
  }

  private isConfigured(): boolean {
    return Boolean(this.url && this.token)
  }

  async check(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    if (!this.isConfigured()) {
      // Fallback if not configured: allow requests
      return {
        success: true,
        remaining: config.limit,
        resetAt: Date.now() + config.windowMs,
      }
    }

    try {
      // Upstash REST API expects pipeline or single commands:
      // We will perform:
      // 1. MULTI
      // 2. INCRBY key 1
      // 3. TTL key
      // 4. EXEC
      // To make it simple and do it in one round-trip, we can send a pipeline request:
      // POST /pipeline
      const res = await fetch(`${this.url}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['INCR', key],
          ['TTL', key],
        ]),
      })

      if (!res.ok) {
        throw new Error(`Upstash API returned status: ${res.status}`)
      }

      const results = await res.json()
      
      // Upstash returns: [ { result: count }, { result: ttl } ]
      const count = Number(results[0]?.result)
      let ttl = Number(results[1]?.result)

      const now = Date.now()

      // If the key is new (ttl is -1 or -2), set expiration
      if (ttl < 0) {
        const expireSeconds = Math.ceil(config.windowMs / 1000)
        await fetch(`${this.url}/EXPIRE/${key}/${expireSeconds}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        ttl = expireSeconds
      }

      const resetAt = now + (ttl * 1000)

      if (count > config.limit) {
        return {
          success: false,
          remaining: 0,
          resetAt,
        }
      }

      return {
        success: true,
        remaining: Math.max(0, config.limit - count),
        resetAt,
      }
    } catch (err) {
      console.error('[UpstashRateLimiter] Error querying Redis, failing open:', err)
      return {
        success: true,
        remaining: 1,
        resetAt: Date.now() + config.windowMs,
      }
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
