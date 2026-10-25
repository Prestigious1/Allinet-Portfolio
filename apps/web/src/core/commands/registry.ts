/**
 * Centralized Command Registry
 * TASK-P11-01 / F-211 / SPEC-10
 *
 * Provides a unified registry of executable commands across public site navigation,
 * system actions, external resources, and the desktop OS Command Palette.
 */

export type CommandGroup = 'Navigation' | 'Actions' | 'System' | 'External'

export interface CommandContext {
  router?: { push: (url: string) => void }
  openApp?: (appId: string) => void
  setTheme?: (theme: string) => void
  toggleSound?: () => void
  close?: () => void
  [key: string]: any
}

export interface CommandItem {
  id: string
  title: string
  description?: string
  keywords: string[]
  group: CommandGroup
  icon: string
  shortcut?: string
  run: (ctx?: CommandContext) => void | Promise<void>
  when?: (ctx?: CommandContext) => boolean
}

// ---------------------------------------------------------------------------
// Standard Built-in Commands
// ---------------------------------------------------------------------------

export const BUILTIN_COMMANDS: CommandItem[] = [
  // ── Navigation ──
  {
    id: 'nav-home',
    title: 'Home',
    description: 'Go to public portfolio overview',
    keywords: ['home', 'landing', 'root', 'main', 'start'],
    group: 'Navigation',
    icon: '🏠',
    shortcut: '1',
    run: (ctx) => {
      ctx?.close?.()
      if (ctx?.router) ctx.router.push('/')
      else if (typeof window !== 'undefined') window.location.href = '/'
    },
  },
  {
    id: 'nav-projects',
    title: 'Projects & Case Studies',
    description: 'Explore verified production case studies',
    keywords: ['projects', 'case studies', 'work', 'code', 'portfolio'],
    group: 'Navigation',
    icon: '💼',
    shortcut: '2',
    run: (ctx) => {
      ctx?.close?.()
      if (ctx?.router) ctx.router.push('/projects')
      else if (typeof window !== 'undefined') window.location.href = '/projects'
    },
  },
  {
    id: 'nav-demos',
    title: 'Interactive Engineering Demos',
    description: 'Launch live functional architecture demonstrations',
    keywords: ['demos', 'hall of fame', 'interactive', 'showcase', 'live proof'],
    group: 'Navigation',
    icon: '⚡',
    shortcut: '3',
    run: (ctx) => {
      ctx?.close?.()
      if (ctx?.router) ctx.router.push('/demos')
      else if (typeof window !== 'undefined') window.location.href = '/demos'
    },
  },
  {
    id: 'nav-brief',
    title: 'Project Brief & Proposal Generator',
    description: 'Build a project specification and get an instant proposal',
    keywords: ['brief', 'proposal', 'quote', 'scoping', 'estimate', 'pricing', 'calculator'],
    group: 'Navigation',
    icon: '📝',
    run: (ctx) => {
      ctx?.close?.()
      if (ctx?.router) ctx.router.push('/brief')
      else if (typeof window !== 'undefined') window.location.href = '/brief'
    },
  },
  {
    id: 'nav-recruiter',
    title: 'Recruiter Fast Track',
    description: 'Direct view for hiring managers: skills, stack, and CV',
    keywords: ['recruiter', 'hire', 'resume', 'skills', 'fullstack', 'engineer'],
    group: 'Navigation',
    icon: '👔',
    run: (ctx) => {
      ctx?.close?.()
      if (ctx?.router) ctx.router.push('/recruiter')
      else if (typeof window !== 'undefined') window.location.href = '/recruiter'
    },
  },
  {
    id: 'nav-client',
    title: 'Client Outcomes & Systems',
    description: 'ROI metrics, engineering services, and business outcomes',
    keywords: ['client', 'business', 'outcomes', 'roi', 'services', 'systems'],
    group: 'Navigation',
    icon: '🏢',
    run: (ctx) => {
      ctx?.close?.()
      if (ctx?.router) ctx.router.push('/client')
      else if (typeof window !== 'undefined') window.location.href = '/client'
    },
  },
  {
    id: 'nav-founder',
    title: 'Founder & Technical Architecture',
    description: 'Architecture blueprints, product mindset, and automation',
    keywords: ['founder', 'technical', 'architecture', 'automation', 'mvp', 'scale'],
    group: 'Navigation',
    icon: '🚀',
    run: (ctx) => {
      ctx?.close?.()
      if (ctx?.router) ctx.router.push('/founder')
      else if (typeof window !== 'undefined') window.location.href = '/founder'
    },
  },
  {
    id: 'nav-services',
    title: 'Services & Pricing Policy',
    description: 'Review service offerings and transparent pricing methodology',
    keywords: ['services', 'pricing', 'rates', 'offerings', 'terms'],
    group: 'Navigation',
    icon: '🛠️',
    shortcut: '4',
    run: (ctx) => {
      ctx?.close?.()
      if (ctx?.router) ctx.router.push('/services')
      else if (typeof window !== 'undefined') window.location.href = '/services'
    },
  },
  {
    id: 'nav-process',
    title: 'Engineering Delivery Process',
    description: 'Milestone-driven engineering delivery methodology',
    keywords: ['process', 'how i work', 'methodology', 'timeline', 'milestones'],
    group: 'Navigation',
    icon: '📋',
    run: (ctx) => {
      ctx?.close?.()
      if (ctx?.router) ctx.router.push('/process')
      else if (typeof window !== 'undefined') window.location.href = '/process'
    },
  },
  {
    id: 'nav-now',
    title: "What I'm Building Now (/now)",
    description: 'Current sprint priorities and availability status',
    keywords: ['now', 'building', 'status', 'current', 'progress', 'availability'],
    group: 'Navigation',
    icon: '⏱️',
    run: (ctx) => {
      ctx?.close?.()
      if (ctx?.router) ctx.router.push('/now')
      else if (typeof window !== 'undefined') window.location.href = '/now'
    },
  },
  {
    id: 'nav-contact',
    title: 'Contact & Consultation',
    description: 'Send a message or schedule a discovery call',
    keywords: ['contact', 'email', 'message', 'touch', 'call'],
    group: 'Navigation',
    icon: '📞',
    shortcut: '5',
    run: (ctx) => {
      ctx?.close?.()
      if (ctx?.router) ctx.router.push('/contact')
      else if (typeof window !== 'undefined') window.location.href = '/contact'
    },
  },
  {
    id: 'nav-concierge',
    title: 'Ask ALLI AI Concierge',
    description: 'Interactive AI assistant with verified knowledge grounding',
    keywords: ['concierge', 'alli', 'ai', 'assistant', 'chat', 'ask'],
    group: 'Navigation',
    icon: '🤖',
    shortcut: 'c',
    run: (ctx) => {
      ctx?.close?.()
      if (ctx?.router) ctx.router.push('/concierge')
      else if (typeof window !== 'undefined') window.location.href = '/concierge'
    },
  },

  // ── Actions ──
  {
    id: 'action-book-call',
    title: 'Book 15-Minute Scoping Call',
    description: 'Schedule a free architectural consultation on Cal.com',
    keywords: ['call', 'cal.com', 'meeting', 'schedule', 'book', 'consultation'],
    group: 'Actions',
    icon: '📅',
    run: (ctx) => {
      ctx?.close?.()
      if (typeof window !== 'undefined') {
        window.open('https://cal.com/ajibade-alli', '_blank', 'noopener,noreferrer')
      }
    },
  },
  {
    id: 'action-download-cv',
    title: 'Download Verified CV / Resume',
    description: 'Download PDF resume with production engineering track record',
    keywords: ['cv', 'resume', 'pdf', 'download', 'hire', 'experience'],
    group: 'Actions',
    icon: '📄',
    run: (ctx) => {
      ctx?.close?.()
      if (typeof window !== 'undefined') {
        window.open('/cv.pdf', '_blank')
      }
    },
  },
  {
    id: 'action-switch-role',
    title: 'Switch Visitor Role',
    description: 'Toggle between Recruiter, Client, and Founder experiences',
    keywords: ['switch', 'role', 'persona', 'toggle', 'recruiter', 'client', 'founder'],
    group: 'Actions',
    icon: '🔄',
    run: (ctx) => {
      ctx?.close?.()
      if (ctx?.router) ctx.router.push('/#roles')
      else if (typeof window !== 'undefined') window.location.href = '/#roles'
    },
  },
  {
    id: 'action-theme-cyber',
    title: 'Theme: Cyber Gold',
    description: 'Switch OS theme to Cyber Gold',
    keywords: ['theme', 'cyber', 'gold', 'amber'],
    group: 'Actions',
    icon: '🌟',
    run: (ctx) => {
      ctx?.setTheme?.('cyber-gold')
      ctx?.close?.()
    },
  },
  {
    id: 'action-theme-midnight',
    title: 'Theme: Midnight',
    description: 'Switch OS theme to Midnight Blue',
    keywords: ['theme', 'midnight', 'blue', 'dark'],
    group: 'Actions',
    icon: '🌑',
    run: (ctx) => {
      ctx?.setTheme?.('midnight')
      ctx?.close?.()
    },
  },
  {
    id: 'action-theme-matrix',
    title: 'Theme: Matrix',
    description: 'Switch OS theme to Matrix Green',
    keywords: ['theme', 'matrix', 'green', 'hacker'],
    group: 'Actions',
    icon: '💚',
    run: (ctx) => {
      ctx?.setTheme?.('matrix')
      ctx?.close?.()
    },
  },
  {
    id: 'action-theme-ice',
    title: 'Theme: Ice Station',
    description: 'Switch OS theme to Ice Station Cyan',
    keywords: ['theme', 'ice', 'station', 'cyan', 'arctic'],
    group: 'Actions',
    icon: '🧊',
    run: (ctx) => {
      ctx?.setTheme?.('ice-station')
      ctx?.close?.()
    },
  },
  {
    id: 'action-theme-void',
    title: 'Theme: Void',
    description: 'Switch OS theme to Pure Void Black',
    keywords: ['theme', 'void', 'pure black', 'minimal'],
    group: 'Actions',
    icon: '⬛',
    run: (ctx) => {
      ctx?.setTheme?.('void')
      ctx?.close?.()
    },
  },

  // ── System ──
  {
    id: 'action-launch-os',
    title: 'Launch ALLINET Desktop OS',
    description: 'Open the interactive web operating system and terminal environment',
    keywords: ['os', 'desktop', 'system', 'terminal', 'shell', 'apps'],
    group: 'System',
    icon: '💻',
    run: (ctx) => {
      ctx?.close?.()
      if (ctx?.openApp) ctx.openApp('terminal')
      else if (ctx?.router) ctx.router.push('/os')
      else if (typeof window !== 'undefined') window.location.href = '/os'
    },
  },

  // ── External ──
  {
    id: 'ext-github',
    title: 'GitHub Profile (Allinet-1)',
    description: 'Review verified open-source repositories and commits',
    keywords: ['github', 'code', 'git', 'repos', 'open source'],
    group: 'External',
    icon: '🐙',
    run: (ctx) => {
      ctx?.close?.()
      if (typeof window !== 'undefined') window.open('https://github.com/Allinet-1', '_blank', 'noopener,noreferrer')
    },
  },
  {
    id: 'ext-linkedin',
    title: 'LinkedIn Profile',
    description: 'Connect professionally on LinkedIn',
    keywords: ['linkedin', 'profile', 'connect', 'social', 'network'],
    group: 'External',
    icon: '🌐',
    run: (ctx) => {
      ctx?.close?.()
      if (typeof window !== 'undefined') window.open('https://linkedin.com/in/ajibade-alli-akinkunmi', '_blank', 'noopener,noreferrer')
    },
  },
  {
    id: 'ext-whatsapp',
    title: 'WhatsApp Direct Chat',
    description: 'Direct mobile conversation for project inquiries',
    keywords: ['whatsapp', 'chat', 'direct', 'instant message', 'mobile'],
    group: 'External',
    icon: '💬',
    run: (ctx) => {
      ctx?.close?.()
      if (typeof window !== 'undefined') window.open('https://wa.me/2348000000000', '_blank', 'noopener,noreferrer')
    },
  },
]

