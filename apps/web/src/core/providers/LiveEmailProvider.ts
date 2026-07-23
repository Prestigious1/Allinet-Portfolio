import { EmailProvider, EmailOptions } from './EmailProvider'

export class LiveEmailProvider implements EmailProvider {
  async send(options: EmailOptions) {
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send transmission via Email provider.')
      }

      return {
        success: true,
        error: null,
      }
    } catch (err: any) {
      console.error('[LiveEmailProvider Error]:', err)
      return {
        success: false,
        error: err as Error,
      }
    }
  }

  async sendTemplate(to: string, templateId: string, variables: Record<string, any>) {
    // Requires a template engine or Resend templates API
    console.warn(`[LiveEmailProvider] sendTemplate not implemented yet. Template: ${templateId}`)
    return { success: false, error: new Error('Not implemented') }
  }
}
