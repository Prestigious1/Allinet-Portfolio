import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Projects & Case Studies — ALLINET',
  description:
    'Production-grade full-stack projects: booking command centers, multi-tenant SaaS platforms, AI concierge systems, and operational dashboards.',
}

/* TODO(owner): Replace with dynamic Payload query when live projects are published */
const PROJECTS = [
  {
    slug: 'hall-booking',
    title: 'Hall & Event Booking Command Center',
    type: 'Business Management System',
    tags: ['Next.js', 'TypeScript', 'PostgreSQL', 'WhatsApp API'],
    summary:
      'Eliminated double-bookings and manual WhatsApp chaos for a Lagos event venue. Real-time availability calendar, conflict detection, and automated customer notifications.',
    caseStudyEnabled: true,
    demoHref: '/demos/hall-booking',
  },
  {
    slug: 'laundry-operations',
    title: 'Laundry Operations Command Center',
    type: 'Operations Management System',
    tags: ['Next.js', 'TypeScript', 'QR Codes', 'Kanban'],
    summary:
      'End-to-end garment tracking from drop-off to delivery. QR bag tags, drag-and-drop stage management, automated pickup alerts.',
    caseStudyEnabled: true,
    demoHref: '/demos/laundry',
  },
  {
    slug: 'allinet-portfolio',
    title: 'ALLINET Command Center Portfolio',
    type: 'Full-Stack Portfolio Platform',
    tags: ['Next.js', 'Payload CMS', 'AI', 'Vercel AI SDK'],
    summary:
      'This site itself — a living command center with OS-mode desktop shell, AI concierge, role-targeted pages, and deterministic brief generator.',
    caseStudyEnabled: false,
    demoHref: '/os',
  },
]

export default function ProjectsPage() {
  return (
    <main id="projects-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="mb-12 text-center">
        <div className="site-badge mb-5 inline-flex">
          <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
          Case Studies
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 font-display">
          Projects &{' '}
          <span className="gold-gradient-text">Case Studies</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Real systems solving real operational problems. Each project is live, interactive, and documented.
        </p>
      </div>

      <ul className="flex flex-col gap-6" aria-label="Project case studies">
        {PROJECTS.map((p) => (
          <li key={p.slug} className="site-glass-card p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-xs font-mono text-amber-400/70 uppercase tracking-widest">
                  {p.type}
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{p.title}</h2>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {p.caseStudyEnabled && (
                  <Link
                    href={`/projects/${p.slug}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition-all duration-150"
                  >
                    Case Study →
                  </Link>
                )}
                <Link
                  href={p.demoHref}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all duration-150"
                >
                  Live Demo
                </Link>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">{p.summary}</p>
            <div className="flex flex-wrap gap-2">
              {p.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-800/60 border border-slate-700/60 text-slate-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
