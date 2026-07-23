import { NextResponse } from 'next/server'
import { services } from '@/core/providers'

/** GET /api/ai/memory — List all owner memories */
export async function GET() {
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
