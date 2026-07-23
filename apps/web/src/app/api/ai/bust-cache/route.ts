import { NextResponse } from 'next/server'
import { bustSystemPromptCache } from '@/lib/ai/system-prompt'

/**
 * POST /api/ai/bust-cache
 * Busts the AION system prompt cache so the next request rebuilds from CMS.
 * Called automatically by Payload CMS hooks after content changes.
 * Protected by a shared secret to prevent unauthorized cache busting.
 */
export async function POST(req: Request) {
  try {
    const { secret } = await req.json().catch(() => ({}))
    const expectedSecret = process.env.PAYLOAD_SECRET || 'fallback-secret-for-local-dev-only-change-in-prod'
    
    if (secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    bustSystemPromptCache()
    console.log('[AION] System prompt cache busted via webhook')
    return NextResponse.json({ success: true, message: 'AION cache cleared — next request will rebuild from CMS.' })
  } catch (error) {
    console.error('[AION Cache Bust] Error:', error)
    return NextResponse.json({ error: 'Failed to bust cache' }, { status: 500 })
  }
}
