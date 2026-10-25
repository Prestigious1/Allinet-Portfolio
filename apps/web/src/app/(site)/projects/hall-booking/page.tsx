import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mission File: Hall & Event Booking Command Center — ALLINET',
  description:
    'Case study: How an interactive TypeScript booking engine eliminated double-bookings and manual WhatsApp chaos for a premier Lagos event venue.',
  openGraph: {
    title: 'Mission File: Hall & Event Booking Command Center',
    description:
      'Case study on resolving turnaround buffer conflicts, automated deposits, and real-time availability in Lagos, Nigeria.',
    type: 'article',
  },
};

export default function HallBookingCaseStudyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'Mission File: Hall & Event Booking Command Center',
        description:
          'Case study on eliminating event hall double-bookings and automating reservation turnaround in Lagos, Nigeria.',
        author: {
          '@type': 'Person',
          name: 'Ajibade Alli Akinkunmi',
          url: 'https://alli.net.ng',
        },
        about: [
          'Venue Management Software',
          'Turnaround Conflict Detection',
          'Event Scheduling Automation',
        ],
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Hall & Event Booking Command Center',
        operatingSystem: 'Web Browser',
        applicationCategory: 'BusinessApplication',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'NGN',
        },
        featureList: [
          'Half-open interval conflict detection with turnaround buffers',
          'Integer kobo pricing in Nigerian Naira',
          'Role-based permission matrix and sanctions system',
          'Client self-service reservation portal',
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="hall-booking-mission-file" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link
            href="/projects"
            id="link-back-projects"
            className="text-xs font-mono text-amber-400/80 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5"
          >
            <span>←</span> Back to Projects & Case Studies
          </Link>
        </nav>

        {/* Hero & Title */}
        <header className="mb-12 border-b border-white/10 pb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-2.5 py-1 rounded text-xs font-mono tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              MISSION FILE • REF: MF-01
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-mono tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              SIMULATED PROOF DEMO
            </span>
            <span className="text-xs text-slate-400 font-mono">
              60-Second Read
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 font-display">
            Hall & Event Booking Command Center
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Eliminating double-bookings, turnaround clashes, and manual payment verification for high-demand event venues across Lagos.
          </p>
        </header>

        {/* Structured Spec Headings */}
        <div className="space-y-12">
          {/* Section: Business Type */}
          <section aria-labelledby="heading-business-type" className="site-glass-card p-6 sm:p-8">
            <h2
              id="heading-business-type"
              className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-2"
            >
              BUSINESS TYPE
            </h2>
            <p className="text-white text-base font-semibold">
              Commercial Event Venues & Multi-Space Banquet Facilities (Lagos, Nigeria)
            </p>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed">
              Serving corporate conferences, luxury wedding receptions, and high-security executive strategy meetings across Victoria Island, Lekki, and Ikoyi.
            </p>
          </section>

          {/* Section: The Problem */}
          <section aria-labelledby="heading-problem" className="site-glass-card p-6 sm:p-8">
            <h2
              id="heading-problem"
              className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-3"
            >
              THE PROBLEM
            </h2>
            <div className="text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                Managing bookings over informal WhatsApp chats and fragmented spreadsheets caused frequent double-booking crises, where weekend evening galas overlapped with corporate morning summits.
              </p>
              <p>
                Crucially, unmanaged turnaround windows (60–90 minutes required for deep cleaning, AV teardown, and stage re-rigging) meant incoming guests arrived while decor teams were still disassembling heavy line-array sound systems. Manual deposit tracking via paper bank slips invited payment reconciliation errors.
              </p>
            </div>
          </section>

          {/* Section: What I Built */}
          <section aria-labelledby="heading-what-i-built" className="site-glass-card p-6 sm:p-8">
            <h2
              id="heading-what-i-built"
              className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-3"
            >
              WHAT I BUILT
            </h2>
            <div className="text-slate-300 text-sm leading-relaxed space-y-3">
              <p>
                A deterministic, zero-dependency pure TypeScript domain engine managing venue availability, turnaround buffer intervals, and non-stacking loyalty/promo rules.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li><strong className="text-white">Turnaround Buffer Engine:</strong> Half-open interval mathematical conflict model that reserves setup and teardown windows automatically per hall.</li>
                <li><strong className="text-white">Integer-Kobo Currency Math:</strong> 100% pure integer arithmetic in Nigerian Naira (<code className="text-amber-300">en-NG</code>) eliminating floating-point rounding drifts.</li>
                <li><strong className="text-white">Operations Command Desk:</strong> Multi-role console (Front-desk, Manager, Owner, Auditor) with 30-day penalty bans for no-shows and verified appeal forgiveness.</li>
              </ul>
            </div>
          </section>

          {/* Section: Live Proof */}
          <section aria-labelledby="heading-live-proof" className="site-glass-card p-6 sm:p-8 border-amber-500/30 bg-amber-500/5">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h2
                  id="heading-live-proof"
                  className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold"
                >
                  LIVE PROOF
                </h2>
                <h3 className="text-lg font-bold text-white mt-1">
                  Interactive Sandbox Command Center
                </h3>
              </div>
              <Link
                href="/demos/hall-booking"
                id="cta-launch-demo-primary"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all inline-flex items-center gap-2"
              >
                <span>Launch Interactive Demo</span>
                <span>→</span>
              </Link>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Test real booking reservations, configure add-ons (LED video walls, 500kVA generator backup), observe live turnaround buffer collisions, and simulate operations desk approvals.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-slate-300">
                <span className="text-amber-400 font-bold block mb-1">Customer Booking Flow</span>
                Instant quotes, slot selection, and 15-minute pending hold generation.
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-slate-300">
                <span className="text-amber-400 font-bold block mb-1">Operations Admin Desk</span>
                Multi-hall timetable, deposit verification, and 60-second challenge.
              </div>
            </div>
          </section>

          {/* Section: Measured / Expected Result */}
          <section aria-labelledby="heading-result" className="site-glass-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-3">
              <h2
                id="heading-result"
                className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold"
              >
                MEASURED / EXPECTED RESULT
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Simulated Result
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#08090C] border border-white/10">
                <div className="text-2xl font-bold font-mono text-emerald-400">0</div>
                <div className="text-xs text-slate-300 mt-1 font-semibold">Turnaround Collisions</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Automated buffer guards</div>
              </div>
              <div className="p-4 rounded-xl bg-[#08090C] border border-white/10">
                <div className="text-2xl font-bold font-mono text-amber-400">&lt;60s</div>
                <div className="text-xs text-slate-300 mt-1 font-semibold">Quote to Confirmed Hold</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Zero back-and-forth chats</div>
              </div>
              <div className="p-4 rounded-xl bg-[#08090C] border border-white/10">
                <div className="text-2xl font-bold font-mono text-cyan-400">100%</div>
                <div className="text-xs text-slate-300 mt-1 font-semibold">Audit Traceability</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Every deposit & waiver logged</div>
              </div>
            </div>
          </section>

          {/* Section: Stack */}
          <section aria-labelledby="heading-stack" className="site-glass-card p-6 sm:p-8">
            <h2
              id="heading-stack"
              className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-3"
            >
              STACK
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                'Next.js 16 (App Router)',
                'TypeScript (Zero-dep Engine)',
                'Zustand (Sandbox Persistence)',
                'Tailwind CSS',
                'Vitest (100% Coverage)',
                'en-NG Currency Spec',
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 border border-white/10 text-slate-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Section: Security & Data */}
          <section aria-labelledby="heading-security" className="site-glass-card p-6 sm:p-8">
            <h2
              id="heading-security"
              className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-3"
            >
              SECURITY & DATA
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Strict RBAC enforces that front-desk staff can confirm payments but cannot forgive penalty appeals or alter hall capacities. All monetary calculations are performed in base kobo to eliminate floating-point precision flaws. No customer credit card or live phone data is recorded in browser storage.
            </p>
          </section>

          {/* Section: What I Would Add Next */}
          <section aria-labelledby="heading-next-steps" className="site-glass-card p-6 sm:p-8">
            <h2
              id="heading-next-steps"
              className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold mb-3"
            >
              WHAT I WOULD ADD NEXT
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Integration with Paystack Webhooks for automated instant settlement verification, physical gate barcode scanners for attendee check-in, and multi-facility synchronization across international branch hubs.
            </p>
          </section>

          {/* Section: CTA */}
          <section aria-labelledby="heading-cta" className="p-8 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h2 id="heading-cta" className="text-xl font-bold text-white mb-1">
                Explore the Live Booking Engine
              </h2>
              <p className="text-xs text-slate-300 max-w-md">
                Experience the customer reservation flow or test the operations admin console in real time.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/demos/hall-booking"
                id="cta-launch-demo-bottom"
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
              >
                Launch Live Demo →
              </Link>
              <Link
                href="/brief"
                id="cta-brief-builder"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-colors"
              >
                Build Similar Brief
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
