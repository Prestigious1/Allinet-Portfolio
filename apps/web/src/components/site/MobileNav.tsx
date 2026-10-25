'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'

interface NavLink {
  readonly href: string
  readonly label: string
}

interface MobileNavProps {
  open: boolean
  onClose: () => void
  navLinks: readonly NavLink[]
}

export function MobileNav({ open, onClose, navLinks }: MobileNavProps) {
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  /* Focus first link when drawer opens */
  useEffect(() => {
    if (open) firstLinkRef.current?.focus()
  }, [open])

  /* Close on ESC */
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  /* Lock body scroll while open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={[
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Drawer panel */}
      <nav
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
        className={[
          'fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] flex flex-col',
          'bg-[#0f081d]/95 backdrop-blur-xl border-l border-[rgba(212,175,55,0.18)]',
          'shadow-[-16px_0_64px_rgba(0,0,0,0.6)]',
          'transition-transform duration-300 ease-out md:hidden',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* Header row */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(212,175,55,0.12)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase">
              System Online
            </span>
          </div>
          <button
            id="mobile-nav-close"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-150"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <ul className="flex flex-col gap-1 px-3 py-4 flex-1" role="list">
          {navLinks.map((link, i) => (
            <li key={link.href} role="listitem">
              <Link
                ref={i === 0 ? firstLinkRef : undefined}
                href={link.href}
                id={`mobile-nav-link-${link.label.toLowerCase()}`}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/8 transition-all duration-150 group"
              >
                <span
                  aria-hidden="true"
                  className="w-1 h-1 rounded-full bg-amber-400/40 group-hover:bg-amber-400 transition-colors duration-150"
                />
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Bottom CTA block */}
        <div className="px-4 py-5 border-t border-[rgba(212,175,55,0.12)] flex flex-col gap-3">
          {/* Availability */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20"
            aria-label="Currently open to projects"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" aria-hidden="true" />
            <span className="text-xs font-mono text-purple-300">Open to projects</span>
          </div>

          {/* Book call */}
          <a
            id="mobile-nav-cta-book"
            href="https://cal.com/allinet/15min"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="block text-center px-4 py-3 rounded-xl text-sm font-medium border border-amber-500/30 text-amber-300 bg-amber-500/5 hover:bg-amber-500/15 transition-all duration-150"
            aria-label="Book a 15-minute discovery call"
          >
            Book 15-min call
          </a>

          {/* Start a project */}
          <Link
            id="mobile-nav-cta-primary"
            href="/contact"
            onClick={onClose}
            className="block text-center px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 transition-all duration-200 shadow-lg shadow-amber-500/20"
            aria-label="Start a project with ALLINET"
          >
            Start a project
          </Link>

          {/* OS launcher */}
          <Link
            id="mobile-nav-launch-os"
            href="/os"
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border border-slate-700/60 text-slate-300 hover:border-amber-500/30 hover:text-amber-400 transition-all duration-150"
            aria-label="Launch ALLINET OS — interactive desktop experience"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5zm2 1v8h10V6H5zm2 1.5a.5.5 0 01.854-.354l2 2a.5.5 0 010 .708l-2 2a.5.5 0 01-.708-.708L8.793 10 7.146 8.354A.5.5 0 017 7.5zM11 11.5a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5z"
                clipRule="evenodd"
              />
            </svg>
            Launch ALLINET OS
          </Link>
        </div>
      </nav>
    </>
  )
}
