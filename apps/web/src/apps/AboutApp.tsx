'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { services } from '@/core/providers'
import { createOSApp } from '@/core/registry/AppRegistry'
import { PortfolioOwner } from '@/core/providers/portfolio/PortfolioProvider'
import { LuxuryImageModal } from '@/components/ui/LuxuryImageModal'
import { useOSStore } from '@/store/os.store'
import type { AppId } from '@/types/os.types'

function AboutAppComponent() {
  const [owner, setOwner] = useState<PortfolioOwner | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeLuxuryImage, setActiveLuxuryImage] = useState<{ url: string; title: string; subtitle: string } | null>(null)
  const { openApp } = useOSStore()

  useEffect(() => {
    let isMounted = true
    services.portfolio.getOwner()
      .then(data => { if (isMounted) { setOwner(data); setLoading(false) } })
      .catch(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [])

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center text-gold font-mono animate-pulse">Initializing profile...</div>
  }

  return (
    <div className="w-full h-full text-white p-6 overflow-y-auto bg-[#050014]/90 space-y-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Profile Header */}
        <div className="flex items-center gap-5">
          <button
            className="relative group/avatar w-24 h-24 rounded-full bg-gradient-to-tr from-gold to-purple p-0.5 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform shadow-[0_0_30px_rgba(212,175,55,0.3)] focus:outline-none focus:ring-2 focus:ring-gold"
            onClick={() => { if (owner?.avatar?.url) setActiveLuxuryImage({ url: owner.avatar.url, title: owner.fullName || 'Profile', subtitle: owner.title || '' }) }}
            title="View avatar in big size luxury"
          >
            {owner?.avatar?.url ? (
              <img
                src={owner.avatar.url}
                alt={owner.avatar.alt || owner.fullName || 'Avatar'}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-3xl">👤</div>
            )}
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center text-gold text-xs font-mono transition-opacity font-bold">
              🔍 Zoom
            </div>
          </button>
          <div>
            <h1 className="text-3xl font-bold font-display gradient-brand-text">{owner?.fullName ?? 'ALLINET OS'}</h1>
            <p className="text-purple-light font-mono text-sm mt-1">{owner?.title ?? 'Full-Stack Engineer & AI Architect'}</p>
            {owner?.location && (
              <p className="text-white/40 text-xs mt-1 font-mono">📍 {owner.location}</p>
            )}
            {owner?.openToWork && (
              <button
                onClick={() => openApp('contact')}
                className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-full hover:bg-green-500/20 transition-colors mt-2"
                title="Contact Me"
              >
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-mono">{owner.availability ?? 'Open to opportunities'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="glassmorphism p-5 rounded-xl border border-white/10 text-sm leading-relaxed text-white/80">
          <p>{owner?.bioLong ?? owner?.bioShort ?? 'Welcome to ALLINET OS. This interactive portfolio demonstrates expertise across software engineering, artificial intelligence, UI/UX design, and cloud architecture.'}</p>
        </div>

        {/* 3D Avatar if available */}
        {owner?.avatar3d?.url && (
          <div
            className="relative glassmorphism rounded-2xl overflow-hidden border border-gold/20 h-40 flex items-center justify-center cursor-zoom-in group/3d shadow-[0_0_25px_rgba(212,175,55,0.1)]"
            onClick={() => setActiveLuxuryImage({ url: owner.avatar3d!.url, title: '3D Avatar', subtitle: owner.fullName || '' })}
          >
            <img src={owner.avatar3d.url} alt="3D Avatar" className="h-full object-contain group-hover/3d:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/3d:opacity-100 flex items-center justify-center text-gold font-mono text-sm font-bold transition-opacity">
              🔍 View Big Size
            </div>
          </div>
        )}

        {/* Contact & Specialties Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glassmorphism p-4 rounded-xl border-l-2 border-l-gold">
            <h3 className="text-gold font-mono text-xs mb-3 uppercase tracking-wider">Contact</h3>
            <ul className="space-y-2 text-sm text-white/70">
              {owner?.email && (
                <li className="font-mono text-xs">
                  <a href={`mailto:${owner.email}`} className="hover:text-gold transition-colors flex items-center gap-1">
                    ✉️ {owner.email}
                  </a>
                </li>
              )}
              {owner?.githubUrl && (
                <li>
                  <a href={owner.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors flex items-center gap-1 text-sm">
                    🐙 GitHub ↗
                  </a>
                </li>
              )}
              {owner?.linkedinUrl && (
                <li>
                  <a href={owner.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors flex items-center gap-1 text-sm">
                    💼 LinkedIn ↗
                  </a>
                </li>
              )}
              {owner?.twitterUrl && (
                <li>
                  <a href={owner.twitterUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors flex items-center gap-1 text-sm">
                    🐦 Twitter ↗
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div className="glassmorphism p-4 rounded-xl border-l-2 border-l-purple">
            <h3 className="text-purple font-mono text-xs mb-3 uppercase tracking-wider">Specialties</h3>
            <ul className="space-y-1.5 text-sm text-white/70">
              <li className="flex items-center gap-2"><span className="text-gold">✦</span> Agentic AI Systems</li>
              <li className="flex items-center gap-2"><span className="text-gold">✦</span> 3D Web (Three.js)</li>
              <li className="flex items-center gap-2"><span className="text-gold">✦</span> Performance Optimization</li>
              <li className="flex items-center gap-2"><span className="text-gold">✦</span> UI/UX Engineering</li>
            </ul>
          </div>
        </div>

        {/* Resume Download */}
        {owner?.resumePdf?.url && (
          <a
            href={owner.resumePdf.url}
            download
            className="btn-gold flex items-center justify-center gap-2 text-sm w-full py-3"
          >
            <span>⬇</span> Download Resume PDF
          </a>
        )}

        {/* Quick-open apps */}
        <div className="flex flex-wrap gap-2 pt-2">
          {([
            { id: 'projects', label: '🗂️ Projects' },
            { id: 'skills', label: '⚡ Skills' },
            { id: 'education', label: '🎓 Education' },
            { id: 'contact', label: '✉️ Contact' },
          ] as { id: AppId; label: string }[]).map(app => (
            <button
              key={app.id}
              onClick={() => openApp(app.id)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-gold/40 hover:text-gold text-xs font-mono transition-all text-white/60"
            >
              {app.label}
            </button>
          ))}
        </div>
      </div>

      <LuxuryImageModal
        isOpen={Boolean(activeLuxuryImage)}
        onClose={() => setActiveLuxuryImage(null)}
        imageUrl={activeLuxuryImage?.url}
        title={activeLuxuryImage?.title}
        subtitle={activeLuxuryImage?.subtitle}
      />
    </div>
  )
}

export default createOSApp({
  id: 'about',
  title: 'About',
  icon: 'user',
  canFullscreen: true,
  defaultWidth: 750,
  defaultHeight: 620,
}, AboutAppComponent)
