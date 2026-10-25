import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('WCAG 2.1 AA Accessibility Audit (TASK-P12-02 / AC-A11Y)', () => {
  const routes = [
    { name: 'Home Route (/)', path: '/' },
    { name: 'Recruiter Persona (/recruiter)', path: '/recruiter' },
    { name: 'Client Persona (/client)', path: '/client' },
    { name: 'Hall Booking Demo (/demos/hall-booking)', path: '/demos/hall-booking' },
    { name: 'Brief Builder (/brief)', path: '/brief' },
    { name: 'Contact (/contact)', path: '/contact' },
  ]

  for (const route of routes) {
    test(`audits ${route.name} for WCAG 2.1 AA violations with axe-core`, async ({ page }) => {
      // Allow session storage boot flag in case it hits OS route
      await page.addInitScript(() => {
        sessionStorage.setItem('allinet-booted', 'true')
      })

      await page.goto(route.path, { waitUntil: 'domcontentloaded' })
      // Brief pause to allow hydration and dynamic elements to settle
      await page.waitForTimeout(1500)

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      const criticalOrSerious = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      )

      if (criticalOrSerious.length > 0) {
        console.error(
          `Axe violations on ${route.path}:`,
          criticalOrSerious.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            nodes: v.nodes.length,
          }))
        )
      }

      expect(criticalOrSerious).toEqual([])
    })
  }
})
