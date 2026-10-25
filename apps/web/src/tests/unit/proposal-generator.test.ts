import { describe, it, expect } from 'vitest'
import {
  generateProposal,
  MANDATORY_DISCLAIMER,
  ProposalInput,
} from '@/core/brief/proposal-generator'

const REQUIRED_SECTIONS = [
  'systemName',
  'businessName',
  'industry',
  'orgType',
  'executiveSummary',
  'problemStatement',
  'suggestedArchitecture',
  'userRoles',
  'coreWorkflow',
  'moduleBreakdown',
  'milestones',
  'timelineBand',
  'budgetGuidance',
  'assumptions',
  'notIncluded',
  'nextSteps',
  'disclaimer',
] as const

const TEN_SCENARIOS: ProposalInput[] = [
  {
    businessName: 'PayFlow Africa',
    orgType: 'startup',
    industry: 'FinTech & Banking',
    problemSummary: 'Need automated multi-currency merchant payment ledger and webhook engine.',
    modules: ['auth', 'payments'],
    timeline: '1_2_months',
    budgetRange: '500k-1.5m-ngn',
  },
  {
    businessName: 'MedCore Clinic',
    orgType: 'sme',
    industry: 'HealthTech & Medical',
    problemSummary: 'Patient queue management and doctor appointment calendar reservations.',
    modules: ['booking', 'notifications'],
    timeline: 'urgent_2_4_weeks',
    budgetRange: '<500k-ngn',
  },
  {
    businessName: 'Apex Cargo',
    orgType: 'enterprise',
    industry: 'Logistics & Supply Chain',
    problemSummary: 'Real-time multi-warehouse inventory tracking and driver dispatch alerts.',
    modules: ['inventory', 'notifications', 'analytics'],
    timeline: '2_3_months',
    budgetRange: '1.5m-3m-ngn',
  },
  {
    businessName: 'SkillBoost Hub',
    orgType: 'agency',
    industry: 'EdTech & Learning',
    problemSummary: 'Course certificate generator and cohort student progress dashboards.',
    modules: ['auth', 'documents', 'analytics'],
    timeline: '1_2_months',
  },
  {
    businessName: 'RetailVault',
    orgType: 'startup',
    industry: 'E-Commerce & Retail',
    problemSummary: 'Multi-vendor product catalogue with automated settlements and stock deduction.',
    modules: ['auth', 'payments', 'inventory', 'notifications', 'analytics'],
    timeline: '2_3_months',
    budgetRange: '>3m-ngn',
  },
  {
    businessName: 'Enterprise MegaCorp',
    orgType: 'enterprise',
    industry: 'SaaS & B2B Software',
    problemSummary: 'Complete internal operating system across all operational verticals.',
    modules: [
      'auth',
      'booking',
      'payments',
      'ai',
      'notifications',
      'analytics',
      'documents',
      'collaboration',
      'inventory',
      'integrations',
    ],
    timeline: 'flexible',
    budgetRange: '>3m-ngn',
  },
  {
    businessName: 'LawDesk Legal',
    orgType: 'individual',
    industry: 'Other / Specialized',
    problemSummary: 'Client intake consultation scheduling and automated fee retainer booking.',
    modules: ['booking'],
    budgetRange: 'to_be_scoped',
  },
  {
    businessName: 'RealtyPro',
    orgType: 'sme',
    industry: 'PropTech & Real Estate',
    problemSummary: 'Property inspection booking and dynamic tenant lease PDF generation.',
    currentTools: 'WhatsApp Business and paper folders',
    modules: ['booking', 'documents', 'notifications'],
    budgetRange: 'unknown',
  },
  {
    businessName: 'Studio Nimbus',
    orgType: 'agency',
    industry: 'Media & Creator Economy',
    problemSummary: 'Client asset review workflow, approval audit trail, and webhook delivery.',
    modules: ['collaboration', 'integrations'],
    timeline: '1_2_months',
    budgetRange: 'discuss',
  },
  {
    businessName: 'Minimal Enterprise',
    orgType: '',
    industry: '',
    problemSummary: 'Automating operational tasks with intelligent assistant guidance.',
    modules: ['ai'],
  },
]

