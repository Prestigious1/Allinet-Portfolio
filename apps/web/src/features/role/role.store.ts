import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** The four visitor personas */
export type VisitorRole = 'recruiter' | 'client' | 'founder' | 'explorer'

export interface RoleOption {
  id: VisitorRole
  label: string
  emoji: string
  tagline: string
  /** Where clicking "Go Deep" routes to */
  href: string
}

export const ROLE_OPTIONS: readonly RoleOption[] = [
  {
    id: 'recruiter',
    label: 'Recruiter',
    emoji: '🎯',
    tagline: 'Senior Full-Stack Engineer, open to roles',
    href: '/recruiter',
  },
  {
    id: 'client',
    label: 'Client',
    emoji: '🏗️',
    tagline: 'I build production systems for businesses',
    href: '/client',
  },
  {
    id: 'founder',
    label: 'Founder',
    emoji: '🚀',
    tagline: 'Let\'s turn your idea into a scalable product',
    href: '/founder',
  },
  {
    id: 'explorer',
    label: 'Just Exploring',
    emoji: '🔭',
    tagline: 'Discover what ALLINET Command Center does',
    href: '/',
  },
]

/** Role-specific headline overrides shown on the homepage */
export const ROLE_HEADLINES: Record<VisitorRole, { title: string; subtitle: string }> = {
  recruiter: {
    title: 'Senior Full-Stack & Systems Architect',
    subtitle:
      'TypeScript, Next.js, React, PostgreSQL, AI pipelines — 5+ years shipping production systems.',
  },
  client: {
    title: 'I Build Systems That Run Your Business',
    subtitle:
      'From multi-tenant SaaS to operational command centers. Predictable timelines, honest delivery.',
  },
  founder: {
    title: 'From Idea to Scalable Product',
    subtitle:
      'Equity-aware project architecture, rapid MVP validation, and growth-ready engineering.',
  },
  explorer: {
    title: 'Systems Architecture & Deterministic Engineering',
    subtitle:
      'High-impact web architectures, multi-tenant SaaS engines, and interactive command centers.',
  },
}

interface RoleState {
  role: VisitorRole | null
  setRole: (role: VisitorRole) => void
  clearRole: () => void
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: null,
      setRole: (role) => {
        // Mirror in cookie for SSR
        if (typeof document !== 'undefined') {
          document.cookie = `visitor_role=${role};path=/;max-age=${60 * 60 * 24 * 90};SameSite=Lax`
        }
        set({ role })
      },
      clearRole: () => {
        if (typeof document !== 'undefined') {
          document.cookie = 'visitor_role=;path=/;max-age=0'
        }
        set({ role: null })
      },
    }),
    {
      name: 'allinet-visitor-role',
      // Only persist the `role` field
      partialize: (state) => ({ role: state.role }),
    }
  )
)
