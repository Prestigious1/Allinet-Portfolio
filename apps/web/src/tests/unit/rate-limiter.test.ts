import { describe, it, expect, beforeEach } from 'vitest'
import { withApiMiddleware, RATE_LIMIT_POLICIES } from '@/core/api/middleware'
import { MemoryRateLimiter } from '@/core/providers/rate-limit/MemoryRateLimiter'
import { NextResponse } from 'next/server'

describe('TASK-P3-03: Distributed Rate Limiting & Policies', () => {
  let rateLimiter: MemoryRateLimiter

  beforeEach(() => {
    rateLimiter = new MemoryRateLimiter()
  })

  it('exposes standard rate limiting policies matching specification', () => {
    expect(RATE_LIMIT_POLICIES.chat).toEqual({ limit: 20, windowMs: 60000 })
    expect(RATE_LIMIT_POLICIES.contact).toEqual({ limit: 5, windowMs: 600000 })
    expect(RATE_LIMIT_POLICIES.leads).toEqual({ limit: 5, windowMs: 600000 })
    expect(RATE_LIMIT_POLICIES.analytics).toEqual({ limit: 60, windowMs: 60000 })
  })

  it('allows requests within threshold and decrements remaining', async () => {
    const res1 = await rateLimiter.check('test-ip', { limit: 3, windowMs: 60000 })
    expect(res1.success).toBe(true)
    expect(res1.remaining).toBe(2)

    const res2 = await rateLimiter.check('test-ip', { limit: 3, windowMs: 60000 })
    expect(res2.success).toBe(true)
    expect(res2.remaining).toBe(1)

    const res3 = await rateLimiter.check('test-ip', { limit: 3, windowMs: 60000 })
    expect(res3.success).toBe(true)
    expect(res3.remaining).toBe(0)
  })

  it('rejects requests exceeding threshold with success: false', async () => {
    const config = { limit: 2, windowMs: 60000 }
    await rateLimiter.check('blocked-ip', config)
    await rateLimiter.check('blocked-ip', config)

    const blocked = await rateLimiter.check('blocked-ip', config)
    expect(blocked.success).toBe(false)
    expect(blocked.remaining).toBe(0)
    expect(blocked.resetAt).toBeGreaterThan(Date.now())
  })

  it('produces Retry-After, X-RateLimit-Remaining, and X-RateLimit-Reset headers', () => {
    const resetAt = Date.now() + 30000
    const headers = rateLimiter.getHeaders(0, resetAt)

    expect(headers['X-RateLimit-Remaining']).toBe('0')
    expect(headers['X-RateLimit-Reset']).toBeDefined()
    expect(headers['Retry-After']).toBeDefined()
    expect(Number(headers['Retry-After'])).toBeGreaterThanOrEqual(1)
  })

  it('middleware returns 429 Too Many Requests when rate limit is exceeded', async () => {
    const handler = withApiMiddleware(
      {
        rateLimitKey: 'test-limit-endpoint',
        rateLimitConfig: { limit: 2, windowMs: 60000 },
      },
      async () => NextResponse.json({ ok: true })
    )

    const makeReq = () =>
      new Request('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': '198.51.100.42' },
      })

    const res1 = await handler(makeReq(), {})
    expect(res1.status).toBe(200)

    const res2 = await handler(makeReq(), {})
    expect(res2.status).toBe(200)

    const res3 = await handler(makeReq(), {})
    expect(res3.status).toBe(429)
    expect(res3.headers.get('Retry-After')).toBeDefined()
    const json = await res3.json()
    expect(json.error).toBe('Too Many Requests')
  })
})
