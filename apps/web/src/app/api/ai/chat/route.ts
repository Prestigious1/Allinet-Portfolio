import { withApiMiddleware } from '@/core/api/middleware'
import { services } from '@/core/providers'
import { aionTools } from '@/lib/ai/tools'
import { buildSystemPrompt } from '@/lib/ai/system-prompt'
import { NextResponse } from 'next/server'
import { convertToModelMessages } from 'ai'

export const runtime = 'edge'

export const POST = withApiMiddleware(
  { rateLimitKey: 'api:ai:chat', rateLimitConfig: { limit: 10, windowMs: 60000 } },
  async (req: Request) => {
    const routeStart = Date.now()
    const reqId = 'SRV-' + routeStart + '-' + Math.random().toString(36).slice(2,6).toUpperCase()
    console.log(`[AION][ROUTE][${reqId}] POST /api/ai/chat received at ${new Date(routeStart).toISOString()}`)
    console.log(`[AION][ROUTE][${reqId}] Headers: content-type=${req.headers.get('content-type')} accept=${req.headers.get('accept')}`)

    let rawBody: string = ''
    let parsed: any = {}
    try {
      rawBody = await req.text()
      console.log(`[AION][ROUTE][${reqId}] Raw body length: ${rawBody.length} bytes`)
      console.log(`[AION][ROUTE][${reqId}] Raw body (first 500 chars): ${rawBody.slice(0, 500)}`)
      parsed = JSON.parse(rawBody)
    } catch (parseErr: any) {
      console.error(`[AION][ROUTE][${reqId}] BODY PARSE ERROR:`, parseErr?.message)
      return NextResponse.json({ error: 'Body parse failed' }, { status: 400 })
    }

    const { messages, sessionId } = parsed
    console.log(`[AION][ROUTE][${reqId}] messages count: ${Array.isArray(messages) ? messages.length : 'NOT_ARRAY'}`)
    console.log(`[AION][ROUTE][${reqId}] sessionId: ${sessionId || 'MISSING'}`)
    if (Array.isArray(messages)) {
      console.log(`[AION][ROUTE][${reqId}] messages[0]:`, JSON.stringify(messages[0]).slice(0, 300))
      console.log(`[AION][ROUTE][${reqId}] messages last:`, JSON.stringify(messages[messages.length - 1]).slice(0, 300))
    }
    
    if (!messages || !Array.isArray(messages)) {
      console.error(`[AION][ROUTE][${reqId}] INVALID messages array — returning 400`)
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 })
    }

    console.log(`[AION][ROUTE][${reqId}] Building system prompt...`)
    const systemPrompt = await buildSystemPrompt()
    console.log(`[AION][ROUTE][${reqId}] System prompt length: ${systemPrompt.length} chars`)

    // In ai@7, the client sends UIMessage[]. Convert to ModelMessage[] before
    // passing to streamText. convertToModelMessages handles all content types.
    // Ensure we handle messages that only have string content by mocking parts if needed.
    const normalizedMessages = messages.map((m: any) => ({
      ...m,
      parts: m.parts || (typeof m.content === 'string' ? [{ type: 'text', text: m.content }] : undefined)
    }))
    console.log(`[AION][ROUTE][${reqId}] normalizedMessages count: ${normalizedMessages.length}`)

    let modelMessages: any
    try {
      modelMessages = await convertToModelMessages(normalizedMessages)
      console.log(`[AION][ROUTE][${reqId}] convertToModelMessages OK. modelMessages count: ${modelMessages.length}`)
      console.log(`[AION][ROUTE][${reqId}] modelMessages[last]:`, JSON.stringify(modelMessages[modelMessages.length-1]).slice(0,300))
    } catch (convErr: any) {
      console.error(`[AION][ROUTE][${reqId}] convertToModelMessages THREW:`, convErr?.message)
      console.error(`[AION][ROUTE][${reqId}] Stack:`, convErr?.stack)
      throw convErr
    }

    console.log(`[AION][ROUTE][${reqId}] Calling services.ai.streamChatResponse at T+${Date.now() - routeStart}ms`)
    try {
      const result = await services.ai.streamChatResponse(modelMessages, systemPrompt, aionTools, { sessionId })
      console.log(`[AION][ROUTE][${reqId}] streamChatResponse returned at T+${Date.now() - routeStart}ms. status: ${result?.status}`)
      return result
    } catch (streamErr: any) {
      console.error(`[AION][ROUTE][${reqId}] streamChatResponse THREW at T+${Date.now() - routeStart}ms:`, streamErr?.message)
      console.error(`[AION][ROUTE][${reqId}] Stack:`, streamErr?.stack)
      throw streamErr
    }
  }
)