// ---------------------------------------------------------------------------
// Registry Storage & API
// ---------------------------------------------------------------------------

const registry: Map<string, CommandItem> = new Map(
  BUILTIN_COMMANDS.map((cmd) => [cmd.id, cmd])
)

/**
 * Registers a new command into the central registry.
 */
export function registerCommand(command: CommandItem): void {
  registry.set(command.id, command)
}

/**
 * Retrieves all registered commands.
 */
export function getAllCommands(): CommandItem[] {
  return Array.from(registry.values())
}

/**
 * Retrieves commands filtered by group category.
 */
export function getCommandsByGroup(group: CommandGroup): CommandItem[] {
  return getAllCommands().filter((c) => c.group === group)
}

/**
 * Performs fuzzy search across commands by query against title, keywords,
 * description, and group. Filters out items where when(ctx) returns false.
 */
export function searchCommands(
  query: string,
  ctx?: CommandContext,
  customList?: CommandItem[]
): CommandItem[] {
  const baseList = customList || getAllCommands()
  const available = baseList.filter((cmd) => (cmd.when ? cmd.when(ctx) : true))

  const q = (query || '').trim().toLowerCase()
  if (!q) {
    return available
  }

  return available
    .map((cmd) => {
      let score = 0
      const titleLower = cmd.title.toLowerCase()
      const descLower = (cmd.description || '').toLowerCase()

      // Exact title match gets highest score
      if (titleLower === q) score += 100
      else if (titleLower.startsWith(q)) score += 50
      else if (titleLower.includes(q)) score += 30

      // Keyword match
      for (const kw of cmd.keywords) {
        const kwLower = kw.toLowerCase()
        if (kwLower === q) score += 40
        else if (kwLower.startsWith(q)) score += 25
        else if (kwLower.includes(q)) score += 15
      }

      // Description match
      if (descLower.includes(q)) score += 10

      // Group match
      if (cmd.group.toLowerCase().includes(q)) score += 5

      return { cmd, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.cmd)
}
