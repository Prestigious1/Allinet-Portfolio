import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, checkSystemHealth } from '@/app/api/health/route'
import { services } from '@/core/providers'

describe('TASK-P6-03: /api/health System Diagnostic Route', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns HTTP 200 with healthy status and core diagnostic fields', async () => {
    const req = new Request('http://localhost:3000/api/health', {
      headers: { 'x-forwarded-for': '127.0.0.1' },
    })

    const res = await GET(req, {})
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.status).toBe('healthy')
    expect(typeof json.timestamp).toBe('string')
    expect(typeof json.uptimeSeconds).toBe('number')
    expect(json.services).toBeDefined()
    expect(json.services.database).toBeDefined()
    expect(json.services.cms).toBeDefined()
    expect(json.services.aiGateway).toBeDefined()
    expect(json.services.github).toBeDefined()
  }, 15000)

  it('sets 60s cache headers and serves from cache on subsequent calls', async () => {
    const req = new Request('http://localhost:3000/api/health', {
      headers: { 'x-forwarded-for': '127.0.0.1' },
    })

    const res = await GET(req, {})
    expect(res.headers.get('Cache-Control')).toContain('max-age=60')

    const second = await checkSystemHealth(false)
    expect(second.cached).toBe(true)
  })

  it('never outputs secrets or sensitive credentials in response', async () => {
    const data = await checkSystemHealth(true)
    const rawString = JSON.stringify(data)

    // Ensure no secret substrings or token formats are present
    expect(rawString).not.toMatch(/sk-[a-zA-Z0-9]{20,}/)
    expect(rawString).not.toContain(process.env.RESEND_API_KEY || 'MISSING_KEY_CHECK')
    expect(rawString).not.toContain(process.env.TURNSTILE_SECRET_KEY || 'MISSING_SECRET_CHECK')
  })

  it('reports database status and latency measurement', async () => {
    const data = await checkSystemHealth(true)
    expect(['connected', 'mock', 'degraded']).toContain(data.services.database.status)
    expect(typeof data.services.database.latencyMs).toBe('number')
  })
})
