import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProposalSharePage from '@/app/(site)/brief/share/[token]/page'
import { briefService } from '@/core/brief/BriefService'

// Mock next/navigation notFound
const notFoundMock = vi.fn()
vi.mock('next/navigation', () => ({
  notFound: () => {
    notFoundMock()
    throw new Error('NEXT_NOT_FOUND')
  },
}))

describe('TASK-P10-04: Proposal Share View (/brief/share/[token])', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    notFoundMock.mockReset()
  })

  it('renders complete proposal view with valid token', async () => {
    const created = await briefService.createBrief({
      businessName: 'SwiftPay Ltd',
      orgType: 'startup',
      industry: 'FinTech & Banking',
      problemSummary: 'Need automated checkout billing and merchant settlement ledger.',
      modules: ['auth', 'payments', 'notifications'],
      timeline: '1_2_months',
      budgetRange: '500k-1.5m-ngn',
      targetScale: 'mvp',
      contactName: 'Chioma Adebayo',
      contactEmail: 'chioma@swiftpay.ng',
      consentGiven: true,
    })

    const token = created.token!
    const PageComponent = await ProposalSharePage({ params: Promise.resolve({ token }) })
    render(PageComponent)

    // Heading & Business Profile
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getAllByText(/SwiftPay Ltd/i).length).toBeGreaterThanOrEqual(1)

    // Download PDF Link
    const pdfLinks = screen.getAllByRole('link', { name: /Download PDF|Download Official PDF/i })
    expect(pdfLinks.length).toBeGreaterThanOrEqual(1)
    expect(pdfLinks[0].getAttribute('href')).toContain(`/api/brief/pdf?token=${token}`)

    // WhatsApp Share Link
    const waLinks = screen.getAllByRole('link', { name: /Share on WhatsApp|Discuss on WhatsApp/i })
    expect(waLinks.length).toBeGreaterThanOrEqual(1)
    expect(waLinks[0].getAttribute('href')).toContain('https://wa.me/?text=')
    expect(waLinks[0].getAttribute('href')).toContain(encodeURIComponent(`/brief/share/${token}`))

    // Disclaimer
    expect(screen.getByText(/Estimate for scoping only; not a quote or contract/i)).toBeInTheDocument()

    // Phased Milestones
    expect(screen.getByText(/Phase 1 MVP/i)).toBeInTheDocument()
    expect(screen.getByText(/Phase 2 Polish & Scale/i)).toBeInTheDocument()
  })

  it('triggers notFound() when token does not exist', async () => {
    await expect(
      ProposalSharePage({ params: Promise.resolve({ token: 'nonexistent-token-abc' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(notFoundMock).toHaveBeenCalled()
  })

  it('triggers notFound() when token is expired', async () => {
    const created = await briefService.createBrief({
      businessName: 'Expired Co',
      orgType: 'enterprise',
      industry: 'Other / Specialized',
      problemSummary: 'Expired proposal test.',
      modules: ['auth'],
      contactName: 'Old User',
      contactEmail: 'old@expired.com',
      consentGiven: true,
    })

    // Manually expire
    if (created.brief) {
      created.brief.expiresAt = new Date(Date.now() - 50000).toISOString()
    }

    await expect(
      ProposalSharePage({ params: Promise.resolve({ token: created.token! }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')

    expect(notFoundMock).toHaveBeenCalled()
  })
})
