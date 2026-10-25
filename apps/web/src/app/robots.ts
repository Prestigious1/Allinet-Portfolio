import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

/**
 * Generates dynamic /robots.txt
 * Disallows private, administrative, and unguessable share paths.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api',
          '/api/*',
          '/brief/share/*',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
