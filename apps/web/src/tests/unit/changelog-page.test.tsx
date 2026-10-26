import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChangelogPage from '@/app/(site)/changelog/page'
import * as ChangelogService from '@/core/status/ChangelogService'

describe('TASK-P6-02: /changelog Product Updates Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(ChangelogService, 'getChangelogEntries').mockResolvedValue(ChangelogService.FALLBACK_CHANGELOG)
  })

  it('renders page header with single h1', async () => {
    const page = await ChangelogPage()
    render(page)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Product Changelog/i)
  })

  it('renders releases with version badges, dates, and categorized release notes', async () => {
    vi.spyOn(ChangelogService, 'getChangelogEntries').mockResolvedValue([
      {
        version: 'v2.5.0',
        title: 'Real-Time Telemetry & Chaos Engineering',
        description: 'Introduced system health diagnostics and automated disaster recovery.',
        date: '2026-10-25T14:00:00.000Z',
        published: true,
        category: 'feature',
      },
      {
        version: 'v2.0.0',
        title: 'Core Architecture 2.0',
        description: 'Complete dual-mode OS redesign and Payload CMS migration.',
        date: '2026-09-01T10:00:00.000Z',
        published: true,
        category: 'major',
      },
    ])

    const page = await ChangelogPage()
    render(page)

    // Version badges
    const versionBadges = screen.getAllByTestId('changelog-version')
    expect(versionBadges[0]).toHaveTextContent('v2.5.0')
    expect(versionBadges[1]).toHaveTextContent('v2.0.0')

    // Titles
    expect(screen.getByText('Real-Time Telemetry & Chaos Engineering')).toBeInTheDocument()
    expect(screen.getByText('Core Architecture 2.0')).toBeInTheDocument()

    // Descriptions
    expect(
      screen.getByText(/Introduced system health diagnostics/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Complete dual-mode OS redesign/i)
    ).toBeInTheDocument()

    // Category badges
    expect(screen.getByText('feature')).toBeInTheDocument()
    expect(screen.getByText('major')).toBeInTheDocument()

    // Formatted dates
    const dateElements = screen.getAllByTestId('changelog-date')
    expect(dateElements[0]).toHaveAttribute('dateTime', '2026-10-25T14:00:00.000Z')
    expect(dateElements[0]).toHaveTextContent('Oct 25, 2026')
  })
})
