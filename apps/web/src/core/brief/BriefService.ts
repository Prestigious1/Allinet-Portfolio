import crypto from 'crypto'
import { services } from '@/core/providers'
import { leadService } from '@/core/leads/LeadService'
import { generateProposal, GeneratedProposal } from './proposal-generator'
import { BriefFormData } from '@/features/brief/brief-schema'

export interface BriefRecord {
  id: string
  tokenHash: string
  businessName: string
  orgType: string
  industry: string
  problemSummary: string
  currentTools?: string
  modules: string[]
  timeline?: string
  budgetRange?: string
  targetScale?: string
  contactName: string
  contactEmail: string
  contactPhone?: string
  notes?: string
  consentGiven: boolean
  consentGivenAt: string
  proposal: GeneratedProposal
  expiresAt: string
  createdAt: string
}

export interface CreateBriefResult {
  success: boolean
  token?: string
  shareUrl?: string
  brief?: BriefRecord
  proposal?: GeneratedProposal
  error?: string
}

export type CreateBriefInput = Partial<BriefFormData> & {
  businessName: string
  problemSummary: string
  modules: string[]
  contactName: string
  contactEmail: string
  consentGiven: boolean
}

// In-memory fallback cache for development/tests or database cold start
const inMemoryBriefsByHash = new Map<string, BriefRecord>()

export class BriefService {
  /**
   * Hashes a raw unguessable token using SHA-256 for database storage and lookup.
   */
  public static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token.trim()).digest('hex')
  }

  /**
   * Generates a 128-bit cryptographically secure random token (32 hex characters).
   */
  public static generateSecureToken(): string {
    return crypto.randomBytes(16).toString('hex')
  }

  /**
   * Creates a new brief record, synchronizes with leads, generates proposal,
   * and prepares secure share link.
   */
  public async createBrief(data: CreateBriefInput, ipHash?: string): Promise<CreateBriefResult> {
    try {
      // 1. Mandatory Consent Check
      if (!data.consentGiven) {
        return {
          success: false,
          error: 'Consent is mandatory to create and store a project brief.',
        }
      }

      const orgType = data.orgType || 'startup'
      const industry = data.industry || 'Other / Specialized'
      const timeline = data.timeline || '1_2_months'
      const budgetRange = data.budgetRange || 'to_be_scoped'

      // 2. Generate Deterministic Proposal
      const proposal = generateProposal({
        businessName: data.businessName,
        orgType,
        industry,
        problemSummary: data.problemSummary,
        currentTools: data.currentTools,
        modules: data.modules,
        timeline,
        budgetRange,
        targetScale: data.targetScale,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
      })

      // 3. Generate Unguessable 128-bit Token and Hash
      const token = BriefService.generateSecureToken()
      const tokenHash = BriefService.hashToken(token)

      // 4. Calculate 30-day Expiration
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      const createdAt = now.toISOString()
      const briefId = `brief_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`

      const briefRecord: BriefRecord = {
        id: briefId,
        tokenHash,
        businessName: data.businessName.trim(),
        orgType,
        industry,
        problemSummary: data.problemSummary.trim(),
        currentTools: data.currentTools?.trim(),
        modules: data.modules,
        timeline,
        budgetRange,
        targetScale: data.targetScale,
        contactName: data.contactName.trim(),
        contactEmail: data.contactEmail.trim().toLowerCase(),
        contactPhone: data.contactPhone?.trim(),
        notes: data.notes?.trim(),
        consentGiven: true,
        consentGivenAt: createdAt,
        proposal,
        expiresAt,
        createdAt,
      }

      // 5. Save to In-Memory Map (guarantees instant share resolution)
      inMemoryBriefsByHash.set(tokenHash, briefRecord)

      // 6. Persist to Database Provider (Payload / Postgres)
      try {
        await services.db.insert<BriefRecord>('briefs', briefRecord)
      } catch (dbErr) {
        console.warn('[BriefService] DB insert into "briefs" fallback to memory cache:', dbErr)
      }

      // 7. Synchronize Lead Record (lead + brief created together)
      try {
        await leadService.createLead({
          name: data.contactName,
          email: data.contactEmail,
          whatsapp: data.contactPhone,
          company: data.businessName,
          role: orgType,
          need: `[Project Brief] ${data.problemSummary}`,
          budgetRange,
          timeline,
          sourcePage: '/brief',
          sourceChannel: 'brief-wizard',
          consentGiven: true,
          ipHash,
        })
      } catch (leadErr) {
        console.warn('[BriefService] Lead synchronization logged warning (brief still valid):', leadErr)
      }

      // 8. Attempt Email Notification (Resend) — AC-BRIEF-8: email failure does not lose brief
      try {
        if (process.env.RESEND_API_KEY && services.email) {
          await services.email.send({
            to: data.contactEmail,
            from: process.env.EMAIL_FROM || 'hello@allinet.dev',
            subject: `Project Proposal: ${proposal.systemName}`,
            body: `Hi ${data.contactName},\n\nYour project proposal for ${data.businessName} has been generated.\n\nView and download your full proposal: https://allinet.dev/brief/share/${token}\n\nNotice: Estimate for scoping only; not a quote or contract.`,
          })
        }
      } catch (emailErr) {
        console.warn('[BriefService] Email notification dispatch skipped/failed (brief saved safely):', emailErr)
      }

      const shareUrl = `/brief/share/${token}`

      return {
        success: true,
        token,
        shareUrl,
        brief: briefRecord,
        proposal,
      }
    } catch (err: any) {
      console.error('[BriefService] createBrief encountered unexpected error:', err)
      return {
        success: false,
        error: err?.message || 'Failed to process and store project brief.',
      }
    }
  }

  /**
   * Retrieves a brief record using the raw secret token.
   * Checks expiration (30 days) and returns null if expired or missing.
   */
  public async getBriefByToken(token: string): Promise<BriefRecord | null> {
    if (!token || typeof token !== 'string' || token.length < 16) {
      return null
    }

    const tokenHash = BriefService.hashToken(token)

    // Check fast memory cache
    const cached = inMemoryBriefsByHash.get(tokenHash)
    if (cached) {
      if (new Date(cached.expiresAt).getTime() < Date.now()) {
        console.log(`[BriefService] Cached token ${tokenHash.slice(0, 8)}... has expired.`)
        return null
      }
      return cached
    }

    // Check Database provider
    try {
      const res = await services.db.query<BriefRecord>('briefs', { tokenHash })
      const found = res.data?.find((b) => b.tokenHash === tokenHash)
      if (found) {
        if (new Date(found.expiresAt).getTime() < Date.now()) {
          console.log(`[BriefService] Database token ${tokenHash.slice(0, 8)}... has expired.`)
          return null
        }
        // Cache warm
        inMemoryBriefsByHash.set(tokenHash, found)
        return found
      }
    } catch (dbErr) {
      console.warn('[BriefService] DB query for brief failed:', dbErr)
    }

    return null
  }
}

export const briefService = new BriefService()
