import { describe, it, expect, vi, beforeEach } from 'vitest'
import { track, sanitizeProperties, WHITELISTED_EVENTS } from '@/core/tracking/track'
import { services } from '@/core/providers'

describe('TASK-P3-05: track() Analytics Abstraction', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('whitelists required spec events', () => {
    expect(WHITELISTED_EVENTS).toHaveProperty('role_selected')
    expect(WHITELISTED_EVENTS).toHaveProperty('demo_opened')
    expect(WHITELISTED_EVENTS).toHaveProperty('brief_started')
    expect(WHITELISTED_EVENTS).toHaveProperty('contact_submitted')
  })

  it('forwards whitelisted events and authorized properties to services.analytics', async () => {
    const trackSpy = vi.spyOn(services.analytics, 'trackEvent').mockResolvedValue(undefined)

    await track('role_selected', { role: 'founder', source: 'hero' })

    expect(trackSpy).toHaveBeenCalledWith('role_selected', {
      role: 'founder',
      source: 'hero',
    })
  })

  it('drops unauthorized and non-whitelisted property fields', async () => {
    const trackSpy = vi.spyOn(services.analytics, 'trackEvent').mockResolvedValue(undefined)

    await track('demo_opened', {
      demoId: 'hall-booking',
      slug: 'lagos-hall',
      maliciousField: 'exploit',
      randomData: 12345,
    })

    expect(trackSpy).toHaveBeenCalledWith('demo_opened', {
      demoId: 'hall-booking',
      slug: 'lagos-hall',
    })
  })

  it('strictly strips any PII properties (email, name, phone, password, etc.)', () => {
    const sanitized = sanitizeProperties('contact_submitted', {
      subject: 'Project inquiry',
      sourcePage: '/contact',
      email: 'user@example.com',
      name: 'John Doe',
      phone: '+234800000000',
      password: 'supersecretpassword',
    })

    expect(sanitized).toEqual({
      subject: 'Project inquiry',
      sourcePage: '/contact',
    })
    expect(sanitized).not.toHaveProperty('email')
    expect(sanitized).not.toHaveProperty('name')
    expect(sanitized).not.toHaveProperty('phone')
    expect(sanitized).not.toHaveProperty('password')
  })

  it('drops non-whitelisted event names without calling analytics provider', async () => {
    const trackSpy = vi.spyOn(services.analytics, 'trackEvent').mockResolvedValue(undefined)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // @ts-expect-error - testing invalid runtime event name
    await track('unauthorized_crypto_event', { amount: 1000 })

    expect(trackSpy).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalled()
  })

  it('executes in a non-blocking fashion and never throws even if provider fails', async () => {
    vi.spyOn(services.analytics, 'trackEvent').mockRejectedValue(new Error('Network offline'))
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await expect(track('brief_started', { step: 1 })).resolves.not.toThrow()
    expect(warnSpy).toHaveBeenCalled()
  })
})
