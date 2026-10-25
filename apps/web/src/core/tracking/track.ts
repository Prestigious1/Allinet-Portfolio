import { services } from '@/core/providers'

/**
 * Whitelist of permitted analytics events and their strictly allowed property keys.
 * Non-whitelisted events are dropped.
 * Non-whitelisted property keys are stripped to prevent accidental PII leakage.
 */
export const WHITELISTED_EVENTS = {
  role_selected: ['role', 'previousRole', 'source'],
  demo_opened: ['demoId', 'slug', 'source'],
  brief_started: ['step', 'serviceType', 'budgetRange'],
  contact_submitted: ['subject', 'sourcePage'],
  os_launched: ['mode', 'resolution'],
  app_opened: ['appId', 'windowId'],
  achievement_unlocked: ['achievementId', 'points'],
  page_view: ['path', 'title', 'referrer'],
} as const

export type WhitelistedEventName = keyof typeof WHITELISTED_EVENTS

/**
 * Global blocklist of PII property keys that must never be collected under any circumstance.
 */
const PII_KEYS = new Set([
  'email',
  'name',
  'fullname',
  'firstname',
  'lastname',
  'phone',
  'whatsapp',
  'password',
  'token',
  'secret',
  'authorization',
  'creditcard',
  'cardnumber',
  'cvv',
  'address',
  'ip',
  'remoteip',
  'ssn',
])

/**
 * Sanitizes property bag according to the event's allowed schema and strips any PII keys.
 */
export function sanitizeProperties<E extends WhitelistedEventName>(
  eventName: E,
  properties?: Record<string, any>
): Record<string, any> {
  if (!properties || typeof properties !== 'object') {
    return {}
  }

  const allowedKeys = new Set<string>(WHITELISTED_EVENTS[eventName] as readonly string[])
  const clean: Record<string, any> = {}

  for (const [key, value] of Object.entries(properties)) {
    const lowerKey = key.toLowerCase()
    // Drop non-whitelisted keys or known PII keys
    if (!allowedKeys.has(key) || PII_KEYS.has(lowerKey)) {
      continue
    }

    // Primitive values only (strings, numbers, booleans)
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      clean[key] = value
    }
  }

  return clean
}

/**
 * Non-blocking centralized analytics tracker.
 * Drops non-whitelisted events and strips non-whitelisted / PII properties.
 * Never throws exceptions, allowing callers to safely fire-and-forget.
 */
export async function track<E extends WhitelistedEventName>(
  event: E,
  properties?: Record<string, any>
): Promise<void> {
  try {
    if (!Object.prototype.hasOwnProperty.call(WHITELISTED_EVENTS, event)) {
      console.warn(`[track] Ignored non-whitelisted event: "${event}"`)
      return
    }

    const cleanProps = sanitizeProperties(event, properties)
    await services.analytics.trackEvent(event, cleanProps)
  } catch (err) {
    // Non-blocking: fail quietly without disrupting the user flow
    console.warn(`[track] Failed to track event "${event}":`, err)
  }
}
