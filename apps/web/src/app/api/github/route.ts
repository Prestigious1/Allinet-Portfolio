import { NextResponse } from 'next/server'
import { apiRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'

// Force 30 minute edge caching for this route
export const revalidate = 1800

export async function GET(req: Request) {
  // Rate limiting (60 requests/minute via apiRateLimit)
  const ip = getClientIp(req)
  const { success, remaining, resetAt } = apiRateLimit(ip)

  if (!success) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests.', status: 429 } },
      { status: 429, headers: rateLimitHeaders(remaining, resetAt) }
    )
  }

  const { searchParams } = new URL(req.url)
  const rawUsername = searchParams.get('username') || process.env.NEXT_PUBLIC_GITHUB_USERNAME
  const username = (!rawUsername || rawUsername === 'alli-net')
    ? (process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'Prestigious1')
    : rawUsername

  if (!username) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Username is required', status: 400 } },
      { status: 400 }
    )
  }

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Allinet-Portfolio',
  }

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`
  }

  try {
    // Fetch User Stats
    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers, next: { revalidate: 1800 } })
    const userData = await userRes.json()

    if (!userRes.ok) {
      throw new Error(userData.message || 'Failed to fetch user data')
    }

    // Fetch Repos
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=20`, { headers, next: { revalidate: 1800 } })
    const reposData = await reposRes.json()

    if (!reposRes.ok) {
      throw new Error(reposData.message || 'Failed to fetch repos')
    }

    // Process Repos
    const repos = reposData.map((r: any) => ({
      name: r.name,
      description: r.description,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      updatedAt: r.updated_at,
      topics: r.topics || [],
      url: r.html_url,
    }))

    const stats = {
      publicRepos: userData.public_repos,
      followers: userData.followers,
      totalStars: repos.reduce((acc: number, r: any) => acc + r.stars, 0)
    }

    const response = NextResponse.json({ repos, stats })
    
    // Set headers
    const limits = rateLimitHeaders(remaining, resetAt)
    Object.entries(limits).forEach(([k, v]) => response.headers.set(k, v))
    // Also explicitly set standard Cache-Control
    response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400')

    return response
  } catch (error: any) {
    console.error('[GitHub API Error]:', error)
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: error.message || 'An error occurred fetching from GitHub.', status: 500 } },
      { status: 500 }
    )
  }
}
