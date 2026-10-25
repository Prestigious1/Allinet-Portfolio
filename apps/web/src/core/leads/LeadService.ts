import { services } from '@/core/providers'

export interface CreateLeadInput {
  name: string
  email: string
  whatsapp?: string
  company?: string
  role?: string
  need?: string
  budgetRange?: string
  timeline?: string
  sourcePage?: string
  sourceChannel?: string
  ipHash?: string
  consentGiven?: boolean
}

export interface LeadRecord {
  id: string
  name: string
  email: string
  whatsapp?: string
  company?: string
  role?: string
  need?: string
  budgetRange?: string
  timeline?: string
  sourcePage?: string
  sourceChannel?: string
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost'
  notes?: string
  consentGivenAt?: string
  ipHash?: string
  createdAt?: string
}

export interface CreateLeadResult {
  success: boolean
  isDuplicate: boolean
  lead?: LeadRecord
  error?: string
}

export class LeadService {
  /**
   * Sanitizes an email address (trims whitespace, converts to lowercase).
   */
  public static sanitizeEmail(email: string): string {
    return email.trim().toLowerCase()
  }

  /**
   * Checks if a lead with the same email or ipHash was submitted in the last 24 hours.
   */
  public async isDuplicate(email: string, ipHash?: string): Promise<{ duplicate: boolean; existingLead?: LeadRecord }> {
    try {
      const res = await services.db.query<LeadRecord>('leads', { email })
      const recent = (res.data || []).find((lead: any) => {
        const createdAt = lead.createdAt ? new Date(lead.createdAt).getTime() : 0
        const isWithin24Hours = Date.now() - createdAt < 24 * 60 * 60 * 1000
        const matchesEmail = lead.email?.toLowerCase() === email.toLowerCase()
        const matchesIp = ipHash && lead.ipHash && lead.ipHash === ipHash
        return isWithin24Hours && (matchesEmail || matchesIp)
      })

      if (recent) {
        return { duplicate: true, existingLead: recent }
      }
    } catch (err) {
      console.warn('[LeadService] Deduplication check failed, proceeding with caution:', err)
    }

    return { duplicate: false }
  }

  /**
   * Creates a new lead, verifies deduplication, writes to database, and notifies owner.
   */
  public async createLead(input: CreateLeadInput): Promise<CreateLeadResult> {
    const cleanEmail = LeadService.sanitizeEmail(input.email)

    // Deduplication check
    const { duplicate, existingLead } = await this.isDuplicate(cleanEmail, input.ipHash)
    if (duplicate && existingLead) {
      console.log(`[LeadService] Duplicate lead detected for ${cleanEmail} within 24h. Skipping email dispatch.`)
      return {
        success: true,
        isDuplicate: true,
        lead: existingLead,
      }
    }

    const newLeadData: Partial<LeadRecord> = {
      name: input.name.trim(),
      email: cleanEmail,
      whatsapp: input.whatsapp?.trim(),
      company: input.company?.trim(),
      role: input.role?.trim(),
      need: input.need?.trim(),
      budgetRange: input.budgetRange,
      timeline: input.timeline,
      sourcePage: input.sourcePage || '/contact',
      sourceChannel: input.sourceChannel || 'direct',
      status: 'new',
      consentGivenAt: input.consentGiven ? new Date().toISOString() : undefined,
      ipHash: input.ipHash,
      createdAt: new Date().toISOString(),
    }

    const { data: createdLead, error: dbError } = await services.db.insert<LeadRecord>('leads', newLeadData)

    if (dbError || !createdLead) {
      console.error('[LeadService] Failed to insert lead into database:', dbError)
      return {
        success: false,
        isDuplicate: false,
        error: dbError?.message || 'Failed to save lead record',
      }
    }

    // Dispatch notification email to owner (non-blocking / error-safe)
    try {
      await services.email.send({
        to: process.env.OWNER_EMAIL || 'hello@allinet.dev',
        from: cleanEmail,
        subject: `[New Lead] ${input.name} from ${input.company || 'Direct Inquiry'}`,
        body: `New lead received from portfolio:
Name: ${input.name}
Email: ${cleanEmail}
WhatsApp: ${input.whatsapp || 'N/A'}
Company: ${input.company || 'N/A'}
Role: ${input.role || 'N/A'}
Need: ${input.need || 'N/A'}
Budget: ${input.budgetRange || 'N/A'}
Timeline: ${input.timeline || 'N/A'}
Source: ${input.sourcePage || 'direct'}
Submitted: ${new Date().toISOString()}`,
      })
    } catch (emailErr) {
      // Must not throw or block lead creation if email dispatch fails
      console.warn('[LeadService] Notification email dispatch failed (lead still created):', emailErr)
    }

    return {
      success: true,
      isDuplicate: false,
      lead: createdLead,
    }
  }
}

export const leadService = new LeadService()
