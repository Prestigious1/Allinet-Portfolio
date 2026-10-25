import { NextResponse } from 'next/server'
import { briefService } from '@/core/brief/BriefService'
import { generateProposalPdf } from '@/core/brief/pdf-generator'
import { generateProposal, GeneratedProposal } from '@/core/brief/proposal-generator'

export const runtime = 'nodejs'

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40)
}

/**
 * GET /api/brief/pdf?token=[token]
 * TASK-P10-03 / SPEC-08 / AC-BRIEF-3
 *
 * Generates and streams a downloadable PDF proposal using the unguessable share token.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: { code: 'MISSING_TOKEN', message: 'Token query parameter is required.' } },
        { status: 400 }
      )
    }

    const brief = await briefService.getBriefByToken(token)
    if (!brief || !brief.proposal) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Proposal not found or link has expired.' } },
        { status: 404 }
      )
    }

    const pdfBytes = await generateProposalPdf(brief.proposal)
    const filename = `${sanitizeFilename(brief.businessName || 'Project')}_Proposal.pdf`

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    })
  } catch (err: any) {
    console.error('[API /api/brief/pdf GET] Error generating PDF:', err)
    return NextResponse.json(
      { error: { code: 'PDF_GENERATION_FAILED', message: 'Failed to generate proposal PDF.' } },
      { status: 500 }
    )
  }
}

/**
 * POST /api/brief/pdf
 *
 * Accepts `{ token }` or `{ proposalInput }` to generate instant PDF buffer.
 */
export async function POST(req: Request) {
  try {
    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: { code: 'INVALID_JSON', message: 'Invalid JSON body.' } },
        { status: 400 }
      )
    }

    let proposal: GeneratedProposal | null = null
    let businessName = 'Project'

    if (body.token) {
      const brief = await briefService.getBriefByToken(body.token)
      if (!brief || !brief.proposal) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Proposal not found or link has expired.' } },
          { status: 404 }
        )
      }
      proposal = brief.proposal
      businessName = brief.businessName
    } else if (body.proposal) {
      proposal = body.proposal
      businessName = proposal?.businessName || 'Project'
    } else if (body.proposalInput) {
      proposal = generateProposal(body.proposalInput)
      businessName = proposal.businessName
    }

    if (!proposal) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'Provide either token, proposal, or proposalInput.' } },
        { status: 400 }
      )
    }

    const pdfBytes = await generateProposalPdf(proposal)
    const filename = `${sanitizeFilename(businessName)}_Proposal.pdf`

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    })
  } catch (err: any) {
    console.error('[API /api/brief/pdf POST] Error generating PDF:', err)
    return NextResponse.json(
      { error: { code: 'PDF_GENERATION_FAILED', message: 'Failed to generate proposal PDF.' } },
      { status: 500 }
    )
  }
}
