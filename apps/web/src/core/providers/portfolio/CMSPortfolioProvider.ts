/**
 * CMSPortfolioProvider.ts
 *
 * Fetches portfolio data from the live Payload CMS REST API.
 * Falls back to seed/demo data if the CMS has no published documents
 * or if the API is unreachable.
 *
 * Fallback logic (per method):
 *   1. Try the Payload REST API
 *   2. If result is empty (0 docs) → use seed data  ← "demo mode"
 *   3. If fetch throws (network error, offline) → use seed data
 */

import {
  PortfolioProvider,
  PortfolioOwner,
  ProjectData,
  ExperienceData,
  EducationData,
  CertificateData,
  TestimonialData,
  BlogPostData,
  SiteSettings,
  SkillData,
  MediaObject,
  DesktopAppData,
} from './PortfolioProvider'
import { SeedPortfolioProvider } from './SeedPortfolioProvider'

// ── Helpers ─────────────────────────────────────────────────────────────────

function getApiBase(): string {
  // In the browser, use a relative path so it always hits the same origin.
  // On the server (SSR/RSC), use the absolute URL from the env var.
  if (typeof window !== 'undefined') return '/api'
  return process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : 'http://localhost:3000/api'
}

const CMS_TIMEOUT_MS = 6000

async function cmsGet<T>(path: string): Promise<T | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), CMS_TIMEOUT_MS)
    const res = await fetch(`${getApiBase()}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      // Allow ISR caching on Next.js server; browser fetches are always live
      next: { revalidate: 60 },
    } as RequestInit)
    clearTimeout(timer)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

async function cmsCollectionHasContent(collectionPath: string): Promise<boolean | null> {
  const data = await cmsGet<any>(`${collectionPath}?limit=1`)
  if (!data) return null
  if (typeof data.totalDocs === 'number') {
    return data.totalDocs > 0
  }
  return Array.isArray(data.docs) ? data.docs.length > 0 : false
}

/** Extracts a clean URL string from a Payload media field (object or string). */
function resolveMedia(field: any): MediaObject | null {
  if (!field) return null
  if (typeof field === 'string') return { url: field }
  if (typeof field === 'object' && field.url) {
    return {
      url: field.url as string,
      alt: field.alt ?? undefined,
      filename: field.filename ?? undefined,
      thumbnailURL: field.sizes?.thumbnail?.url ?? null,
    }
  }
  return null
}

/** Extracts a plain-text string from a Payload richText (Lexical) JSON object. */
function richTextToString(richText: any): string {
  if (!richText) return ''
  if (typeof richText === 'string') return richText
  // Payload Lexical: { root: { children: [ { children: [{text}] } ] } }
  try {
    const walk = (node: any): string => {
      if (!node) return ''
      if (node.text !== undefined) return node.text as string
      if (Array.isArray(node.children)) {
        return node.children.map(walk).join('\n')
      }
      if (node.root) return walk(node.root)
      return ''
    }
    return walk(richText).trim()
  } catch {
    return ''
  }
}

/** Resolves a relationship field — returns the slug of the first related doc, or an array of names. */
function resolveRelationshipNames(field: any): string[] {
  if (!field) return []
  const items = Array.isArray(field) ? field : [field]
  return items.map((item: any) => {
    if (typeof item === 'string') return item
    if (typeof item === 'object') return item.name ?? item.slug ?? item.title ?? String(item.id ?? '')
    return String(item)
  }).filter(Boolean)
}

// ── Provider ─────────────────────────────────────────────────────────────────

export class CMSPortfolioProvider implements PortfolioProvider {
  private fallback = new SeedPortfolioProvider()

  // ── Owner ──────────────────────────────────────────────────────────────

  async getOwner(): Promise<PortfolioOwner> {
    try {
      const data = await cmsGet<any>('/globals/portfolio-owner')
      if (!data || !data.full_name) {
        console.log('[CMS] portfolio-owner: no data, using seed')
        return this.fallback.getOwner()
      }
      const owner: PortfolioOwner = {
        fullName:     data.full_name,
        displayName:  data.display_name ?? data.full_name,
        title:        data.title,
        bioShort:     data.bio_short,
        bioLong:      richTextToString(data.bio_long) || data.bio_short,
        email:        data.email,
        phone:        data.phone ?? null,
        location:     data.location,
        locationLat:  data.location_lat ?? null,
        locationLng:  data.location_lng ?? null,
        githubUrl:    data.github_url,
        linkedinUrl:  data.linkedin_url,
        twitterUrl:   data.twitter_url ?? null,
        websiteUrl:   data.website_url ?? null,
        openToWork:   data.open_to_work ?? false,
        availability: data.availability ?? null,
        avatar:       resolveMedia(data.avatar),
        avatar3d:     resolveMedia(data.avatar_3d),
        resumePdf:    resolveMedia(data.resume_pdf),
      }
      return owner
    } catch {
      return this.fallback.getOwner()
    }
  }

  // ── Projects ───────────────────────────────────────────────────────────

  async getProjects(): Promise<ProjectData[]> {
    try {
      const data = await cmsGet<any>(
        '/projects?where[_status][equals]=published&limit=100&sort=sort_order'
      )
      if (data?.docs?.length) {
        return data.docs.map(this.mapProject)
      }

      const hasAny = await cmsCollectionHasContent('/projects')
      if (hasAny === false) {
        return this.fallback.getProjects()
      }
      if (hasAny === true) {
        return []
      }

      return this.fallback.getProjects()
    } catch {
      return this.fallback.getProjects()
    }
  }

  async getProject(slug: string): Promise<ProjectData | null> {
    try {
      const data = await cmsGet<any>(
        `/projects?where[slug][equals]=${encodeURIComponent(slug)}&where[_status][equals]=published&limit=1`
      )
      if (!data?.docs?.length) {
        return this.fallback.getProject(slug)
      }
      return this.mapProject(data.docs[0])
    } catch {
      return this.fallback.getProject(slug)
    }
  }

  private mapProject(doc: any): ProjectData {
    return {
      title:        doc.title,
      slug:         doc.slug,
      tagline:      doc.tagline,
      description:  richTextToString(doc.description),
      coverImage:   resolveMedia(doc.cover_image),
      gallery:      Array.isArray(doc.gallery)
                      ? doc.gallery.map(resolveMedia).filter(Boolean) as MediaObject[]
                      : [],
      techStack:    resolveRelationshipNames(doc.tech_stack),
      category:     resolveRelationshipNames(doc.category),
      status:       doc._status ?? 'published',
      featured:     doc.featured ?? false,
      featuredOrder: doc.featured_order ?? null,
      demoUrl:      doc.demo_url ?? null,
      repoUrl:      doc.repo_url ?? null,
      videoUrl:     doc.video_url ?? null,
      metrics:      doc.metrics ?? null,
      startDate:    doc.start_date ?? null,
      endDate:      doc.end_date ?? null,
      sortOrder:    doc.sort_order ?? null,
    }
  }

  private async resolvePublishedCollection<T>(collectionPath: string, publishedQuery: string): Promise<T[] | null> {
    const data = await cmsGet<any>(publishedQuery)
    if (data?.docs?.length) {
      return data.docs as T[]
    }

    const hasAny = await cmsCollectionHasContent(collectionPath)
    if (hasAny === false) {
      return null
    }
    if (hasAny === true) {
      return []
    }
    return null
  }

  // ── Experience ─────────────────────────────────────────────────────────

  async getExperience(): Promise<ExperienceData[]> {
    try {
      let docs = await this.resolvePublishedCollection<any>(
        '/experiences',
        '/experiences?where[_status][equals]=published&limit=100&sort=sort_order'
      )
      if (!docs || docs.length === 0) {
        const allData = await cmsGet<any>('/experiences?limit=100&sort=sort_order')
        if (allData?.docs?.length) docs = allData.docs
      }
      if (!docs || docs.length === 0) {
        return this.fallback.getExperience()
      }
      return docs.map((doc: any): ExperienceData => ({
        role:        doc.role,
        company:     doc.company,
        companyUrl:  doc.company_url ?? null,
        companyLogo: resolveMedia(doc.company_logo),
        type:        doc.type,
        startDate:   doc.start_date ?? '',
        endDate:     doc.end_date ?? null,
        isCurrent:   doc.is_current ?? false,
        location:    doc.location ?? '',
        remote:      doc.remote ?? false,
        description: richTextToString(doc.description),
        achievements: Array.isArray(doc.achievements) ? doc.achievements : [],
        techStack:   resolveRelationshipNames(doc.tech_stack),
        sortOrder:   doc.sort_order ?? null,
      }))
    } catch {
      return this.fallback.getExperience()
    }
  }

  // ── Education ──────────────────────────────────────────────────────────

  async getEducation(): Promise<EducationData[]> {
    try {
      // Try published first, fall back to all docs if status filter returns nothing
      let docs = await this.resolvePublishedCollection<any>(
        '/education',
        '/education?where[_status][equals]=published&limit=100&sort=-start_date'
      )
      if (!docs || docs.length === 0) {
        const allData = await cmsGet<any>('/education?limit=100&sort=-start_date')
        if (allData?.docs?.length) docs = allData.docs
      }
      if (!docs || docs.length === 0) {
        return this.fallback.getEducation()
      }
      return docs.map((doc: any): EducationData => ({
        institution:     doc.institution,
        institutionLogo: resolveMedia(doc.institution_logo),
        degree:          doc.degree,
        field:           doc.field,
        startDate:       doc.start_date ?? '',
        endDate:         doc.end_date ?? null,
        grade:           doc.grade ?? null,
        description:     richTextToString(doc.description) || null,
        achievements:    Array.isArray(doc.achievements) ? doc.achievements : [],
      }))
    } catch {
      return this.fallback.getEducation()
    }
  }

  // ── Certificates ───────────────────────────────────────────────────────

  async getCertificates(): Promise<CertificateData[]> {
    try {
      let docs = await this.resolvePublishedCollection<any>(
        '/certificates',
        '/certificates?where[_status][equals]=published&limit=100&sort=-issue_date'
      )
      if (!docs || docs.length === 0) {
        const allData = await cmsGet<any>('/certificates?limit=100&sort=-issue_date')
        if (allData?.docs?.length) docs = allData.docs
      }
      if (!docs || docs.length === 0) {
        return this.fallback.getCertificates()
      }
      return docs.map((doc: any): CertificateData => ({
        name:          doc.name,
        issuer:        doc.issuer,
        issuerLogo:    resolveMedia(doc.issuer_logo),
        issueDate:     doc.issue_date ?? '',
        expiryDate:    doc.expiry_date ?? null,
        credentialId:  doc.credential_id ?? null,
        credentialUrl: doc.credential_url ?? null,
        category:      doc.category,
        featured:      doc.featured ?? false,
        image:         resolveMedia(doc.image),
      }))
    } catch {
      return this.fallback.getCertificates()
    }
  }

  // ── Testimonials ───────────────────────────────────────────────────────

  async getTestimonials(): Promise<TestimonialData[]> {
    try {
      const docs = await this.resolvePublishedCollection<any>(
        '/testimonials',
        '/testimonials?where[_status][equals]=published&limit=100&sort=sort_order'
      )
      if (docs === null) {
        return []
      }
      return docs.map((doc: any): TestimonialData => ({
        authorName:    doc.author_name,
        authorRole:    doc.author_role,
        authorCompany: doc.author_company,
        authorAvatar:  resolveMedia(doc.author_avatar),
        authorLinkedin: doc.author_linkedin ?? null,
        content:       doc.content,
        rating:        doc.rating ?? 5,
        featured:      doc.featured ?? false,
        sortOrder:     doc.sort_order ?? null,
      }))
    } catch {
      return []
    }
  }

  // ── Blog Posts ──────────────────────────────────────────────────

  async getBlogPosts(): Promise<BlogPostData[]> {
    try {
      const docs = await this.resolvePublishedCollection<any>(
        '/blog-posts',
        '/blog-posts?where[_status][equals]=published&limit=50&sort=-createdAt'
      )
      if (docs === null) {
        return []
      }
      return docs.map((doc: any): BlogPostData => ({
        title:      doc.title,
        slug:       doc.slug,
        excerpt:    doc.excerpt,
        content:    doc.content,
        coverImage: resolveMedia(doc.cover_image),
        tags:       Array.isArray(doc.tags) ? doc.tags : [],
        category:   doc.category ?? null,
        featured:   doc.featured ?? false,
        publishedAt: doc.createdAt ?? null,
        aiSummary:  doc.ai_summary ?? null,
      }))
    } catch {
      return []
    }
  }

  // ── Skills / Technologies ──────────────────────────────────────────────

  async getSkills(): Promise<SkillData[]> {
    try {
      const docs = await this.resolvePublishedCollection<any>(
        '/technologies',
        '/technologies?where[_status][equals]=published&limit=200&sort=sort_order'
      )
      if (docs === null) {
        return this.fallback.getSkills()
      }

      const colorMap: Record<string, string> = {
        frontend: '#61dafb',
        backend:  '#68a063',
        ai:       '#d4af37',
        devops:   '#2496ed',
        db:       '#336791',
        cloud:    '#ff9900',
        security: '#ef4444',
        mobile:   '#a78bfa',
      }

      return docs.map((doc: any): SkillData => ({
        name:        doc.name,
        level:       doc.proficiency ? Math.round((doc.proficiency / 5) * 100) : 60,
        category:    doc.category ?? 'other',
        color:       doc.color || colorMap[doc.category] || '#a78bfa',
        iconUrl:     resolveMedia(doc.icon_url),
        years:       doc.years ?? null,
        officialUrl: doc.official_url ?? null,
      }))
    } catch {
      return this.fallback.getSkills()
    }
  }

  // ── Site Settings ──────────────────────────────────────────────────────

  async getSiteSettings(): Promise<SiteSettings> {
    try {
      const data = await cmsGet<any>('/globals/site-settings')
      if (!data) return this.fallback.getSiteSettings()
      return {
        siteName:            data.site_name ?? 'ALLINET OS',
        defaultTheme:        data.default_theme ?? 'cyber-gold',
        logoText:            'A',
        metaTitle:           data.meta_title ?? null,
        metaDescription:     data.meta_description ?? null,
        bootSequenceEnabled: data.boot_sequence_enabled ?? true,
        introSceneEnabled:   data.intro_scene_enabled ?? true,
        maintenanceMode:     data.maintenance_mode ?? false,
        maintenanceMessage:  data.maintenance_message ?? null,
      }
    } catch {
      return this.fallback.getSiteSettings()
    }
  }

  // ── Desktop Apps ───────────────────────────────────────────────────────

  async getDesktopApps(): Promise<DesktopAppData[]> {
    try {
      const data = await cmsGet<any>('/desktop-apps?limit=100')
      if (data?.docs?.length) {
        return data.docs.map((doc: any): DesktopAppData => ({
          id: String(doc.id),
          appId: doc.app_id,
          label: doc.label,
          iconName: doc.icon_name,
          iconMediaUrl: doc.icon_media?.url ? doc.icon_media.url : undefined,
          iconColor: doc.icon_color ?? null,
          showOnDesktop: doc.show_on_desktop ?? true,
          showInDock: doc.show_in_dock ?? true,
          showInMenu: doc.show_in_menu ?? true,
          showInSearch: doc.show_in_search ?? true,
          desktopPosition: doc.desktop_position ?? null,
          dockPosition: doc.dock_position ?? null,
        }))
      }

      const hasAny = await cmsCollectionHasContent('/desktop-apps')
      if (hasAny === false) {
        return this.fallback.getDesktopApps()
      }
      return this.fallback.getDesktopApps()
    } catch {
      return this.fallback.getDesktopApps()
    }
  }

  // ── Full Context (for AION AI) ─────────────────────────────────────────

  async getFullContextPayload(): Promise<any> {
    try {
      const [owner, projects, experience, education, certificates, skills, settings, blogPosts] =
        await Promise.allSettled([
          this.getOwner(),
          this.getProjects(),
          this.getExperience(),
          this.getEducation(),
          this.getCertificates(),
          this.getSkills(),
          this.getSiteSettings(),
          this.getBlogPosts(),
        ])

      return {
        owner:        owner.status        === 'fulfilled' ? owner.value        : null,
        projects:     projects.status     === 'fulfilled' ? projects.value     : [],
        experiences:  experience.status   === 'fulfilled' ? experience.value   : [],
        education:    education.status    === 'fulfilled' ? education.value    : [],
        certificates: certificates.status === 'fulfilled' ? certificates.value : [],
        technologies: skills.status       === 'fulfilled' ? skills.value       : [],
        settings:     settings.status     === 'fulfilled' ? settings.value     : null,
        blogPosts:    blogPosts.status    === 'fulfilled' ? blogPosts.value    : [],
      }
    } catch {
      return this.fallback.getFullContextPayload()
    }
  }
}
