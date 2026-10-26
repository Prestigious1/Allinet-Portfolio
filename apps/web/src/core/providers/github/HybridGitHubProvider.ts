import { GitHubProvider, GitHubRepo, GitHubStats } from './GitHubProvider'

/**
 * HybridGitHubProvider
 *
 * Fetches live GitHub data with automatic in-memory caching (5 min TTL).
 * When running on the server, it queries GitHub directly or via local cache,
 * avoiding loopback HTTP requests that fail when the port or host varies.
 * On any failure it gracefully returns { data: null, error } so consumers
 * can fall back to mocks without triggering console error overlays.
 */
export class HybridGitHubProvider implements GitHubProvider {
  private cache: { repos: GitHubRepo[] | null; stats: GitHubStats | null; timestamp: number } | null = null
  private readonly CACHE_TTL = 1000 * 60 * 5 // 5 minutes

  private resolveUsername(username?: string): string {
    if (!username || username === 'alli-net') {
      return process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'Prestigious1'
    }
    return username
  }

  private async fetchDirect(targetUser: string) {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Allinet-Portfolio',
    }
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`
    }

    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${targetUser}`, { headers, next: { revalidate: 1800 } }),
      fetch(`https://api.github.com/users/${targetUser}/repos?sort=updated&per_page=20`, { headers, next: { revalidate: 1800 } })
    ])

    if (!userRes.ok) {
      const err = await userRes.json().catch(() => ({}))
      throw new Error(err.message || `GitHub user fetch failed: ${userRes.status}`)
    }
    if (!reposRes.ok) {
      const err = await reposRes.json().catch(() => ({}))
      throw new Error(err.message || `GitHub repos fetch failed: ${reposRes.status}`)
    }

    const userData = await userRes.json()
    const reposData = await reposRes.json()

    const repos: GitHubRepo[] = Array.isArray(reposData)
      ? reposData.map((r: any) => ({
          name: r.name,
          description: r.description,
          stars: r.stargazers_count,
          forks: r.forks_count,
          language: r.language,
          updatedAt: r.updated_at,
          topics: r.topics || [],
          url: r.html_url,
        }))
      : []

    const stats: GitHubStats = {
      publicRepos: userData.public_repos || 0,
      followers: userData.followers || 0,
      totalStars: repos.reduce((acc: number, r: GitHubRepo) => acc + (r.stars || 0), 0)
    }

    return { repos, stats, timestamp: Date.now() }
  }

  private async fetchFromApi(username: string) {
    const targetUser = this.resolveUsername(username)

    // Return cached data if still fresh
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_TTL) {
      return this.cache
    }

    // On the server, fetch GitHub directly to avoid loopback network issues
    if (typeof window === 'undefined') {
      try {
        this.cache = await this.fetchDirect(targetUser)
        return this.cache
      } catch (directErr: any) {
        console.warn(`[HybridGitHubProvider] Direct fetch for ${targetUser} failed: ${directErr?.message || directErr}`)
        throw directErr
      }
    }

    // On the client, fetch through internal proxy route
    const origin =
      window.location &&
      window.location.origin &&
      window.location.origin !== 'null' &&
      !window.location.origin.startsWith('about:')
        ? window.location.origin
        : ''
    const res = await fetch(`${origin}/api/github?username=${encodeURIComponent(targetUser)}`)
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
      console.warn('[HybridGitHubProvider] getPinnedRepos using fallback:', err?.message || err)
      return { data: null, error: err as Error }
    }
  }

  async getStats(username: string) {
    try {
      const data = await this.fetchFromApi(username)
      return { data: data.stats, error: null }
    } catch (err: any) {
      console.warn('[HybridGitHubProvider] getStats using fallback:', err?.message || err)
      return { data: null, error: err as Error }
    }
  }
}
