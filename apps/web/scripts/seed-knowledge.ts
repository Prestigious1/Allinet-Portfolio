/**
 * ALLI Knowledge Base Seed Script
 * TASK-P9-05 / F-307 / F-308
 *
 * Populates the Payload `knowledge-items` collection with 35+ verified entries
 * covering: engineering background, tech stack, engagement process, project
 * deliverables, demo modules, FAQs, and operational policies.
 *
 * Usage:
 *   npx tsx scripts/seed-knowledge.ts
 *   OR via npm script: npm run seed:knowledge
 *
 * Requires: DATABASE_URL env var pointing to the Payload Postgres instance.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createRequire } from 'module';

const req = createRequire(import.meta.url);
try {
  const nextEnv = req('@next/env');
  if (nextEnv && !nextEnv.default) nextEnv.default = nextEnv;
} catch { /* ignore */ }

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const envLocalPath = path.resolve(dirname, '../.env.local');
if (fs.existsSync(envLocalPath)) process.loadEnvFile(envLocalPath);
const envPath = path.resolve(dirname, '../.env');
if (fs.existsSync(envPath)) process.loadEnvFile(envPath);

// ---------------------------------------------------------------------------
// Knowledge Items Data (35 verified entries)
// ---------------------------------------------------------------------------

interface KnowledgeItemInput {
  title: string;
  content: string;
  confidence: 'high' | 'medium' | 'low';
  topic: string;
  tags: string[];
}

