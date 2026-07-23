import { AIProvider } from './AIProvider'
import { ModelMessage, streamText, isStepCount } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { saveConversation } from '@/lib/ai/memory'

async function getAiSettings() {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL}/api`
      : 'http://localhost:3000/api'
    const res = await fetch(`${apiBase}/globals/ai-settings`, {
      next: { revalidate: 60 }, // Cache settings for 60 seconds
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (e) {
    console.warn('[LiveAIProvider] Failed to fetch live AI settings global, using env variables/defaults.', e)
  }
  return null
}

export class LiveAIProvider implements AIProvider {
  private async getModel() {
    const settings = await getAiSettings()
    const provider = settings?.provider || process.env.AI_PROVIDER || 'openrouter'
    const modelName = settings?.model || process.env.AI_MODEL || (provider === 'openrouter' ? 'google/gemini-2.5-flash' : 'gpt-4o')
    const apiKey = provider === 'openrouter'
      ? (process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY)
      : process.env.OPENAI_API_KEY
    const baseURL = process.env.AI_BASE_URL || (provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : undefined)

    console.log('[AION][PROVIDER] getModel() called')
    console.log('[AION][PROVIDER] settings from CMS:', JSON.stringify(settings))
    console.log('[AION][PROVIDER] provider:', provider)
    console.log('[AION][PROVIDER] modelName:', modelName)
    console.log('[AION][PROVIDER] baseURL:', baseURL)
    console.log('[AION][PROVIDER] apiKey present?', !!apiKey, '| apiKey prefix:', apiKey ? apiKey.slice(0, 12) + '...' : 'MISSING')

    if (!apiKey) {
      console.error('[AION][PROVIDER] API KEY MISSING for provider:', provider)
      throw new Error(`API key missing for provider: ${provider}`)
    }

    const client = createOpenAI({
      apiKey,
      baseURL,
      compatibility: 'compatible',
    } as any)

    const temperature = settings?.temperature !== undefined ? Number(settings.temperature) : Number(process.env.AI_TEMPERATURE || '0.7')
    console.log('[AION][PROVIDER] temperature:', temperature)

    return {
      model: client.chat(modelName) as any,
      temperature,
    }
  }

  async streamChatResponse(
    messages: ModelMessage[],
    systemPrompt: string,
    tools: any,
    options?: { sessionId?: string }
  ): Promise<Response> {
    const provStart = Date.now()
    console.log('[AION][PROVIDER] streamChatResponse() entered at', new Date(provStart).toISOString())
    console.log('[AION][PROVIDER] messages count:', messages.length)
    console.log('[AION][PROVIDER] sessionId:', options?.sessionId || 'MISSING')
    console.log('[AION][PROVIDER] systemPrompt length:', systemPrompt.length)
    try {
      const { model, temperature } = await this.getModel()
      console.log('[AION][PROVIDER] model obtained at T+' + (Date.now() - provStart) + 'ms. model:', typeof model)
      console.log('[AION][PROVIDER] calling streamText with maxTokens:500 temperature:' + temperature)
      const result = streamText({
        model,
        system: systemPrompt,
        messages,
        tools,
        temperature,
        // FIX: stopWhen: isStepCount(3) keeps the server stream alive through the full
        // tool-call -> (client executes) -> tool-result -> LLM-continues lifecycle.
        stopWhen: isStepCount(3),
        maxOutputTokens: 500,
        // Force max_tokens into the wire-level API call for OpenRouter compatibility.
        // Without this, Gemini 2.5 Flash defaults to 65535 output tokens which
        // exceeds the free-tier credit limit and causes a 402 error.
        providerOptions: {
          openai: { max_tokens: 500 },
        },
        onFinish: async ({ text, usage, finishReason }) => {
          console.log('[AION][PROVIDER] onFinish called at T+' + (Date.now() - provStart) + 'ms')
          console.log('[AION][PROVIDER] finishReason:', finishReason)
          console.log('[AION][PROVIDER] usage:', JSON.stringify(usage))
          console.log('[AION][PROVIDER] response text length:', text?.length)
          if (options?.sessionId) {
            // Append assistant response to conversational memory
            const updatedMessages = [
              ...messages,
              { role: 'assistant' as const, content: text },
            ]
            await saveConversation(options.sessionId, updatedMessages)
          }
        },
      })

      console.log('[AION][PROVIDER] streamText() returned result object at T+' + (Date.now() - provStart) + 'ms. Calling toUIMessageStreamResponse()')
      const response = result.toUIMessageStreamResponse()
      console.log('[AION][PROVIDER] toUIMessageStreamResponse() returned. status:', response?.status, '| headers:', JSON.stringify(Object.fromEntries(response?.headers?.entries?.() || [])))
      return response
    } catch (error: any) {
      console.error('[LiveAIProvider] Error during streamText setup:', error?.message || error)
      if (error?.cause) console.error('[LiveAIProvider] Error cause:', error.cause)
      console.error(error.stack)
      throw error
    }
  }

  async analyzeImage(imageUrl: string) {
    return {
      analysis: `Image analysis module is currently offline. Target: ${imageUrl}`,
      error: null,
    }
  }
}
