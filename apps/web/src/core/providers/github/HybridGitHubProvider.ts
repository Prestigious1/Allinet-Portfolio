import { GitHubProvider, GitHubRepo, GitHubStats } from './GitHubProvider'

/**
 * HybridGitHubProvider
 *
 * Fetches live GitHub data from the internal API route with automatic
 * in-memory caching (5 min TTL). On any failure it gracefully returns
 * { data: null, error } so consumers can decide to fall back to mocks.
 */
export class HybridGitHubProvider implements GitHubProvider {
  private cache: { repos: GitHubRepo[] | null; stats: GitHubStats | null; timestamp: number } | null = null
  private readonly CACHE_TTL = 1000 * 60 * 5 // 5 minutes

  private async fetchFromApi(username: string) {
    // Return cached data if still fresh
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_TTL) {
      return this.cache
    }

    const origin =
      typeof window !== 'undefined' &&
      window.location &&
      window.location.origin &&
      window.location.origin !== 'null' &&
      !window.location.origin.startsWith('about:')
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
    const res = await fetch(`${origin}/api/github?username=${encodeURIComponent(username)}`)
    const data = await res.json()

    if (!res.ok) {
      const errMessage =
        typeof data.error === 'string'
          ? data.error
          : data.error?.message || data.message || 'Failed to fetch GitHub data'
      throw new Error(errMessage)
    }

    this.cache = { repos: data.repos, stats: data.stats, timestamp: Date.now() }
    return this.cache
  }

  async getPinnedRepos(username: string) {
    try {
      const data = await this.fetchFromApi(username)
      return { data: data.repos, error: null }
    } catch (err: any) {
      console.error('[HybridGitHubProvider] getPinnedRepos failed:', err)
      return { data: null, error: err as Error }
    }
  }

  async getStats(username: string) {
    try {
      const data = await this.fetchFromApi(username)
      return { data: data.stats, error: null }
    } catch (err: any) {
      console.error('[HybridGitHubProvider] getStats failed:', err)
      return { data: null, error: err as Error }
    }
  }
}
