import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BriefWizard } from '@/features/brief/BriefWizard'
import BriefPage from '@/app/(site)/brief/page'
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  fullBriefSchema,
} from '@/features/brief/brief-schema'

describe('TASK-P10-01: Brief Schema Validation', () => {
  it('validates Step 1 business details', () => {
    const invalid = step1Schema.safeParse({ businessName: 'A', orgType: '', industry: '' })
    expect(invalid.success).toBe(false)

    const valid = step1Schema.safeParse({
      businessName: 'Apex Health Ltd',
      orgType: 'startup',
      industry: 'HealthTech & Medical',
    })
    expect(valid.success).toBe(true)
  })

  it('validates Step 2 problem statement with min 15 chars', () => {
    const short = step2Schema.safeParse({ problemSummary: 'Too short' })
    expect(short.success).toBe(false)

    const valid = step2Schema.safeParse({
      problemSummary: 'We need to streamline healthcare appointment booking and Paystack billing.',
      currentTools: 'Excel, WhatsApp',
    })
    expect(valid.success).toBe(true)
  })

  it('validates Step 3 requires at least one module', () => {
    const empty = step3Schema.safeParse({ modules: [] })
    expect(empty.success).toBe(false)

    const valid = step3Schema.safeParse({ modules: ['auth', 'booking', 'payments'] })
    expect(valid.success).toBe(true)
  })

  it('validates Step 4 timeline and budget range defaults', () => {
    const valid = step4Schema.safeParse({
      timeline: '1_2_months',
      budgetRange: 'to_be_scoped',
      targetScale: 'mvp',
    })
    expect(valid.success).toBe(true)
  })

  it('validates Step 5 requires consent and valid email', () => {
    const noConsent = step5Schema.safeParse({
      contactName: 'Amaka',
      contactEmail: 'amaka@example.com',
      consentGiven: false,
    })
    expect(noConsent.success).toBe(false)

    const badEmail = step5Schema.safeParse({
      contactName: 'Amaka',
      contactEmail: 'not-an-email',
      consentGiven: true,
    })
    expect(badEmail.success).toBe(false)

    const valid = step5Schema.safeParse({
      contactName: 'Amaka Okonkwo',
      contactEmail: 'amaka@company.com',
      consentGiven: true,
    })
    expect(valid.success).toBe(true)
  })

  it('validates entire brief successfully', () => {
    const validBrief = fullBriefSchema.safeParse({
      businessName: 'Apex Health Ltd',
      orgType: 'startup',
      industry: 'HealthTech & Medical',
      problemSummary: 'Automating patient intake and doctor scheduling with real-time notifications.',
      currentTools: 'Spreadsheets',
      modules: ['auth', 'booking', 'notifications'],
      timeline: '1_2_months',
      budgetRange: 'to_be_scoped',
      targetScale: 'mvp',
      contactName: 'Dr. Tunde',
      contactEmail: 'tunde@apexhealth.ng',
      contactPhone: '+234 801 234 5678',
      consentGiven: true,
    })
    expect(validBrief.success).toBe(true)
  })
})

describe('TASK-P10-01: Brief Wizard Multi-Step Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    window.sessionStorage.clear()
  })

  it('renders BriefPage container and header elements', () => {
    render(<BriefPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Project Brief Builder/i)
    expect(screen.getByLabelText(/Project Brief Builder/i)).toBeInTheDocument()
    expect(screen.getByText(/Step 1 of 5: Business/i)).toBeInTheDocument()
  })

  it('blocks navigation if Step 1 required fields are empty', async () => {
    render(<BriefWizard />)
    const nextBtn = screen.getByRole('button', { name: /Continue to Step 2/i })
    fireEvent.click(nextBtn)

    await waitFor(() => {
      expect(screen.getByText(/Please enter your business or project name/i)).toBeInTheDocument()
    })
    // Still on step 1
    expect(screen.getByText(/Step 1 of 5: Business/i)).toBeInTheDocument()
  })

  it('navigates through all 5 wizard steps and completes submission', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          success: true,
          shareUrl: '/brief/share/test-token-123',
        },
      }),
    } as any)

    render(<BriefWizard />)

    // Step 1: Business details
    fireEvent.change(screen.getByLabelText(/Business or Project Name/i), {
      target: { value: 'PayFlow Tech' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Continue to Step 2/i }))

    // Step 2: Problem statement
    await waitFor(() => {
      expect(screen.getByText(/Step 2 of 5: Problem/i)).toBeInTheDocument()
    })
    fireEvent.change(screen.getByLabelText(/Core Operational Problem/i), {
      target: { value: 'We need automated invoicing and multi-channel notification for B2B merchants.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Continue to Step 3/i }))

    // Step 3: Modules selection
    await waitFor(() => {
      expect(screen.getByText(/Step 3 of 5: Modules/i)).toBeInTheDocument()
    })
    // Toggle Payments module
    const paymentsBtn = screen.getByRole('checkbox', { name: /Payments & Invoicing/i })
    fireEvent.click(paymentsBtn)
    fireEvent.click(screen.getByRole('button', { name: /Continue to Step 4/i }))

    // Step 4: Scope & Budget
    await waitFor(() => {
      expect(screen.getByText(/Step 4 of 5: Scope/i)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Continue to Step 5/i }))

    // Step 5: Contact & Consent
    await waitFor(() => {
      expect(screen.getByText(/Step 5 of 5: Contact/i)).toBeInTheDocument()
    })

    // Try submit without consent
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'Bayo Adeleke' },
    })
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'bayo@payflow.ng' },
    })
    const submitBtn = screen.getByRole('button', { name: /Generate Project Proposal/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/You must agree to data processing to continue/i)).toBeInTheDocument()
    })

    // Check consent box
    fireEvent.click(screen.getByRole('checkbox', { name: /I agree to data processing/i }))
    fireEvent.click(submitBtn)

    // Verify success view
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Project Brief Received!/i })).toBeInTheDocument()
      expect(screen.getAllByText(/PayFlow Tech/i).length).toBeGreaterThan(0)
    })
  })

  it('supports Back navigation between steps', async () => {
    render(<BriefWizard />)

    fireEvent.change(screen.getByLabelText(/Business or Project Name/i), {
      target: { value: 'KoloLogistics' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Continue to Step 2/i }))

    await waitFor(() => {
      expect(screen.getByText(/Step 2 of 5: Problem/i)).toBeInTheDocument()
    })

    const backBtn = screen.getByRole('button', { name: /← Back/i })
    fireEvent.click(backBtn)

    await waitFor(() => {
      expect(screen.getByText(/Step 1 of 5: Business/i)).toBeInTheDocument()
      expect(screen.getByDisplayValue('KoloLogistics')).toBeInTheDocument()
    })
  })

  it('persists draft to sessionStorage and restores on mount', () => {
    window.sessionStorage.setItem(
      'allinet_brief_draft_v1',
      JSON.stringify({
        step: 2,
        formData: {
          businessName: 'Stored Venture',
          orgType: 'startup',
          industry: 'FinTech & Banking',
          problemSummary: 'Stored problem draft.',
          modules: ['auth', 'ai'],
          timeline: '1_2_months',
          budgetRange: 'to_be_scoped',
        },
      })
    )

    render(<BriefWizard />)

    expect(screen.getByText(/Step 2 of 5: Problem/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('Stored problem draft.')).toBeInTheDocument()
  })
})
