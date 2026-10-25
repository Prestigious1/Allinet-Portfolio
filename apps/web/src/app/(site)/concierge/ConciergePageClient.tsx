'use client';

/**
 * /concierge — Standalone Client Page
 * TASK-P9-04 / F-028 / F-060..F-064
 *
 * On desktop this route complements the slide-over drawer (accessible from
 * the command header). On mobile it becomes the primary concierge interface.
 */

import React from 'react';
import { AlliDrawer } from '@/components/concierge/AlliDrawer';

export function ConciergePageClient() {
  return (
    <main
      id="concierge-page"
      className="flex-1 flex flex-col min-h-[calc(100vh-4rem)]"
      aria-label="ALLI AI Concierge"
    >
      {/* Page Header */}
      <section className="border-b border-white/8 bg-gradient-to-b from-[#0d0914] to-transparent px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div
            aria-hidden="true"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/5 mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs text-amber-400 font-mono tracking-wider uppercase">
              AI · Verified Facts Only
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 leading-tight mb-3">
            Meet{' '}
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              ALLI
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
            ALLI is Ajibade Alli Akinkunmi&apos;s verified AI concierge. Ask about engineering
            expertise, live demos, project engagement, or how to get started.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-5 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-green-400" fill="currentColor" aria-hidden="true">
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/>
              </svg>
              Grounded in verified facts
            </span>
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-green-400" fill="currentColor" aria-hidden="true">
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/>
              </svg>
              Refuses to hallucinate pricing
            </span>
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-green-400" fill="currentColor" aria-hidden="true">
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/>
              </svg>
              Session-capped for safety
            </span>
          </div>
        </div>
      </section>

      {/* Inline Chat — Full Page Mode */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-0 sm:px-4 lg:px-0 py-0 sm:py-6">
        <div className="h-full sm:rounded-2xl sm:border sm:border-amber-400/10 overflow-hidden sm:shadow-[0_0_60px_rgba(212,175,55,0.06)]" style={{ minHeight: '600px' }}>
          <AlliDrawer open={true} onClose={() => {}} inline />
        </div>
      </div>
    </main>
  );
}
