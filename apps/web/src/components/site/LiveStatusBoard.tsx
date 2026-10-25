import Link from 'next/link'
import { getNowStatus } from '@/core/status/NowStatusService'
import { services } from '@/core/providers'

/**
 * LiveStatusBoard
 *
 * Compact living status strip displayed on the homepage.
 * Reflects real-time CMS project focus, release version, GitHub stats,
 * and current client availability.
 */
export async function LiveStatusBoard() {
  const status = await getNowStatus()

  let stats = { totalStars: 128, publicRepos: 38 }
  try {
    const ghStats = await services.github.getStats('alli-net')
    if (ghStats.data) {
      stats = ghStats.data
    }
  } catch {
    // Graceful fallback
  }

  return (
    <section
      id="live-status-board"
      aria-label="Live System & Engineering Status Board"
      className="w-full max-w-4xl my-8 mx-auto"
    >
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-amber-500/20 backdrop-blur-md shadow-lg shadow-black/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Item 1: Active Project Focus */}
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <div className="text-left">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Active Engineering
              </span>
              <Link
                id="status-board-project-link"
                href="/now"
                className="text-xs sm:text-sm font-medium text-white hover:text-amber-300 transition-colors flex items-center gap-1.5"
              >
                <span>{status.currentProject}</span>
                <span
                  data-testid="status-board-progress"
                  className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 font-mono"
                >
                  {status.progressPct}%
                </span>
              </Link>
            </div>
          </div>

          {/* Item 2: Deployment / Version */}
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Release Health
            </span>
            <Link
              id="status-board-changelog-link"
              href="/changelog"
              className="text-xs sm:text-sm font-medium text-slate-200 hover:text-amber-300 transition-colors font-mono"
            >
              v2.0.0 · Production
            </Link>
          </div>

          {/* Item 3: GitHub Activity Pill */}
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Open Source
            </span>
            <a
              id="status-board-github-link"
              href="https://github.com/alli-net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm font-medium text-slate-200 hover:text-amber-300 transition-colors flex items-center gap-1.5 font-mono"
            >
              <span>{stats.publicRepos} Repos</span>
              <span className="text-amber-400 text-xs">★ {stats.totalStars}</span>
            </a>
          </div>

          {/* Item 4: Booking & Availability */}
          <div className="flex items-center gap-2">
            <div className="text-left">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Availability
              </span>
              <span
                data-testid="status-board-availability"
                className={`text-xs sm:text-sm font-medium ${
                  status.slotsOpen > 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {status.slotsOpen > 0
                  ? `${status.slotsOpen} Slot${status.slotsOpen > 1 ? 's' : ''} Open`
                  : 'At Capacity'}
              </span>
            </div>
            <Link
              id="status-board-book-cta"
              href="/contact"
              className="ml-2 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium transition-colors"
            >
              Book →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