const KNOWLEDGE_ITEMS: KnowledgeItemInput[] = [
  // ── Engineering Background ──────────────────────────────────────────────
  {
    title: "Ajibade Alli Akinkunmi — Engineering Background",
    content: "Ajibade Alli Akinkunmi is a senior full-stack engineer and systems architect with 5+ years of experience building high-reliability software for operations, logistics, and enterprise platforms. He specializes in TypeScript, Next.js, Node.js, Go, and Python.",
    confidence: "high",
    topic: "engineering",
    tags: ["background", "experience", "senior", "full-stack", "systems architect"],
  },
  {
    title: "Primary Tech Stack",
    content: "Core stack: TypeScript, Next.js 14+, React, Node.js. Database: Supabase (PostgreSQL) with Row-Level Security. AI: Google Gemini, OpenAI, Vercel AI SDK. DevOps: Vercel, GitHub Actions, Docker. CMS: Payload CMS. Secondary: Go, Python, Redis.",
    confidence: "high",
    topic: "engineering",
    tags: ["typescript", "nextjs", "react", "nodejs", "supabase", "postgresql", "gemini", "openai", "vercel", "golang", "python", "redis", "docker"],
  },
  {
    title: "Frontend Engineering Expertise",
    content: "Alli builds responsive, accessible, performance-optimized UIs with React and Next.js. He uses server components, streaming SSR, and edge rendering to deliver sub-100ms FCP on Vercel's global edge network. Familiar with Tailwind CSS, Framer Motion, and Radix UI.",
    confidence: "high",
    topic: "engineering",
    tags: ["frontend", "react", "nextjs", "ssr", "server components", "edge rendering", "tailwind", "accessibility", "performance"],
  },
  {
    title: "Backend & API Engineering",
    content: "Alli designs RESTful and tRPC APIs, implements middleware pipelines, distributed rate limiting, authentication (JWT, sessions, OAuth), and webhook integrations. He builds for horizontal scalability using stateless services and Redis-backed queues.",
    confidence: "high",
    topic: "engineering",
    tags: ["backend", "api", "rest", "trpc", "middleware", "rate limiting", "authentication", "jwt", "oauth", "redis", "webhook"],
  },
  {
    title: "Database & Supabase Expertise",
    content: "Alli uses Supabase as his primary database, leveraging PostgreSQL with complex relational schemas, triggers, functions, Row-Level Security policies, and Supabase Realtime for live data sync. He writes raw SQL for complex queries and migrations.",
    confidence: "high",
    topic: "engineering",
    tags: ["supabase", "postgresql", "sql", "rls", "realtime", "database", "migrations", "triggers"],
  },
  {
    title: "AI Integration & RAG Systems",
    content: "Alli builds production AI features using the Vercel AI SDK, Google Gemini API, and OpenAI. He implements Retrieval-Augmented Generation (RAG) pipelines, streaming chat interfaces, vector search with pgvector, and agentic workflows with tool calling.",
    confidence: "high",
    topic: "engineering",
    tags: ["ai", "llm", "rag", "retrieval augmented generation", "gemini", "openai", "vercel ai sdk", "vector search", "pgvector", "streaming", "agentic"],
  },
  {
    title: "Go (Golang) Backend Development",
    content: "Alli writes Go microservices for high-throughput data processing, background job workers, and CLI tooling. He uses goroutines, channels, and Go's standard library for efficient concurrent processing.",
    confidence: "high",
    topic: "engineering",
    tags: ["golang", "go", "microservices", "concurrency", "cli", "backend"],
  },
  {
    title: "Python & Data Engineering",
    content: "Alli uses Python for data pipelines, AI model integration scripts, automation workflows, and rapid prototyping. Libraries: FastAPI, Pandas, NumPy, SQLAlchemy, and LangChain.",
    confidence: "high",
    topic: "engineering",
    tags: ["python", "fastapi", "pandas", "numpy", "langchain", "data pipeline", "automation"],
  },

  // ── Engagement Process ───────────────────────────────────────────────────
  {
    title: "How to Start a Project with Alli",
    content: "The engagement starts with a project brief submission at /brief. Alli reviews all briefs within 48 hours on business days. After review, he schedules a 30-minute discovery call to align on scope, constraints, and expectations before producing a written proposal.",
    confidence: "high",
    topic: "process",
    tags: ["engagement", "start", "project", "brief", "discovery call", "proposal", "process"],
  },
  {
    title: "Project Brief — What to Include",
    content: "A strong project brief should include: (1) problem statement and business goal, (2) target users or audience, (3) desired features or functionality, (4) existing systems to integrate with, (5) rough timeline expectation, and (6) budget range if applicable.",
    confidence: "high",
    topic: "process",
    tags: ["brief", "project brief", "requirements", "scope", "process"],
  },
  {
    title: "Discovery Call Process",
    content: "After reviewing the brief, Alli schedules a 30-minute video call (Zoom or Google Meet) to discuss requirements in depth. This call covers technical approach, architecture options, risks, and timeline. A written proposal follows within 3–5 business days.",
    confidence: "high",
    topic: "process",
    tags: ["discovery call", "consultation", "meeting", "zoom", "process", "proposal"],
  },
  {
    title: "How Alli Handles Project Proposals",
    content: "Proposals are structured documents covering: scope definition, technical architecture, phased delivery milestones, risk register, and payment terms. Proposals are valid for 14 days. Projects begin after mutual agreement and initial milestone payment.",
    confidence: "high",
    topic: "process",
    tags: ["proposal", "scope", "milestones", "delivery", "payment", "process"],
  },
  {
    title: "Typical Project Delivery Timeline",
    content: "MVP delivery: 4–8 weeks for focused scope projects. Enterprise platforms with complex integrations: 3–6 months with iterative milestone releases. Alli delivers bi-weekly progress updates and demo sessions throughout the project.",
    confidence: "high",
    topic: "process",
    tags: ["timeline", "delivery", "mvp", "milestones", "iterations", "process"],
  },
  {
    title: "Pricing — How to Get a Quote",
    content: "Pricing is project-specific and based on scope, complexity, and timeline. Alli does not publish fixed rate cards to avoid misaligned expectations. Submit a project brief at /brief to receive a tailored, transparent proposal with clear deliverables and milestone costs.",
    confidence: "high",
    topic: "process",
    tags: ["pricing", "quote", "cost", "rate", "brief", "proposal", "process"],
  },
  {
    title: "Communication & Availability",
    content: "Alli is based in Lagos, Nigeria (WAT, UTC+1). He responds to all messages within 24 hours on business days. Preferred communication channels: project brief form (/brief), WhatsApp for quick queries, and email for formal correspondence.",
    confidence: "high",
    topic: "process",
    tags: ["availability", "communication", "timezone", "lagos", "nigeria", "response time", "whatsapp", "email"],
  },
  {
    title: "Book a Consultation Call",
    content: "Alli offers 15-minute introductory calls via Cal.com for quick project scoping questions. For full discovery sessions, submit a brief at /brief first so the call is productive. Book at https://cal.com/alli/15min.",
    confidence: "high",
    topic: "process",
    tags: ["consultation", "book", "call", "cal.com", "15 minutes", "schedule", "meeting"],
  },

  // ── Project Types & Deliverables ─────────────────────────────────────────
  {
    title: "Types of Projects Alli Takes On",
    content: "Alli specializes in: (1) SaaS product platforms, (2) operations management software (booking, logistics, laundry, inventory), (3) AI-powered web applications with RAG and agentic workflows, (4) developer tooling and CLI systems, (5) enterprise data platforms with reporting.",
    confidence: "high",
    topic: "projects",
    tags: ["project types", "saas", "operations", "booking", "logistics", "ai", "developer tooling", "enterprise", "data platform"],
  },
  {
    title: "Hall Booking Management System (Live Demo)",
    content: "Alli built a full hall booking and event operations system featuring: real-time availability grid, multi-tier pricing engine, automated booking confirmation, and an operations admin dashboard. Live demo at /demos/hall-booking.",
    confidence: "high",
    topic: "projects",
    tags: ["hall booking", "event management", "booking system", "demo", "operations", "availability", "admin dashboard"],
  },
  {
    title: "Laundry Operations Management System (Live Demo)",
    content: "Alli built an end-to-end laundry business management platform featuring: customer order tracker, multi-stage operations board, real-time status updates, and automated billing. Live demo at /demos/laundry.",
    confidence: "high",
    topic: "projects",
    tags: ["laundry", "operations management", "order tracker", "demo", "operations", "billing", "status"],
  },
  {
    title: "What Alli Delivers in a Project",
    content: "Standard deliverables: working production-ready codebase (TypeScript, clean architecture), CI/CD pipeline via GitHub Actions, automated test suite (Vitest + Playwright), documentation, and a 2-week post-launch support window for critical bug fixes.",
    confidence: "high",
    topic: "projects",
    tags: ["deliverables", "codebase", "ci/cd", "github actions", "tests", "documentation", "support"],
  },

  // ── Portfolio & Public Projects ──────────────────────────────────────────
  {
    title: "Alli's Portfolio Site — ALLINET Command Center",
    content: "This portfolio site (allinet.dev) is itself a live case study demonstrating Alli's stack: Next.js 14 App Router, Payload CMS, Supabase, Vitest test suite with 100% coverage, Playwright E2E smoke tests, and AI-powered concierge.",
    confidence: "high",
    topic: "portfolio",
    tags: ["portfolio", "allinet", "next.js", "payload cms", "supabase", "vitest", "playwright", "case study"],
  },
  {
    title: "GitHub Profile",
    content: "Alli's open-source work and project repositories are on GitHub at https://github.com/ajibade-alli. The portfolio also integrates live GitHub contribution data.",
    confidence: "high",
    topic: "portfolio",
    tags: ["github", "open source", "repositories", "contributions"],
  },

  // ── Technical FAQs ───────────────────────────────────────────────────────
  {
    title: "Does Alli do mobile app development?",
    content: "Alli focuses on web applications and APIs. For mobile, he builds progressive web apps (PWA) and responsive web apps that work excellently on mobile browsers. He does not develop native iOS or Android apps.",
    confidence: "high",
    topic: "faq",
    tags: ["mobile", "pwa", "progressive web app", "ios", "android", "faq"],
  },
  {
    title: "Does Alli work with existing codebases?",
    content: "Yes. Alli takes on modernization, refactoring, and feature extension work on existing codebases. He first conducts an architecture audit to identify technical debt and risks before committing to a scope.",
    confidence: "high",
    topic: "faq",
    tags: ["existing codebase", "refactoring", "modernization", "technical debt", "audit", "faq"],
  },
  {
    title: "What CMS does Alli use?",
    content: "Alli's preferred headless CMS is Payload CMS (v3, TypeScript-native, self-hosted or cloud). He also has experience with Sanity, Contentful, and Strapi depending on project requirements.",
    confidence: "high",
    topic: "engineering",
    tags: ["cms", "payload cms", "sanity", "contentful", "strapi", "headless cms", "faq"],
  },
  {
    title: "Does Alli do DevOps and deployment?",
    content: "Yes. Alli handles full deployment pipelines: Vercel for Next.js apps, Railway or Fly.io for Node/Go services, GitHub Actions for CI/CD, Docker containerization, and environment variable management.",
    confidence: "high",
    topic: "engineering",
    tags: ["devops", "deployment", "vercel", "railway", "fly.io", "docker", "ci/cd", "github actions", "faq"],
  },
  {
    title: "What testing frameworks does Alli use?",
    content: "Alli uses Vitest for unit and integration tests (with React Testing Library for component tests), and Playwright for E2E browser automation. He aims for meaningful coverage on business logic, not 100% line coverage for its own sake.",
    confidence: "high",
    topic: "engineering",
    tags: ["testing", "vitest", "playwright", "react testing library", "unit tests", "integration tests", "e2e", "faq"],
  },
  {
    title: "Does Alli work with startups or only established companies?",
    content: "Alli works with both early-stage startups (pre-product, MVP builds) and established companies (scale-up features, platform modernization). He adapts the engagement model — fixed-scope vs ongoing retainer — to fit the stage.",
    confidence: "high",
    topic: "faq",
    tags: ["startup", "enterprise", "mvp", "early stage", "scale up", "retainer", "faq"],
  },
  {
    title: "Can Alli work as a team member (staff augmentation)?",
    content: "Yes. Alli is available for staff augmentation engagements where he joins an existing engineering team as a senior contractor. He integrates with team workflows (Jira, Linear, GitHub, Slack) and contributes from day one.",
    confidence: "high",
    topic: "faq",
    tags: ["staff augmentation", "contractor", "team", "jira", "linear", "slack", "github", "senior", "faq"],
  },
  {
    title: "Does Alli handle SEO and performance optimization?",
    content: "Yes. Alli builds with SEO fundamentals by default: structured JSON-LD, semantic HTML, meta tags, dynamic sitemaps, and robots.txt. He also optimizes Core Web Vitals — targeting LCP <2.5s and FID <100ms.",
    confidence: "high",
    topic: "engineering",
    tags: ["seo", "performance", "core web vitals", "lcp", "fid", "json-ld", "sitemap", "robots.txt", "faq"],
  },
  {
    title: "Does Alli sign NDAs?",
    content: "Yes. Alli routinely signs Non-Disclosure Agreements (NDAs) and IP assignment agreements as standard practice for client engagements. These are reviewed and executed before any proprietary information is shared.",
    confidence: "high",
    topic: "process",
    tags: ["nda", "non-disclosure", "ip", "confidentiality", "legal", "contract", "faq"],
  },

  // ── Site Features ────────────────────────────────────────────────────────
  {
    title: "Available Live Demos on the Portfolio",
    content: "The portfolio hosts two interactive business demos: (1) Hall Booking Management System at /demos/hall-booking — complete with customer flow and admin dashboard. (2) Laundry Operations Platform at /demos/laundry — with order tracking and operations desk.",
    confidence: "high",
    topic: "portfolio",
    tags: ["demos", "hall booking", "laundry", "interactive", "portfolio", "live"],
  },
  {
    title: "Project Brief Builder at /brief",
    content: "Visitors can build a structured project brief at /brief. The multi-step form guides them through project type, scope, budget range, and timeline. On completion, it generates a formatted proposal request sent directly to Alli.",
    confidence: "high",
    topic: "portfolio",
    tags: ["brief builder", "brief", "proposal", "form", "project request", "portfolio"],
  },
  {
    title: "Contact Methods",
    content: "Best ways to reach Alli: (1) Project brief form at /brief for new project enquiries. (2) WhatsApp for quick questions. (3) Contact form at /contact for general correspondence. Response within 24 hours on business days.",
    confidence: "high",
    topic: "process",
    tags: ["contact", "whatsapp", "email", "brief", "contact form", "response time"],
  },
  {
    title: "Alli's /now Status Page",
    content: "The /now page shows Alli's current focus, availability status, and recent project activity. It's updated regularly to reflect real-time availability for new engagements.",
    confidence: "medium",
    topic: "portfolio",
    tags: ["now", "availability", "status", "current focus", "portfolio"],
  },
];

