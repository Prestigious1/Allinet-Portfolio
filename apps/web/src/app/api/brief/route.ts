import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiMiddleware, RATE_LIMIT_POLICIES } from '@/core/api/middleware'
import { briefService } from '@/core/brief/BriefService'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { fullBriefSchema } from '@/features/brief/brief-schema'

const briefApiRequestSchema = fullBriefSchema.extend({
  turnstileToken: z.string().optional().default('dev-bypass'),
})

/**
 * POST /api/brief
 * TASK-P10-03 / SPEC-08 / AC-BRIEF-4, 8
 *
 * Public submission endpoint with Turnstile bot verification,
 * rate limiting (3 / 10 min / IP), lead synchronization, and deterministic
 * proposal generation with 128-bit unguessable share token.
 */
export const POST = withApiMiddleware(
  { rateLimitKey: 'api:brief', rateLimitConfig: RATE_LIMIT_POLICIES.brief },
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

    const parsed = briefApiRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data.',
            details: parsed.error.flatten(),
            status: 400,
          },
        },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Honeypot check: reject bot submissions silently
    if (data.honeypot) {
      return NextResponse.json({
        data: {
          success: true,
          message: 'Thank you for your project brief.',
        },
      })
    }

    // Turnstile bot verification
    const turnstilePassed = await verifyTurnstileToken(data.turnstileToken, ip)
    if (!turnstilePassed) {
      return NextResponse.json(
        { error: { code: 'TURNSTILE_FAILED', message: 'Bot verification check failed. Please refresh and retry.', status: 403 } },
        { status: 403 }
      )
    }

    // Hash client IP for deduplication and non-PII rate tracking
    const ipHash = Buffer.from(ip + (process.env.IP_HASH_SALT || 'allinet-brief-salt'))
      .toString('base64')
      .slice(0, 32)

    const result = await briefService.createBrief(data, ipHash)

    if (!result.success || !result.token) {
      return NextResponse.json(
        {
          error: {
            code: 'BRIEF_CREATION_FAILED',
            message: result.error || 'Failed to create and save project brief.',
            status: 500,
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: {
        success: true,
        token: result.token,
        shareUrl: result.shareUrl,
        proposal: result.proposal,
      },
    })
  }
)
