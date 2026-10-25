import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { RolePicker } from '@/features/role/RolePicker'

export const metadata: Metadata = {
  title: 'Ajibade Alli Akinkunmi — Senior Full-Stack & Systems Architect',
  description:
    'High-performance full-stack web applications, AI workflows, and enterprise architectures built for Nigerian and global markets.',
}

export default function SiteHomePage() {
  return (
    <main
      id="site-home"
      className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center max-w-5xl mx-auto"
    >
      {/* Status badge */}
      <div id="site-home-badge" className="site-badge mb-6">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
        ALLINET COMMAND CENTER v2.0
      </div>

      {/* Hero headline */}
      <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 font-display">
        Systems Architecture &{' '}
        <span className="gold-gradient-text">Deterministic Engineering</span>
      </h1>

      <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mb-12 leading-relaxed">
        High-impact web architectures, multi-tenant SaaS engines, and interactive experiences
        crafted by Ajibade Alli Akinkunmi.
      </p>

      {/* Role picker */}
      <div className="w-full max-w-2xl mb-12">
        <RolePicker />
      </div>

      {/* Fallback CTAs */}
      <div
        id="site-home-ctas"
        className="flex flex-wrap items-center justify-center gap-4"
      >
        <Link
          href="/os"
          id="site-home-cta-os"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all duration-200"
        >
          Launch ALLINET OS
        </Link>
        <Link
          href="/contact"
          id="site-home-cta-contact"
          className="px-6 py-3 rounded-xl border border-amber-500/30 bg-slate-900/60 text-amber-300 font-medium hover:bg-slate-800/80 hover:border-amber-400/50 transition-all duration-200"
        >
          Direct Contact
        </Link>
      </div>
    </main>
  )
}
