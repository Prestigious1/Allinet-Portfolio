import { NextResponse } from 'next/server'
import { withApiMiddleware, RATE_LIMIT_POLICIES } from '@/core/api/middleware'
import { contactSchema } from '@/lib/validation'
import { services } from '@/core/providers'

export const POST = withApiMiddleware(
  { rateLimitKey: 'api:contact', rateLimitConfig: RATE_LIMIT_POLICIES.contact },
  async (req: Request) => {
    const body = await req.json()
    
    // This will throw z.ZodError if invalid, which is caught by middleware
    const data = contactSchema.parse(body)

    if (data.honeypot) {
      // Silently accept but do nothing (bot trap)
      return NextResponse.json({ data: { success: true, message: 'Message sent.' } })
    }

    // Send email to owner
    await services.email.send({
      to: 'hello@allinet.dev', // Hardcoded owner email or fetch from portfolio
      from: data.email,
      subject: `[Portfolio Contact] ${data.subject}`,
      body: `From: ${data.name} (${data.email})\n\n${data.message}`,
    })

    // Auto-reply to sender
    await services.email.send({
      to: data.email,
      from: 'hello@allinet.dev',
      subject: 'Re: ' + data.subject,
      body: `Hi ${data.name},\n\nThank you for reaching out! I have received your message and will get back to you shortly.\n\nBest regards,\nAjibade Alli-Akinkunmi`,
    })

    return NextResponse.json({ data: { success: true, message: 'Your message has been sent.' } })
  }
)