describe('TASK-P10-02: Proposal Generator (AC-BRIEF-1, 2, 9)', () => {
  it('AC-BRIEF-1: returns every required section across ≥ 10 distinct scenarios', () => {
    expect(TEN_SCENARIOS.length).toBeGreaterThanOrEqual(10)

    for (const scenario of TEN_SCENARIOS) {
      const proposal = generateProposal(scenario)

      for (const section of REQUIRED_SECTIONS) {
        expect(proposal).toHaveProperty(section)
        expect((proposal as any)[section]).toBeDefined()
      }

      // Check nested architecture requirements
      expect(proposal.suggestedArchitecture.frontend).toBeTruthy()
      expect(proposal.suggestedArchitecture.backend).toBeTruthy()
      expect(proposal.suggestedArchitecture.database).toBeTruthy()

      // Check milestones
      expect(proposal.milestones.phase1.deliverables.length).toBeGreaterThan(0)
      expect(proposal.milestones.phase2.deliverables.length).toBeGreaterThan(0)

      // Check user roles and workflow
      expect(proposal.userRoles.length).toBeGreaterThanOrEqual(2)
      expect(proposal.coreWorkflow.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('AC-BRIEF-2: includes mandatory estimate disclaimer in every scenario', () => {
    for (const scenario of TEN_SCENARIOS) {
      const proposal = generateProposal(scenario)
      expect(proposal.disclaimer).toBe(MANDATORY_DISCLAIMER)
      expect(proposal.disclaimer).toBe('Estimate for scoping only; not a quote or contract.')
    }
  })

  it('AC-BRIEF-2: output never contains binding contract or price quote patterns', () => {
    // Prohibited patterns: fixed price commitments, binding contracts, guaranteed costs
    const PROHIBITED_REGEXES = [
      /binding contract/i,
      /legal agreement/i,
      /fixed price of/i,
      /guaranteed quote/i,
      /total fee is/i,
      /final cost:/i,
    ]

    for (const scenario of TEN_SCENARIOS) {
      const proposal = generateProposal(scenario)
      const serialized = JSON.stringify(proposal)

      for (const regex of PROHIBITED_REGEXES) {
        expect(serialized).not.toMatch(regex)
      }
    }
  })

  it('AC-BRIEF-9: optional fields can be skipped and budget "unknown" or empty yields "to be scoped"', () => {
    const minimalProposal = generateProposal({
      businessName: 'Acme Test',
      orgType: '',
      industry: '',
      problemSummary: 'Just a basic problem statement to verify scoping.',
      modules: [],
      budgetRange: 'unknown',
    })

    expect(minimalProposal.budgetGuidance).toContain('To be scoped')
    expect(minimalProposal.moduleBreakdown.length).toBeGreaterThanOrEqual(1) // defaults to auth
    expect(minimalProposal.timelineBand.band).toBe('S')
  })

  it('is 100% deterministic (calling with identical input returns identical output)', () => {
    const input: ProposalInput = {
      businessName: 'FinSync Global',
      orgType: 'startup',
      industry: 'FinTech & Banking',
      problemSummary: 'Automated invoice settlement with webhook notifications.',
      modules: ['auth', 'payments', 'notifications'],
      timeline: '1_2_months',
      budgetRange: '500k-1.5m-ngn',
    }

    const first = generateProposal(input)
    const second = generateProposal(input)

    // Omit generatedAt timestamp for exact deep equality
    const { generatedAt: g1, ...rest1 } = first
    const { generatedAt: g2, ...rest2 } = second

    expect(rest1).toEqual(rest2)
  })

  it('assigns correct timeline bands based on module count', () => {
    const small = generateProposal({ ...TEN_SCENARIOS[0], modules: ['auth', 'booking'] })
    expect(small.timelineBand.band).toBe('S')

    const medium = generateProposal({ ...TEN_SCENARIOS[0], modules: ['auth', 'booking', 'payments', 'notifications'] })
    expect(medium.timelineBand.band).toBe('M')

    const large = generateProposal({
      ...TEN_SCENARIOS[0],
      modules: ['auth', 'booking', 'payments', 'notifications', 'analytics', 'documents', 'inventory'],
    })
    expect(large.timelineBand.band).toBe('L')

    const enterprise = generateProposal({
      ...TEN_SCENARIOS[0],
      modules: ['auth', 'booking', 'payments', 'ai', 'notifications', 'analytics', 'documents', 'collaboration', 'inventory'],
    })
    expect(enterprise.timelineBand.band).toBe('XL')
  })
})
