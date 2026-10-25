import type { Metadata } from 'next';
import { ConciergePageClient } from './ConciergePageClient';

export const metadata: Metadata = {
  title: 'ALLI AI Concierge',
  description:
    'Chat with ALLI, the verified AI concierge for Ajibade Alli Akinkunmi\'s engineering portfolio. Get answers about tech stack, engagement process, and live demos — grounded in verified facts.',
  robots: { index: true, follow: true },
};

export default function ConciergePage() {
  return <ConciergePageClient />;
}
