import { AIProvider } from './AIProvider'
import { ModelMessage } from 'ai'

export class MockAIProvider implements AIProvider {
  async streamChatResponse(messages: ModelMessage[], systemPrompt: string, tools: any, options?: { sessionId?: string }): Promise<Response> {
    console.log('[MockAIProvider] Generating mock AION stream for messages:', messages.length)
    
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()
    const lastText = typeof lastUserMsg?.content === 'string'
      ? lastUserMsg.content
      : Array.isArray(lastUserMsg?.content)
        ? (lastUserMsg.content.find((c: any) => c.type === 'text') as any)?.text || ''
        : ''

    const responseText = `[AION — Offline Mode] I received your message: "${lastText}". ` +
      `To activate live AI responses, add your OPENROUTER_API_KEY to .env.local. ` +
      `You can get a free API key at openrouter.ai — it gives access to DeepSeek, Qwen, Gemma, and many more models.`

    const encoder = new TextEncoder()
    const msgId = `msg-${Date.now()}`
    const partId = `part-${Date.now()}`

    const stream = new ReadableStream({
      async start(controller) {
        // ai@7 UIMessageChunk protocol (NDJSON)
        const send = (obj: object) =>
          controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'))

        send({ type: 'message-start', messageId: msgId, role: 'assistant', metadata: null })
        send({ type: 'text-start', partId })

        const words = responseText.split(' ')
        for (const word of words) {
          send({ type: 'text-delta', partId, delta: word + ' ' })
          await new Promise(resolve => setTimeout(resolve, 40))
        }

        send({ type: 'text-end', partId })
        send({ type: 'finish', messageId: msgId, finishReason: 'stop', usage: null })
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
      }
    })
  }

  async analyzeImage(imageUrl: string) {
    return {
      analysis: `[AION Mock] Simulated analysis of image at ${imageUrl}`,
      error: null
    }
  }
}
