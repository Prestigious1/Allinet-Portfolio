import { AuthService, MockAuthService } from './auth/AuthService'
import { DatabaseProvider, MockDatabaseProvider } from './database/DatabaseProvider'
import { PayloadDatabaseProvider } from './database/PayloadDatabaseProvider'
import { AIProvider } from './ai/AIProvider'
import { MockAIProvider } from './ai/MockAIProvider'
import { LiveAIProvider } from './ai/LiveAIProvider'
import { StorageProvider, MockStorageProvider } from './storage/StorageProvider'
import { SupabaseStorageProvider } from './storage/SupabaseStorageProvider'
import { AnalyticsProvider, MockAnalyticsProvider } from './analytics/AnalyticsProvider'
import { VercelAnalyticsProvider } from './analytics/VercelAnalyticsProvider'
import { EmailProvider, MockEmailProvider } from './email/EmailProvider'
import { LiveEmailProvider } from './email/LiveEmailProvider'
import { GitHubProvider, MockGitHubProvider } from './github/GitHubProvider'
import { HybridGitHubProvider } from './github/HybridGitHubProvider'
import { RateLimiterProvider } from './rate-limit/RateLimiter'
import { MemoryRateLimiter } from './rate-limit/MemoryRateLimiter'
import { UpstashRateLimiter } from './rate-limit/UpstashRateLimiter'
import { PortfolioProvider } from './portfolio/PortfolioProvider'
import { CMSPortfolioProvider } from './portfolio/CMSPortfolioProvider'

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Checks whether an env var is set and non-empty.
 * Logs a warning if missing so CI/CD pipelines surface the gap immediately.
 */
function requireEnv(key: string, providerName: string): boolean {
  const value = process.env[key]
  if (!value) {
    console.warn(
      `[CoreServices] ⚠️  Missing env var "${key}" — ${providerName} will use its Mock fallback.`
    )
    return false
  }
  return true
}

// ── Central Dependency Injection Container ─────────────────────────────────

class CoreServices {
  private static instance: CoreServices

  public auth: AuthService
  public db: DatabaseProvider
  public ai: AIProvider
  public storage: StorageProvider
  public analytics: AnalyticsProvider
  public email: EmailProvider
  public github: GitHubProvider
  public rateLimiter: RateLimiterProvider
  public portfolio: PortfolioProvider

  private constructor() {
    const isProd = process.env.NODE_ENV === 'production'

    // ── Auth ──────────────────────────────────────────────────────────────
    // Auth is handled by Payload CMS session; MockAuthService is fine for now.
    this.auth = new MockAuthService()

    // ── Database (Payload CMS / Supabase Postgres) ────────────────────────
    if (requireEnv('DATABASE_URL', 'PayloadDatabaseProvider') || isProd) {
      this.db = new PayloadDatabaseProvider()
    } else {
      this.db = new MockDatabaseProvider()
    }

    // ── AI (AION via OpenRouter / OpenAI) ───────────────────────────────────
    const hasAIKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY
    if (hasAIKey || isProd) {
      this.ai = new LiveAIProvider()
    } else {
      console.warn('[CoreServices] ⚠️ No AI keys detected (OPENROUTER_API_KEY / OPENAI_API_KEY) — using MockAIProvider.')
      this.ai = new MockAIProvider()
    }

    // ── Storage (Supabase Storage) ─────────────────────────────────────────
    const hasSupabase =
      requireEnv('NEXT_PUBLIC_SUPABASE_URL', 'SupabaseStorageProvider') &&
      requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SupabaseStorageProvider')

    if (hasSupabase || isProd) {
      this.storage = new SupabaseStorageProvider()
    } else {
      this.storage = new MockStorageProvider()
    }

    // ── Analytics (Vercel Analytics) ───────────────────────────────────────
    // VercelAnalyticsProvider works via the @vercel/analytics script in production;
    // it gracefully no-ops in dev when the script is absent.
    if (isProd) {
      this.analytics = new VercelAnalyticsProvider()
    } else {
      console.warn(
        '[CoreServices] ℹ️  NODE_ENV is not "production" — AnalyticsProvider will use Mock.'
      )
      this.analytics = new MockAnalyticsProvider()
    }

    // ── Email (Resend) ─────────────────────────────────────────────────────
    if (requireEnv('RESEND_API_KEY', 'LiveEmailProvider') || isProd) {
      this.email = new LiveEmailProvider()
    } else {
      this.email = new MockEmailProvider()
    }

    // ── GitHub ─────────────────────────────────────────────────────────────
    // HybridGitHubProvider handles its own errors and falls back gracefully.
    this.github = new HybridGitHubProvider()

    // ── Rate Limiter ───────────────────────────────────────────────────────
    // Uses Upstash Redis when credentials are present (production-safe, multi-instance).
    // Falls back to in-memory for local dev.
    const hasUpstash = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    if (hasUpstash || isProd) {
      this.rateLimiter = new UpstashRateLimiter()
    } else {
      console.warn('[CoreServices] ℹ️  No Upstash credentials — using in-memory rate limiter (dev mode).')
      this.rateLimiter = new MemoryRateLimiter()
    }

    // ── Portfolio ──────────────────────────────────────────────────────────
    // CMSPortfolioProvider automatically falls back to Seed data if CMS is empty/unreachable
    this.portfolio = new CMSPortfolioProvider()
  }

  public static getInstance(): CoreServices {
    if (!CoreServices.instance) {
      CoreServices.instance = new CoreServices()
    }
    return CoreServices.instance
  }
}

export const services = CoreServices.getInstance()
