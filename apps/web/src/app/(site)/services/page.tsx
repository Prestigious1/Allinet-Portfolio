import type { Metadata } from 'next'
import Link from 'next/link'
import { generateServiceJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Services — What I Build & How I Work',
  description:
    'Custom business systems, multi-tenant SaaS platforms, AI workflows, and operational command centers. Fixed milestones, honest delivery, zero scope creep.',
}

const SERVICES = [
  {
    icon: '📋',
    title: 'Custom Business Systems',
    price: 'From ₦500k / $600',
    timeline: '4–8 weeks',
    body: 'Purpose-built operational engines: hall booking command centers, laundry management, inventory control, appointment schedulers. Eliminates manual spreadsheets and WhatsApp chaos.',
    includes: [
      'Real-time availability & conflict detection',
      'WhatsApp / email notification pipelines',
      'PDF invoicing & receipt generation',
      'Staff operations dashboard',
    ],
  },
  {
    icon: '🏢',
    title: 'Multi-Tenant SaaS Platforms',
    price: 'From ₦1.5m / $1,800',
    timeline: '8–16 weeks',
    body: 'White-label SaaS products with tenant isolation, role-based access control, Stripe billing integration, and admin dashboards you can actually use.',
    includes: [
      'Tenant isolation (schema or row-level)',
      'RBAC with custom permission sets',
      'Stripe subscriptions & usage metering',
      'Feature flags & gradual rollouts',
    ],
  },
  {
    icon: '🤖',
    title: 'AI-Powered Workflows',
    price: 'From ₦800k / $950',
    timeline: '3–6 weeks',
    body: 'Retrieval-grounded chatbots, automated qualification funnels, intelligent document processing, and LLM pipelines that actually stay on-topic.',
    includes: [
      'Knowledge base ingestion & vector search',
      'Streaming LLM with Vercel AI SDK',
      'Deterministic qualification state machines',
      'WhatsApp & email automation',
    ],
  },
  {
    icon: '📊',
    title: 'Operational Command Centers',
    price: 'From ₦400k / $500',
    timeline: '2–4 weeks',
    body: 'Real-time staff dashboards, KPI boards, Kanban stage managers, and reporting surfaces that give you visibility into your operations at a glance.',
    includes: [
      'Live data dashboards (WebSocket / polling)',
      'Drag-and-drop Kanban boards',
      'Exportable reports (PDF / CSV)',
      'Mobile-responsive operator views',
    ],
  },
]

export default function ServicesPage() {
  const servicesJsonLd = SERVICES.map((s) =>
    generateServiceJsonLd({
      name: s.title,
      description: s.body,
    })
  )

  return (
    <main id="services-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
      />
      {/* Hero */}
      <div className="mb-16 text-center">
        <div className="site-badge mb-5 inline-flex">
          <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
          Services & Pricing
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 font-display">
          What I{' '}
          <span className="gold-gradient-text">Build & Ship</span>
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Production-grade systems with fixed milestones, transparent pricing, and honest delivery.
          No vague timelines. No scope creep surprises.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link
            id="services-cta-brief"
            href="/brief"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all duration-200"
          >
            Generate Project Brief
          </Link>
          <a
            id="services-cta-book"
            href="https://cal.com/allinet/15min"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl border border-amber-500/30 bg-slate-900/60 text-amber-300 font-medium hover:bg-slate-800/80 hover:border-amber-400/50 transition-all duration-200"
          >
            Book Discovery Call
          </a>
        </div>
      </div>

      {/* Service cards */}
      <section aria-labelledby="services-list-heading" className="mb-16">
        <h2 id="services-list-heading" className="sr-only">Service offerings</h2>
        <ul className="flex flex-col gap-6" aria-label="Service packages">
          {SERVICES.map((s) => (
            <li key={s.title} className="site-glass-card p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden="true">{s.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{s.title}</h3>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{s.timeline}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold font-mono">
                  {s.price}
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{s.body}</p>
              <ul className="grid sm:grid-cols-2 gap-2" aria-label={`${s.title} inclusions`}>
                {s.includes.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="text-amber-400 font-mono" aria-hidden="true">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {/* Guarantee strip */}
      <section
        aria-labelledby="guarantee-heading"
        className="site-glass-card p-8 text-center"
      >
        <h2 id="guarantee-heading" className="text-xl font-bold text-white mb-3">
          The ALLINET Guarantee
        </h2>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed mb-6">
          Every project ships with full source code handover, deployment documentation,
          a 30-day support window, and a Loom walkthrough of the codebase.
          If milestone deliverables don&apos;t match the brief, you don&apos;t pay for that milestone.
        </p>
        <Link
          href="/process"
          className="text-amber-400 text-sm font-medium hover:text-amber-300 transition-colors"
        >
          See how the engagement process works →
        </Link>
      </section>
    </main>
  )
}
