/**
 * lib/seo.ts
 *
 * Centralized SEO engine:
 * - Canonical base URL resolution
 * - Structured Data (JSON-LD) generators (Person, WebSite, Service, BreadcrumbList, SoftwareApplication)
 * - Indexable public route definitions for sitemaps
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://allinet.dev'

export const DEFAULT_SEO = {
  name: 'Akinkunmi Alli (ALLINET)',
  legalName: 'Ajibade Alli Akinkunmi',
  jobTitle: 'Senior Full Stack & Systems Engineer',
  description:
    'Senior Full Stack & Systems Engineer building high-reliability distributed systems, reactive web applications, and mission-critical digital products.',
  url: SITE_URL,
  email: 'hello@allinet.dev',
  location: {
    addressLocality: 'Lagos',
    addressCountry: 'Nigeria',
  },
  socials: [
    'https://github.com/alli-net',
    'https://linkedin.com/in/akinkunmi-alli',
    'https://x.com/alli_net',
  ],
}

/**
 * Public routes exposed in sitemap and indexed by search engines.
 */
export interface RouteMeta {
  path: string
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

export const PUBLIC_ROUTES: RouteMeta[] = [
  { path: '', changeFrequency: 'daily', priority: 1.0 },
  { path: '/projects', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/services', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/process', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/cv', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/recruiter', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/client', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/founder', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/now', changeFrequency: 'daily', priority: 0.7 },
  { path: '/changelog', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
]

/**
 * Generate schema.org Person structured data
 */
export function generatePersonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: DEFAULT_SEO.name,
    alternateName: DEFAULT_SEO.legalName,
    jobTitle: DEFAULT_SEO.jobTitle,
    description: DEFAULT_SEO.description,
    url: DEFAULT_SEO.url,
    email: DEFAULT_SEO.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: DEFAULT_SEO.location.addressLocality,
      addressCountry: DEFAULT_SEO.location.addressCountry,
    },
    sameAs: DEFAULT_SEO.socials,
    knowsAbout: [
      'Full Stack Development',
      'Distributed Systems',
      'TypeScript',
      'Next.js',
      'Node.js',
      'PostgreSQL',
      'Cloud Architecture',
      'High-Availability Systems',
    ],
  }
}

/**
 * Generate schema.org WebSite structured data
 */
export function generateWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ALLINET — Akinkunmi Alli Portfolio & Operating System',
    alternateName: 'ALLINET Portfolio',
    url: DEFAULT_SEO.url,
    description: DEFAULT_SEO.description,
    inLanguage: 'en-US',
    publisher: {
      '@type': 'Person',
      name: DEFAULT_SEO.name,
      url: DEFAULT_SEO.url,
    },
  }
}

/**
 * Generate schema.org Service structured data
 */
export function generateServiceJsonLd(service: {
  name: string
  description: string
  serviceType?: string
  url?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    serviceType: service.serviceType || 'Software Development & Systems Engineering',
    url: service.url || `${DEFAULT_SEO.url}/services`,
    provider: {
      '@type': 'Person',
      name: DEFAULT_SEO.name,
      url: DEFAULT_SEO.url,
    },
    areaServed: 'Worldwide',
  }
}

/**
 * Generate schema.org BreadcrumbList structured data
 */
export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${DEFAULT_SEO.url}${item.url}`,
    })),
  }
}

/**
 * Generate schema.org SoftwareApplication structured data
 */
export function generateSoftwareApplicationJsonLd(app: {
  name: string
  description: string
  applicationCategory?: string
  url?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: app.name,
    description: app.description,
    applicationCategory: app.applicationCategory || 'BusinessApplication',
    operatingSystem: 'Any',
    url: app.url || DEFAULT_SEO.url,
    author: {
      '@type': 'Person',
      name: DEFAULT_SEO.name,
      url: DEFAULT_SEO.url,
    },
  }
}