// ---------------------------------------------------------------------------
// Seed Function
// ---------------------------------------------------------------------------

async function seedKnowledge() {
  console.log('[SeedKnowledge] Initializing Payload Local API...');
  const { getPayload } = await import('payload');
  const configModule = await import('../payload.config');
  const config = (configModule as any).default || configModule;
  const payload = await getPayload({ config });

  console.log(`[SeedKnowledge] Seeding ${KNOWLEDGE_ITEMS.length} knowledge items...`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of KNOWLEDGE_ITEMS) {
    try {
      // Check if item with same title already exists
      const existing = await payload.find({
        collection: 'knowledge-items' as any,
        where: { title: { equals: item.title } },
        limit: 1,
      });

      if (existing.docs.length > 0) {
        console.log(`  ↷ Skip (exists): "${item.title}"`);
        skipped++;
        continue;
      }

      await payload.create({
        collection: 'knowledge-items' as any,
        data: item as any,
      });

      console.log(`  ✓ Created: "${item.title}"`);
      created++;
    } catch (err: any) {
      console.error(`  ✗ Failed: "${item.title}" — ${err?.message || err}`);
      failed++;
    }
  }

  console.log('\n[SeedKnowledge] ─────────────────────────────────');
  console.log(`  Created : ${created}`);
  console.log(`  Skipped : ${skipped} (already exist)`);
  console.log(`  Failed  : ${failed}`);
  console.log(`  Total   : ${KNOWLEDGE_ITEMS.length} items defined`);
  console.log('[SeedKnowledge] Done.');

  if (failed > 0) process.exit(1);
}

seedKnowledge().catch((err) => {
  console.error('[SeedKnowledge] Fatal error:', err);
  process.exit(1);
});
