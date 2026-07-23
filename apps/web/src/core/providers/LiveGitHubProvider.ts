import { GitHubProvider, GitHubRepo, GitHubStats } from './GitHubProvider'

export class LiveGitHubProvider implements GitHubProvider {
  private cache: { repos: GitHubRepo[] | null, stats: GitHubStats | null, timestamp: number } | null = null
  private readonly CACHE_TTL = 1000 * 60 * 5 // 5 minutes cache

  private async fetchFromApi(username: string) {
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_TTL) {
      return this.cache
    }

    const res = await fetch(`/api/github?username=${encodeURIComponent(username)}`)
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch GitHub data')
    }

    this.cache = { repos: data.repos, stats: data.stats, timestamp: Date.now() }
    return this.cache
  }

  async getPinnedRepos(username: string) {
    try {
      const data = await this.fetchFromApi(username)
      return { data: data.repos, error: null }
    } catch (err: any) {
      console.error('[LiveGitHubProvider Error]:', err)
      return { data: null, error: err as Error }
    }
  }

  async getStats(username: string) {
    try {
      const data = await this.fetchFromApi(username)
      return { data: data.stats, error: null }
    } catch (err: any) {
      console.error('[LiveGitHubProvider Error]:', err)
      return { data: null, error: err as Error }
    }
  }
}
