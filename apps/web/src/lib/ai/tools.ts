import { tool } from 'ai'
import { z } from 'zod'
import { services } from '@/core/providers'
import { PORTFOLIO_DATA } from './portfolio-data'

// ── Shared app ID enum ────────────────────────────────────────────────────────
const appIdEnum = z.enum([
  'about', 'projects', 'resume', 'skills', 'terminal',
  'contact', 'github', 'blog', 'gallery', 'music',
  'trading', 'timeline', 'achievements', 'games', 'settings',
  'explorer', 'education', 'certificates', 'testimonials',
])

// ── AION Tool Registry ─────────────────────────────────────────────────────

export const aionTools = {
  // ── Desktop Window Control ───────────────────────────────────────────────

  open_application: tool({
    description: 'Open an application window in ALLINET OS. Use this when a visitor asks to see projects, resume, skills, contact form, or any other app.',
    inputSchema: z.object({
      appId: appIdEnum.describe('The application to open'),
    }),
    execute: async ({ appId }) => {
      return { success: true, action: 'opened', appId, message: `Opened application "${appId}".` }
    },
  }),

  close_application: tool({
    description: 'Close an application window in ALLINET OS.',
    inputSchema: z.object({
      appId: appIdEnum.describe('The application to close'),
    }),
    execute: async ({ appId }) => {
      return { success: true, action: 'closed', appId, message: `Closed application "${appId}".` }
    },
  }),

  minimize_application: tool({
    description: 'Minimize an application window to the taskbar in ALLINET OS.',
    inputSchema: z.object({
      appId: appIdEnum.describe('The application to minimize'),
    }),
    execute: async ({ appId }) => {
      return { success: true, action: 'minimized', appId, message: `Minimized application "${appId}".` }
    },
  }),

  maximize_application: tool({
    description: 'Maximize an application window to fill the screen in ALLINET OS.',
    inputSchema: z.object({
      appId: appIdEnum.describe('The application to maximize/restore'),
    }),
    execute: async ({ appId }) => {
      return { success: true, action: 'maximized', appId, message: `Maximized application "${appId}".` }
    },
  }),

  // ── OS Customization ─────────────────────────────────────────────────────

  change_theme: tool({
    description: 'Change the system color theme of ALLINET OS. Use when visitor asks to change the look or theme.',
    inputSchema: z.object({
      theme: z.enum(['cyber-gold', 'midnight', 'matrix', 'ice-station', 'void'])
        .describe('The theme to apply'),
    }),
    execute: async ({ theme }) => {
      return { success: true, action: 'theme_changed', theme, message: `Changed theme to "${theme}".` }
    },
  }),

  add_notification: tool({
    description: 'Display a system notification toast in ALLINET OS.',
    inputSchema: z.object({
      title: z.string().describe('Notification title'),
      message: z.string().describe('Notification body'),
      type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
    }),
    execute: async ({ title, message, type }) => {
      return { success: true, action: 'notification_added', title, message, type }
    },
  }),

  // ── Portfolio Content Search ─────────────────────────────────────────────

  search_content: tool({
    description: 'Search through projects and blog posts by keyword. Use when visitor asks about specific technologies, topics, or project types.',
    inputSchema: z.object({
      query: z.string().min(2).describe('Search query'),
      type: z.enum(['projects', 'blog', 'all']).default('all'),
    }),
    execute: async ({ query, type }) => {
      try {
        const q = query.toLowerCase()
        const [projects, blog] = await Promise.all([
          type === 'blog' ? [] : services.portfolio.getProjects(),
          type === 'projects' ? [] : services.portfolio.getBlogPosts(),
        ])

        const matchedProjects = (projects || []).filter((p: any) =>
          p.title?.toLowerCase().includes(q) ||
          p.tagline?.toLowerCase().includes(q) ||
          (p.techStack || []).some((t: string) => t.toLowerCase().includes(q))
        )

        const matchedBlog = (blog || []).filter((b: any) =>
          b.title?.toLowerCase().includes(q) ||
          b.excerpt?.toLowerCase().includes(q)
        )

        const total = matchedProjects.length + matchedBlog.length
        if (total === 0) {
          return {
            found: false,
            message: `No projects or blog posts matched the search query "${query}".`,
            suggestion: 'Try searching for topics like React, Next.js, Node.js, Python, or open the Projects application to view all available work.'
          }
        }

        return {
          found: true,
          projects: matchedProjects.slice(0, 5),
          blog: matchedBlog.slice(0, 5),
          total,
        }
      } catch (err: any) {
        return { found: false, error: err?.message || 'Search encountered an issue.' }
      }
    },
  }),

  get_project: tool({
    description: 'Get detailed information about a specific project by its slug.',
    inputSchema: z.object({
      slug: z.string().describe('The project slug (URL-friendly name)'),
    }),
    execute: async ({ slug }) => {
      try {
        const project = await services.portfolio.getProject(slug)
        if (!project) {
          const allProjects = await services.portfolio.getProjects()
          const projectList = (allProjects || []).map((p: any) => ({ title: p.title, slug: p.slug }))
          return {
            found: false,
            message: `Project "${slug}" was not found in the portfolio repository.`,
            availableProjects: projectList,
            suggestion: 'You can guide the user to check available projects in the list or open the Projects application window.'
          }
        }
        return { found: true, project }
      } catch {
        return {
          found: false,
          message: `Could not retrieve project "${slug}".`,
          suggestion: 'You can open the Projects application window to view available projects.'
        }
      }
    },
  }),

  get_contact_info: tool({
    description: 'Get the portfolio owner contact information, availability, and social links.',
    inputSchema: z.object({}),
    execute: async () => {
      try {
        const data = await services.portfolio.getFullContextPayload()
        return {
          email:      data.owner.email,
          linkedin:   data.owner.linkedinUrl,
          github:     data.owner.githubUrl,
          openToWork: data.owner.openToWork,
          availability: data.owner.availability,
        }
      } catch {
        const owner = PORTFOLIO_DATA.owner
        return {
          email:    owner.email,
          linkedin: owner.linkedinUrl,
          github:   owner.githubUrl,
          openToWork: owner.openToWork,
          availability: owner.availability,
        }
      }
    },
  }),

  get_skills: tool({
    description: 'Get a list of the portfolio owner\'s technical skills, proficiency levels, and technology categories.',
    inputSchema: z.object({
      category: z.string().optional().describe('Filter by category (e.g., "frontend", "backend", "devops")'),
    }),
    execute: async ({ category }) => {
      try {
        const data = await services.portfolio.getFullContextPayload()
        let skills = data.technologies || []
        if (category) {
          const cat = category.toLowerCase()
          skills = skills.filter((t: any) =>
            t.category?.toLowerCase().includes(cat) ||
            t.name?.toLowerCase().includes(cat)
          )
        }
        return { skills: skills.slice(0, 30), total: skills.length }
      } catch {
        return { skills: PORTFOLIO_DATA.technologies, total: PORTFOLIO_DATA.technologies.length }
      }
    },
  }),

  get_experience: tool({
    description: 'Get details about the portfolio owner\'s professional work experience and career history.',
    inputSchema: z.object({}),
    execute: async () => {
      try {
        const data = await services.portfolio.getFullContextPayload()
        return { experiences: data.experiences }
      } catch {
        return { experiences: PORTFOLIO_DATA.experiences }
      }
    },
  }),

  get_education: tool({
    description: 'Get details about the portfolio owner\'s educational background, degrees, and certifications.',
    inputSchema: z.object({}),
    execute: async () => {
      try {
        const data = await services.portfolio.getFullContextPayload()
        return {
          education: data.education,
          certificates: data.certificates,
        }
      } catch {
        return {
          education: PORTFOLIO_DATA.education,
          certificates: PORTFOLIO_DATA.certificates,
        }
      }
    },
  }),

  // ── Meeting / Contact Flow ───────────────────────────────────────────────

  schedule_meeting: tool({
    description: 'Open the contact form to schedule a meeting or send a message. Use when visitor wants to get in touch or book a call.',
    inputSchema: z.object({
      subject: z.string().optional().describe('Pre-filled subject line'),
      message: z.string().optional().describe('Pre-filled message body'),
    }),
    execute: async ({ subject, message }) => {
      return { success: true, action: 'contact_opened', subject, message }
    },
  }),

  download_cv: tool({
    description: 'Trigger a CV/Resume download for the visitor.',
    inputSchema: z.object({}),
    execute: async () => {
      return { success: true, action: 'cv_download_triggered' }
    },
  }),

  // ── AION Memory (Owner-editable) ─────────────────────────────────────────

  search_memory: tool({
    description: 'Search AION long-term memory for owner-defined facts, updates, or notes.',
    inputSchema: z.object({
      query: z.string().min(2).describe('Search query for memory'),
    }),
    execute: async ({ query }) => {
      try {
        const res = await services.db.query<any>('ai-memories', {})
        const all = res.data || []
        const q = query.toLowerCase()
        const matched = all.filter((m: any) =>
          m.title?.toLowerCase().includes(q) ||
          m.content?.toLowerCase().includes(q) ||
          m.category?.toLowerCase().includes(q)
        )
        if (matched.length === 0) {
          return { memories: [], total: 0, message: `No specific stored memories found for "${query}".` }
        }
        return { memories: matched, total: matched.length }
      } catch {
        return { memories: [], total: 0 }
      }
    },
  }),
}
