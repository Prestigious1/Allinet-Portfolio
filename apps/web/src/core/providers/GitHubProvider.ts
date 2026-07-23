export interface GitHubRepo {
  name: string
  description: string | null
  stars: number
  forks: number
  language: string | null
  updatedAt: string
  topics: string[]
  url: string
}

export interface GitHubStats {
  publicRepos: number
  followers: number
  totalStars: number
}

export interface GitHubProvider {
  getPinnedRepos(username: string): Promise<{ data: GitHubRepo[] | null; error: Error | null }>
  getStats(username: string): Promise<{ data: GitHubStats | null; error: Error | null }>
}

export class MockGitHubProvider implements GitHubProvider {
  async getPinnedRepos(username: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    return {
      data: [
        {
          name: 'allinet-os',
          description: 'An award-winning browser-based operating system portfolio with 3D environments and AI.',
          stars: 128, forks: 23, language: 'TypeScript', updatedAt: new Date().toISOString(),
          topics: ['nextjs', 'three.js', 'gsap', 'ai'],
          url: `https://github.com/${username}/allinet-os`,
        },
        {
          name: 'agentic-ai-orchestrator',
          description: 'Distributed multi-agent AI system with autonomous software engineering capabilities.',
          stars: 312, forks: 67, language: 'Python', updatedAt: new Date().toISOString(),
          topics: ['ai', 'agents', 'langchain', 'redis'],
          url: `https://github.com/${username}/agentic-ai-orchestrator`,
        }
      ],
      error: null
    }
  }

  async getStats(username: string) {
    await new Promise(resolve => setTimeout(resolve, 400))
    return {
      data: {
        publicRepos: 38,
        followers: 312,
        totalStars: 1300
      },
      error: null
    }
  }
}
