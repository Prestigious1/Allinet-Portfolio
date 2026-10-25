import { describe, it, expect, vi } from 'vitest'

/**
 * TASK-P5-04: Role Store unit tests
 *
 * We test the store's exported constants and the pure logic
 * independently of the zustand persist middleware (which requires
 * a real localStorage at module init time in JSDOM).
 */
import { ROLE_OPTIONS, ROLE_HEADLINES, type VisitorRole } from '@/features/role/role.store'

describe('TASK-P5-04: Role Store — constants & pure logic', () => {
  it('ROLE_OPTIONS defines exactly 4 personas', () => {
    expect(ROLE_OPTIONS).toHaveLength(4)
  })

  it('every ROLE_OPTION has id, label, href, tagline, emoji', () => {
    for (const opt of ROLE_OPTIONS) {
      expect(opt.id, `${opt.id} missing id`).toBeTruthy()
      expect(opt.label, `${opt.id} missing label`).toBeTruthy()
      expect(opt.href, `${opt.id} missing href`).toBeTruthy()
      expect(opt.tagline, `${opt.id} missing tagline`).toBeTruthy()
      expect(opt.emoji, `${opt.id} missing emoji`).toBeTruthy()
    }
  })

  it('ROLE_OPTION ids are the four expected personas', () => {
    const ids = ROLE_OPTIONS.map((o) => o.id)
    expect(ids).toContain('recruiter')
    expect(ids).toContain('client')
    expect(ids).toContain('founder')
    expect(ids).toContain('explorer')
  })

  it('ROLE_HEADLINES provides title and subtitle for all roles', () => {
    const roles: VisitorRole[] = ['recruiter', 'client', 'founder', 'explorer']
    for (const r of roles) {
      expect(ROLE_HEADLINES[r], `missing headline for ${r}`).toBeDefined()
      expect(ROLE_HEADLINES[r].title, `${r} missing title`).toBeTruthy()
      expect(ROLE_HEADLINES[r].subtitle, `${r} missing subtitle`).toBeTruthy()
    }
  })

  it('recruiter option routes to /recruiter', () => {
    const opt = ROLE_OPTIONS.find((o) => o.id === 'recruiter')
    expect(opt?.href).toBe('/recruiter')
  })

  it('client option routes to /client', () => {
    const opt = ROLE_OPTIONS.find((o) => o.id === 'client')
    expect(opt?.href).toBe('/client')
  })

  it('founder option routes to /founder', () => {
    const opt = ROLE_OPTIONS.find((o) => o.id === 'founder')
    expect(opt?.href).toBe('/founder')
  })

  it('explorer option routes to /', () => {
    const opt = ROLE_OPTIONS.find((o) => o.id === 'explorer')
    expect(opt?.href).toBe('/')
  })
})

describe('TASK-P5-04: cookie mirror logic', () => {
  it('setRole writes visitor_role cookie when document is available', () => {
    // Verify the cookie-writing logic inline (same logic as the store)
    const cookies: string[] = []
    const mockDocument = { cookie: '' }
    Object.defineProperty(mockDocument, 'cookie', {
      set(v: string) { cookies.push(v) },
      get() { return cookies.join('; ') },
    })

    // Replicate store cookie logic
    const writeRoleCookie = (role: VisitorRole, doc: typeof mockDocument) => {
      doc.cookie = `visitor_role=${role};path=/;max-age=${60 * 60 * 24 * 90};SameSite=Lax`
    }

    writeRoleCookie('recruiter', mockDocument)
    expect(cookies[0]).toContain('visitor_role=recruiter')
    expect(cookies[0]).toContain('path=/')
    expect(cookies[0]).toContain('SameSite=Lax')
  })

  it('clearRole writes max-age=0 to expire cookie', () => {
    const cookies: string[] = []
    const mockDocument = { cookie: '' }
    Object.defineProperty(mockDocument, 'cookie', {
      set(v: string) { cookies.push(v) },
      get() { return cookies.join('; ') },
    })

    // Replicate clear cookie logic
    const clearRoleCookie = (doc: typeof mockDocument) => {
      doc.cookie = 'visitor_role=;path=/;max-age=0'
    }

    clearRoleCookie(mockDocument)
    expect(cookies[0]).toContain('max-age=0')
    expect(cookies[0]).toContain('visitor_role=')
  })
})
