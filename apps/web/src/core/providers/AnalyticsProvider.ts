export interface AnalyticsProvider {
  trackEvent(eventName: string, properties?: Record<string, any>): Promise<void>
  trackPageView(pageUrl: string): Promise<void>
  identifyUser(userId: string, traits?: Record<string, any>): Promise<void>
}

export class MockAnalyticsProvider implements AnalyticsProvider {
  async trackEvent(eventName: string, properties?: Record<string, any>) {
    console.log(`[MockAnalytics] Event: ${eventName}`, properties)
  }

  async trackPageView(pageUrl: string) {
    console.log(`[MockAnalytics] PageView: ${pageUrl}`)
  }

  async identifyUser(userId: string, traits?: Record<string, any>) {
    console.log(`[MockAnalytics] Identify: ${userId}`, traits)
  }
}
