import { track } from '@vercel/analytics'
import { AnalyticsProvider } from './AnalyticsProvider'

export class LiveAnalyticsProvider implements AnalyticsProvider {
  async trackEvent(eventName: string, properties?: Record<string, any>) {
    try {
      track(eventName, properties)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[LiveAnalytics] Event: ${eventName}`, properties)
      }
    } catch (err) {
      console.error('[LiveAnalyticsProvider Error]:', err)
    }
  }

  async trackPageView(pageUrl: string) {
    try {
      track('PageView', { url: pageUrl })
    } catch (err) {
      console.error('[LiveAnalyticsProvider Error]:', err)
    }
  }

  async identifyUser(userId: string, traits?: Record<string, any>) {
    // Vercel Analytics doesn't have a direct identify method in the standard tier,
    // so we can just track an 'Identify' event with the traits.
    try {
      track('Identify', { userId, ...traits })
    } catch (err) {
      console.error('[LiveAnalyticsProvider Error]:', err)
    }
  }
}
