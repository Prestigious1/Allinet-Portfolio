import { ModelMessage } from 'ai'

export interface AIProvider {
  /**
   * Generates a streaming response for the AI chat.
   * Returns a standard Response object configured for streaming (e.g. via DataStreamResponse)
   */
  streamChatResponse(messages: ModelMessage[], systemPrompt: string, tools: any, options?: { sessionId?: string }): Promise<Response>
  
  analyzeImage(imageUrl: string): Promise<{ analysis: string; error: Error | null }>
}
