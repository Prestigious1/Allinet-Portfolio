import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CV — Ajibade Alli Akinkunmi, Senior Full-Stack Engineer',
  description:
    'Full curriculum vitae: 5+ years shipping Next.js, TypeScript, AI, and PostgreSQL systems. Skills, experience, education, and downloadable PDF.',
}

const EXPERIENCE = [
  {
    role: 'Senior Full-Stack Engineer & Systems Architect',
    company: 'ALLINET (Independent)',
    period: '2022 — Present',
    location: 'Lagos, Nigeria (Remote)',
    highlights: [
      'Designed and shipped multi-tenant SaaS architectures serving concurrent tenants with full data isolation',
      'Built deterministic AI concierge (Vercel AI SDK + OpenRouter) with retrieval-grounded knowledge base',
      'Implemented Hall Booking Command Center: real-time availability, conflict detection, WhatsApp notifications',
      'Built Laundry Operations Command Center: QR bag tags, drag-and-drop Kanban, automated pickup alerts',
      'Maintained 60+ unit, integration, and E2E tests (Vitest + Playwright) with CI/CD on GitHub Actions',
      'Achieved Lighthouse mobile scores ≥ 90 across all production projects',
    ],
  },
  {
    role: 'Full-Stack Developer',
    company: 'Freelance / Contract',
    period: '2020 — 2022',
    location: 'Lagos, Nigeria',
    highlights: [
      'Delivered 12+ client projects across e-commerce, booking, and content management domains',
      'Migrated legacy PHP/jQuery applications to modern Next.js + PostgreSQL stacks',
      'Built RESTful and GraphQL APIs with Node.js, Express, and Prisma ORM',
      'Introduced automated testing (Jest) to previously untested client codebases',
    ],
  },
]

const EDUCATION = [
  {
    degree: 'B.Sc. Computer Science',
    institution: 'University of Lagos',
    period: '2022 — 2026',
    note: 'Second Class Upper Honours',
  },
]

const CORE_SKILLS = [
  { category: 'Languages', items: ['TypeScript', 'JavaScript', 'SQL', 'HTML5', 'CSS3'] },
  { category: 'Frameworks', items: ['Next.js 15+', 'React 19', 'Node.js', 'Hono'] },
  { category: 'Data & Storage', items: ['PostgreSQL', 'Supabase', 'Drizzle ORM', 'Prisma', 'Redis', 'Upstash'] },
  { category: 'AI & LLM', items: ['Vercel AI SDK', 'OpenRouter', 'pgvector', 'LangChain'] },
  { category: 'CMS & Auth', items: ['Payload CMS 3', 'NextAuth', 'Clerk'] },
  { category: 'Testing', items: ['Vitest', 'Playwright', 'Testing Library', 'MSW'] },
  { category: 'DevOps', items: ['GitHub Actions', 'Vercel', 'Docker', 'Cloudflare'] },
  { category: 'State & Forms', items: ['Zustand', 'Zod', 'React Hook Form', 'TanStack Query'] },
]

export default function CVPage() {
  return (
    <main id="cv-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="site-badge mb-5 inline-flex">
          <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
          Curriculum Vitae
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 font-display">
          Ajibade{' '}
          <span className="gold-gradient-text">Alli Akinkunmi</span>
        </h1>
        <p className="text-slate-400 text-lg mb-6">
          Senior Full-Stack Engineer & Systems Architect
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-400 mb-8">
          <span>Lagos, Nigeria</span>
          <span aria-hidden="true">·</span>
          <span>Remote-first</span>
          <span aria-hidden="true">·</span>
          <a href="mailto:hello@allinet.dev" className="text-amber-400 hover:text-amber-300 transition-colors">
            hello@allinet.dev
          </a>
        </div>
        <Link
          id="cv-download-pdf"
          href="/api/cv/download"
          prefetch={false}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all duration-200"
          aria-label="Download CV as PDF"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 12l-4-4h2.5V4h3v4H12L8 12z" />
            <path d="M2 13h12v1.5H2V13z" />
          </svg>
          Download PDF
        </Link>
      </div>

      {/* Professional Summary */}
      <section aria-labelledby="summary-heading" className="site-glass-card p-6 mb-8">
        <h2 id="summary-heading" className="text-lg font-bold text-amber-300 mb-3">Professional Summary</h2>
        <p className="text-slate-300 leading-relaxed text-sm">
          Senior Full-Stack Engineer with 5+ years of experience designing and shipping production-grade
          systems for Lagos businesses and international clients. Specializes in TypeScript/Next.js
          architectures, deterministic domain engines, AI-powered workflows, and operational command
          centers. Known for test-first engineering discipline, zero-tolerance for technical debt on
          core paths, and transparent milestone-driven delivery.
        </p>
      </section>

      {/* Core Skills */}
      <section aria-labelledby="skills-heading" className="mb-8">
        <h2 id="skills-heading" className="text-xl font-bold text-white mb-5">Core Skills</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {CORE_SKILLS.map(({ category, items }) => (
            <div key={category} className="site-glass-card p-4">
              <h3 className="text-xs font-mono text-amber-400/70 uppercase tracking-widest mb-3">{category}</h3>
              <div className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <span
                    key={item}
                    className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-800/60 border border-slate-700/60 text-slate-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section aria-labelledby="experience-heading" className="mb-8">
        <h2 id="experience-heading" className="text-xl font-bold text-white mb-5">Experience</h2>
        <div className="flex flex-col gap-6">
          {EXPERIENCE.map((job) => (
            <div key={`${job.role}-${job.period}`} className="site-glass-card p-6">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                <h3 className="text-base font-bold text-white">{job.role}</h3>
                <span className="text-xs font-mono text-slate-500">{job.period}</span>
              </div>
              <p className="text-sm text-amber-400/80 mb-1">{job.company}</p>
              <p className="text-xs text-slate-500 mb-4">{job.location}</p>
              <ul className="flex flex-col gap-2" aria-label={`${job.role} highlights`}>
                {job.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="text-amber-400/60 mt-0.5 flex-shrink-0" aria-hidden="true">▸</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section aria-labelledby="education-heading" className="mb-8">
        <h2 id="education-heading" className="text-xl font-bold text-white mb-5">Education</h2>
        <div className="flex flex-col gap-4">
          {EDUCATION.map((edu) => (
            <div key={edu.degree} className="site-glass-card p-6">
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <h3 className="text-base font-bold text-white">{edu.degree}</h3>
                  <p className="text-sm text-amber-400/80 mt-0.5">{edu.institution}</p>
                  {edu.note && <p className="text-xs text-slate-500 mt-1">{edu.note}</p>}
                </div>
                <span className="text-xs font-mono text-slate-500">{edu.period}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <div className="text-center mt-12">
        <p className="text-slate-500 text-sm mb-4">
          Interested in working together?
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            id="cv-cta-contact"
            href="/contact"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all duration-200"
          >
            Get in Touch
          </Link>
          <Link
            href="/recruiter"
            className="px-6 py-3 rounded-xl border border-slate-700/60 bg-slate-800/40 text-slate-300 font-medium hover:border-amber-500/30 hover:text-white transition-all duration-200"
          >
            Recruiter Page →
          </Link>
        </div>
      </div>
    </main>
  )
}
