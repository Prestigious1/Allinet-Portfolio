import type { MetadataRoute } from 'next'
import { SITE_URL, PUBLIC_ROUTES } from '@/lib/seo'
import { services } from '@/core/providers'

/**
 * Generates dynamic /sitemap.xml
 * Includes all public indexable site routes and published project slugs.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  try {
    const projects = await services.portfolio.getProjects()
    if (Array.isArray(projects)) {
      for (const project of projects) {
        if (project.slug) {
          routes.push({
            url: `${SITE_URL}/projects/${project.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
          })
        }
      }
    }
  } catch (err) {
    console.warn('[sitemap] Failed to fetch dynamic projects, using static routes:', err)
  }

  return routes
}
