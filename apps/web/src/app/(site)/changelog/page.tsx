import type { Metadata } from 'next'
import Link from 'next/link'
import { getChangelogEntries } from '@/core/status/ChangelogService'

export const metadata: Metadata = {
  title: 'Changelog — Platform & Product Release Notes',
  description:
    'Chronological log of version updates, architectural overhauls, features released, and performance improvements across the ALLINET platform.',
}

const CATEGORY_STYLES = {
  major: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  feature: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
  improvement: 'bg-sky-400/10 text-sky-300 border-sky-400/30',
  fix: 'bg-purple-400/10 text-purple-300 border-purple-400/30',
}

export default async function ChangelogPage() {
  const entries = await getChangelogEntries()

  return (
    <main id="changelog-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="mb-14 text-center">
        <div className="site-badge mb-5 inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
          Platform Updates
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 font-display">
          Product <span className="gold-gradient-text">Changelog</span>
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Continuous delivery in action. Track platform versions, architecture upgrades, and new
          features shipped across the ALLINET operating system.
        </p>
        <div className="mt-6 flex justify-center gap-4 text-xs font-mono">
          <Link
            href="/now"
            className="text-amber-400 hover:text-amber-300 transition-colors underline"
          >
            Looking for what&apos;s currently being built? See /now →
          </Link>
        </div>
      </div>

      {/* Timeline entries */}
      <div className="relative border-l border-slate-800 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-12">
        {entries.map((entry, index) => {
          const entryDate = new Date(entry.date)
          const formattedDate = !isNaN(entryDate.getTime())
            ? entryDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : entry.date

          const cat = entry.category || 'feature'
          const badgeClass = CATEGORY_STYLES[cat] || CATEGORY_STYLES.feature

          return (
            <article
              key={entry.version || index}
              id={`release-${entry.version.replace(/[^a-zA-Z0-9_-]/g, '')}`}
              aria-labelledby={`release-title-${entry.version.replace(/[^a-zA-Z0-9_-]/g, '')}`}
              className="relative group"
            >
              {/* Timeline marker */}
              <div
                className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-amber-400/80 group-hover:border-amber-300 group-hover:scale-110 transition-all duration-200"
                aria-hidden="true"
              />

              <div className="site-glass-card p-6 sm:p-8">
                {/* Meta header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-sm font-bold"
                      data-testid="changelog-version"
                    >
                      {entry.version}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full border uppercase tracking-wider font-mono font-medium ${badgeClass}`}
                    >
                      {cat}
                    </span>
                  </div>
                  <time
                    dateTime={entry.date}
                    className="text-xs text-slate-400 font-mono"
                    data-testid="changelog-date"
                  >
                    {formattedDate}
                  </time>
                </div>

                {/* Title */}
                <h2
                  id={`release-title-${entry.version.replace(/[^a-zA-Z0-9_-]/g, '')}`}
                  className="text-xl sm:text-2xl font-bold text-white mb-3 font-display"
                >
                  {entry.title}
                </h2>

                {/* Description */}
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  {entry.description}
                </p>

                {/* Footer notes */}
                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>Verified Release</span>
                  <a
                    href="https://github.com/alli-net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    View commit log →
                  </a>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </main>
  )
}
