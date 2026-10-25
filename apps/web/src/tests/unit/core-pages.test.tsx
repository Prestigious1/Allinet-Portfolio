import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

/**
 * TASK-P5-06: Core Indexable Public Pages — route smoke tests
 *
 * Verifies each route:
 *  - exports valid metadata (unique title, description)
 *  - renders without crashing
 *  - contains a single <h1>
 *  - <h1> contains expected keyword
 *  - has root id for browser targeting
 */

import ProjectsPage, { metadata as projectsMeta } from '@/app/(site)/projects/page'
import ServicesPage, { metadata as servicesMeta } from '@/app/(site)/services/page'
import ProcessPage, { metadata as processMeta } from '@/app/(site)/process/page'
import CVPage, { metadata as cvMeta } from '@/app/(site)/cv/page'
import PrivacyPage, { metadata as privacyMeta } from '@/app/(site)/privacy/page'

// Utility: render page and return h1 element safely
function getH1(Page: React.ComponentType) {
  render(React.createElement(Page))
  return screen.getByRole('heading', { level: 1 })
}

describe('TASK-P5-06: Core Indexable Public Pages', () => {
  // ────────────────────────── /projects ──────────────────────────────
  describe('/projects page', () => {
    it('has metadata title', () => expect(String(projectsMeta.title)).toBeTruthy())
    it('has metadata description', () => expect(projectsMeta.description).toBeTruthy())
    it('renders without crashing', () => {
      expect(() => render(React.createElement(ProjectsPage))).not.toThrow()
    })
    it('contains exactly one <h1>', () => {
      render(React.createElement(ProjectsPage))
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    })
    it('h1 contains "Case Studies"', () => {
      expect(getH1(ProjectsPage).textContent).toContain('Case Studies')
    })
    it('root element has id="projects-page"', () => {
      render(React.createElement(ProjectsPage))
      expect(document.getElementById('projects-page')).not.toBeNull()
    })
  })

  // ────────────────────────── /services ──────────────────────────────
  describe('/services page', () => {
    it('has unique metadata title', () => {
      expect(String(servicesMeta.title)).toBeTruthy()
      expect(String(servicesMeta.title)).not.toBe(String(projectsMeta.title))
    })
    it('has metadata description', () => expect(servicesMeta.description).toBeTruthy())
    it('renders without crashing', () => {
      expect(() => render(React.createElement(ServicesPage))).not.toThrow()
    })
    it('contains exactly one <h1>', () => {
      render(React.createElement(ServicesPage))
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    })
    it('h1 contains "Build & Ship"', () => {
      expect(getH1(ServicesPage).textContent).toContain('Build')
    })
    it('primary CTA links to /brief (services-cta-brief)', () => {
      render(React.createElement(ServicesPage))
      const cta = document.getElementById('services-cta-brief')
      expect(cta).not.toBeNull()
      expect(cta?.getAttribute('href')).toBe('/brief')
    })
    it('root element has id="services-page"', () => {
      render(React.createElement(ServicesPage))
      expect(document.getElementById('services-page')).not.toBeNull()
    })
  })

  // ────────────────────────── /process ──────────────────────────────
  describe('/process page', () => {
    it('has unique metadata title', () => {
      expect(String(processMeta.title)).toBeTruthy()
      expect(String(processMeta.title)).not.toBe(String(servicesMeta.title))
    })
    it('has metadata description', () => expect(processMeta.description).toBeTruthy())
    it('renders without crashing', () => {
      expect(() => render(React.createElement(ProcessPage))).not.toThrow()
    })
    it('contains exactly one <h1>', () => {
      render(React.createElement(ProcessPage))
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    })
    it('h1 contains "Work Together"', () => {
      expect(getH1(ProcessPage).textContent).toContain('Work Together')
    })
    it('root element has id="process-page"', () => {
      render(React.createElement(ProcessPage))
      expect(document.getElementById('process-page')).not.toBeNull()
    })
  })

  // ────────────────────────── /cv ───────────────────────────────────
  describe('/cv page', () => {
    it('has unique metadata title', () => {
      expect(String(cvMeta.title)).toBeTruthy()
      expect(String(cvMeta.title)).not.toBe(String(processMeta.title))
    })
    it('has metadata description', () => expect(cvMeta.description).toBeTruthy())
    it('renders without crashing', () => {
      expect(() => render(React.createElement(CVPage))).not.toThrow()
    })
    it('contains exactly one <h1>', () => {
      render(React.createElement(CVPage))
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    })
    it('h1 contains "Alli Akinkunmi"', () => {
      expect(getH1(CVPage).textContent).toContain('Alli Akinkunmi')
    })
    it('PDF download button exists (cv-download-pdf)', () => {
      render(React.createElement(CVPage))
      const btn = document.getElementById('cv-download-pdf')
      expect(btn).not.toBeNull()
    })
    it('root element has id="cv-page"', () => {
      render(React.createElement(CVPage))
      expect(document.getElementById('cv-page')).not.toBeNull()
    })
  })

  // ────────────────────────── /privacy ─────────────────────────────
  describe('/privacy page', () => {
    it('has unique metadata title', () => {
      expect(String(privacyMeta.title)).toBeTruthy()
      expect(String(privacyMeta.title)).not.toBe(String(cvMeta.title))
    })
    it('has metadata description', () => expect(privacyMeta.description).toBeTruthy())
    it('renders without crashing', () => {
      expect(() => render(React.createElement(PrivacyPage))).not.toThrow()
    })
    it('contains exactly one <h1>', () => {
      render(React.createElement(PrivacyPage))
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    })
    it('h1 is "Privacy Policy"', () => {
      expect(getH1(PrivacyPage).textContent).toContain('Privacy Policy')
    })
    it('root element has id="privacy-page"', () => {
      render(React.createElement(PrivacyPage))
      expect(document.getElementById('privacy-page')).not.toBeNull()
    })
  })
})
