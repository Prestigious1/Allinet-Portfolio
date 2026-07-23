import { track } from '@vercel/analytics'
import { AnalyticsProvider } from './AnalyticsProvider'

export class VercelAnalyticsProvider implements AnalyticsProvider {
  async trackEvent(eventName: string, properties?: Record<string, any>) {
    try {
      track(eventName, properties)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[VercelAnalytics] Event: ${eventName}`, properties)
      }
    } catch (err) {
      console.warn('[VercelAnalyticsProvider] trackEvent failed, falling back silently:', err)
    }
  }

  async trackPageView(pageUrl: string) {
    try {
      track('PageView', { url: pageUrl })
    } catch (err) {
      console.warn('[VercelAnalyticsProvider] trackPageView failed, falling back silently:', err)
    }
  }

  async identifyUser(userId: string, traits?: Record<string, any>) {
    // Vercel Analytics doesn't have a direct identify method in the standard tier,
    // so we track an 'Identify' event with the traits.
    try {
      track('Identify', { userId, ...traits })
    } catch (err) {
      console.warn('[VercelAnalyticsProvider] identifyUser failed, falling back silently:', err)
    }
  }
}
