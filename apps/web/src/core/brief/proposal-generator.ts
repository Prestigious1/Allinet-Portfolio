/**
 * Deterministic Project Proposal Generator
 * TASK-P10-02 / F-183 / SPEC-08 / AC-BRIEF
 *
 * Maps brief inputs (businessType, modules, tools, scale, timeline) into a
 * structured, professional, deterministic project proposal.
 *
 * CRITICAL CONSTRAINTS:
 * 1. Output is 100% deterministic (same input produces identical proposal).
 * 2. Absolutely zero AI hallucinations, pricing quotes, or contract terms.
 * 3. Mandatory fixed disclaimer: "Estimate for scoping only; not a quote or contract."
 */

export interface ProposalInput {
  businessName: string
  orgType: string
  industry: string
  problemSummary: string
  currentTools?: string
  modules: string[]
  timeline?: string
  budgetRange?: string
  targetScale?: string
  contactName?: string
  contactEmail?: string
}

export interface ProposalModuleItem {
  id: string
  title: string
  tech: string
  phase: 1 | 2
  deliverable: string
}

export interface MilestonePhase {
  phaseNumber: 1 | 2
  title: string
  focus: string
  deliverables: string[]
  estimatedWeeks: string
}

export interface GeneratedProposal {
  systemName: string
  businessName: string
  industry: string
  orgType: string
  executiveSummary: string
  problemStatement: string
  suggestedArchitecture: {
    frontend: string
    backend: string
    database: string
    integrations: string[]
    securityAndOps: string
  }
  userRoles: { role: string; description: string }[]
  coreWorkflow: string[]
  moduleBreakdown: ProposalModuleItem[]
  milestones: {
    phase1: MilestonePhase
    phase2: MilestonePhase
  }
  timelineBand: {
    band: 'S' | 'M' | 'L' | 'XL'
    label: string
    weeks: string
    pacingNotes: string
  }
  budgetGuidance: string
  assumptions: string[]
  notIncluded: string[]
  nextSteps: string
  disclaimer: string
  generatedAt: string
}

// Fixed disclaimer required by SPEC-08 and AC-BRIEF-2
export const MANDATORY_DISCLAIMER = 'Estimate for scoping only; not a quote or contract.'

// Module catalogue with deterministic technical and phased assignments
const MODULE_CATALOGUE: Record<
  string,
  {
    title: string
    tech: string
    defaultPhase: 1 | 2
    deliverable: string
  }
> = {
  auth: {
    title: 'Authentication & Role-Based Access Control',
    tech: 'NextAuth / Supabase Auth with JWT/Argon2 tokens, RBAC permissions, and protected routes',
    defaultPhase: 1,
    deliverable: 'User onboarding, secure credential management, role-based session isolation, and audit login trails.',
  },
  booking: {
    title: 'Real-time Booking & Calendar Scheduling',
    tech: 'PostgreSQL atomic reservation locks, dynamic slot availability resolver, Cal/Google calendar hooks',
    defaultPhase: 1,
    deliverable: 'Automated appointment booking, double-booking prevention, calendar invites, and customer self-serve rescheduling.',
  },
  payments: {
    title: 'Automated Payments & Settlement Engine',
    tech: 'Paystack, Flutterwave or Stripe webhooks with cryptographic HMAC signature verification',
    defaultPhase: 1,
    deliverable: 'One-time & recurring checkouts, automated digital invoice generation, and transaction ledger reconciliation.',
  },
  ai: {
    title: 'AI Concierge & Grounded Knowledge Assistant',
    tech: 'Google Gemini 2.5 API with pgvector semantic similarity search and strict context boundaries',
    defaultPhase: 2,
    deliverable: 'Embedded concierge widget grounded strictly on verified business knowledge without hallucinations.',
  },
  notifications: {
    title: 'Multi-Channel Transactional Alerts',
    tech: 'Resend API (Email) + Termii/Twilio (SMS & WhatsApp Business API) with asynchronous queues',
    defaultPhase: 1,
    deliverable: 'Instant booking receipts, WhatsApp shipment or delivery updates, and automated transactional alerts.',
  },
  analytics: {
    title: 'Operational Telemetry & Performance Dashboard',
    tech: 'Tailwind UI, Recharts visualization, PostgreSQL aggregation views with indexed queries',
    defaultPhase: 2,
    deliverable: 'Executive summary KPI cards, funnel progression metrics, data export (CSV), and activity logs.',
  },
  documents: {
    title: 'Automated Document & PDF Export Engine',
    tech: 'Serverless Node.js PDFKit / Chromium document generation engine',
    defaultPhase: 2,
    deliverable: 'Downloadable PDF project summaries, branded customer invoices, and contract receipts.',
  },
  collaboration: {
    title: 'Team Workspaces & Activity Audit Trail',
    tech: 'Row-level security (RLS), immutable audit events, team remark threads',
    defaultPhase: 2,
    deliverable: 'Internal staff notes, assignment of pending requests, and complete chronological event logs.',
  },
  inventory: {
    title: 'Inventory & Resource Allocation Tracking',
    tech: 'SQL row-level locking, automated stock threshold triggers, SKU management',
    defaultPhase: 1,
    deliverable: 'Real-time inventory levels, re-order alert triggers, and warehouse/resource allocation logs.',
  },
  integrations: {
    title: 'Custom API & Third-Party Webhook Pipelines',
    tech: 'HMAC-verified webhook endpoints, exponential backoff retries, JSON REST endpoints',
    defaultPhase: 2,
    deliverable: 'Seamless integration with existing CRM, accounting software, or external logistics APIs.',
  },
}

