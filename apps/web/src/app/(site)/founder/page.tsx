import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Product Engineering Partner for Founders — ALLINET',
  description:
    'Equity-aware product architecture, rapid MVP validation, and growth-ready engineering. Turn your idea into a scalable product without burning runway on bad technical choices.',
}

const MVP_PRINCIPLES = [
  {
    icon: '🎯',
    title: 'Problem-First Architecture',
    body: 'I validate your core user journey before writing a line of scalable infrastructure. No premature optimization.',
  },
  {
    icon: '⚡',
    title: 'Rapid Validation Cycles',
    body: 'Week-1 working demo, week-4 launchable MVP. Real users in front of real software fast.',
  },
  {
    icon: '📈',
    title: 'Growth-Ready by Default',
    body: 'Multi-tenancy, feature flags, usage-based billing hooks, and analytics from day one — not retrofitted later.',
  },
  {
    icon: '🔒',
    title: 'Investor-Ready Code',
    body: 'Typed, tested, documented. Your technical due diligence passes because the codebase is not held together with duct tape.',
  },
]

const FOUNDER_MODULES = [
  'User auth (magic link, OAuth, MFA)',
  'Tenant isolation & RBAC',
  'Usage metering & billing (Stripe)',
  'AI-powered onboarding flows',
  'Real-time dashboards',
  'Notification engine (email, WhatsApp, push)',
  'Admin command center',
  'Analytics & funnel tracking',
]

export default function FounderPage() {
  return (
    <main id="founder-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

      {/* Hero */}
      <div className="mb-14 text-center">
        <div className="site-badge mb-5 inline-flex">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" aria-hidden="true" />
          Founder-Friendly Engagement
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 font-display">
          From Idea to{' '}
          <span className="gold-gradient-text">Scalable Product</span>
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Equity-aware product architecture, rapid MVP validation, and growth-ready engineering.
          No burnout sprints. No technical debt landmines. Just a product that works.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link
            id="founder-cta-brief"
            href="/brief"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all duration-200"
          >
            Start Your Brief
          </Link>
          <a
            id="founder-cta-book"
            href="https://cal.com/allinet/15min"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl border border-amber-500/30 bg-slate-900/60 text-amber-300 font-medium hover:bg-slate-800/80 hover:border-amber-400/50 transition-all duration-200"
          >
            Founder Strategy Call
          </a>
        </div>
      </div>

      {/* Principles */}
      <section aria-labelledby="principles-heading" className="mb-14">
        <h2 id="principles-heading" className="text-2xl font-bold mb-6 text-center text-white">
          How I Think About Product
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {MVP_PRINCIPLES.map((p) => (
            <div key={p.title} className="site-glass-card p-6">
              <div className="text-2xl mb-3" aria-hidden="true">{p.icon}</div>
              <h3 className="text-base font-semibold text-amber-300 mb-2">{p.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Module catalogue */}
      <section aria-labelledby="modules-heading" className="mb-14">
        <h2 id="modules-heading" className="text-2xl font-bold mb-6 text-center text-white">
          Module Catalogue
        </h2>
        <p className="text-center text-slate-400 text-sm mb-6">
          Mix and match pre-built, production-tested modules to compose your product faster.
        </p>
        <ul
          className="grid sm:grid-cols-2 gap-3"
          aria-label="Available product modules"
        >
          {FOUNDER_MODULES.map((m) => (
            <li
              key={m}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-sm text-slate-300"
            >
              <span className="text-amber-400 font-mono text-xs" aria-hidden="true">✓</span>
              {m}
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section
        aria-labelledby="founder-cta-heading"
        className="site-glass-card p-8 text-center"
      >
        <h2 id="founder-cta-heading" className="text-xl font-bold text-white mb-3">
          Let&apos;s Build Something Real
        </h2>
        <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
          Fill in the brief generator to get a structured architecture proposal — it takes under 5 minutes.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/brief"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all duration-200"
          >
            Generate Architecture Brief →
          </Link>
          <Link
            href="/projects"
            className="px-6 py-3 rounded-xl border border-slate-700/60 bg-slate-800/40 text-slate-300 font-medium hover:border-amber-500/30 hover:text-white transition-all duration-200"
          >
            View Past Projects
          </Link>
        </div>
      </section>
    </main>
  )
}
