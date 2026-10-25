import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { GeneratedProposal, MANDATORY_DISCLAIMER } from './proposal-generator'

/**
 * Sanitizes input text to safe WinAnsi / ASCII range.
 * Standard fonts (Helvetica) reject Unicode symbols like '✓', '—', '•', or '₦'.
 */
function safeAscii(str: string | undefined | null): string {
  if (!str) return ''
  return str
    .replace(/[✓✔]/g, '[+]')
    .replace(/₦/g, 'NGN ')
    .replace(/[—–]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/•/g, '-')
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Generates a clean, deterministic, professional PDF proposal document.
 * TASK-P10-03 / SPEC-08 / AC-BRIEF-3
 *
 * Requirements:
 * - Non-empty, 1–3 pages (typically 2 pages)
 * - Returns in < 300ms
 * - Pure text/standard fonts, robust in Node.js serverless runtimes
 * - Contains full architectural milestones, timeline band, and mandatory disclaimer
 */
export async function generateProposalPdf(proposal: GeneratedProposal): Promise<Uint8Array> {
  const doc = await PDFDocument.create()

  const helvetica = await doc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const helveticaOblique = await doc.embedFont(StandardFonts.HelveticaOblique)

  const PAGE_WIDTH = 595.28 // Standard A4 width in points
  const PAGE_HEIGHT = 841.89 // Standard A4 height in points
  const MARGIN = 50
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

  // Color palette
  const darkNavy = rgb(0.06, 0.09, 0.16)
  const slateDark = rgb(0.12, 0.16, 0.24)
  const amberGold = rgb(0.85, 0.65, 0.13)
  const slateText = rgb(0.2, 0.25, 0.35)
  const mutedText = rgb(0.45, 0.5, 0.6)
  const borderGrey = rgb(0.88, 0.9, 0.93)

  const cleanDisclaimer = safeAscii(MANDATORY_DISCLAIMER)

  // ---------------------------------------------------------------------------
  // PAGE 1: Executive Overview, Architecture & Roles
  // ---------------------------------------------------------------------------
  const page1 = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let y = PAGE_HEIGHT - MARGIN

  // Header Bar Accent
  page1.drawRectangle({
    x: MARGIN,
    y: y - 4,
    width: 40,
    height: 4,
    color: amberGold,
  })
  y -= 18

  // Brand Header
  page1.drawText(safeAscii('ALLINET - AJIBADE ALLI AKINKUNMI'), {
    x: MARGIN,
    y,
    size: 9,
    font: helveticaBold,
    color: amberGold,
  })
  const dateStr = proposal.generatedAt ? proposal.generatedAt.slice(0, 10) : new Date().toISOString().slice(0, 10)
  page1.drawText(`DATE: ${dateStr}`, {
    x: PAGE_WIDTH - MARGIN - 110,
    y,
    size: 8,
    font: helvetica,
    color: mutedText,
  })
  y -= 22

  // Document Title
  page1.drawText('PROJECT ARCHITECTURAL PROPOSAL', {
    x: MARGIN,
    y,
    size: 18,
    font: helveticaBold,
    color: darkNavy,
  })
  y -= 14

  // System Subtitle
  page1.drawText(safeAscii(proposal.systemName).toUpperCase().slice(0, 60), {
    x: MARGIN,
    y,
    size: 11,
    font: helveticaBold,
    color: slateDark,
  })
  y -= 20

  // Divider line
  page1.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 1,
    color: borderGrey,
  })
  y -= 20

  // Organization Meta Box
  page1.drawRectangle({
    x: MARGIN,
    y: y - 48,
    width: CONTENT_WIDTH,
    height: 52,
    color: rgb(0.96, 0.97, 0.99),
    borderColor: borderGrey,
    borderWidth: 1,
  })

  page1.drawText('Organization / Client:', { x: MARGIN + 14, y: y - 16, size: 8, font: helveticaBold, color: mutedText })
  page1.drawText(safeAscii(proposal.businessName).slice(0, 36), { x: MARGIN + 14, y: y - 30, size: 10, font: helveticaBold, color: darkNavy })

  page1.drawText('Industry Sector:', { x: MARGIN + 180, y: y - 16, size: 8, font: helveticaBold, color: mutedText })
  page1.drawText(safeAscii(proposal.industry).slice(0, 26), { x: MARGIN + 180, y: y - 30, size: 10, font: helvetica, color: slateText })

  page1.drawText('Timeline Window:', { x: MARGIN + 340, y: y - 16, size: 8, font: helveticaBold, color: mutedText })
  page1.drawText(`${proposal.timelineBand.band} (${safeAscii(proposal.timelineBand.weeks)})`, {
    x: MARGIN + 340,
    y: y - 30,
    size: 10,
    font: helveticaBold,
    color: amberGold,
  })
  y -= 65

  // Section 1: Executive Summary
  page1.drawText('1. EXECUTIVE SUMMARY', { x: MARGIN, y, size: 11, font: helveticaBold, color: darkNavy })
  y -= 16

  const summaryWords = safeAscii(proposal.executiveSummary).split(' ')
  let currentLine = ''
  for (const word of summaryWords) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (helvetica.widthOfTextAtSize(testLine, 9) > CONTENT_WIDTH) {
      page1.drawText(currentLine, { x: MARGIN, y, size: 9, font: helvetica, color: slateText })
      y -= 13
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) {
    page1.drawText(currentLine, { x: MARGIN, y, size: 9, font: helvetica, color: slateText })
    y -= 18
  } else {
    y -= 10
  }

  // Section 2: Core Problem Statement
  page1.drawText('2. OPERATIONAL PROBLEM & OBJECTIVE', { x: MARGIN, y, size: 11, font: helveticaBold, color: darkNavy })
  y -= 16

  const problemWords = safeAscii(proposal.problemStatement).split(' ')
  currentLine = ''
  for (const word of problemWords) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (helvetica.widthOfTextAtSize(testLine, 9) > CONTENT_WIDTH) {
      page1.drawText(currentLine, { x: MARGIN, y, size: 9, font: helvetica, color: slateText })
      y -= 13
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) {
    page1.drawText(currentLine, { x: MARGIN, y, size: 9, font: helvetica, color: slateText })
    y -= 22
  } else {
    y -= 14
  }

  // Section 3: Recommended Architecture Stack
  page1.drawText('3. RECOMMENDED ARCHITECTURAL STACK', { x: MARGIN, y, size: 11, font: helveticaBold, color: darkNavy })
  y -= 16

  const archItems = [
    { label: 'Frontend / Client:', value: proposal.suggestedArchitecture.frontend },
    { label: 'Backend API:', value: proposal.suggestedArchitecture.backend },
    { label: 'Database & ORM:', value: proposal.suggestedArchitecture.database },
    { label: 'Security & Reliability:', value: proposal.suggestedArchitecture.securityAndOps },
  ]

  for (const arch of archItems) {
    page1.drawText(`- ${safeAscii(arch.label)}`, { x: MARGIN + 4, y, size: 8.5, font: helveticaBold, color: slateDark })
    const valueText = safeAscii(arch.value)
    const clipped = valueText.length > 75 ? `${valueText.slice(0, 72)}...` : valueText
    page1.drawText(clipped, { x: MARGIN + 125, y, size: 8.5, font: helvetica, color: slateText })
    y -= 14
  }
  y -= 12

  // Section 4: Primary User Roles
  page1.drawText('4. IDENTIFIED USER ROLES', { x: MARGIN, y, size: 11, font: helveticaBold, color: darkNavy })
  y -= 16

  for (const role of proposal.userRoles.slice(0, 3)) {
    page1.drawText(`- ${safeAscii(role.role)}:`, { x: MARGIN + 4, y, size: 8.5, font: helveticaBold, color: slateDark })
    page1.drawText(safeAscii(role.description).slice(0, 80), { x: MARGIN + 125, y, size: 8.5, font: helvetica, color: slateText })
    y -= 14
  }

  // Page 1 Footer
  page1.drawText('Page 1 of 2 - Confidential Scoping Document', {
    x: MARGIN,
    y: MARGIN / 2,
    size: 7.5,
    font: helvetica,
    color: mutedText,
  })
  page1.drawText(cleanDisclaimer, {
    x: PAGE_WIDTH - MARGIN - helveticaOblique.widthOfTextAtSize(cleanDisclaimer, 7.5),
    y: MARGIN / 2,
    size: 7.5,
    font: helveticaOblique,
    color: mutedText,
  })

  // ---------------------------------------------------------------------------
  // PAGE 2: Milestones, Modules, Scope Boundaries & Next Steps
  // ---------------------------------------------------------------------------
  const page2 = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  y = PAGE_HEIGHT - MARGIN

  // Brand Header Page 2
  page2.drawText(`ALLINET - ${safeAscii(proposal.systemName).toUpperCase().slice(0, 50)}`, {
    x: MARGIN,
    y,
    size: 8.5,
    font: helveticaBold,
    color: amberGold,
  })
  y -= 20

  // Section 5: Phased Milestones
  page2.drawText('5. PHASED IMPLEMENTATION MILESTONES', { x: MARGIN, y, size: 11, font: helveticaBold, color: darkNavy })
  y -= 16

  // Phase 1 Card
  page2.drawRectangle({
    x: MARGIN,
    y: y - 82,
    width: CONTENT_WIDTH,
    height: 86,
    color: rgb(0.98, 0.98, 1.0),
    borderColor: rgb(0.82, 0.86, 0.94),
    borderWidth: 1,
  })

  page2.drawText(`PHASE 1: ${safeAscii(proposal.milestones.phase1.title)} (${safeAscii(proposal.milestones.phase1.estimatedWeeks)})`, {
    x: MARGIN + 12,
    y: y - 16,
    size: 9.5,
    font: helveticaBold,
    color: darkNavy,
  })
  page2.drawText(safeAscii(proposal.milestones.phase1.focus).slice(0, 100), {
    x: MARGIN + 12,
    y: y - 28,
    size: 8,
    font: helveticaOblique,
    color: mutedText,
  })

  let delivY = y - 42
  for (const deliv of proposal.milestones.phase1.deliverables.slice(0, 3)) {
    const text = safeAscii(deliv)
    const clipped = text.length > 95 ? `${text.slice(0, 92)}...` : text
    page2.drawText(`[+] ${clipped}`, { x: MARGIN + 12, y: delivY, size: 8, font: helvetica, color: slateText })
    delivY -= 13
  }
  y -= 96

  // Phase 2 Card
  page2.drawRectangle({
    x: MARGIN,
    y: y - 82,
    width: CONTENT_WIDTH,
    height: 86,
    color: rgb(0.99, 0.98, 0.96),
    borderColor: rgb(0.92, 0.88, 0.8),
    borderWidth: 1,
  })

  page2.drawText(`PHASE 2: ${safeAscii(proposal.milestones.phase2.title)} (${safeAscii(proposal.milestones.phase2.estimatedWeeks)})`, {
    x: MARGIN + 12,
    y: y - 16,
    size: 9.5,
    font: helveticaBold,
    color: darkNavy,
  })
  page2.drawText(safeAscii(proposal.milestones.phase2.focus).slice(0, 100), {
    x: MARGIN + 12,
    y: y - 28,
    size: 8,
    font: helveticaOblique,
    color: mutedText,
  })

  delivY = y - 42
  for (const deliv of proposal.milestones.phase2.deliverables.slice(0, 3)) {
    const text = safeAscii(deliv)
    const clipped = text.length > 95 ? `${text.slice(0, 92)}...` : text
    page2.drawText(`[+] ${clipped}`, { x: MARGIN + 12, y: delivY, size: 8, font: helvetica, color: slateText })
    delivY -= 13
  }
  y -= 105

  // Section 6: Selected Modules
  page2.drawText('6. SELECTED SYSTEM MODULES', { x: MARGIN, y, size: 11, font: helveticaBold, color: darkNavy })
  y -= 16

  for (const mod of proposal.moduleBreakdown.slice(0, 5)) {
    page2.drawText(`[Phase ${mod.phase}] ${safeAscii(mod.title)}:`, { x: MARGIN + 4, y, size: 8.5, font: helveticaBold, color: slateDark })
    page2.drawText(safeAscii(mod.deliverable).slice(0, 75), { x: MARGIN + 170, y, size: 8, font: helvetica, color: slateText })
    y -= 13
  }
  if (proposal.moduleBreakdown.length > 5) {
    page2.drawText(`+ ${proposal.moduleBreakdown.length - 5} additional architectural modules included in comprehensive roadmap`, {
      x: MARGIN + 4,
      y,
      size: 8,
      font: helveticaOblique,
      color: mutedText,
    })
    y -= 14
  }
  y -= 10

  // Section 7: Scope Boundaries & Not Included
  page2.drawText('7. OUT-OF-SCOPE BOUNDARIES', { x: MARGIN, y, size: 11, font: helveticaBold, color: darkNavy })
  y -= 14

  for (const item of proposal.notIncluded.slice(0, 3)) {
    page2.drawText(`- ${safeAscii(item).slice(0, 95)}`, { x: MARGIN + 4, y, size: 8, font: helvetica, color: mutedText })
    y -= 12
  }
  y -= 12

  // Section 8: Next Steps
  page2.drawText('8. NEXT ACTION & ENGAGEMENT', { x: MARGIN, y, size: 11, font: helveticaBold, color: darkNavy })
  y -= 14
  page2.drawText(safeAscii(proposal.nextSteps), { x: MARGIN, y, size: 8.5, font: helvetica, color: slateText })
  y -= 14
  page2.drawText('Direct Consultation Calendar: cal.com/ajibade-alli | Direct Portfolio: allinet.dev', {
    x: MARGIN,
    y,
    size: 8.5,
    font: helveticaBold,
    color: amberGold,
  })
  y -= 25

  // Fixed Mandatory Disclaimer Box at Bottom of Page 2
  page2.drawRectangle({
    x: MARGIN,
    y: y - 28,
    width: CONTENT_WIDTH,
    height: 32,
    color: rgb(0.96, 0.96, 0.96),
    borderColor: borderGrey,
    borderWidth: 1,
  })
  page2.drawText(`NOTICE: ${cleanDisclaimer}`, {
    x: MARGIN + 12,
    y: y - 15,
    size: 8,
    font: helveticaBold,
    color: darkNavy,
  })
  page2.drawText('All milestones and delivery estimates are subject to formal verification during discovery.', {
    x: MARGIN + 12,
    y: y - 24,
    size: 7,
    font: helvetica,
    color: mutedText,
  })

  // Page 2 Footer
  page2.drawText('Page 2 of 2 - Generated by ALLINET Brief & Proposal Engine', {
    x: MARGIN,
    y: MARGIN / 2,
    size: 7.5,
    font: helvetica,
    color: mutedText,
  })

  return await doc.save()
}
