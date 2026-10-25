import type { Metadata } from 'next'
import Link from 'next/link'
import { getNowStatus, isStatusStale } from '@/core/status/NowStatusService'
import { services } from '@/core/providers'

export const metadata: Metadata = {
  title: 'Now — What I am Currently Building & Exploring',
  description:
    'Live engineering status: current active project, milestone progress, learning topics, and client availability.',
}

export default async function NowPage() {
  const status = await getNowStatus()
  const isStale = isStatusStale(status.progressUpdatedAt)

  // Fetch repos if enabled
  let repos: any[] = []
  if (status.showGithub) {
    try {
      const gh = await services.github.getPinnedRepos('alli-net')
      if (gh.data) {
        repos = gh.data
      }
    } catch {
      // Fallback
    }
  }

  const updatedDate = new Date(status.progressUpdatedAt)
  const formattedDate = !isNaN(updatedDate.getTime())
    ? updatedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently'

  const daysAgo = !isNaN(updatedDate.getTime())
    ? Math.max(0, Math.floor((Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <main id="now-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="site-badge mb-5 inline-flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isStale ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
            }`}
            aria-hidden="true"
          />
          Live Engineering Status
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 font-display">
          What I&apos;m Doing <span className="gold-gradient-text">Now</span>
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Inspired by Derek Sivers&apos;{' '}
          <a
            href="https://nownownow.com/about"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 transition-colors underline"
          >
            /now page movement
          </a>
          . A public snapshot of my active priorities, project milestones, and availability.
        </p>
      </div>

      {/* Staleness Banner */}
      {isStale ? (
        <div
          role="alert"
          aria-live="polite"
          className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-start gap-3"
        >
          <span className="text-lg" aria-hidden="true">
            ⚠️
          </span>
          <div>
            <strong className="font-semibold block text-amber-200">
              Notice: Status update may be delayed
            </strong>
            This page was last updated {daysAgo} days ago ({formattedDate}). Current focus or
            milestone progress may have shifted.
          </div>
        </div>
      ) : (
        <div
          role="status"
          aria-live="polite"
          className="mb-8 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            Verified live status
          </span>
          <span className="text-slate-400 font-mono">Updated: {formattedDate}</span>
        </div>
      )}

      <div className="grid gap-6">
        {/* Active Project & Milestone Card */}
        <section
          id="now-active-project"
          aria-labelledby="now-active-project-heading"
          className="site-glass-card p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-400/90 font-mono">
              Primary Build Focus
            </span>
            <span
              className="text-xs px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 font-mono"
              data-testid="now-progress-badge"
            >
              {status.progressPct}% Complete
            </span>
          </div>

          <h2
            id="now-active-project-heading"
            className="text-2xl sm:text-3xl font-bold text-white mb-3 font-display"
          >
            {status.currentProject}
          </h2>

          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            <strong className="text-slate-100">Current Milestone:</strong> {status.milestone}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-3.5 p-0.5 border border-slate-700/50 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500 shadow-sm shadow-amber-500/50"
              style={{ width: `${Math.min(100, Math.max(0, status.progressPct))}%` }}
              role="progressbar"
              aria-valuenow={status.progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Project progress: ${status.progressPct}%`}
            />
          </div>
        </section>

        {/* Availability & Capacity Card */}
        <section
          id="now-availability"
          aria-labelledby="now-availability-heading"
          className="site-glass-card p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-400/90 font-mono">
              Work Availability
            </span>
            <span
              className={`text-xs px-3 py-1 rounded-full font-mono font-medium ${
                status.slotsOpen > 0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              {status.slotsOpen > 0
                ? `${status.slotsOpen} Project Slot${status.slotsOpen > 1 ? 's' : ''} Open`
                : 'Fully Booked'}
            </span>
          </div>

          <h2 id="now-availability-heading" className="text-xl font-bold text-white mb-2">
            {status.availabilityText}
          </h2>

          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            I limit concurrent client engagements to guarantee high velocity, zero compromises,
            and dedicated daily engineering focus.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              id="now-cta-contact"
              href="/contact"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all duration-200 text-sm"
            >
              Start a Conversation →
            </Link>
            <Link
              id="now-cta-brief"
              href="/brief"
              className="px-6 py-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-amber-500/50 text-slate-200 hover:text-white transition-all duration-200 text-sm"
            >
              Generate Project Brief
            </Link>
          </div>
        </section>

        {/* Learning & Deep-Dives */}
        <section
          id="now-learning"
          aria-labelledby="now-learning-heading"
          className="site-glass-card p-6 sm:p-8"
        >
          <span className="text-xs uppercase tracking-wider font-semibold text-amber-400/90 font-mono block mb-3">
            Research & Skill Deep-Dives
          </span>
          <h2 id="now-learning-heading" className="text-xl font-bold text-white mb-4">
            What I&apos;m Studying
          </h2>
          <div className="flex flex-wrap gap-2">
            {status.learningFocus.split(',').map((topic, index) => (
              <span
                key={index}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-200 text-xs font-mono"
              >
                {topic.trim()}
              </span>
            ))}
          </div>
        </section>

        {/* GitHub Live Feed */}
        {status.showGithub && repos.length > 0 && (
          <section
            id="now-github"
            aria-labelledby="now-github-heading"
            className="site-glass-card p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-400/90 font-mono">
                Recent Code Activity
              </span>
              <a
                href="https://github.com/alli-net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-mono"
              >
                github.com/alli-net →
              </a>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {repos.map((repo: any) => (
                <a
                  key={repo.name}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-amber-500/40 transition-all duration-200 group flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-mono text-sm font-bold text-white group-hover:text-amber-300 transition-colors mb-1.5 flex items-center justify-between">
                      {repo.name}
                      <span className="text-xs text-slate-500 font-normal">★ {repo.stars}</span>
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                      {repo.description || 'Open source engineering project.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                    {repo.language && <span>{repo.language}</span>}
                    <span>⑂ {repo.forks}</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
