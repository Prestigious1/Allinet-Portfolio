import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

/**
 * TASK-P5-05: Role-Targeted Public Pages — route smoke tests
 *
 * Verifies each persona page:
 *  - exports correct metadata (title, description, unique h1 content)
 *  - renders without crashing
 *  - contains a single <h1>
 *  - contains the expected primary CTA id
 */

// Dynamic imports are resolved at test time (vitest handles ESM)
import RecruiterPage, { metadata as recruiterMeta } from '@/app/(site)/recruiter/page'
import ClientPage, { metadata as clientMeta } from '@/app/(site)/client/page'
import FounderPage, { metadata as founderMeta } from '@/app/(site)/founder/page'

describe('TASK-P5-05: Role-Targeted Public Pages', () => {
  // ──────────────────────────────── RECRUITER ────────────────────────────────
  describe('/recruiter page', () => {
    it('has unique metadata title', () => {
      expect(recruiterMeta.title).toBeTruthy()
      expect(String(recruiterMeta.title)).toContain('Senior Full-Stack')
    })

    it('has metadata description', () => {
      expect(recruiterMeta.description).toBeTruthy()
    })

    it('renders without crashing', () => {
      expect(() => render(React.createElement(RecruiterPage))).not.toThrow()
    })

    it('contains exactly one <h1>', () => {
      render(React.createElement(RecruiterPage))
      const headings = screen.getAllByRole('heading', { level: 1 })
      expect(headings).toHaveLength(1)
    })

    it('h1 contains "Systems Architect"', () => {
      render(React.createElement(RecruiterPage))
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1.textContent).toContain('Systems Architect')
    })

    it('primary CTA links to /cv (recruiter-cta-cv)', () => {
      render(React.createElement(RecruiterPage))
      const cta = document.getElementById('recruiter-cta-cv')
      expect(cta).not.toBeNull()
      expect(cta?.getAttribute('href')).toBe('/cv')
    })
  })

  // ──────────────────────────────── CLIENT ───────────────────────────────────
  describe('/client page', () => {
    it('has unique metadata title', () => {
      expect(clientMeta.title).toBeTruthy()
      expect(String(clientMeta.title)).not.toBe(String(recruiterMeta.title))
    })

    it('has metadata description', () => {
      expect(clientMeta.description).toBeTruthy()
    })

    it('renders without crashing', () => {
      expect(() => render(React.createElement(ClientPage))).not.toThrow()
    })

    it('contains exactly one <h1>', () => {
      render(React.createElement(ClientPage))
      const headings = screen.getAllByRole('heading', { level: 1 })
      expect(headings).toHaveLength(1)
    })

    it('h1 contains "Run Your Business"', () => {
      render(React.createElement(ClientPage))
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1.textContent).toContain('Run Your Business')
    })

    it('primary CTA links to /brief (client-cta-brief)', () => {
      render(React.createElement(ClientPage))
      const cta = document.getElementById('client-cta-brief')
      expect(cta).not.toBeNull()
      expect(cta?.getAttribute('href')).toBe('/brief')
    })
  })

  // ──────────────────────────────── FOUNDER ──────────────────────────────────
  describe('/founder page', () => {
    it('has unique metadata title', () => {
      expect(founderMeta.title).toBeTruthy()
      expect(String(founderMeta.title)).not.toBe(String(clientMeta.title))
    })

    it('has metadata description', () => {
      expect(founderMeta.description).toBeTruthy()
    })

    it('renders without crashing', () => {
      expect(() => render(React.createElement(FounderPage))).not.toThrow()
    })

    it('contains exactly one <h1>', () => {
      render(React.createElement(FounderPage))
      const headings = screen.getAllByRole('heading', { level: 1 })
      expect(headings).toHaveLength(1)
    })

    it('h1 contains "Scalable Product"', () => {
      render(React.createElement(FounderPage))
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1.textContent).toContain('Scalable Product')
    })

    it('primary CTA links to /brief (founder-cta-brief)', () => {
      render(React.createElement(FounderPage))
      const cta = document.getElementById('founder-cta-brief')
      expect(cta).not.toBeNull()
      expect(cta?.getAttribute('href')).toBe('/brief')
    })
  })
})
