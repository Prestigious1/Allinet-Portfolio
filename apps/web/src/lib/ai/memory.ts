import { services } from '@/core/providers'

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  name?: string
  toolCallId?: string
}

export async function saveConversation(sessionId: string, messages: any[]): Promise<void> {
  try {
    const existing = await services.db.query<any>('ai-conversations', { session_id: sessionId })
    
    const record = {
      session_id: sessionId,
      title: messages[0]?.content?.slice(0, 50) || 'Conversation',
      messages,
    }

    if (existing.data && existing.data.length > 0) {
      const id = existing.data[0].id
      await services.db.update('ai-conversations', id, record)
    } else {
      await services.db.insert('ai-conversations', record)
    }
  } catch (error) {
    console.error('[AIMemory] Error saving conversation:', error)
  }
}

export async function getConversation(sessionId: string): Promise<any[] | null> {
  try {
    const res = await services.db.query<any>('ai-conversations', { session_id: sessionId })
    if (res.data && res.data.length > 0) {
      return res.data[0].messages || []
    }
  } catch (error) {
    console.error('[AIMemory] Error getting conversation:', error)
  }
  return null
}

export async function getMemoriesContext(): Promise<string> {
  try {
    // Fetch all user-defined owner memories
    const res = await services.db.query<any>('ai-memories')
    if (res.data && res.data.length > 0) {
      return res.data.map(m => `- [Category: ${m.category}, Importance: ${m.importance}] ${m.title}: ${m.content}`).join('\n')
    }
  } catch (error) {
    console.error('[AIMemory] Error getting memories context:', error)
  }
  return 'No extra long-term memories stored yet.'
}
