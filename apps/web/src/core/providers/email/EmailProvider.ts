export interface EmailOptions {
  to: string
  from: string
  subject: string
  body: string
  isHtml?: boolean
}

export interface EmailProvider {
  send(options: EmailOptions): Promise<{ success: boolean; error: Error | null }>
  sendTemplate(to: string, templateId: string, variables: Record<string, any>): Promise<{ success: boolean; error: Error | null }>
}

export class MockEmailProvider implements EmailProvider {
  async send(options: EmailOptions) {
    console.log(`[MockEmail] Sending email to ${options.to} from ${options.from}`)
    console.log(`[MockEmail] Subject: ${options.subject}`)
    console.log(`[MockEmail] Body:\n${options.body}`)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return { success: true, error: null }
  }

  async sendTemplate(to: string, templateId: string, variables: Record<string, any>) {
    console.log(`[MockEmail] Sending template ${templateId} to ${to} with variables:`, variables)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return { success: true, error: null }
  }
}
