import { describe, it, expect } from 'vitest'
import { contactSchema, analyticsSchema, chatSchema } from '@/lib/validation'

describe('Validation Schemas (lib/validation.ts)', () => {
  describe('contactSchema', () => {
    it('validates a valid contact form submission', () => {
      const valid = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Project Inquiry',
        message: 'Hello, I would like to discuss building an event command center.',
      }
      const result = contactSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('rejects short names or invalid emails', () => {
      const invalid = {
        name: 'A',
        email: 'not-an-email',
        subject: 'Hey',
        message: 'Too short',
      }
      const result = contactSchema.safeParse(invalid)
      expect(result.success).toBe(false)
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors
        expect(errors.name).toBeDefined()
        expect(errors.email).toBeDefined()
        expect(errors.subject).toBeDefined()
        expect(errors.message).toBeDefined()
      }
    })

    it('rejects submissions with anti-spam honeypot filled', () => {
      const botSubmission = {
        name: 'Spam Bot',
        email: 'bot@spam.com',
        subject: 'Buy Cheap Watches',
        message: 'This is a long spam message exceeding twenty characters easily.',
        honeypot: 'filled_by_bot',
      }
      const result = contactSchema.safeParse(botSubmission)
      expect(result.success).toBe(false)
    })
  })

  describe('analyticsSchema', () => {
    it('validates standard analytics telemetry payload', () => {
      const payload = {
        event: 'app_opened',
        path: '/os',
        appId: 'projects',
        data: { duration: 120 },
      }
      const result = analyticsSchema.safeParse(payload)
      expect(result.success).toBe(true)
    })

    it('rejects empty event names', () => {
      const payload = {
        event: '',
      }
      const result = analyticsSchema.safeParse(payload)
      expect(result.success).toBe(false)
    })
  })

  describe('chatSchema', () => {
    it('validates structured AI chat input', () => {
      const chatInput = {
        messages: [
          { role: 'user', content: 'What is your experience with Next.js?' },
        ],
        sessionId: 'test-session-123',
      }
      const result = chatSchema.safeParse(chatInput)
      expect(result.success).toBe(true)
    })

    it('rejects empty message lists or invalid roles', () => {
      const invalid = {
        messages: [],
      }
      const result = chatSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })
})
