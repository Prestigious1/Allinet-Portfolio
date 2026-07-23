import { NextResponse } from 'next/server'
import { services } from '@/core/providers'
import { bustSystemPromptCache } from '@/lib/ai/system-prompt'

/** PATCH /api/ai/memory/[id] — Update a memory */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const result = await services.db.update('ai-memories', id, body)
    bustSystemPromptCache()
    return NextResponse.json({ memory: result })
  } catch (error) {
    console.error('[AI Memory API] PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update memory' }, { status: 500 })
  }
}

/** DELETE /api/ai/memory/[id] — Delete a memory */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await services.db.delete('ai-memories', id)
    bustSystemPromptCache()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[AI Memory API] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 })
  }
}
