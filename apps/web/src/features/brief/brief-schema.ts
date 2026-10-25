import { z } from 'zod'

export const MODULE_OPTIONS = [
  { id: 'auth', label: 'Auth & Role Permissions', desc: 'User login, OAuth, RBAC, session tokens, audit trail' },
  { id: 'booking', label: 'Booking & Scheduling', desc: 'Calendar sync, slot reservations, real-time availability' },
  { id: 'payments', label: 'Payments & Invoicing', desc: 'Paystack, Flutterwave, Stripe, split settlements, automated invoices' },
  { id: 'ai', label: 'AI Concierge & Assistants', desc: 'RAG knowledge search, semantic grounding, guided user flows' },
  { id: 'notifications', label: 'Multi-Channel Alerts', desc: 'Transactional email, WhatsApp messages, SMS notifications' },
  { id: 'analytics', label: 'Analytics Dashboard', desc: 'KPI tracking, funnel conversion graphs, exportable reports' },
  { id: 'documents', label: 'Document & PDF Engine', desc: 'Automated contract generation, receipts, statement exports' },
  { id: 'collaboration', label: 'Team Collaboration', desc: 'Shared workspaces, team remarks, audit logs, role approvals' },
  { id: 'inventory', label: 'Inventory & Resource Tracking', desc: 'SKU counts, threshold alerts, multi-warehouse allocation' },
  { id: 'integrations', label: 'Custom API Integrations', desc: 'Webhooks, ERP/CRM links, external banking, data pipelines' },
] as const

export type ModuleId = (typeof MODULE_OPTIONS)[number]['id']

export const ORG_TYPES = [
  { value: 'startup', label: 'Startup (Pre-seed / Seed / Series A)' },
  { value: 'sme', label: 'SME / Growing Business' },
  { value: 'enterprise', label: 'Enterprise / Corporate' },
  { value: 'agency', label: 'Agency / Product Studio' },
  { value: 'nonprofit', label: 'Nonprofit / Public Sector' },
  { value: 'individual', label: 'Solo Founder / Specialist' },
] as const

export const INDUSTRIES = [
  'FinTech & Banking',
  'HealthTech & Medical',
  'Logistics & Supply Chain',
  'E-Commerce & Retail',
  'EdTech & Learning',
  'PropTech & Real Estate',
  'SaaS & B2B Software',
  'Media & Creator Economy',
  'Other / Specialized',
] as const

export const TIMELINE_OPTIONS = [
  { value: 'urgent_2_4_weeks', label: 'Urgent: 2–4 weeks (High priority MVP)' },
  { value: '1_2_months', label: 'Standard: 1–2 months' },
  { value: '2_3_months', label: 'Quarterly: 2–3 months' },
  { value: 'flexible', label: 'Flexible: Timeline can adjust to scope' },
] as const

export const BUDGET_OPTIONS = [
  { value: 'to_be_scoped', label: 'To be scoped / Recommend for my scope' },
  { value: '<500k-ngn', label: 'Under ₦500k (under $600)' },
  { value: '500k-1.5m-ngn', label: '₦500k – ₦1.5m ($600 – $1.8k)' },
  { value: '1.5m-3m-ngn', label: '₦1.5m – ₦3m ($1.8k – $3.6k)' },
  { value: '>3m-ngn', label: 'Over ₦3m (over $3.6k)' },
  { value: 'discuss', label: 'Prefer to discuss in discovery call' },
] as const

export const SCALE_OPTIONS = [
  { value: 'internal', label: 'Internal company team (< 50 users)' },
  { value: 'mvp', label: 'Initial customer launch (< 1,000 users)' },
  { value: 'growth', label: 'Growth scale (1,000 – 50,000 users)' },
  { value: 'scale', label: 'High volume / Enterprise (> 50,000 users)' },
] as const

// Step 1: Business details & organization type
export const step1Schema = z.object({
  businessName: z.string().min(2, 'Please enter your business or project name').max(100),
  orgType: z.string().min(1, 'Please select your organization type'),
  industry: z.string().min(1, 'Please select your industry'),
})

// Step 2: Core operational problem & current workflow
export const step2Schema = z.object({
  problemSummary: z.string().min(15, 'Please describe your core problem or objective (min 15 characters)').max(2000),
  currentTools: z.string().max(500).optional(),
})

// Step 3: System modules required (at least 1 of 10)
export const step3Schema = z.object({
  modules: z.array(z.string()).min(1, 'Please select at least 1 system module'),
})

// Step 4: Timeline & budget range (+ scale)
export const step4Schema = z.object({
  timeline: z.string().min(1, 'Please select an estimated timeline'),
  budgetRange: z.string().default('to_be_scoped'),
  targetScale: z.string().optional(),
})

// Step 5: Contact info & consent
export const step5Schema = z.object({
  contactName: z.string().min(2, 'Please enter your full name').max(100),
  contactEmail: z.string().email('Please enter a valid email address'),
  contactPhone: z.string().max(30).optional(),
  notes: z.string().max(1000).optional(),
  consentGiven: z.boolean().refine((val) => val === true, {
    message: 'You must agree to data processing to continue',
  }),
  honeypot: z.string().max(0).optional(),
})

export const fullBriefSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)

export type BriefFormData = z.infer<typeof fullBriefSchema>
export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
export type Step4Data = z.infer<typeof step4Schema>
export type Step5Data = z.infer<typeof step5Schema>

export const INITIAL_BRIEF_FORM_DATA: BriefFormData = {
  businessName: '',
  orgType: 'startup',
  industry: 'FinTech & Banking',
  problemSummary: '',
  currentTools: '',
  modules: ['auth'],
  timeline: '1_2_months',
  budgetRange: 'to_be_scoped',
  targetScale: 'mvp',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  notes: '',
  consentGiven: false,
  honeypot: '',
}