/**
 * Derives a structured, branded system name from input details.
 */
function deriveSystemName(businessName: string, industry: string, modules: string[]): string {
  const cleanName = (businessName || 'Enterprise').trim()
  if (modules.includes('booking') && modules.includes('payments')) {
    return `${cleanName} Operations & Transaction Engine`
  }
  if (modules.includes('ai')) {
    return `${cleanName} Intelligent Service Platform`
  }
  if (modules.includes('inventory')) {
    return `${cleanName} Resource & Order Management System`
  }
  return `${cleanName} Core Platform`
}

/**
 * Derives standard user personas based on selected modules and organization profile.
 */
function deriveUserRoles(modules: string[], orgType: string) {
  const roles = [
    {
      role: 'System Administrator',
      description: 'Full oversight of configuration, team roles, system telemetry, and operational parameters.',
    },
    {
      role: orgType === 'enterprise' || orgType === 'agency' ? 'Operations Staff / Coordinator' : 'Team Member',
      description: 'Manages day-to-day intake, verifies updates, responds to requests, and reviews activity logs.',
    },
  ]

  if (modules.includes('booking') || modules.includes('payments') || modules.includes('ai')) {
    roles.push({
      role: 'Client / End Customer',
      description: 'Self-serve interaction: requests services, reviews status, receives notifications, and makes payments.',
    })
  }

  return roles
}

/**
 * Determines timeline band from module count and technical complexity.
 */
function deriveTimelineBand(moduleCount: number): {
  band: 'S' | 'M' | 'L' | 'XL'
  label: string
  weeks: string
  pacingNotes: string
} {
  if (moduleCount <= 2) {
    return {
      band: 'S',
      label: 'Rapid MVP Sprint',
      weeks: '2 to 3 weeks',
      pacingNotes: 'Focused delivery of core operational bottleneck with zero bloat.',
    }
  }
  if (moduleCount <= 5) {
    return {
      band: 'M',
      label: 'Standard Production Build',
      weeks: '4 to 6 weeks',
      pacingNotes: 'Two balanced phases: MVP foundation followed by notifications and reporting polish.',
    }
  }
  if (moduleCount <= 8) {
    return {
      band: 'L',
      label: 'Comprehensive System',
      weeks: '7 to 9 weeks',
      pacingNotes: 'Full-featured enterprise platform with advanced integrations and automated document engines.',
    }
  }
  return {
    band: 'XL',
    label: 'Enterprise Multi-Phase Ecosystem',
    weeks: '10 to 12 weeks',
    pacingNotes: 'Multi-tiered architecture structured across staged bi-weekly milestone releases.',
  }
}

