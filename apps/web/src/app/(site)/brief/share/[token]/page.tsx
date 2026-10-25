import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { briefService } from '@/core/brief/BriefService'
import { MANDATORY_DISCLAIMER } from '@/core/brief/proposal-generator'

export const metadata: Metadata = {
  title: 'Project Proposal — ALLINET',
  description: 'Private architectural specification, phased deliverables, and scoping estimate.',
  robots: {
    index: false,
    follow: false,
  },
}

interface PageProps {
  params: Promise<{ token: string }> | { token: string }
}

export default async function ProposalSharePage({ params }: PageProps) {
  const resolvedParams = await params
  const token = resolvedParams?.token

  if (!token) {
    notFound()
  }

  const brief = await briefService.getBriefByToken(token)

  if (!brief || !brief.proposal) {
    notFound()
  }

  const proposal = brief.proposal
  const shareUrl = `https://allinet.dev/brief/share/${token}`
  const pdfDownloadUrl = `/api/brief/pdf?token=${encodeURIComponent(token)}`

  const waText = encodeURIComponent(
    `Hi Alli, I reviewed the project proposal for ${proposal.businessName} (${proposal.systemName}):\n${shareUrl}`
  )
  const whatsappUrl = `https://wa.me/?text=${waText}`

  return (
    <main id="proposal-share-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      {/* Top Banner / Privacy Alert */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          <span className="text-xs sm:text-sm font-medium text-amber-300">
            Private Client Proposal • 30-Day Access Token
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            id="proposal-download-pdf-top"
            href={pdfDownloadUrl}
            download
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
          >
            Download PDF ↓
          </a>
          <a
            id="proposal-whatsapp-share-top"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-750 transition-colors"
          >
            Share on WhatsApp ↗
          </a>
        </div>
      </div>

      {/* Hero Header */}
      <div className="mb-12">
        <div className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-2">
          Project Proposal & Architecture Blueprint
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 font-display">
          {proposal.systemName}
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
          Prepared exclusively for <strong className="text-amber-400">{proposal.businessName}</strong> ({proposal.industry}).
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        <div className="site-glass-card p-4">
          <span className="text-xs text-slate-400 block mb-1">Timeline Window</span>
          <span className="text-sm sm:text-base font-bold text-amber-300">
            {proposal.timelineBand.band} ({proposal.timelineBand.weeks})
          </span>
        </div>
        <div className="site-glass-card p-4">
          <span className="text-xs text-slate-400 block mb-1">Pacing Focus</span>
          <span className="text-sm sm:text-base font-bold text-white truncate block">
            {proposal.timelineBand.label}
          </span>
        </div>
        <div className="site-glass-card p-4">
          <span className="text-xs text-slate-400 block mb-1">Modules Included</span>
          <span className="text-sm sm:text-base font-bold text-emerald-400">
            {proposal.moduleBreakdown.length} System Modules
          </span>
        </div>
        <div className="site-glass-card p-4">
          <span className="text-xs text-slate-400 block mb-1">Budget Tier</span>
          <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate block">
            {proposal.budgetGuidance}
          </span>
        </div>
      </div>

      {/* Section 1: Executive Summary */}
      <div className="site-glass-card p-6 sm:p-8 mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-3 font-display">
          1. Executive Summary
        </h2>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
          {proposal.executiveSummary}
        </p>

        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
          Operational Problem & Need
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          {proposal.problemStatement}
        </p>
      </div>

      {/* Section 2: Architectural Stack */}
      <div className="site-glass-card p-6 sm:p-8 mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 font-display">
          2. Recommended Architectural Stack
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Frontend / Client</span>
            <span className="text-white font-medium">{proposal.suggestedArchitecture.frontend}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Backend & Serverless API</span>
            <span className="text-white font-medium">{proposal.suggestedArchitecture.backend}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Database & ORM</span>
            <span className="text-white font-medium">{proposal.suggestedArchitecture.database}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Security & Telemetry</span>
            <span className="text-white font-medium">{proposal.suggestedArchitecture.securityAndOps}</span>
          </div>
        </div>
      </div>

      {/* Section 3: Phased Milestones */}
      <div className="site-glass-card p-6 sm:p-8 mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-6 font-display">
          3. Implementation Milestones
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Phase 1 */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Phase 1 MVP
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {proposal.milestones.phase1.estimatedWeeks}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              {proposal.milestones.phase1.title}
            </h3>
            <p className="text-xs text-slate-400 mb-4 italic">
              {proposal.milestones.phase1.focus}
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              {proposal.milestones.phase1.deliverables.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Phase 2 */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Phase 2 Polish & Scale
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {proposal.milestones.phase2.estimatedWeeks}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              {proposal.milestones.phase2.title}
            </h3>
            <p className="text-xs text-slate-400 mb-4 italic">
              {proposal.milestones.phase2.focus}
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              {proposal.milestones.phase2.deliverables.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Section 4: System Modules Breakdown */}
      <div className="site-glass-card p-6 sm:p-8 mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 font-display">
          4. Selected Architectural Modules ({proposal.moduleBreakdown.length})
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {proposal.moduleBreakdown.map((mod) => (
            <div key={mod.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="text-sm font-bold text-white">{mod.title}</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Phase {mod.phase}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{mod.deliverable}</p>
              </div>
              <span className="text-[11px] text-amber-400/90 font-mono block mt-2 border-t border-slate-800/80 pt-2">
                Tech: {mod.tech}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Out of Scope & Boundaries */}
      <div className="site-glass-card p-6 sm:p-8 mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-3 font-display">
          5. Scope Boundaries (Not Included)
        </h2>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
          {proposal.notIncluded.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-slate-600 font-bold shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Mandatory Disclaimer Callout */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <strong className="text-white block mb-0.5">Scoping Estimate Disclaimer</strong>
          <span>{MANDATORY_DISCLAIMER} Final pricing and deliverables are confirmed upon discovery completion.</span>
        </div>
        <a
          id="proposal-download-pdf-bottom"
          href={pdfDownloadUrl}
          download
          className="shrink-0 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
        >
          Download Official PDF ↓
        </a>
      </div>

      {/* Kickoff / Call CTA Card */}
      <div className="site-glass-card p-8 sm:p-10 text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-2 font-display">
          Ready to verify this architecture?
        </h2>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Book a 15-minute discovery call with Alli to review requirements, refine milestone timelines, and inspect relevant demo architectures.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            id="proposal-book-call-cta"
            href="/contact"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm hover:opacity-95 transition-opacity"
          >
            Book Scoping Call →
          </Link>
          <a
            id="proposal-whatsapp-cta"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm hover:bg-slate-700 transition-colors"
          >
            Discuss on WhatsApp ↗
          </a>
        </div>
      </div>
    </main>
  )
}
