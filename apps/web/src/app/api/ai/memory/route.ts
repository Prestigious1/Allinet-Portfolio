import { NextResponse } from 'next/server'
import { services } from '@/core/providers'

/**
 * Auth guard: require the caller to supply the server-to-server secret
 * in the `x-payload-secret` header. Write operations (POST/PUT/DELETE)
 * are restricted; GET is intentionally readable by authenticated owner
 * sessions only (same guard applied for safety).
 */
function isAuthorized(req: Request): boolean {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) return false
  const provided = req.headers.get('x-payload-secret') || req.headers.get('x-api-secret')
  return provided === secret
}

/** GET /api/ai/memory — List all owner memories */
export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const res = await services.db.query<any>('ai-memories', {})
    return NextResponse.json({ memories: res.data || [] })
  } catch (error) {
    console.error('[AI Memory API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 })
  }
}

/** POST /api/ai/memory — Create a new owner memory */
export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const { title, content, category, importance } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'title and content are required' }, { status: 400 })
    }

    const record = {
      title,
      content,
      category: category || 'general',
      importance: importance || 'medium',
    }

    const result = await services.db.insert('ai-memories', record)
    return NextResponse.json({ memory: result }, { status: 201 })
  } catch (error) {
    console.error('[AI Memory API] POST error:', error)
    return NextResponse.json({ error: 'Failed to create memory' }, { status: 500 })
  }
}
