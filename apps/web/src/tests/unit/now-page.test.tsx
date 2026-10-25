import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import NowPage from '@/app/(site)/now/page'
import * as NowStatusService from '@/core/status/NowStatusService'

vi.mock('@/core/providers', () => ({
  services: {
    github: {
      getPinnedRepos: vi.fn().mockResolvedValue({
        data: [
          {
            name: 'allinet-os',
            description: 'Browser operating system portfolio',
            stars: 128,
            forks: 23,
            language: 'TypeScript',
            url: 'https://github.com/alli-net/allinet-os',
          },
        ],
        error: null,
      }),
    },
  },
}))

describe('TASK-P6-01: /now Live Status Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('isStatusStale utility', () => {
    it('returns false for fresh timestamps within 30 days', () => {
      const freshDate = new Date().toISOString()
      expect(NowStatusService.isStatusStale(freshDate, 30)).toBe(false)

      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      expect(NowStatusService.isStatusStale(tenDaysAgo, 30)).toBe(false)
    })

    it('returns true for timestamps older than 30 days', () => {
      const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
      expect(NowStatusService.isStatusStale(fortyDaysAgo, 30)).toBe(true)
    })

    it('handles invalid dates gracefully by returning true', () => {
      expect(NowStatusService.isStatusStale('not-a-date')).toBe(true)
    })
  })

  describe('NowPage rendering', () => {
    it('renders page header with single h1 and active project', async () => {
      vi.spyOn(NowStatusService, 'getNowStatus').mockResolvedValue({
        currentProject: 'Distributed Multi-Agent Engine',
        progressPct: 92,
        progressUpdatedAt: new Date().toISOString(),
        milestone: 'Deterministic Qualification State Machine',
        learningFocus: 'Vector embeddings, Actor models, Rust WASM',
        availabilityText: 'Available for 1 Q4 enterprise project',
        slotsOpen: 1,
        showGithub: true,
      })

      const page = await NowPage()
      render(page)

      // Heading
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/What I'm Doing Now/i)

      // Project title & milestone
      expect(screen.getByText('Distributed Multi-Agent Engine')).toBeInTheDocument()
      expect(screen.getByText(/Deterministic Qualification State Machine/i)).toBeInTheDocument()

      // Progress bar
      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '92')
      expect(screen.getByTestId('now-progress-badge')).toHaveTextContent('92% Complete')

      // Availability
      expect(screen.getByText('Available for 1 Q4 enterprise project')).toBeInTheDocument()
      expect(screen.getByText('1 Project Slot Open')).toBeInTheDocument()

      // Learning topics
      expect(screen.getByText('Vector embeddings')).toBeInTheDocument()
      expect(screen.getByText('Actor models')).toBeInTheDocument()
      expect(screen.getByText('Rust WASM')).toBeInTheDocument()

      // Fresh status indicator
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('displays staleness alert when status is older than 30 days', async () => {
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      vi.spyOn(NowStatusService, 'getNowStatus').mockResolvedValue({
        currentProject: 'Old Project Archive',
        progressPct: 50,
        progressUpdatedAt: sixtyDaysAgo,
        milestone: 'Legacy milestone',
        learningFocus: 'Old topics',
        availabilityText: 'Unknown availability',
        slotsOpen: 0,
        showGithub: false,
      })

      const page = await NowPage()
      render(page)

      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent(/Notice: Status update may be delayed/i)
      expect(alert).toHaveTextContent(/last updated 60 days ago/i)
      expect(screen.getByText('Fully Booked')).toBeInTheDocument()
    })
  })
})
