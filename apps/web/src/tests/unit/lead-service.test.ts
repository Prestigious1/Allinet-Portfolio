import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LeadService, leadService } from '@/core/leads/LeadService'
import { services } from '@/core/providers'

describe('TASK-P4-07: LeadService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('sanitizes email address by trimming and lowercasing', () => {
    expect(LeadService.sanitizeEmail('  Test.User+Tag@EXAMPLE.COM  ')).toBe('test.user+tag@example.com')
  })

  it('creates a new lead and sends notification email', async () => {
    const mockLead = {
      id: 'lead-123',
      name: 'Ada Lovelace',
      email: 'ada@analytical.dev',
      company: 'Babbage Systems',
      status: 'new' as const,
      createdAt: new Date().toISOString(),
    }

    vi.spyOn(services.db, 'query').mockResolvedValue({ data: [], error: null })
    const insertSpy = vi.spyOn(services.db, 'insert').mockResolvedValue({ data: mockLead, error: null })
    const emailSpy = vi.spyOn(services.email, 'send').mockResolvedValue({ success: true, error: null })

    const result = await leadService.createLead({
      name: 'Ada Lovelace',
      email: '  ADA@ANALYTICAL.DEV  ',
      company: 'Babbage Systems',
      need: 'Building the Analytical Engine frontend',
      budgetRange: '$50k+',
    })

    expect(result.success).toBe(true)
    expect(result.isDuplicate).toBe(false)
    expect(result.lead?.email).toBe('ada@analytical.dev')
    expect(insertSpy).toHaveBeenCalledTimes(1)
    expect(emailSpy).toHaveBeenCalledTimes(1)
  })

  it('deduplicates submissions from same email within 24 hours', async () => {
    const existingLead = {
      id: 'existing-123',
      name: 'Alan Turing',
      email: 'alan@bletchley.gov',
      status: 'new' as const,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    }

    vi.spyOn(services.db, 'query').mockResolvedValue({ data: [existingLead], error: null })
    const insertSpy = vi.spyOn(services.db, 'insert')
    const emailSpy = vi.spyOn(services.email, 'send')

    const result = await leadService.createLead({
      name: 'Alan Turing',
      email: 'alan@bletchley.gov',
      company: 'Bletchley Park',
    })

    expect(result.success).toBe(true)
    expect(result.isDuplicate).toBe(true)
    expect(result.lead?.id).toBe('existing-123')
    expect(insertSpy).not.toHaveBeenCalled()
    expect(emailSpy).not.toHaveBeenCalled()
  })

  it('does not throw when notification email dispatch fails', async () => {
    const mockLead = {
      id: 'lead-456',
      name: 'Grace Hopper',
      email: 'grace@navy.mil',
      status: 'new' as const,
      createdAt: new Date().toISOString(),
    }

    vi.spyOn(services.db, 'query').mockResolvedValue({ data: [], error: null })
    vi.spyOn(services.db, 'insert').mockResolvedValue({ data: mockLead, error: null })
    vi.spyOn(services.email, 'send').mockRejectedValue(new Error('Resend API key missing'))
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const result = await leadService.createLead({
      name: 'Grace Hopper',
      email: 'grace@navy.mil',
    })

    expect(result.success).toBe(true)
    expect(result.lead?.id).toBe('lead-456')
    expect(warnSpy).toHaveBeenCalled()
  })
})
