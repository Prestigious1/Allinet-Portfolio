/**
 * Cloudflare Turnstile server-side verification helper.
 * Validates bot challenge tokens for public submissions (leads, briefs, contacts).
 */

const TURNSTILE_VERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export interface TurnstileVerificationResult {
  success: boolean
  errorCodes?: string[]
}

/**
 * Verifies a Cloudflare Turnstile token against Cloudflare's siteverify API.
 * 
 * - In production: fails closed if TURNSTILE_SECRET_KEY is missing or invalid.
 * - In non-production (development/test): bypasses verification with a warning if TURNSTILE_SECRET_KEY is unconfigured.
 */
export async function verifyTurnstileToken(
  token: string,
  ip?: string
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY
  const isProduction = process.env.NODE_ENV === 'production'

  // Dev-mode bypass when secret key is not configured
  if (!secretKey) {
    if (!isProduction) {
      console.warn('[Turnstile] TURNSTILE_SECRET_KEY not configured — bypassing verification in development/test.')
      return true
    }
    console.error('[Turnstile] Missing TURNSTILE_SECRET_KEY in production — failing closed.')
    return false
  }

  if (!token || typeof token !== 'string') {
    return false
  }

  try {
    const formData = new URLSearchParams()
    formData.append('secret', secretKey)
    formData.append('response', token)
    if (ip && ip !== 'unknown') {
      formData.append('remoteip', ip)
    }

    const res = await fetch(TURNSTILE_VERIFY_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (!res.ok) {
      console.error(`[Turnstile] Verification endpoint returned status ${res.status}`)
      return false
    }

    const data: { success: boolean; 'error-codes'?: string[] } = await res.json()
    return Boolean(data.success)
  } catch (err) {
    console.error('[Turnstile] Verification request failed:', err)
    return false
  }
}
