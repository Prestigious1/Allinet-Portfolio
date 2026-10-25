import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { POST as emailPost } from '@/app/api/email/route'
import { GET as memoryGet, POST as memoryPost } from '@/app/api/ai/memory/route'

describe('API Security Guards', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv, PAYLOAD_SECRET: 'test-payload-secret' }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('TASK-P3-01: /api/email', () => {
    it('returns 401 when called with no auth header', async () => {
      const req = new Request('http://localhost:3000/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'user@example.com', subject: 'Hi', body: 'Test' }),
      })

      const res = await emailPost(req)
      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 401 when called with invalid secret', async () => {
      const req = new Request('http://localhost:3000/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-secret': 'wrong-secret',
        },
        body: JSON.stringify({ to: 'user@example.com', subject: 'Hi', body: 'Test' }),
      })

      const res = await emailPost(req)
      expect(res.status).toBe(401)
    })
  })

  describe('TASK-P3-02: /api/ai/memory', () => {
    it('returns 401 on GET with no auth header', async () => {
      const req = new Request('http://localhost:3000/api/ai/memory', {
        method: 'GET',
      })

      const res = await memoryGet(req)
      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 401 on POST with no auth header', async () => {
      const req = new Request('http://localhost:3000/api/ai/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Important Fact', content: 'Some knowledge' }),
      })

      const res = await memoryPost(req)
      expect(res.status).toBe(401)
      const data = await res.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 401 on POST with invalid secret', async () => {
      const req = new Request('http://localhost:3000/api/ai/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-payload-secret': 'wrong-secret',
        },
        body: JSON.stringify({ title: 'Important Fact', content: 'Some knowledge' }),
      })

      const res = await memoryPost(req)
      expect(res.status).toBe(401)
    })
  })
})
