/**
 * core/status/NowStatusService.ts
 *
 * Fetches the living `now-status` global from Payload CMS with fallback data,
 * and provides staleness calculation.
 */

export interface NowStatusData {
  currentProject: string
  progressPct: number
  progressUpdatedAt: string
  milestone: string
  learningFocus: string
  availabilityText: string
  slotsOpen: number
  showGithub: boolean
}

export const FALLBACK_NOW_STATUS: NowStatusData = {
  currentProject: 'ALLINET Portfolio OS v2.0',
  progressPct: 85,
  progressUpdatedAt: new Date().toISOString(),
  milestone: 'Security hardening & CMS schema expansion',
  learningFocus: 'Distributed rate limiting, LLM memory retrieval, Next.js 16 Edge runtime',
  availabilityText: 'Open for high-impact advisory & architecture contracts',
  slotsOpen: 1,
  showGithub: true,
}

/**
 * Checks if a status timestamp is older than maxDays (default: 30 days).
 */
export function isStatusStale(updatedAt: string, maxDays = 30): boolean {
  const ts = new Date(updatedAt).getTime()
  if (isNaN(ts)) return true
  const ageMs = Date.now() - ts
  return ageMs > maxDays * 24 * 60 * 60 * 1000
}

/**
 * Fetches the living now-status data from Payload CMS.
 */
export async function getNowStatus(): Promise<NowStatusData> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : 'http://localhost:3000/api'

  try {
    const res = await fetch(`${apiBase}/globals/now-status`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 },
    })

    if (res.ok) {
      const data = await res.json()
      if (data && data.currentProject) {
        return {
          currentProject: data.currentProject,
          progressPct:
            typeof data.progressPct === 'number'
              ? data.progressPct
              : FALLBACK_NOW_STATUS.progressPct,
          progressUpdatedAt:
            data.progressUpdatedAt || data.updatedAt || FALLBACK_NOW_STATUS.progressUpdatedAt,
          milestone: data.milestone || FALLBACK_NOW_STATUS.milestone,
          learningFocus: data.learningFocus || FALLBACK_NOW_STATUS.learningFocus,
          availabilityText: data.availabilityText || FALLBACK_NOW_STATUS.availabilityText,
          slotsOpen:
            typeof data.slotsOpen === 'number'
              ? data.slotsOpen
              : FALLBACK_NOW_STATUS.slotsOpen,
          showGithub: data.showGithub !== undefined ? Boolean(data.showGithub) : true,
        }
      }
    }
  } catch {
    // CMS offline or mock environment
  }

  return FALLBACK_NOW_STATUS
}
