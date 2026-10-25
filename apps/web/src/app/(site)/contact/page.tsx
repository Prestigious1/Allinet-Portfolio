import type { Metadata } from 'next'
import Link from 'next/link'
import { ContactForm } from '@/components/site/ContactForm'

export const metadata: Metadata = {
  title: 'Contact — Start a Project with ALLINET',
  description:
    'Get in touch to discuss your project, book a discovery call, or generate a project brief. Honest pricing. Fast response.',
}

export default function ContactPage() {
  return (
    <main id="contact-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="site-badge mb-5 inline-flex">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          Available for Projects
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 font-display">
          Let&apos;s{' '}
          <span className="gold-gradient-text">Build Together</span>
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Describe what you need below — or{' '}
          <Link href="/brief" className="text-amber-400 hover:text-amber-300 transition-colors underline">
            generate a structured project brief
          </Link>{' '}
          for a faster, more detailed response.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3">
          <div className="site-glass-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-white mb-6">Send a Message</h2>
            <ContactForm />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Response time */}
          <div className="site-glass-card p-5">
            <h3 className="text-sm font-bold text-amber-300 mb-3">Response Time</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              I respond to all enquiries within <strong className="text-white">24 hours</strong>,
              Monday to Friday. Weekend messages get a reply first thing Monday.
            </p>
          </div>

          {/* Prefer a call? */}
          <div className="site-glass-card p-5">
            <h3 className="text-sm font-bold text-amber-300 mb-3">Prefer a Call?</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-3">
              Book a free 15-minute discovery call directly in my calendar.
            </p>
            <a
              id="contact-cal-link"
              href="https://cal.com/allinet/15min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium"
            >
              Book on Cal.com →
            </a>
          </div>

          {/* Brief generator */}
          <div className="site-glass-card p-5">
            <h3 className="text-sm font-bold text-amber-300 mb-3">Have a Full Project?</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-3">
              Use the brief generator to get a structured proposal in minutes.
              No account required.
            </p>
            <Link
              id="contact-brief-link"
              href="/brief"
              className="inline-flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium"
            >
              Generate Project Brief →
            </Link>
          </div>

          {/* Direct email */}
          <div className="site-glass-card p-5">
            <h3 className="text-sm font-bold text-amber-300 mb-3">Direct Email</h3>
            <a
              href="mailto:hello@allinet.dev"
              className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-mono"
            >
              hello@allinet.dev
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
