import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiMiddleware, RATE_LIMIT_POLICIES } from '@/core/api/middleware'
import { leadService } from '@/core/leads/LeadService'
import { verifyTurnstileToken } from '@/lib/turnstile'

/**
 * POST /api/leads
 *
 * Validates Turnstile token, de-duplicates, writes to `leads` Payload collection,
 * and dispatches owner notification email via LeadService.
 */

const leadsBodySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()), {
    message: 'Invalid email address',
  }),
  whatsapp: z.string().max(20).optional(),
  company: z.string().max(200).optional(),
  role: z.string().max(100).optional(),
  need: z.string().min(10, 'Need must be at least 10 characters').max(2000).optional(),
  budgetRange: z.string().max(50).optional(),
  timeline: z.string().max(50).optional(),
  sourcePage: z.string().max(200).optional(),
  turnstileToken: z.string().min(1, 'Bot check token required'),
  consentGiven: z.boolean().refine((v) => v === true, {
    message: 'You must consent to data processing',
  }),
  honeypot: z.string().optional(),
})

export const POST = withApiMiddleware(
  { rateLimitKey: 'api:leads', rateLimitConfig: RATE_LIMIT_POLICIES.leads },
  async (req: Request) => {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1'

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON.', status: 400 } },
        { status: 400 }
      )
    }

    const parsed = leadsBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid request data.', details: parsed.error.flatten(), status: 400 } },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Honeypot check
    if (data.honeypot) {
      return NextResponse.json({ data: { success: true, message: 'Thank you.' } })
    }

    // Turnstile verification
    const turnstilePassed = await verifyTurnstileToken(data.turnstileToken, ip)
    if (!turnstilePassed) {
      return NextResponse.json(
        { error: { code: 'TURNSTILE_FAILED', message: 'Bot check failed. Please try again.', status: 403 } },
        { status: 403 }
      )
    }

    // Build a simple ipHash for deduplication (non-PII, hashed)
    const ipHash = Buffer.from(ip + (process.env.IP_HASH_SALT || 'allinet-salt'))
      .toString('base64')
      .slice(0, 32)

    const result = await leadService.createLead({
      name: data.name,
      email: data.email,
      whatsapp: data.whatsapp,
      company: data.company,
      role: data.role,
      need: data.need,
      budgetRange: data.budgetRange,
      timeline: data.timeline,
      sourcePage: data.sourcePage || '/contact',
      sourceChannel: 'contact-form',
      consentGiven: data.consentGiven,
      ipHash,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: { code: 'LEAD_CREATE_FAILED', message: result.error || 'Failed to save enquiry.', status: 500 } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: {
        success: true,
        isDuplicate: result.isDuplicate,
        message: result.isDuplicate
          ? 'We already have your enquiry on file — we will be in touch soon!'
          : 'Thank you for your enquiry! We will respond within 24 hours.',
      },
    })
  }
)
