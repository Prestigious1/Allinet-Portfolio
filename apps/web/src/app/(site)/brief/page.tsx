import type { Metadata } from 'next'
import { BriefWizard } from '@/features/brief/BriefWizard'

export const metadata: Metadata = {
  title: 'Project Brief Builder — ALLINET',
  description:
    'Structure your software requirements in 3 minutes. Receive an instant modular architecture breakdown, timeline estimate, and proposal preview.',
  openGraph: {
    title: 'Project Brief Builder — ALLINET',
    description:
      'Structure your software requirements in 3 minutes. Receive an instant modular architecture breakdown, timeline estimate, and proposal preview.',
  },
}

export default function BriefPage() {
  return (
    <main id="brief-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="site-badge mb-4 inline-flex">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
          Interactive Scoping Tool
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 font-display">
          Project <span className="gold-gradient-text">Brief Builder</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Define your operational bottleneck and required system capabilities in 5 quick steps.
          Get a structured architecture roadmap, phased milestones, and proposal preview.
        </p>
      </div>

      {/* The Wizard */}
      <BriefWizard />

      {/* Trust & Next Steps Info */}
      <div className="mt-16 grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-center sm:text-left">
        <div className="site-glass-card p-5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3 font-bold text-sm">
            1
          </div>
          <h2 className="text-sm font-bold text-white mb-1.5">No Pressure Scoping</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            All estimates are non-binding architectural recommendations to align on deliverables before any commitment.
          </p>
        </div>

        <div className="site-glass-card p-5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3 font-bold text-sm">
            2
          </div>
          <h2 className="text-sm font-bold text-white mb-1.5">24-Hour Review</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every brief is directly analyzed by Alli. You receive a structured written response and timeline verification within 24 hours.
          </p>
        </div>

        <div className="site-glass-card p-5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3 font-bold text-sm">
            3
          </div>
          <h2 className="text-sm font-bold text-white mb-1.5">Instant PDF Export</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Generate and export an executive proposal summary to review with your co-founders, stakeholders, or board.
          </p>
        </div>
      </div>
    </main>
  )
}
