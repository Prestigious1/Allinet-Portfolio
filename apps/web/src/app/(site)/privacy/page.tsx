import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — ALLINET Command Center',
  description:
    'Privacy policy for ALLINET Command Center. How we collect, use, and protect your data.',
}

const LAST_UPDATED = '25 October 2026'

export default function PrivacyPage() {
  return (
    <main id="privacy-page" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="mb-12">
        <div className="site-badge mb-5 inline-flex">
          <span className="w-2 h-2 rounded-full bg-slate-400" aria-hidden="true" />
          Legal
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3 font-display text-white">
          Privacy Policy
        </h1>
        <p className="text-slate-500 text-sm">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="prose prose-sm prose-invert max-w-none space-y-8 text-slate-300 leading-relaxed">

        <section aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="text-lg font-bold text-white mb-3">Overview</h2>
          <p>
            ALLINET Command Center (&ldquo;ALLINET&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) operates this website at{' '}
            <span className="font-mono text-amber-400">allinet.dev</span>. This policy explains what
            data we collect, why we collect it, and how we protect it. We keep this simple because
            we believe you deserve to know exactly how your information is handled.
          </p>
        </section>

        <section aria-labelledby="data-collected-heading">
          <h2 id="data-collected-heading" className="text-lg font-bold text-white mb-3">What We Collect</h2>
          <ul className="space-y-3">
            <li>
              <strong className="text-white">Contact form submissions</strong> — When you submit the
              contact form or project brief, we collect your name, email address, and message content.
              This is used solely to respond to your enquiry.
            </li>
            <li>
              <strong className="text-white">Analytics data</strong> — We use Vercel Analytics to
              collect anonymous, privacy-first page view data (no cookies, no fingerprinting, no
              cross-site tracking). This data is aggregated and cannot identify you individually.
            </li>
            <li>
              <strong className="text-white">Technical logs</strong> — Server request logs (IP address,
              user agent, timestamp) are retained for up to 7 days for security and debugging purposes,
              then automatically deleted.
            </li>
          </ul>
        </section>

        <section aria-labelledby="how-we-use-heading">
          <h2 id="how-we-use-heading" className="text-lg font-bold text-white mb-3">How We Use It</h2>
          <ul className="space-y-2">
            <li>To respond to your contact form submissions and project enquiries</li>
            <li>To understand which pages are most useful (via anonymous analytics)</li>
            <li>To detect and prevent abuse of the API endpoints (rate limiting)</li>
            <li>We do not sell, rent, or share your data with third parties for marketing purposes</li>
          </ul>
        </section>

        <section aria-labelledby="third-parties-heading">
          <h2 id="third-parties-heading" className="text-lg font-bold text-white mb-3">Third-Party Services</h2>
          <ul className="space-y-3">
            <li>
              <strong className="text-white">Vercel</strong> — Hosts this website. See{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 transition-colors">
                Vercel&apos;s Privacy Policy
              </a>.
            </li>
            <li>
              <strong className="text-white">Resend</strong> — Transactional email delivery for
              contact form notifications. See{' '}
              <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 transition-colors">
                Resend&apos;s Privacy Policy
              </a>.
            </li>
            <li>
              <strong className="text-white">Cloudflare Turnstile</strong> — Bot protection on
              contact forms. No behavioural tracking or cookies. See{' '}
              <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 transition-colors">
                Cloudflare&apos;s Privacy Policy
              </a>.
            </li>
          </ul>
        </section>

        <section aria-labelledby="cookies-heading">
          <h2 id="cookies-heading" className="text-lg font-bold text-white mb-3">Cookies & Local Storage</h2>
          <p>
            This site uses a single <span className="font-mono text-amber-400">visitor_role</span>{' '}
            cookie (90-day expiry) to remember your preferred persona (Recruiter, Client, Founder).
            This is purely for personalisation and does not contain any personal data.
            No advertising cookies or cross-site tracking cookies are used.
          </p>
        </section>

        <section aria-labelledby="rights-heading">
          <h2 id="rights-heading" className="text-lg font-bold text-white mb-3">Your Rights</h2>
          <p>
            You may request deletion of any personal data we hold about you by emailing{' '}
            <a href="mailto:privacy@allinet.dev" className="text-amber-400 hover:text-amber-300 transition-colors">
              privacy@allinet.dev
            </a>.
            We will respond within 30 days.
          </p>
        </section>

        <section aria-labelledby="contact-privacy-heading">
          <h2 id="contact-privacy-heading" className="text-lg font-bold text-white mb-3">Contact</h2>
          <p>
            Questions about this policy? Email{' '}
            <a href="mailto:privacy@allinet.dev" className="text-amber-400 hover:text-amber-300 transition-colors">
              privacy@allinet.dev
            </a>{' '}
            or use the{' '}
            <Link href="/contact" className="text-amber-400 hover:text-amber-300 transition-colors">
              contact form
            </Link>.
          </p>
        </section>
      </div>
    </main>
  )
}
