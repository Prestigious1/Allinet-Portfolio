import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Engagement Process — How We Work Together',
  description:
    'A transparent, milestone-driven engineering process: discovery call, brief, proposal, build, handover. No surprises, no scope creep.',
}

const PHASES = [
  {
    step: '01',
    label: 'Discovery Call',
    duration: '15 minutes',
    color: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    body: 'A focused 15-minute call to understand your problem, business context, budget range, and timeline. I ask the right questions so the brief is accurate from day one.',
    outputs: ['Problem statement', 'Budget alignment', 'Timeline feasibility check'],
  },
  {
    step: '02',
    label: 'Project Brief',
    duration: '5–15 minutes',
    color: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    body: 'Use the AI-assisted brief generator to produce a structured project specification. It takes under 15 minutes and produces a document I can respond to with a detailed proposal within 24 hours.',
    outputs: ['Structured requirements doc', 'Feature priority list', 'Integration list'],
  },
  {
    step: '03',
    label: 'Proposal & Sign-off',
    duration: '24–48 hours',
    color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    body: 'I generate a fixed-price proposal with clear milestones, deliverables, and payment schedule. No hourly billing guesswork. You sign off on the scope before a single line of code is written.',
    outputs: ['Fixed-price quote', 'Milestone breakdown', 'Payment schedule'],
  },
  {
    step: '04',
    label: 'Build & Weekly Demos',
    duration: 'Per milestone',
    color: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    body: 'Weekly Loom demos keep you informed without requiring meetings. You see real progress on real code. Each milestone is tested before delivery.',
    outputs: ['Weekly Loom demo videos', 'Milestone test reports', 'GitHub commits'],
  },
  {
    step: '05',
    label: 'Handover & Support',
    duration: '30 days included',
    color: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    body: 'Full source code handover, deployment documentation, environment variable guide, and a codebase walkthrough. 30-day post-launch support window included in every project.',
    outputs: ['Full source code', 'Deployment docs', 'Codebase Loom walkthrough', '30-day support'],
  },
]

export default function ProcessPage() {
  return (
    <main id="process-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Hero */}
      <div className="mb-16 text-center">
        <div className="site-badge mb-5 inline-flex">
          <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
          Engagement Process
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 font-display">
          How We{' '}
          <span className="gold-gradient-text">Work Together</span>
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          A transparent, milestone-driven process designed to protect your budget and your time.
          No surprises. No scope creep. No vague progress updates.
        </p>
      </div>

      {/* Phases */}
      <ol className="flex flex-col gap-6 mb-16" aria-label="Engagement phases">
        {PHASES.map(({ step, label, duration, color, body, outputs }) => (
          <li key={step} className="site-glass-card p-6 sm:p-8">
            <div className="flex flex-wrap items-start gap-4 mb-4">
              <span
                aria-hidden="true"
                className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border font-mono font-bold text-sm ${color}`}
              >
                {step}
              </span>
              <div>
                <h2 className="text-lg font-bold text-white">{label}</h2>
                <p className="text-xs font-mono text-slate-500 mt-0.5">{duration}</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">{body}</p>
            <ul className="flex flex-wrap gap-2" aria-label={`${label} outputs`}>
              {outputs.map((o) => (
                <li
                  key={o}
                  className="px-3 py-1.5 rounded-lg text-xs bg-slate-800/60 border border-slate-700/60 text-slate-300"
                >
                  {o}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {/* CTA */}
      <div className="text-center">
        <Link
          id="process-cta-brief"
          href="/brief"
          className="inline-flex px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all duration-200 text-lg"
        >
          Start With the Brief Generator →
        </Link>
        <p className="text-slate-500 text-sm mt-4">
          Takes under 15 minutes. No account required.
        </p>
      </div>
    </main>
  )
}
