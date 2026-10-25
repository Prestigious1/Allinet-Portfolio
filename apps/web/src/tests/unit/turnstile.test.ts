import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { verifyTurnstileToken } from '@/lib/turnstile'

describe('TASK-P3-04: verifyTurnstileToken', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('bypasses verification in non-production when TURNSTILE_SECRET_KEY is unconfigured', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')
    vi.stubEnv('NODE_ENV', 'development')

    const result = await verifyTurnstileToken('mock-token', '127.0.0.1')
    expect(result).toBe(true)
  })

  it('fails closed in production when TURNSTILE_SECRET_KEY is unconfigured', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')
    vi.stubEnv('NODE_ENV', 'production')

    const result = await verifyTurnstileToken('mock-token', '127.0.0.1')
    expect(result).toBe(false)
  })

  it('returns true when Cloudflare API responds with success: true', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '1x0000000000000000000000000000000AA')
    vi.stubEnv('NODE_ENV', 'production')

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await verifyTurnstileToken('valid-cf-token', '203.0.113.195')
    expect(result).toBe(true)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('returns false when Cloudflare API responds with success: false', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '1x0000000000000000000000000000000AA')
    vi.stubEnv('NODE_ENV', 'production')

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await verifyTurnstileToken('invalid-token', '203.0.113.195')
    expect(result).toBe(false)
  })

  it('returns false when network request fails', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '1x0000000000000000000000000000000AA')
    vi.stubEnv('NODE_ENV', 'production')

    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
    vi.stubGlobal('fetch', mockFetch)

    const result = await verifyTurnstileToken('token', '127.0.0.1')
    expect(result).toBe(false)
  })

  it('returns false when empty token provided with configured secret key', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '1x0000000000000000000000000000000AA')
    vi.stubEnv('NODE_ENV', 'production')

    const result = await verifyTurnstileToken('', '127.0.0.1')
    expect(result).toBe(false)
  })
})
