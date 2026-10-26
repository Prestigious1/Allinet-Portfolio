/**
 * core/status/ChangelogService.ts
 *
 * Fetches published changelog releases from Payload CMS with fallback data,
 * sorted chronologically (newest first).
 */

export interface ChangelogEntry {
  id?: string
  version: string
  title: string
  description: string
  date: string
  published: boolean
  category?: 'major' | 'feature' | 'improvement' | 'fix'
}

export const FALLBACK_CHANGELOG: ChangelogEntry[] = [
  {
    version: 'v2.0.0',
    title: 'ALLINET OS 2.0 Architectural Overhaul',
    description:
      'Major release featuring dual-mode shell (OS / Public Site), distributed rate limiting, Payload CMS expansion, and automated SEO engine.',
    date: '2026-10-25T12:00:00.000Z',
    published: true,
    category: 'major',
  },
  {
    version: 'v1.5.0',
    title: '3D World Environments & Audio Engine',
    description:
      'Added customizable 3D worlds, dynamic volumetric fog, time-of-day lighting transitions, and spatial audio synthesis.',
    date: '2026-09-25T12:00:00.000Z',
    published: true,
    category: 'feature',
  },
  {
    version: 'v1.2.0',
    title: 'AI Concierge & Lead Qualification Pipeline',
    description:
      'Integrated in-process knowledge retrieval engine, Turnstile anti-bot verification, and automated project intake system.',
    date: '2026-08-15T12:00:00.000Z',
    published: true,
    category: 'feature',
  },
  {
    version: 'v1.0.0',
    title: 'Initial Production Release',
    description:
      'Initial release of ALLINET Portfolio OS with multi-window desktop manager, retro CRT shaders, and system sound effects.',
    date: '2026-07-01T12:00:00.000Z',
    published: true,
    category: 'major',
  },
]

/**
 * Fetches published changelog entries, sorted newest first.
 */
export async function getChangelogEntries(): Promise<ChangelogEntry[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : 'http://localhost:3000/api'

  try {
    const res = await fetch(
      `${apiBase}/changelog?where[published][equals]=true&sort=-date&limit=50`,
      {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(1500),
      }
    )

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.docs) && data.docs.length > 0) {
        return data.docs.map((doc: any) => ({
          id: doc.id,
          version: doc.version,
          title: doc.title,
          description: doc.description,
          date: doc.date || doc.createdAt || new Date().toISOString(),
          published: doc.published !== undefined ? Boolean(doc.published) : true,
          category: doc.version?.startsWith('v2') || doc.version?.endsWith('.0.0')
            ? 'major'
            : 'feature',
        }))
      }
    }
  } catch {
    // CMS offline or mock environment
  }

  return FALLBACK_CHANGELOG
}
