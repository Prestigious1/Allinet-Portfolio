// ── Shared sub-types ──────────────────────────────────────────────────────

export interface MediaObject {
  url: string
  alt?: string
  filename?: string
  thumbnailURL?: string | null
}

// ── Portfolio Owner ────────────────────────────────────────────────────────

export interface PortfolioOwner {
  fullName: string
  displayName: string
  title: string
  bioShort: string
  bioLong: string
  email: string
  phone?: string | null
  location: string
  locationLat?: number | null
  locationLng?: number | null
  githubUrl: string
  linkedinUrl: string
  twitterUrl?: string | null
  websiteUrl?: string | null
  openToWork: boolean
  availability: string | null
  avatar?: MediaObject | null
  avatar3d?: MediaObject | null
  resumePdf?: MediaObject | null
}

// ── Projects ───────────────────────────────────────────────────────────────

export interface ProjectData {
  title: string
  slug: string
  tagline: string
  description?: any
  coverImage?: MediaObject | null
  gallery?: MediaObject[]
  techStack: string[]
  category?: string[]
  status?: string
  featured?: boolean
  featuredOrder?: number | null
  demoUrl: string | null
  repoUrl: string | null
  videoUrl?: string | null
  metrics?: Record<string, string> | null
  startDate?: string | null
  endDate?: string | null
  sortOrder?: number | null
}

// ── Experience ─────────────────────────────────────────────────────────────

export interface ExperienceData {
  role: string
  company: string
  companyUrl?: string | null
  companyLogo?: MediaObject | null
  type: string
  startDate: string
  endDate: string | null
  isCurrent?: boolean
  location: string
  remote?: boolean
  description: string
  achievements?: string[]
  techStack: string[]
  sortOrder?: number | null
}

// ── Education ──────────────────────────────────────────────────────────────

export interface EducationData {
  institution: string
  institutionLogo?: MediaObject | null
  degree: string
  field: string
  startDate: string
  endDate: string | null
  grade?: string | null
  description?: string | null
  achievements?: string[]
}

// ── Certificate ────────────────────────────────────────────────────────────

export interface CertificateData {
  name: string
  issuer: string
  issuerLogo?: MediaObject | null
  issueDate: string
  expiryDate?: string | null
  credentialId?: string | null
  credentialUrl?: string | null
  category: string
  featured?: boolean
  image?: MediaObject | null
}

// ── Blog Post ──────────────────────────────────────────────────────────────

export interface BlogPostData {
  title: string
  slug: string
  excerpt: string
  content?: any
  coverImage?: MediaObject | null
  tags?: string[]
  category?: string
  featured?: boolean
  publishedAt?: string | null
  aiSummary?: string | null
}

// ── Testimonial ────────────────────────────────────────────────────────────

export interface TestimonialData {
  authorName: string
  authorRole: string
  authorCompany: string
  authorAvatar?: MediaObject | null
  authorLinkedin?: string | null
  content: string
  rating: number
  featured?: boolean
  sortOrder?: number | null
}

// ── Skills / Technologies ──────────────────────────────────────────────────

export interface SkillData {
  name: string
  /** 0-100 proficiency */
  level: number
  category: string
  color?: string
  iconUrl?: MediaObject | null
  years?: number | null
  officialUrl?: string | null
}

// ── Site Settings ──────────────────────────────────────────────────────────

export interface SiteSettings {
  siteName: string
  defaultTheme: string
  logoText: string
  metaTitle?: string | null
  metaDescription?: string | null
  bootSequenceEnabled?: boolean
  introSceneEnabled?: boolean
  maintenanceMode?: boolean
  maintenanceMessage?: string | null
}

// ── Desktop Apps ─────────────────────────────────────────────────────────────

export interface DesktopAppData {
  id: string
  appId: string
  label: string
  iconName: string
  iconMediaUrl?: string
  iconColor?: string | null
  showOnDesktop: boolean
  showInDock: boolean
  showInMenu: boolean
  showInSearch: boolean
  desktopPosition?: { x: number; y: number } | null
  dockPosition?: number | null
}

// ── Provider Interface ─────────────────────────────────────────────────────

export interface PortfolioProvider {
  /** Gets details about the portfolio owner */
  getOwner(): Promise<PortfolioOwner>

  /** Gets all published projects */
  getProjects(): Promise<ProjectData[]>

  /** Gets a specific project by slug */
  getProject(slug: string): Promise<ProjectData | null>

  /** Gets work experience entries */
  getExperience(): Promise<ExperienceData[]>

  /** Gets education entries */
  getEducation(): Promise<EducationData[]>

  /** Gets certificates */
  getCertificates(): Promise<CertificateData[]>

  /** Gets testimonials */
  getTestimonials(): Promise<TestimonialData[]>

  /** Gets published blog posts */
  getBlogPosts(): Promise<BlogPostData[]>

  /** Gets all skills/technologies with proficiency */
  getSkills(): Promise<SkillData[]>

  /** Gets global site settings */
  getSiteSettings(): Promise<SiteSettings>

  /** Gets dynamic desktop apps / shortcuts configuration */
  getDesktopApps(): Promise<DesktopAppData[]>

  /** Used by AION to inject full context */
  getFullContextPayload(): Promise<any>
}
