import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Hire Ajibade Alli Akinkunmi — Senior Full-Stack Engineer',
  description:
    'Senior Full-Stack & Systems Architect with 5+ years shipping production Next.js, TypeScript, AI, and PostgreSQL systems. Open to senior/staff IC and lead roles.',
}

const TECH_STACK = [
  'TypeScript', 'Next.js 15+', 'React 19', 'Node.js', 'PostgreSQL',
  'Supabase', 'Payload CMS', 'Prisma', 'Drizzle ORM', 'Vercel AI SDK',
  'Zustand', 'Zod', 'Vitest', 'Playwright', 'Tailwind CSS',
  'Docker', 'GitHub Actions', 'Vercel', 'Redis / Upstash',
]

const PROOF_POINTS = [
  {
    icon: '🏗️',
    title: 'Systems Architect',
    body: 'Designed and shipped multi-tenant SaaS architectures, deterministic domain engines, and real-time operational command centers.',
  },
  {
    icon: '🤖',
    title: 'AI Integration',
    body: 'Built retrieval-grounded AI concierges, streaming LLM pipelines, and qualification state machines using Vercel AI SDK and OpenRouter.',
  },
  {
    icon: '🧪',
    title: 'Test-First Engineering',
    body: 'Maintains 60+ passing unit, integration, and E2E tests (Vitest + Playwright) with CI/CD on GitHub Actions.',
  },
  {
    icon: '⚡',
    title: 'Performance-Obsessed',
    body: 'Targets LCP ≤ 2.5s, CLS ≤ 0.1, mobile Lighthouse ≥ 90. Zero technical debt tolerance on core paths.',
  },
]

export default function RecruiterPage() {
  return (
    <main id="recruiter-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

      {/* Hero */}
      <div className="mb-14 text-center">
        <div className="site-badge mb-5 inline-flex">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          Open to Opportunities
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 font-display">
          Senior Full-Stack &{' '}
          <span className="gold-gradient-text">Systems Architect</span>
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          5+ years shipping production-grade TypeScript, Next.js, and AI-powered systems.
          Available for senior IC, staff engineer, and technical lead roles.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <a
            id="recruiter-cta-cv"
            href="/cv"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all duration-200"
          >
            View Full CV
          </a>
          <Link
            id="recruiter-cta-contact"
            href="/contact"
            className="px-6 py-3 rounded-xl border border-amber-500/30 bg-slate-900/60 text-amber-300 font-medium hover:bg-slate-800/80 hover:border-amber-400/50 transition-all duration-200"
          >
            Get in Touch
          </Link>
          <a
            id="recruiter-cta-book"
            href="https://cal.com/allinet/15min"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl border border-slate-700/60 bg-slate-800/40 text-slate-300 font-medium hover:border-amber-500/30 hover:text-white transition-all duration-200"
          >
            Book 15-min Call
          </a>
        </div>
      </div>

      {/* Proof points */}
      <section aria-labelledby="proof-heading" className="mb-14">
        <h2 id="proof-heading" className="text-2xl font-bold mb-6 text-center text-white">
          What I Bring
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {PROOF_POINTS.map((p) => (
            <div key={p.title} className="site-glass-card p-6">
              <div className="text-2xl mb-3" aria-hidden="true">{p.icon}</div>
              <h3 className="text-base font-semibold text-amber-300 mb-2">{p.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section aria-labelledby="stack-heading" className="mb-14">
        <h2 id="stack-heading" className="text-2xl font-bold mb-6 text-center text-white">
          Core Technology Stack
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {TECH_STACK.map((t) => (
            <span
              key={t}
              className="px-3 py-1.5 rounded-lg text-sm font-mono bg-slate-800/60 border border-slate-700/60 text-slate-300"
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Engagement info */}
      <section
        aria-labelledby="engagement-heading"
        className="site-glass-card p-8 text-center"
      >
        <h2 id="engagement-heading" className="text-xl font-bold text-white mb-3">
          Engagement Details
        </h2>
        <dl className="grid sm:grid-cols-3 gap-6 text-sm mt-6">
          {[
            { label: 'Location', value: 'Lagos, Nigeria (Remote-first)' },
            { label: 'Availability', value: 'Open — 2–4 weeks notice' },
            { label: 'Preference', value: 'Full-time · Contract · Hybrid' },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-slate-500 font-mono text-xs uppercase tracking-widest mb-1">{label}</dt>
              <dd className="text-white font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  )
}
