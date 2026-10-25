import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { briefService } from '@/core/brief/BriefService'
import { generateProposalPdf } from '@/core/brief/pdf-generator'
import { generateProposal } from '@/core/brief/proposal-generator'
import { POST as briefRoutePost } from '@/app/api/brief/route'
import { GET as pdfRouteGet, POST as pdfRoutePost } from '@/app/api/brief/pdf/route'

describe('TASK-P10-03: Brief Submission API & PDF Export', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('briefService creates a brief, hashed token, and proposal', async () => {
    const result = await briefService.createBrief({
      businessName: 'Apex Health Ltd',
      orgType: 'startup',
      industry: 'HealthTech & Medical',
      problemSummary: 'Need automated patient appointment scheduling and Paystack billing.',
      currentTools: 'WhatsApp and Excel',
      modules: ['auth', 'booking', 'payments', 'notifications'],
      timeline: '1_2_months',
      budgetRange: '500k-1.5m-ngn',
      targetScale: 'mvp',
      contactName: 'Dr. Tunde',
      contactEmail: 'tunde@apexhealth.ng',
      contactPhone: '+2348012345678',
      consentGiven: true,
    })

    expect(result.success).toBe(true)
    expect(result.token).toBeDefined()
    expect(result.token?.length).toBe(32) // 16 bytes = 32 hex chars (128-bit)
    expect(result.shareUrl).toBe(`/brief/share/${result.token}`)
    expect(result.proposal?.systemName).toContain('Apex Health Ltd')
    expect(result.proposal?.disclaimer).toBe('Estimate for scoping only; not a quote or contract.')

    // Verify retrieval by token
    const retrieved = await briefService.getBriefByToken(result.token!)
    expect(retrieved).not.toBeNull()
    expect(retrieved?.businessName).toBe('Apex Health Ltd')
    expect(retrieved?.tokenHash).toBeDefined()
  })

  it('briefService rejects retrieval for invalid or expired tokens (AC-BRIEF-5)', async () => {
    const notFound = await briefService.getBriefByToken('invalid-fake-token-1234567890')
    expect(notFound).toBeNull()

    // Test expired brief
    const created = await briefService.createBrief({
      businessName: 'Expired Corp',
      orgType: 'enterprise',
      industry: 'Other / Specialized',
      problemSummary: 'Testing expired token behavior.',
      modules: ['auth'],
      consentGiven: true,
      contactName: 'John Doe',
      contactEmail: 'john@expired.com',
    })

    // Artificially expire
    if (created.brief) {
      created.brief.expiresAt = new Date(Date.now() - 10000).toISOString()
    }

    const expiredResult = await briefService.getBriefByToken(created.token!)
    expect(expiredResult).toBeNull()
  })

  it('generateProposalPdf generates a valid 2-page PDF document in under 1s (AC-BRIEF-3)', async () => {
    const proposal = generateProposal({
      businessName: 'PayFlow Africa',
      orgType: 'startup',
      industry: 'FinTech & Banking',
      problemSummary: 'Automated merchant billing and multi-channel notification engine.',
      modules: ['auth', 'payments', 'notifications', 'analytics'],
      timeline: '1_2_months',
      budgetRange: '500k-1.5m-ngn',
    })

    const startTime = Date.now()
    const pdfBytes = await generateProposalPdf(proposal)
    const duration = Date.now() - startTime

    expect(pdfBytes).toBeInstanceOf(Uint8Array)
    expect(pdfBytes.length).toBeGreaterThan(1000)
    expect(duration).toBeLessThan(1000) // Much faster than 3s requirement

    // Verify it parses as a valid PDF with 2 pages
    const loadedDoc = await PDFDocument.load(pdfBytes)
    expect(loadedDoc.getPageCount()).toBe(2)
  })

  it('POST /api/brief rejects submission without consent', async () => {
    const req = new Request('http://localhost/api/brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: 'Test Biz',
        orgType: 'startup',
        industry: 'FinTech & Banking',
        problemSummary: 'Test problem description with minimum 15 characters.',
        modules: ['auth'],
        contactName: 'Test User',
        contactEmail: 'test@example.com',
        consentGiven: false,
      }),
    })

    const res = await briefRoutePost(req, {})
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBeDefined()
  })

  it('POST /api/brief succeeds and returns shareUrl and proposal', async () => {
    const req = new Request('http://localhost/api/brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: 'LogiTrack Pro',
        orgType: 'sme',
        industry: 'Logistics & Supply Chain',
        problemSummary: 'Real-time fleet tracking and automated customer delivery alerts.',
        currentTools: 'Spreadsheets',
        modules: ['auth', 'inventory', 'notifications'],
        timeline: '1_2_months',
        budgetRange: '500k-1.5m-ngn',
        targetScale: 'mvp',
        contactName: 'Folake Adeleke',
        contactEmail: 'folake@logitrack.ng',
        consentGiven: true,
        turnstileToken: 'dev-bypass',
      }),
    })

    const res = await briefRoutePost(req, {})
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.success).toBe(true)
    expect(json.data.token).toBeDefined()
    expect(json.data.shareUrl).toContain('/brief/share/')
    expect(json.data.proposal).toBeDefined()
  })

  it('GET /api/brief/pdf streams downloadable PDF with valid token', async () => {
    // 1. Create a brief
    const created = await briefService.createBrief({
      businessName: 'Streamline Ltd',
      orgType: 'startup',
      industry: 'EdTech & Learning',
      problemSummary: 'Automated cohort enrollment and invoice generation system.',
      modules: ['auth', 'payments', 'documents'],
      contactName: 'Ada Lovelace',
      contactEmail: 'ada@streamline.ng',
      consentGiven: true,
    })

    // 2. Request PDF via GET
    const req = new Request(`http://localhost/api/brief/pdf?token=${created.token}`, {
      method: 'GET',
    })

    const res = await pdfRouteGet(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('application/pdf')
    expect(res.headers.get('Content-Disposition')).toContain('attachment; filename="Streamline_Ltd_Proposal.pdf"')

    const arrayBuffer = await res.arrayBuffer()
    expect(arrayBuffer.byteLength).toBeGreaterThan(1000)
  })

  it('GET /api/brief/pdf returns 404 for nonexistent token', async () => {
    const req = new Request('http://localhost/api/brief/pdf?token=nonexistent-token-123456789', {
      method: 'GET',
    })

    const res = await pdfRouteGet(req)
    expect(res.status).toBe(404)
  })

  it('POST /api/brief/pdf allows instant PDF generation from proposalInput', async () => {
    const req = new Request('http://localhost/api/brief/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proposalInput: {
          businessName: 'Instant Corp',
          orgType: 'enterprise',
          industry: 'FinTech & Banking',
          problemSummary: 'Instant PDF export test without database record.',
          modules: ['auth', 'booking'],
        },
      }),
    })

    const res = await pdfRoutePost(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('application/pdf')
    const bytes = await res.arrayBuffer()
    expect(bytes.byteLength).toBeGreaterThan(1000)
  })
})
