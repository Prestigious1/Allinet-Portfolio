export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number // Timestamp in milliseconds
}

export interface RateLimitConfig {
  limit: number
  windowMs: number
}

export interface RateLimiterProvider {
  /**
   * Check and increment the rate limit for a given key.
   */
  check(key: string, config: RateLimitConfig): Promise<RateLimitResult>

  /**
   * Extract the client IP from a request.
   */
  getClientIp(req: Request): string

  /**
   * Build rate limit response headers.
   */
  getHeaders(remaining: number, resetAt: number): Record<string, string>
}
