import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mission File: Laundry Operations Command Center — ALLINET',
  description:
    'Case study: How an itemized tracking engine, deterministic QR bag tags, and automated customer pickup alerts eliminated garment loss for commercial laundry operations in Lagos.',
  openGraph: {
    title: 'Mission File: Laundry Operations Command Center',
    description:
      'Case study on garment loss prevention, automated pickup alerts, and Kanban stage management in Lagos, Nigeria.',
    type: 'article',
  },
};

export default function LaundryOperationsCaseStudyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'Mission File: Laundry Operations Command Center',
        description:
          'Case study on eliminating garment loss and automating customer pickup notifications for commercial dry cleaning operations in Lagos, Nigeria.',
        author: {
          '@type': 'Person',
          name: 'Ajibade Alli Akinkunmi',
          url: 'https://alli.net.ng',
        },
        about: [
          'Laundry Operations Management',
          'Garment Loss Prevention',
          'Barcode Bag Tagging',
          'Workflow Stage Automation',
        ],
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Laundry Operations Command Center',
        operatingSystem: 'Web Browser',
        applicationCategory: 'BusinessApplication',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'NGN',
        },
        featureList: [
          'Itemized garment lifecycle tracking across 8 discreet processing stages',
          'Deterministic SVG QR bag tag generator for zero-loss garment intake',
          'Drag-and-drop Kanban stage board with delay alerts',
          'Customer self-service ticket tracker with real-time stage sync',
          'Integer-kobo currency pricing in Nigerian Naira with express surcharges',
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

      <main id="laundry-operations-mission-file" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
              MISSION FILE • REF: MF-02
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-mono tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              SIMULATED PROOF DEMO
            </span>
            <span className="text-xs text-slate-400 font-mono">
              60-Second Read
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 font-display">
            Laundry Operations Command Center
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Eliminating garment loss, counter intake bottlenecks, and customer pickup anxiety for high-volume commercial dry cleaners and garment care facilities in Lagos.
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
              Commercial Dry Cleaners & Multi-Branch Garment Care Services (Lagos, Nigeria)
            </p>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed">
              Handling high-value executive apparel, ceremonial native attire (Agbada, Aso-Oke), and premium delicate fabrics across Victoria Island, Lekki, and Ikeja branches.
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
                Commercial laundries processing hundreds of items daily suffered from garment loss, untagged mix-ups between sorting tables and wash tumblers, and customer anxiety over expensive native outfits and designer suits.
              </p>
              <p>
                Front desks relied on handwritten paper carbon-copy receipts that were easily lost or water-damaged. Customers had no visibility into processing stages, causing phone lines to be jammed with repetitive &quot;Is my laundry ready?&quot; inquiries, while finished orders sat unclaimed in sorting bins for weeks.
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
                An end-to-end, zero-dependency pure TypeScript laundry domain engine providing item-level tracking, deterministic QR bag tagging, and real-time customer tracking.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li><strong className="text-white">Deterministic QR Bag Tags:</strong> Instant SVG QR code generation deterministically mapped to order and garment IDs for physical tag printing and scanning.</li>
                <li><strong className="text-white">Integer-Kobo Currency & Express Surcharges:</strong> 100% integer mathematics in Nigerian Naira (<code className="text-amber-300">en-NG</code>) with automated +50% express wash surcharges and loyalty point redemption.</li>
                <li><strong className="text-white">Operations Desk & Kanban Stage Board:</strong> Drag-and-drop operations console advancing orders across 5 stages with automated delayed-order flags.</li>
                <li><strong className="text-white">Customer Self-Service Tracker:</strong> Real-time ticket lookup (`LND-1042`), garment-level checklist status, and instant pickup alerts.</li>
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
                href="/demos/laundry"
                id="cta-launch-demo-primary"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all inline-flex items-center gap-2"
              >
                <span>Launch Interactive Demo</span>
                <span>→</span>
              </Link>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Explore the live customer tracker or the staff operations desk. Drag orders between Kanban columns, create rapid intake tickets, generate QR bag tags, and inspect garment-level progress.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-slate-300">
                <span className="text-amber-400 font-bold block mb-1">Customer Tracker Portal</span>
                Live stage progress bar, item checklist, express badges, and pickup notifications.
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-slate-300">
                <span className="text-amber-400 font-bold block mb-1">Operations Admin Desk</span>
                Drag-and-drop Kanban stage board, QR bag tag printer, and delayed-order alert flags.
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
                <div className="text-2xl font-bold font-mono text-emerald-400">0%</div>
                <div className="text-xs text-slate-300 mt-1 font-semibold">Garment Loss</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Item-level QR code tracking</div>
              </div>
              <div className="p-4 rounded-xl bg-[#08090C] border border-white/10">
                <div className="text-2xl font-bold font-mono text-amber-400">&lt;30s</div>
                <div className="text-xs text-slate-300 mt-1 font-semibold">Rapid Counter Intake</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Garment presets + bag tags</div>
              </div>
              <div className="p-4 rounded-xl bg-[#08090C] border border-white/10">
                <div className="text-2xl font-bold font-mono text-cyan-400">100%</div>
                <div className="text-xs text-slate-300 mt-1 font-semibold">Customer Visibility</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Live self-service tracker</div>
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
                'SVG Barcode Generator',
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
              Multi-role access policies ensure counter staff can create orders and update stages, while claims resolution and financial compensation remain restricted to branch managers. All price, surcharge, and refund math is executed in integer kobo to eliminate floating-point drift. Customer phone and address data is never leaked to client telemetry.
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
              Thermal Bluetooth label printer integration for waterproof garment tags, automated WhatsApp/SMS gateway notifications when orders enter &quot;Ready for Pickup&quot;, and driver delivery dispatch routing optimized across Lagos traffic corridors.
            </p>
          </section>

          {/* Section: CTA */}
          <section aria-labelledby="heading-cta" className="p-8 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h2 id="heading-cta" className="text-xl font-bold text-white mb-1">
                Explore the Live Laundry System
              </h2>
              <p className="text-xs text-slate-300 max-w-md">
                Experience the customer order tracker or manage laundry stages and bag tags on the operations desk.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/demos/laundry"
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
