import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { createRequire } from 'module'

const req = createRequire(import.meta.url)
try {
  const nextEnv = req('@next/env')
  if (nextEnv && !nextEnv.default) {
    nextEnv.default = nextEnv
  }
} catch {
  // Ignore if @next/env cannot be required directly
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Load env files natively
const envLocalPath = path.resolve(dirname, '../.env.local')
if (fs.existsSync(envLocalPath)) {
  process.loadEnvFile(envLocalPath)
}
const envPath = path.resolve(dirname, '../.env')
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath)
}

import { PORTFOLIO_DATA } from '../src/lib/ai/portfolio-data'

async function seed() {
  console.log('[Seed] Initializing Payload Local API...')
  const { getPayload } = await import('payload')
  const configModule = await import('../payload.config')
  const config = configModule.default || configModule
  const payload = await getPayload({ config })

  console.log('[Seed] Seeding globals...')

  // 1. Seed portfolio-owner global
  await payload.updateGlobal({
    slug: 'portfolio-owner',
    data: {
      full_name: PORTFOLIO_DATA.owner.fullName,
      display_name: PORTFOLIO_DATA.owner.displayName,
      title: PORTFOLIO_DATA.owner.title,
      bio_short: PORTFOLIO_DATA.owner.bioShort,
      email: PORTFOLIO_DATA.owner.email,
      location: PORTFOLIO_DATA.owner.location,
      github_url: PORTFOLIO_DATA.owner.githubUrl,
      linkedin_url: PORTFOLIO_DATA.owner.linkedinUrl,
      open_to_work: PORTFOLIO_DATA.owner.openToWork,
      availability: PORTFOLIO_DATA.owner.availability,
    },
  })
  console.log('  ✓ portfolio-owner seeded')

  // 2. Seed site-settings global
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      site_name: 'ALLINET OS',
      default_theme: 'cyber-gold',
      boot_sequence_enabled: true,
      intro_scene_enabled: true,
      analytics_enabled: true,
    },
  })
  console.log('  ✓ site-settings seeded')

  // 3. Seed now-status global
  await payload.updateGlobal({
    slug: 'now-status',
    data: {
      currentProject: 'ALLINET Portfolio OS v2.0',
      progressPct: 85,
      progressUpdatedAt: new Date().toISOString(),
      milestone: 'Security hardening & CMS schema expansion',
      learningFocus: 'Distributed rate limiting, LLM memory retrieval, Next.js 16 Edge runtime',
      availabilityText: 'Open for high-impact advisory & architecture contracts',
      slotsOpen: 1,
      showGithub: true,
    },
  })
  console.log('  ✓ now-status seeded')

  // 4. Seed technologies (idempotent)
  console.log('[Seed] Seeding technologies...')
  let techCount = 0
  for (const tech of PORTFOLIO_DATA.technologies) {
    const slug = tech.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const existing = await payload.find({
      collection: 'technologies',
      where: { slug: { equals: slug } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'technologies',
        data: {
          name: tech.name,
          slug,
          category: tech.category as any,
          proficiency: tech.proficiency,
          years: 4,
          description: `Production experience with ${tech.name}`,
        },
      })
      techCount++
    }
  }
  console.log(`  ✓ technologies processed (${techCount} new inserted)`)

  // 5. Seed project categories (idempotent)
  console.log('[Seed] Seeding project categories...')
  const categories = [
    { name: 'Full-Stack Web', slug: 'web', icon: '🌐' },
    { name: 'AI & Machine Learning', slug: 'ai', icon: '🤖' },
    { name: 'Interactive 3D / Graphics', slug: '3d', icon: '🎮' },
    { name: 'Enterprise Systems', slug: 'systems', icon: '⚡' },
  ]
  for (const cat of categories) {
    const existing = await payload.find({
      collection: 'project-categories',
      where: { slug: { equals: cat.slug } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'project-categories',
        data: {
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
        },
      })
    }
  }
  console.log('  ✓ project-categories processed')

  // 6. Seed sample knowledge items (idempotent)
  console.log('[Seed] Seeding knowledge items...')
  const sampleKnowledge = [
    {
      title: 'Architectural Philosophy: Deterministic Systems & Edge Performance',
      category: 'architecture' as const,
      content: 'ALLINET OS leverages Next.js 16 Edge runtime with layered fallback providers. State machines govern interactive flows, ensuring predictable behavior and resilience under network disruption.',
      sourcePath: 'MASTER_PORTFOLIO_IMPLEMENTATION_PLAN.md',
      tags: ['architecture', 'nextjs', 'edge', 'state-machine'],
      isPublic: true,
      verifiedAt: new Date().toISOString(),
    },
    {
      title: 'Developer Experience: Multi-Engine Testing & CI Automation',
      category: 'dx' as const,
      content: 'Automated Vitest unit and Playwright end-to-end test suites run on every commit. Strict linting and TypeScript checks enforce pristine type safety.',
      sourcePath: '.github/workflows/ci.yml',
      tags: ['dx', 'testing', 'vitest', 'playwright', 'ci'],
      isPublic: true,
      verifiedAt: new Date().toISOString(),
    },
    {
      title: 'Security: Zero-Trust Endpoint Protection & Rate Limiting',
      category: 'patterns' as const,
      content: 'Server-to-server secret authentication guards sensitive endpoints (/api/email, /api/ai/memory), while Upstash Redis enforces distributed token-bucket rate limits.',
      sourcePath: 'src/core/api/middleware.ts',
      tags: ['security', 'rate-limiting', 'auth', 'redis'],
      isPublic: true,
      verifiedAt: new Date().toISOString(),
    },
  ]

  let kiCount = 0
  for (const item of sampleKnowledge) {
    const existing = await payload.find({
      collection: 'knowledge-items',
      where: { title: { equals: item.title } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'knowledge-items',
        data: item,
      })
      kiCount++
    }
  }
  console.log(`  ✓ knowledge-items processed (${kiCount} new inserted)`)

  // 7. Seed services (idempotent)
  console.log('[Seed] Seeding services...')
  const sampleServices = [
    {
      title: 'MVP Systems Architecture',
      slug: 'mvp-systems-architecture',
      outcome: 'Architect and deliver high-performance, scalable web and mobile software foundations in weeks, not months.',
      deliverables: ['System Architecture Document', 'Next.js 16 + Payload CMS Core', 'Automated CI/CD Pipeline', 'Security Audit'],
      published: true,
    },
    {
      title: 'Interactive 3D Web & Creative Engineering',
      slug: 'interactive-3d-creative',
      outcome: 'Award-winning interactive brand experiences utilizing Three.js, React Three Fiber, GSAP, and WebGL.',
      deliverables: ['Custom 3D Scene', 'Interactive Shaders', 'Cross-Device Performance Optimization'],
      published: true,
    },
    {
      title: 'AI Agent Systems & Automation',
      slug: 'ai-agent-systems',
      outcome: 'Deploy deterministic multi-agent architectures, RAG pipelines, and intelligent customer concierge workflows.',
      deliverables: ['Custom LLM Tool Integration', 'Vector/Semantic Retrieval Engine', 'Anti-Hallucination Guardrails'],
      published: true,
    },
  ]

  let srvCount = 0
  for (const srv of sampleServices) {
    const existing = await payload.find({
      collection: 'services',
      where: { slug: { equals: srv.slug } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'services',
        data: srv,
      })
      srvCount++
    }
  }
  console.log(`  ✓ services processed (${srvCount} new inserted)`)

  // 8. Seed changelog (idempotent)
  console.log('[Seed] Seeding changelog...')
  const sampleChangelog = [
    {
      version: 'v2.0.0',
      title: 'ALLINET OS 2.0 Architectural Overhaul',
      description: 'Major release featuring dual-mode shell (OS / Public Site), distributed rate limiting, and Payload CMS expansion.',
      date: new Date().toISOString(),
      published: true,
    },
    {
      version: 'v1.5.0',
      title: '3D World Environments & Audio Engine',
      description: 'Added customizable 3D worlds, dynamic fog, time-of-day lighting, and spatial audio synthesis.',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      published: true,
    },
  ]

  let clCount = 0
  for (const cl of sampleChangelog) {
    const existing = await payload.find({
      collection: 'changelog',
      where: { version: { equals: cl.version } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'changelog',
        data: cl,
      })
      clCount++
    }
  }
  console.log(`  ✓ changelog processed (${clCount} new inserted)`)

  // 9. Seed demos (idempotent)
  console.log('[Seed] Seeding demos...')
  const sampleDemos = [
    {
      title: 'Lagos Hall Booking Experience',
      slug: 'hall-booking',
      status: 'live' as const,
      challengeName: 'Mission 01: Event Venue Booking & Conflict Resolution Engine',
    },
    {
      title: 'Express Laundry Operations Tracker',
      slug: 'laundry',
      status: 'live' as const,
      challengeName: 'Mission 02: Multi-Stage Order Lifecycle & Delivery Desk',
    },
  ]

  let demoCount = 0
  for (const demo of sampleDemos) {
    const existing = await payload.find({
      collection: 'demos',
      where: { slug: { equals: demo.slug } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      await payload.create({
        collection: 'demos',
        data: demo,
      })
      demoCount++
    }
  }
  console.log(`  ✓ demos processed (${demoCount} new inserted)`)

  console.log('[Seed] Seeding completed successfully and idempotently.')
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[Seed] Error during database seeding:', err)
    process.exit(1)
  })