/**
 * Normalizes budget range to clear, non-contractual scoping guidance.
 */
function deriveBudgetGuidance(budgetRange?: string): string {
  if (!budgetRange || budgetRange === 'to_be_scoped' || budgetRange === 'unknown') {
    return 'To be scoped during architectural discovery call to match required milestones.'
  }
  if (budgetRange === '<500k-ngn') {
    return 'Target guidance tier: Under ₦500k (Optimized for focused MVP delivery).'
  }
  if (budgetRange === '500k-1.5m-ngn') {
    return 'Target guidance tier: ₦500k – ₦1.5m (Standard full-stack product sprint).'
  }
  if (budgetRange === '1.5m-3m-ngn') {
    return 'Target guidance tier: ₦1.5m – ₦3m (Multi-module high-availability architecture).'
  }
  if (budgetRange === '>3m-ngn') {
    return 'Target guidance tier: Over ₦3m (Enterprise-grade resilient infrastructure).'
  }
  if (budgetRange === 'discuss') {
    return 'Custom scoping tier (to be discussed in discovery call).'
  }
  return 'To be scoped during architectural discovery call.'
}

/**
 * Generates a deterministic proposal from brief inputs.
 */
export function generateProposal(input: ProposalInput): GeneratedProposal {
  const businessName = (input.businessName || 'Your Organization').trim()
  const industry = input.industry || 'Technology & Digital Operations'
  const orgType = input.orgType || 'startup'
  const problemSummary = (input.problemSummary || '').trim() || 'Modernize manual operations into an automated software workflow.'
  const currentTools = input.currentTools?.trim() || 'Manual spreadsheets and chat channels'

  // Ensure unique modules list
  const requestedModules = Array.from(new Set(input.modules || []))
  const activeModules = requestedModules.length > 0 ? requestedModules : ['auth']

  const systemName = deriveSystemName(businessName, industry, activeModules)
  const timelineBand = deriveTimelineBand(activeModules.length)
  const budgetGuidance = deriveBudgetGuidance(input.budgetRange)
  const userRoles = deriveUserRoles(activeModules, orgType)

  // Map modules into structured catalogue items
  const moduleBreakdown: ProposalModuleItem[] = activeModules.map((id) => {
    const item = MODULE_CATALOGUE[id] || {
      title: `${id.toUpperCase()} Custom Module`,
      tech: 'Custom TypeScript architecture',
      defaultPhase: 1,
      deliverable: 'Custom operational workflow automation.',
    }

    return {
      id,
      title: item.title,
      tech: item.tech,
      phase: item.defaultPhase,
      deliverable: item.deliverable,
    }
  })

  // Separate modules into Phase 1 (MVP) and Phase 2 (Polish & Scale)
  const phase1Modules = moduleBreakdown.filter((m) => m.phase === 1)
  const phase2Modules = moduleBreakdown.filter((m) => m.phase === 2)

  // If all modules fall into one phase, balance them logically
  if (phase1Modules.length === 0 && phase2Modules.length > 0) {
    phase1Modules.push(phase2Modules.shift()!)
  }

  // Construct Core Workflow steps
  const coreWorkflow: string[] = [
    `Intake & Capture: Secure intake of customer or internal data, replacing friction from ${currentTools}.`,
    'Processing & Validation: Server-side business logic validation, state tracking, and permission checks.',
  ]

  if (activeModules.includes('booking')) {
    coreWorkflow.push('Scheduling: Real-time slot reservation with automated collision prevention.')
  }
  if (activeModules.includes('payments')) {
    coreWorkflow.push('Settlement: Cryptographically verified billing, automated receipts, and revenue reconciliation.')
  }
  if (activeModules.includes('notifications')) {
    coreWorkflow.push('Communication: Instant delivery of transactional emails, WhatsApp updates, or SMS alerts.')
  }
  if (activeModules.includes('analytics')) {
    coreWorkflow.push('Telemetry & Review: Activity aggregation, metrics visualization, and exportable operational reports.')
  }

  // Phased milestones
  const phase1Deliverables = [
    'Foundation infrastructure setup (Next.js, PostgreSQL/Supabase, TypeScript, CI/CD pipeline)',
    ...phase1Modules.map((m) => `${m.title}: ${m.deliverable}`),
    'Internal testing, security linting, and staging environment verification',
  ]

  const phase2Deliverables = [
    ...(phase2Modules.length > 0
      ? phase2Modules.map((m) => `${m.title}: ${m.deliverable}`)
      : ['UI/UX micro-interactions, responsive optimizations, and performance tuning']),
    'Automated end-to-end regression test suite',
    'Production launch, zero-downtime DNS deployment, and handover documentation',
  ]

  const executiveSummary =
    `This proposal outlines the architectural blueprint for ${businessName}. ` +
    `The primary objective is to resolve operational friction (${problemSummary.slice(0, 160)}${problemSummary.length > 160 ? '...' : ''}) ` +
    `by transitioning away from ${currentTools} to a high-performance, maintainable software platform (${systemName}). ` +
    `Delivery is partitioned into Phase 1 (Core Functional MVP) and Phase 2 (Advanced Capabilities & Polish).`

  const suggestedArchitecture = {
    frontend: 'Next.js (App Router), TypeScript, Tailwind CSS, Accessible WCAG 2.1 AA UI components',
    backend: 'Node.js serverless route handlers, Zod schema validation, secure HMAC webhooks',
    database: 'PostgreSQL with Row Level Security (RLS), atomic transactions, and Prisma/Payload ORM',
    integrations: activeModules.map((m) => {
      const match = MODULE_CATALOGUE[m]
      return match ? `${match.title} (${match.tech.split(' with ')[0]})` : m
    }),
    securityAndOps: 'HTTPS encryption in transit, Argon2 password hashing, rate limiting, and automated backups',
  }

  const assumptions = [
    'Client will provide necessary third-party API credentials (payment gateways, notification providers) during sprint setup.',
    'Branding assets (logos, typography, color palettes) will be supplied prior to the UI polishing phase.',
    'Stakeholder feedback will be provided within 48 hours during milestone review checkpoints.',
    'System will be deployed on modern cloud infrastructure (Vercel, Supabase, or AWS) with automated CI/CD.',
  ]

  const notIncluded = [
    'Third-party recurring subscription costs (e.g. Paystack transaction fees, Resend email credits, domain registration).',
    'Ongoing 24/7 end-user customer support (available as a separate maintenance retainer).',
    'Legacy database data cleaning or unformatted manual entry migration.',
    'Native iOS / Android mobile store binaries (solution is delivered as a progressive mobile-optimized web application).',
  ]

  return {
    systemName,
    businessName,
    industry,
    orgType,
    executiveSummary,
    problemStatement: problemSummary,
    suggestedArchitecture,
    userRoles,
    coreWorkflow,
    moduleBreakdown,
    milestones: {
      phase1: {
        phaseNumber: 1,
        title: 'Phase 1: Core Functional MVP',
        focus: 'Deploying the essential operational engine and data models to immediately alleviate bottleneck.',
        deliverables: phase1Deliverables,
        estimatedWeeks: timelineBand.band === 'S' ? '1 to 2 weeks' : '2 to 4 weeks',
      },
      phase2: {
        phaseNumber: 2,
        title: 'Phase 2: Polish, Integrations & Launch',
        focus: 'Layering telemetry, secondary integrations, automated document exports, and final production hardening.',
        deliverables: phase2Deliverables,
        estimatedWeeks: timelineBand.band === 'S' ? '1 week' : '2 to 3 weeks',
      },
    },
    timelineBand,
    budgetGuidance,
    assumptions,
    notIncluded,
    nextSteps:
      'Book a 15-minute discovery call with Alli to review this architectural roadmap, confirm milestone dates, and inspect live demonstration patterns.',
    disclaimer: MANDATORY_DISCLAIMER,
    generatedAt: new Date().toISOString(),
  }
}
