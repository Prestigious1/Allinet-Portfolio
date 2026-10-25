'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { MobileNav } from './MobileNav'

/** Primary navigation links for desktop */
const NAV_LINKS = [
  { href: '/projects', label: 'Projects' },
  { href: '/services', label: 'Services' },
  { href: '/process', label: 'Process' },
  { href: '/now', label: 'Now' },
] as const

export function CommandHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        role="banner"
        className={[
          'fixed top-0 inset-x-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-[#07040d]/90 backdrop-blur-xl border-b border-[rgba(212,175,55,0.18)] shadow-[0_4px_32px_rgba(0,0,0,0.5)]'
            : 'bg-transparent',
        ].join(' ')}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">

            {/* ── Brand ── */}
            <Link
              href="/"
              id="site-header-brand"
              className="flex items-center gap-3 group focus-visible:outline-none"
            >
              {/* Hexagonal logo mark */}
              <span
                aria-hidden="true"
                className="relative flex items-center justify-center w-9 h-9"
              >
                <svg viewBox="0 0 36 36" fill="none" className="absolute inset-0 w-full h-full">
                  <polygon
                    points="18,2 34,10 34,26 18,34 2,26 2,10"
                    stroke="#d4af37"
                    strokeWidth="1.5"
                    fill="rgba(212,175,55,0.08)"
                    className="transition-all duration-300 group-hover:fill-[rgba(212,175,55,0.18)] group-hover:stroke-[#f5c842]"
                  />
                  <text
                    x="18"
                    y="23"
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="bold"
                    fill="#d4af37"
                    fontFamily="monospace"
                    className="group-hover:fill-[#f5c842]"
                  >
                    A
                  </text>
                </svg>
              </span>

              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold tracking-widest text-white uppercase font-mono">
                  ALLINET
                </span>
                <span className="text-[10px] tracking-[0.2em] text-amber-400/70 uppercase font-mono hidden sm:block">
                  Command Center
                </span>
              </div>
            </Link>

            {/* ── Status Badge (desktop) ── */}
            <div
              id="site-header-status"
              aria-label="System status: online"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              <span className="text-[11px] font-mono tracking-widest uppercase">System Online</span>
            </div>

            {/* ── Desktop Navigation ── */}
            <nav
              aria-label="Primary site navigation"
              className="hidden md:flex items-center gap-1"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  id={`nav-link-${link.label.toLowerCase()}`}
                  className="relative px-3 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5 group"
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className="absolute bottom-1 left-3 right-3 h-px bg-amber-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"
                  />
                </Link>
              ))}
            </nav>

            {/* ── Desktop CTAs ── */}
            <div className="hidden md:flex items-center gap-2">
              {/* Command Palette Trigger */}
              <button
                type="button"
                id="site-header-search-btn"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('open-site-command-palette'))
                  }
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700/80 bg-slate-850/60 hover:bg-slate-800 text-slate-300 text-xs transition-colors duration-200"
                aria-label="Search ⌘K"
              >
                <span className="text-amber-400 text-sm">⌕</span>
                <span className="hidden xl:inline text-slate-400">Search</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-400 font-mono">⌘K</kbd>
              </button>

              {/* Availability pill */}
              <span
                id="site-header-availability"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-[11px] font-mono"
                aria-label="Currently: open to projects"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" aria-hidden="true" />
                Open to projects
              </span>

              {/* Book call CTA */}
              <a
                id="site-header-cta-book"
                href="https://cal.com/allinet/15min"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-sm font-medium border border-amber-500/30 text-amber-300 bg-amber-500/5 hover:bg-amber-500/15 hover:border-amber-400/50 transition-all duration-200"
                aria-label="Book 15-min call — 15 minute discovery call"
              >
                Book 15-min call
              </a>

              {/* Primary CTA — Start a project */}
              <Link
                id="site-header-cta-primary"
                href="/contact"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
                aria-label="Start a project with ALLINET — get in touch"
              >
                Start a project
              </Link>

              {/* OS launcher */}
              <Link
                id="site-header-launch-os"
                href="/os"
                title="Launch ALLINET OS"
                aria-label="Launch ALLINET OS — interactive desktop experience"
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-700/60 bg-slate-800/50 hover:border-amber-500/40 hover:bg-slate-700/70 text-slate-400 hover:text-amber-400 transition-all duration-200 group"
              >
                {/* Terminal / OS icon */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5zm2 1v8h10V6H5zm2 1.5a.5.5 0 01.854-.354l2 2a.5.5 0 010 .708l-2 2a.5.5 0 01-.708-.708L8.793 10 7.146 8.354A.5.5 0 017 7.5zM11 11.5a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              id="site-header-mobile-menu-btn"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:border-amber-500/30 hover:bg-slate-700/60 text-slate-300 hover:text-amber-400 transition-all duration-200"
            >
              <span aria-hidden="true" className="flex flex-col gap-1.5 w-5">
                <span
                  className={`block h-0.5 bg-current transition-all duration-200 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`}
                />
                <span
                  className={`block h-0.5 bg-current transition-all duration-200 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`}
                />
                <span
                  className={`block h-0.5 bg-current transition-all duration-200 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Navigation Drawer ── */}
      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navLinks={NAV_LINKS}
      />
    </>
  )
}
