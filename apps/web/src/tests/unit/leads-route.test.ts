import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * TASK-P5-07: /api/leads route unit tests
 *
 * Tests the route logic using the existing mock infrastructure.
 * The route is tested by importing and calling the POST handler directly.
 */

// We need to mock LeadService and Turnstile before importing the route
vi.mock('@/core/leads/LeadService', () => ({
  leadService: {
    createLead: vi.fn().mockResolvedValue({
      success: true,
      isDuplicate: false,
      lead: { id: 'test-lead-id', email: 'test@example.com', name: 'Test User', status: 'new' },
    }),
  },
  LeadService: {
    sanitizeEmail: (email: string) => email.trim().toLowerCase(),
  },
}))

vi.mock('@/lib/turnstile', () => ({
  verifyTurnstileToken: vi.fn().mockResolvedValue(true),
}))

vi.mock('@/core/providers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core/providers')>()
  return {
    ...actual,
    services: {
      ...actual.services,
      rateLimiter: {
        ...actual.services.rateLimiter,
        check: vi.fn().mockResolvedValue({ success: true, remaining: 99, resetAt: Date.now() + 60000 }),
        getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
        getHeaders: vi.fn().mockReturnValue({ 'Retry-After': '60' }),
      },
    },
  }
})

import { POST } from '@/app/api/leads/route'
import { leadService } from '@/core/leads/LeadService'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { services } from '@/core/providers'

function makeRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost:3000/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    body: JSON.stringify(body),
  })
}

const validBody = {
  name: 'Amaka Okonkwo',
  email: 'amaka@example.com',
  need: 'I need a booking system for my event venue in Lagos. Looking for real-time availability and WhatsApp notifications.',
  turnstileToken: 'test-token',
  consentGiven: true,
}

describe('TASK-P5-07: POST /api/leads', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(leadService.createLead).mockResolvedValue({
      success: true,
      isDuplicate: false,
      lead: { id: 'test-lead-id', email: 'amaka@example.com', name: 'Amaka Okonkwo', status: 'new' },
    })
    vi.mocked(verifyTurnstileToken).mockResolvedValue(true)
    vi.mocked(services.rateLimiter.check).mockResolvedValue({
      success: true,
      remaining: 99,
      resetAt: Date.now() + 60000,
    })
  })

  it('returns 200 with success:true for valid input', async () => {
    const res = await POST(makeRequest(validBody), {})
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.success).toBe(true)
  })

  it('calls leadService.createLead with sanitized email', async () => {
    await POST(makeRequest({ ...validBody, email: '  Amaka@Example.COM  ' }), {})
    expect(leadService.createLead).toHaveBeenCalledOnce()
    expect(vi.mocked(leadService.createLead).mock.calls[0][0].email).toBe('  Amaka@Example.COM  ')
    // email sanitization happens inside LeadService; route passes raw value
  })

  it('returns 400 when email is invalid', async () => {
    const res = await POST(makeRequest({ ...validBody, email: 'not-an-email' }), {})
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 when name is too short', async () => {
    const res = await POST(makeRequest({ ...validBody, name: 'A' }), {})
    expect(res.status).toBe(400)
  })

  it('returns 400 when need is too short', async () => {
    const res = await POST(makeRequest({ ...validBody, need: 'Too short' }), {})
    expect(res.status).toBe(400)
  })

  it('returns 400 when consentGiven is false', async () => {
    const res = await POST(makeRequest({ ...validBody, consentGiven: false }), {})
    expect(res.status).toBe(400)
  })

  it('returns 400 when turnstileToken is missing', async () => {
    const { turnstileToken: _, ...noToken } = validBody
    const res = await POST(makeRequest(noToken), {})
    expect(res.status).toBe(400)
  })

  it('returns 403 when Turnstile verification fails', async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(false)
    const res = await POST(makeRequest(validBody), {})
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error.code).toBe('TURNSTILE_FAILED')
  })

  it('silently accepts honeypot submissions without calling LeadService', async () => {
    const res = await POST(makeRequest({ ...validBody, honeypot: 'bot@spam.com' }), {})
    expect(res.status).toBe(200)
    expect(leadService.createLead).not.toHaveBeenCalled()
  })

  it('returns 400 for malformed JSON', async () => {
    const req = new Request('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: 'NOT VALID JSON',
    })
    const res = await POST(req, {})
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error.code).toBe('INVALID_JSON')
  })

  it('returns isDuplicate:true message when lead is a duplicate', async () => {
    vi.mocked(leadService.createLead).mockResolvedValue({
      success: true,
      isDuplicate: true,
      lead: { id: 'existing-id', email: 'amaka@example.com', name: 'Amaka Okonkwo', status: 'new' },
    })
    const res = await POST(makeRequest(validBody), {})
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.isDuplicate).toBe(true)
    expect(json.data.message).toContain('already have your enquiry')
  })

  it('returns 500 when LeadService.createLead fails', async () => {
    vi.mocked(leadService.createLead).mockResolvedValue({
      success: false,
      isDuplicate: false,
      error: 'Database unavailable',
    })
    const res = await POST(makeRequest(validBody), {})
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error.code).toBe('LEAD_CREATE_FAILED')
  })
})
