import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Hire a Systems Architect for Your Business — ALLINET',
  description:
    'I build custom business management systems — booking engines, SaaS platforms, AI workflows, and operational command centers. Predictable timelines, honest delivery.',
}

const SERVICES_SUMMARY = [
  {
    icon: '📋',
    title: 'Custom Business Systems',
    body: 'Hall booking, laundry operations, inventory, appointments — purpose-built engines that eliminate manual chaos.',
  },
  {
    icon: '🏢',
    title: 'Multi-Tenant SaaS Platforms',
    body: 'White-label platforms with tenant isolation, role-based access, Stripe billing, and admin dashboards.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Workflows',
    body: 'Retrieval-grounded chatbots, automated qualification funnels, and intelligent notification pipelines.',
  },
  {
    icon: '📊',
    title: 'Operational Command Centers',
    body: 'Real-time staff dashboards, KPI boards, WhatsApp integrations, and PDF invoice automation.',
  },
]

const ENGAGEMENT_STAGES = [
  { step: '01', label: 'Discovery Call', desc: '15 minutes — understand your problem, budget, timeline' },
  { step: '02', label: 'Project Brief', desc: 'AI-assisted brief generator produces a proposal in minutes' },
  { step: '03', label: 'Milestone Plan', desc: 'Fixed milestones with deliverables, no scope creep surprises' },
  { step: '04', label: 'Build & Ship', desc: 'Weekly demos, transparent progress, final handover with docs' },
]

export default function ClientPage() {
  return (
    <main id="client-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

      {/* Hero */}
      <div className="mb-14 text-center">
        <div className="site-badge mb-5 inline-flex">
          <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
          Available for Projects
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 font-display">
          I Build Systems That{' '}
          <span className="gold-gradient-text">Run Your Business</span>
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          From custom booking engines to multi-tenant SaaS platforms.
          Predictable timelines, honest delivery, zero vague promises.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link
            id="client-cta-brief"
            href="/brief"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all duration-200"
          >
            Generate Project Brief
          </Link>
          <a
            id="client-cta-book"
            href="https://cal.com/allinet/15min"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl border border-amber-500/30 bg-slate-900/60 text-amber-300 font-medium hover:bg-slate-800/80 hover:border-amber-400/50 transition-all duration-200"
          >
            Book Discovery Call
          </a>
        </div>
      </div>

      {/* What I build */}
      <section aria-labelledby="services-heading" className="mb-14">
        <h2 id="services-heading" className="text-2xl font-bold mb-6 text-center text-white">
          What I Build
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {SERVICES_SUMMARY.map((s) => (
            <div key={s.title} className="site-glass-card p-6 transition-all duration-200">
              <div className="text-2xl mb-3" aria-hidden="true">{s.icon}</div>
              <h3 className="text-base font-semibold text-amber-300 mb-2">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="process-heading" className="mb-14">
        <h2 id="process-heading" className="text-2xl font-bold mb-8 text-center text-white">
          How We Work Together
        </h2>
        <ol className="flex flex-col gap-4" aria-label="Engagement stages">
          {ENGAGEMENT_STAGES.map(({ step, label, desc }) => (
            <li key={step} className="flex gap-5 items-start site-glass-card p-5">
              <span
                aria-hidden="true"
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-bold text-sm"
              >
                {step}
              </span>
              <div>
                <p className="font-semibold text-white mb-0.5">{label}</p>
                <p className="text-sm text-slate-400">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA block */}
      <section
        aria-labelledby="client-cta-heading"
        className="site-glass-card p-8 text-center"
      >
        <h2 id="client-cta-heading" className="text-xl font-bold text-white mb-3">
          Ready to Start?
        </h2>
        <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
          Use the brief generator to get an instant structured proposal — no call required to get started.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/brief"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all duration-200"
          >
            Generate Project Brief →
          </Link>
          <Link
            href="/demos/hall-booking"
            className="px-6 py-3 rounded-xl border border-slate-700/60 bg-slate-800/40 text-slate-300 font-medium hover:border-amber-500/30 hover:text-white transition-all duration-200"
          >
            See Live Demo
          </Link>
        </div>
      </section>
    </main>
  )
}
