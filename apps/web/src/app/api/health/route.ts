import { NextResponse } from 'next/server'
import { withApiMiddleware, RATE_LIMIT_POLICIES } from '@/core/api/middleware'
import { services } from '@/core/providers'

export interface ServiceHealth {
  status: 'healthy' | 'connected' | 'mock' | 'degraded' | 'unreachable'
  latencyMs?: number
  details?: string
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded'
  timestamp: string
  uptimeSeconds: number
  cached: boolean
  services: {
    database: ServiceHealth
    cms: ServiceHealth
    aiGateway: ServiceHealth
    github: ServiceHealth
  }
}

let cachedCheck: { response: HealthCheckResponse; timestamp: number } | null = null
const CACHE_TTL_MS = 60 * 1000

/**
 * Executes or retrieves cached diagnostic probes across core subsystem dependencies.
 * Never outputs credentials, tokens, or raw internal connection strings.
 */
export async function checkSystemHealth(forceFresh = false): Promise<HealthCheckResponse> {
  const now = Date.now()
  if (!forceFresh && cachedCheck && now - cachedCheck.timestamp < CACHE_TTL_MS) {
    return {
      ...cachedCheck.response,
      cached: true,
    }
  }

  // 1. Probe database
  const dbStart = performance.now()
  let dbStatus: ServiceHealth = { status: 'mock' }
  try {
    const res = await services.db.query('site-settings')
    const dbLatency = Math.round(performance.now() - dbStart)
    if (res.error) {
      dbStatus = { status: 'degraded', latencyMs: dbLatency, details: res.error.message }
    } else {
      const isLiveDb = Boolean(process.env.DATABASE_URL)
      dbStatus = {
        status: isLiveDb ? 'connected' : 'mock',
        latencyMs: dbLatency,
      }
    }
  } catch (err: any) {
    dbStatus = { status: 'unreachable', details: err?.message || 'Database probe failed' }
  }

  // 2. Probe CMS Read Status
  const cmsStart = performance.now()
  let cmsStatus: ServiceHealth = { status: 'mock' }
  try {
    const owner = await services.portfolio.getOwner()
    const cmsLatency = Math.round(performance.now() - cmsStart)
    if (owner && owner.fullName) {
      cmsStatus = { status: 'connected', latencyMs: cmsLatency }
    } else {
      cmsStatus = { status: 'mock', latencyMs: cmsLatency }
    }
  } catch (err: any) {
    cmsStatus = { status: 'degraded', details: err?.message || 'CMS probe failed' }
  }

  // 3. Probe AI Gateway Configuration (Safe key presence check)
  const hasAiKey = Boolean(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY)
  const aiStatus: ServiceHealth = {
    status: hasAiKey ? 'connected' : 'mock',
    details: hasAiKey ? 'Active API credentials detected' : 'Mock AI provider fallback in use',
  }

  // 4. Probe GitHub Provider Status
  const ghStart = performance.now()
  let ghStatus: ServiceHealth = { status: 'mock' }
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'Prestigious1'
  try {
    const ghRes = await services.github.getPinnedRepos(username)
    const ghLatency = Math.round(performance.now() - ghStart)
    if (ghRes.error) {
      ghStatus = { status: 'degraded', latencyMs: ghLatency, details: ghRes.error.message }
    } else {
      ghStatus = { status: 'connected', latencyMs: ghLatency }
    }
  } catch (err: any) {
    ghStatus = { status: 'degraded', details: err?.message || 'GitHub probe failed' }
  }

  const allHealthy =
    dbStatus.status !== 'unreachable' &&
    cmsStatus.status !== 'unreachable' &&
    ghStatus.status !== 'unreachable'

  const responseData: HealthCheckResponse = {
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(typeof process.uptime === 'function' ? process.uptime() : 0),
    cached: false,
    services: {
      database: dbStatus,
      cms: cmsStatus,
      aiGateway: aiStatus,
      github: ghStatus,
    },
  }

  cachedCheck = { response: responseData, timestamp: now }
  return responseData
}

export const GET = withApiMiddleware(
  { rateLimitKey: 'api:health', rateLimitConfig: RATE_LIMIT_POLICIES.health },
  async () => {
    const result = await checkSystemHealth()
    return NextResponse.json(result, {
      status: result.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=30',
      },
    })
  }
)
