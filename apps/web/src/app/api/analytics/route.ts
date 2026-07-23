import { NextResponse } from 'next/server'
import { withApiMiddleware } from '@/core/api/middleware'
import { analyticsSchema } from '@/lib/validation'
import { services } from '@/core/providers'

export const POST = withApiMiddleware(
  { rateLimitKey: 'api:analytics', rateLimitConfig: { limit: 100, windowMs: 60000 } }, // 100 per minute
  async (req: Request) => {
    const body = await req.json()
    const data = analyticsSchema.parse(body)

    // Call the centralized analytics provider
    await services.analytics.trackEvent(data.event, data.data)

    return NextResponse.json({ success: true })
  }
)
