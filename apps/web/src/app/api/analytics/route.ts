import { NextResponse } from 'next/server'
import { withApiMiddleware, RATE_LIMIT_POLICIES } from '@/core/api/middleware'
import { analyticsSchema } from '@/lib/validation'
import { services } from '@/core/providers'

export const POST = withApiMiddleware(
  { rateLimitKey: 'api:analytics', rateLimitConfig: RATE_LIMIT_POLICIES.analytics },
  async (req: Request) => {
    const body = await req.json()
    const data = analyticsSchema.parse(body)

    // Call the centralized analytics provider
    await services.analytics.trackEvent(data.event, data.data)

    return NextResponse.json({ success: true })
  }
)
