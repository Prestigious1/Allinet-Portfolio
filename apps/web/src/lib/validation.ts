/**
 * lib/validation.ts
 *
 * Shared Zod schemas and validation helpers for all API routes.
 */
import { z } from 'zod'
import { NextResponse } from 'next/server'

// ── Schemas ────────────────────────────────────────────────────────────────

export const contactSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters').max(100),
  email:    z.string().email('Invalid email address'),
  subject:  z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message:  z.string().min(20, 'Message must be at least 20 characters').max(5000),
  honeypot: z.string().max(0, 'Bot detected').optional(), // Anti-spam
})

export const chatSchema = z.object({
  messages: z.array(
    z.object({
      role:    z.enum(['user', 'assistant']),
      content: z.string().min(1).max(10_000),
    })
  ).min(1).max(50),
  sessionId: z.string().optional(),
})

export const analyticsSchema = z.object({
  event:  z.string().min(1).max(100),
  path:   z.string().optional(),
  appId:  z.string().optional(),
  data:   z.record(z.string(), z.unknown()).optional(),
})

// ── Types ──────────────────────────────────────────────────────────────────

export type ContactInput  = z.infer<typeof contactSchema>
export type ChatInput     = z.infer<typeof chatSchema>
export type AnalyticsInput = z.infer<typeof analyticsSchema>

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Validate JSON body against a Zod schema.
 * Returns { data } on success, or { error: NextResponse } on failure.
 */
export async function validateBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return {
      data: null,
      error: NextResponse.json(
        { error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON.', status: 400 } },
        { status: 400 }
      ),
    }
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return {
      data: null,
      error: NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data.',
            details: result.error.flatten(),
            status: 400,
          },
        },
        { status: 400 }
      ),
    }
  }

  return { data: result.data, error: null }
}
