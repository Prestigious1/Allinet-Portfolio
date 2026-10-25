/**
 * /terminal — Standalone Web Terminal Route
 * TASK-P11-05 / F-027 / F-211
 *
 * Full-page retro CRT console with green/amber phosphor styling.
 * Includes public-site-focused commands: demos, now, brief, role, exit.
 */

import type { Metadata } from 'next'
import { WebTerminalClient } from './WebTerminalClient'

export const metadata: Metadata = {
  title: 'Web Terminal — ALLINET Portfolio',
  description:
    'Explore the ALLINET portfolio via a retro CRT terminal interface. Navigate to demos, brief, now, and more.',
  robots: { index: false },
}

export default function TerminalPage() {
  return (
    <main className="fixed inset-0 bg-black overflow-hidden" data-os-shell="true">
      <WebTerminalClient />
    </main>
  )
}
