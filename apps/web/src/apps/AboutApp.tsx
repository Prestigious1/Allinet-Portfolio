'use client'

import React, { useEffect, useState } from 'react'
import { services } from '@/core/providers'
import { createOSApp } from '@/core/registry/AppRegistry'
import { PortfolioOwner } from '@/core/providers/portfolio/PortfolioProvider'
import ImageViewer from '@/components/shared/ImageViewer'
import { useOSStore } from '@/store/os.store'

function AboutAppComponent() {
  const [owner, setOwner] = useState<PortfolioOwner | null>(null)
  const [loading, setLoading] = useState(true)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const { openApp } = useOSStore()

  useEffect(() => {
    services.portfolio.getOwner().then(data => {
      setOwner(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center text-gold animate-pulse">Initializing profile...</div>
  }

  return (
    <div className="w-full h-full text-white p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-6">
          <button 
            className="w-24 h-24 rounded-full bg-gradient-to-tr from-gold to-purple p-1 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform shadow-lg focus:outline-none focus:ring-2 focus:ring-gold"
            onClick={() => { if (owner?.avatar?.url) setLightboxImage(owner.avatar.url) }}
            title="View Avatar"
          >
            {owner?.avatar?.url ? (
              <img 
                src={owner.avatar.url} 
                alt={owner.avatar.alt || owner.fullName || 'Avatar'} 
                className="w-full h-full object-cover rounded-full border border-white/20"
              />
            ) : (
              <div className="w-full h-full bg-black rounded-full border border-white/20" />
            )}
          </button>
          <div>
            <h1 className="text-3xl font-bold font-sans tracking-wide">{owner?.fullName ?? 'ALLINET OS'}</h1>
            <p className="text-purple-light font-mono text-sm mt-1">{owner?.title ?? 'Full-Stack Engineer & AI Architect'}</p>
            {owner?.location && (
              <p className="text-white/40 text-xs mt-1 font-mono">📍 {owner.location}</p>
            )}
          </div>
        </div>
        
        <div className="glassmorphism p-6 rounded-xl space-y-4 text-sm leading-relaxed text-white/80">
          <p>{owner?.bioLong ?? owner?.bioShort ?? 'Welcome to ALLINET OS. This interactive portfolio demonstrates expertise across software engineering, artificial intelligence, UI/UX design, and cloud architecture.'}</p>
          {owner?.openToWork && (
            <button 
              onClick={() => openApp('contact')}
              className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 py-1.5 rounded-full hover:bg-green-500/20 hover:border-green-500/50 transition-colors cursor-pointer"
              title="Contact Me"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-mono">{owner.availability ?? 'Open to opportunities'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glassmorphism p-4 rounded-xl border-l-2 border-l-gold">
            <h3 className="text-gold font-mono text-xs mb-2">CONTACT</h3>
            <ul className="space-y-1 text-sm text-white/70">
              {owner?.email && (
                <li className="font-mono text-xs">
                  <a href={`mailto:${owner.email}`} className="hover:text-gold transition-colors">
                    {owner.email} ↗
                  </a>
                </li>
              )}
              {owner?.githubUrl && (
                <li>
                  <a href={owner.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                    GitHub ↗
                  </a>
                </li>
              )}
              {owner?.linkedinUrl && (
                <li>
                  <a href={owner.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                    LinkedIn ↗
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div className="glassmorphism p-4 rounded-xl border-l-2 border-l-purple">
            <h3 className="text-purple font-mono text-xs mb-2">SPECIALTIES</h3>
            <ul className="space-y-1 text-sm text-white/70">
              <li>Agentic AI Systems</li>
              <li>3D Web Experiences (Three.js)</li>
              <li>Performance Optimization</li>
              <li>UI/UX Engineering</li>
            </ul>
          </div>
        </div>
      </div>

      <ImageViewer 
        src={lightboxImage} 
        onClose={() => setLightboxImage(null)} 
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
  defaultHeight: 600,
}, AboutAppComponent)
