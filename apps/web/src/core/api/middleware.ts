import { NextResponse } from 'next/server'
import { services } from '@/core/providers'
import { z } from 'zod'

export interface ApiMiddlewareConfig {
  rateLimitKey: string
  rateLimitConfig?: {
    limit: number
    windowMs: number
  }
}

/**
 * Standard rate limiting policies specified across all API surfaces.
 */
export const RATE_LIMIT_POLICIES = {
  chat: { limit: 20, windowMs: 60 * 1000 }, // 20 req/min
  concierge: { limit: 20, windowMs: 60 * 1000 }, // 20 req/min (TASK-P9-01)
  contact: { limit: 5, windowMs: 10 * 60 * 1000 }, // 5 req/10min
  leads: { limit: 5, windowMs: 10 * 60 * 1000 }, // 5 req/10min
  brief: { limit: 3, windowMs: 10 * 60 * 1000 }, // 3 req/10min (SPEC-08)
  analytics: { limit: 60, windowMs: 60 * 1000 }, // 60 req/min
  health: { limit: 60, windowMs: 60 * 1000 }, // 60 req/min
} as const

/**
 * Standard API error structure.
 */
export interface ApiErrorResponse {
  error: string
  details?: any
}

type NextRouteHandler = (req: Request, context: any) => Promise<NextResponse | Response>

/**
 * Wraps an API route handler to provide standard rate limiting, logging, and error handling.
 */
export function withApiMiddleware(
  config: ApiMiddlewareConfig,
  handler: NextRouteHandler
): NextRouteHandler {
  return async (req: Request, context: any) => {
    try {
      // 1. Rate Limiting
      const ip = services.rateLimiter.getClientIp(req)
      // Base key on IP + the configured key (e.g. "contact-api")
      const key = `${config.rateLimitKey}:${ip}`
      const limitConfig = config.rateLimitConfig || { limit: 20, windowMs: 60000 } // default 20/min

      const rlResult = await services.rateLimiter.check(key, limitConfig)
      
      if (!rlResult.success) {
        console.warn(`[API RateLimit] Blocked ${ip} on ${config.rateLimitKey}`)
        return NextResponse.json(
          { error: 'Too Many Requests' },
          {
            status: 429,
            headers: services.rateLimiter.getHeaders(rlResult.remaining, rlResult.resetAt)
          }
        )
      }

      // 2. Logging (Request started)
      console.log(`[API ${req.method}] ${req.url} - IP: ${ip}`)

      // 3. Execute Handler
      const response = await handler(req, context)

      // 4. Attach Rate Limit Headers to success responses
      if (response instanceof NextResponse || response instanceof Response) {
        const headers = services.rateLimiter.getHeaders(rlResult.remaining, rlResult.resetAt)
        Object.entries(headers).forEach(([k, v]) => {
          response.headers.set(k, v)
        })
      }

      return response
    } catch (err: any) {
      // Handle Zod Validation Errors
      if (err instanceof z.ZodError) {
        const zodErrors = (err as z.ZodError<any>).issues
        console.warn(`[API Validation Error] ${req.url}`, zodErrors)
        return NextResponse.json(
          { error: 'Validation Error', details: zodErrors },
          { status: 400 }
        )
      }

      // Handle Standard Errors
      console.error(`[API Internal Error] ${req.url}`, err)
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      )
    }
  }
}
