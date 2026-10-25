import { describe, it, expect, vi, beforeEach } from 'vitest'
import sitemap from '@/app/sitemap'
import robots from '@/app/robots'
import {
  generatePersonJsonLd,
  generateWebSiteJsonLd,
  generateServiceJsonLd,
  generateBreadcrumbJsonLd,
  generateSoftwareApplicationJsonLd,
  PUBLIC_ROUTES,
  SITE_URL,
} from '@/lib/seo'

vi.mock('@/core/providers', () => ({
  services: {
    portfolio: {
      getProjects: vi.fn().mockResolvedValue([
        { slug: 'hall-booking-engine', title: 'Hall Booking Engine' },
        { slug: 'laundry-ops-desk', title: 'Laundry Operations Desk' },
      ]),
    },
  },
}))

describe('TASK-P5-08: Automated SEO Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sitemap.ts', () => {
    it('generates a valid sitemap containing all public routes', async () => {
      const items = await sitemap()
      expect(Array.isArray(items)).toBe(true)

      const urls = items.map((i) => i.url)

      // Must include base URL
      expect(urls).toContain(SITE_URL)

      // Must include all key public routes
      expect(urls).toContain(`${SITE_URL}/projects`)
      expect(urls).toContain(`${SITE_URL}/services`)
      expect(urls).toContain(`${SITE_URL}/process`)
      expect(urls).toContain(`${SITE_URL}/cv`)
      expect(urls).toContain(`${SITE_URL}/contact`)
      expect(urls).toContain(`${SITE_URL}/recruiter`)
      expect(urls).toContain(`${SITE_URL}/client`)
      expect(urls).toContain(`${SITE_URL}/founder`)
      expect(urls).toContain(`${SITE_URL}/now`)
      expect(urls).toContain(`${SITE_URL}/changelog`)
      expect(urls).toContain(`${SITE_URL}/privacy`)
    })

    it('expands dynamic project slugs into sitemap', async () => {
      const items = await sitemap()
      const urls = items.map((i) => i.url)

      expect(urls).toContain(`${SITE_URL}/projects/hall-booking-engine`)
      expect(urls).toContain(`${SITE_URL}/projects/laundry-ops-desk`)
    })

    it('sets valid priorities and change frequencies', async () => {
      const items = await sitemap()
      for (const item of items) {
        expect(item.url).toMatch(/^https?:\/\//)
        expect(item.priority).toBeGreaterThanOrEqual(0)
        expect(item.priority).toBeLessThanOrEqual(1.0)
        expect(item.lastModified).toBeInstanceOf(Date)
        expect([
          'always',
          'hourly',
          'daily',
          'weekly',
          'monthly',
          'yearly',
          'never',
        ]).toContain(item.changeFrequency)
      }
    })

    it('formats into valid sitemap XML structure', async () => {
      const items = await sitemap()
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items
  .map(
    (i) => `  <url>
    <loc>${i.url}</loc>
    <lastmod>${(i.lastModified as Date).toISOString().split('T')[0]}</lastmod>
    <changefreq>${i.changeFrequency}</changefreq>
    <priority>${i.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
      expect(xml).toContain(`<loc>${SITE_URL}</loc>`)
      expect(xml).toContain(`<loc>${SITE_URL}/contact</loc>`)
      expect(xml).toContain('</urlset>')
    })
  })

  describe('robots.ts', () => {
    it('disallows admin, api, and private brief share routes', () => {
      const config = robots()
      expect(config.sitemap).toBe(`${SITE_URL}/sitemap.xml`)

      const rules = Array.isArray(config.rules) ? config.rules : [config.rules]
      expect(rules.length).toBeGreaterThan(0)

      const rule = rules[0]
      expect(rule.userAgent).toBe('*')
      expect(rule.allow).toBe('/')

      const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow]
      expect(disallow).toContain('/admin')
      expect(disallow).toContain('/api')
      expect(disallow).toContain('/brief/share/*')
    })
  })

  describe('Structured Data (JSON-LD)', () => {
    it('generates valid Person schema with required schema.org fields', () => {
      const person = generatePersonJsonLd()
      expect(person['@context']).toBe('https://schema.org')
      expect(person['@type']).toBe('Person')
      expect(person.name).toBe('Akinkunmi Alli (ALLINET)')
      expect(person.alternateName).toBe('Ajibade Alli Akinkunmi')
      expect(person.email).toBe('hello@allinet.dev')
      expect(person.address['@type']).toBe('PostalAddress')
      expect(person.sameAs).toContain('https://github.com/alli-net')
    })

    it('generates valid WebSite schema with publisher relationship', () => {
      const website = generateWebSiteJsonLd()
      expect(website['@context']).toBe('https://schema.org')
      expect(website['@type']).toBe('WebSite')
      expect(website.url).toBe(SITE_URL)
      expect(website.publisher['@type']).toBe('Person')
    })

    it('generates valid Service schema', () => {
      const service = generateServiceJsonLd({
        name: 'Custom Business Systems',
        description: 'Bespoke booking engines and operational platforms',
      })
      expect(service['@context']).toBe('https://schema.org')
      expect(service['@type']).toBe('Service')
      expect(service.name).toBe('Custom Business Systems')
      expect(service.provider['@type']).toBe('Person')
    })

    it('generates valid BreadcrumbList schema', () => {
      const breadcrumbs = generateBreadcrumbJsonLd([
        { name: 'Home', url: '/' },
        { name: 'Projects', url: '/projects' },
      ])
      expect(breadcrumbs['@context']).toBe('https://schema.org')
      expect(breadcrumbs['@type']).toBe('BreadcrumbList')
      expect(breadcrumbs.itemListElement).toHaveLength(2)
      expect(breadcrumbs.itemListElement[0].position).toBe(1)
      expect(breadcrumbs.itemListElement[0].name).toBe('Home')
      expect(breadcrumbs.itemListElement[1].position).toBe(2)
      expect(breadcrumbs.itemListElement[1].name).toBe('Projects')
    })

    it('generates valid SoftwareApplication schema', () => {
      const app = generateSoftwareApplicationJsonLd({
        name: 'Hall Booking Engine',
        description: 'Real-time Lagos venue availability and booking state machine',
        url: `${SITE_URL}/demos/hall-booking`,
      })
      expect(app['@context']).toBe('https://schema.org')
      expect(app['@type']).toBe('SoftwareApplication')
      expect(app.name).toBe('Hall Booking Engine')
      expect(app.operatingSystem).toBe('Any')
    })
  })
})
