import { NextResponse } from 'next/server'
import { Resend } from 'resend'

/**
 * Auth guard: require the caller to supply the server-to-server secret.
 * Public unauthenticated calls are rejected with 401.
 *
 * Expected header: `x-api-secret: <PAYLOAD_SECRET>`
 */
function isAuthorized(req: Request): boolean {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) return false
  const provided = req.headers.get('x-api-secret') || req.headers.get('x-payload-secret')
  return provided === secret
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { to, from, subject, body, isHtml } = await req.json()

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Resend API key not configured' },
        { status: 500 }
      )
    }

    // Lazy instantiation — only create the Resend client when we have a key.
    // Instantiating at module level throws during build if the key is missing.
    const resend = new Resend(process.env.RESEND_API_KEY)

    const data = await resend.emails.send({
      from: 'ALLINET OS <onboarding@resend.dev>', // Use verified domain in prod
      to: [to],
      subject: subject,
      text: isHtml ? undefined : body,
      html: isHtml ? body : undefined,
      replyTo: from,
    })

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('[Email API Error]:', error)
    return NextResponse.json(
      { error: error.message || 'An error occurred while sending the email.' },
      { status: 500 }
    )
  }
}
