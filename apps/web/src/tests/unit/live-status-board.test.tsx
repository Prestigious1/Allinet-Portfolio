import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LiveStatusBoard } from '@/components/site/LiveStatusBoard'
import SiteHomePage from '@/app/(site)/page'
import * as NowStatusService from '@/core/status/NowStatusService'

vi.mock('@/core/providers', () => ({
  services: {
    github: {
      getStats: vi.fn().mockResolvedValue({
        data: {
          publicRepos: 42,
          followers: 350,
          totalStars: 1450,
        },
        error: null,
      }),
    },
  },
}))

describe('TASK-P6-04: Homepage Live Status Board Widget', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders status board with active project, progress percentage, and GitHub metrics', async () => {
    vi.spyOn(NowStatusService, 'getNowStatus').mockResolvedValue({
      currentProject: 'Next.js Systems Architecture',
      progressPct: 88,
      progressUpdatedAt: new Date().toISOString(),
      milestone: 'Distributed telemetry',
      learningFocus: 'Edge computing',
      availabilityText: 'Open for architecture advisory',
      slotsOpen: 2,
      showGithub: true,
    })

    const component = await LiveStatusBoard()
    render(component)

    // Project focus
    expect(screen.getByText('Next.js Systems Architecture')).toBeInTheDocument()
    expect(screen.getByTestId('status-board-progress')).toHaveTextContent('88%')

    // Release version link
    expect(screen.getByText(/v2.0.0 · Production/i)).toBeInTheDocument()

    // GitHub stats
    expect(screen.getByText(/42 Repos/i)).toBeInTheDocument()
    expect(screen.getByText(/★ 1450/i)).toBeInTheDocument()

    // Availability
    expect(screen.getByTestId('status-board-availability')).toHaveTextContent('2 Slots Open')
  })

  it('displays "At Capacity" when slotsOpen is 0', async () => {
    vi.spyOn(NowStatusService, 'getNowStatus').mockResolvedValue({
      currentProject: 'Private Engagement',
      progressPct: 100,
      progressUpdatedAt: new Date().toISOString(),
      milestone: 'Production launch',
      learningFocus: 'None',
      availabilityText: 'Fully committed',
      slotsOpen: 0,
      showGithub: false,
    })

    const component = await LiveStatusBoard()
    render(component)

    expect(screen.getByTestId('status-board-availability')).toHaveTextContent('At Capacity')
  })

  it('mounts properly on homepage alongside hero and role picker', () => {
    render(<SiteHomePage />)

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Systems Architecture/i)).toBeInTheDocument()
  })
})
