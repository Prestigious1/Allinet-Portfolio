'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { services } from '@/core/providers'
import { createOSApp } from '@/core/registry/AppRegistry'
import { TestimonialData } from '@/core/providers/portfolio/PortfolioProvider'
import { LuxuryImageModal } from '@/components/ui/LuxuryImageModal'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } },
}

function TestimonialsAppComponent() {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTestimonial, setSelectedTestimonial] = useState<TestimonialData | null>(null)
  const [activeLuxuryImage, setActiveLuxuryImage] = useState<{ url: string; title: string; subtitle: string } | null>(null)

  useEffect(() => {
    let isMounted = true
    services.portfolio
      .getTestimonials()
      .then(data => {
        if (isMounted) {
          setTestimonials(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gold font-mono animate-pulse">
        Loading recommendations...
      </div>
    )
  }

  return (
    <div className="w-full h-full text-white overflow-y-auto p-6 space-y-6 bg-[#050014]/90 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display gradient-brand-text">Client Testimonials & Endorsements</h1>
          <p className="text-white/50 text-xs font-mono mt-1">
            Recommendations and reviews from colleagues, CTOs, and clients (Click card or photo for full luxury details)
          </p>
        </div>
        <span className="text-xs font-mono text-gold/80 px-2.5 py-1 rounded-full bg-gold/10 border border-gold/20 hidden sm:inline-block">
          {testimonials.length} {testimonials.length === 1 ? 'Endorsement' : 'Endorsements'}
        </span>
      </div>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {testimonials.map((item, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            onClick={() => setSelectedTestimonial(item)}
            className="glassmorphism rounded-xl p-5 border border-white/10 hover:border-gold/40 hover:bg-white/[0.06] transition-all cursor-pointer flex flex-col justify-between group shadow-lg"
          >
            <div>
              {/* Rating stars */}
              <div className="flex items-center gap-1 text-gold text-sm mb-3">
                {Array.from({ length: Math.min(5, Math.max(1, item.rating)) }).map((_, idx) => (
                  <span key={idx}>★</span>
                ))}
              </div>

              <p className="text-sm text-white/80 italic leading-relaxed mb-4 line-clamp-3">
                "{item.content}"
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-white/5 mt-2">
              {item.authorAvatar?.url ? (
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveLuxuryImage({
                      url: item.authorAvatar!.url,
                      title: item.authorName,
                      subtitle: `${item.authorRole} at ${item.authorCompany}`,
                    })
                  }}
                  className="relative group/avatar cursor-zoom-in shrink-0"
                >
                  <img
                    src={item.authorAvatar.url}
                    alt={item.authorName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gold/40 shadow-md group-hover/avatar:scale-105 group-hover/avatar:border-gold transition-all"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center text-gold text-xs font-mono transition-opacity">
                    🔍
                  </div>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-purple-900/50 border-2 border-purple-500/30 flex items-center justify-center text-base font-bold text-white shrink-0 group-hover:scale-105 transition-transform shadow-md">
                  {item.authorName.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm truncate group-hover:text-gold transition-colors">{item.authorName}</h4>
                  <span className="text-xs text-gold/80 font-mono group-hover:translate-x-1 transition-transform">Read →</span>
                </div>
                <p className="text-xs text-white/50 font-mono truncate">
                  {item.authorRole} at {item.authorCompany}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {testimonials.length === 0 && (
          <div className="col-span-full text-center py-12 text-white/40 font-mono text-sm glassmorphism rounded-xl border border-white/5">
            No testimonials found yet. Add recommendations in Payload CMS Admin.
          </div>
        )}
      </motion.div>

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedTestimonial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTestimonial(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="glassmorphism border border-gold/30 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 relative shadow-2xl text-white space-y-5"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedTestimonial(null)}
                className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center font-mono text-sm transition-all border border-white/10"
              >
                ✕
              </button>

              {/* Author Header */}
              <div className="flex items-center gap-4 pr-8">
                {selectedTestimonial.authorAvatar?.url ? (
                  <div
                    onClick={() =>
                      setActiveLuxuryImage({
                        url: selectedTestimonial.authorAvatar!.url,
                        title: selectedTestimonial.authorName,
                        subtitle: `${selectedTestimonial.authorRole} at ${selectedTestimonial.authorCompany}`,
                      })
                    }
                    className="relative group/modalavatar cursor-pointer shrink-0"
                  >
                    <img
                      src={selectedTestimonial.authorAvatar.url}
                      alt={selectedTestimonial.authorName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gold/50 shadow-[0_0_20px_rgba(212,175,55,0.3)] group-hover/modalavatar:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover/modalavatar:opacity-100 flex items-center justify-center text-gold text-xs font-mono font-bold transition-opacity">
                      🔍
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-900 to-black border-2 border-gold/40 flex items-center justify-center text-2xl font-bold text-gold shrink-0 shadow-lg">
                    {selectedTestimonial.authorName.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-white font-display leading-tight gradient-brand-text">{selectedTestimonial.authorName}</h2>
                  <p className="text-purple-light font-mono text-xs mt-0.5">{selectedTestimonial.authorRole} at <span className="text-white/90">{selectedTestimonial.authorCompany}</span></p>
                  <div className="flex items-center gap-1 text-gold text-xs mt-1">
                    {Array.from({ length: Math.min(5, Math.max(1, selectedTestimonial.rating)) }).map((_, idx) => (
                      <span key={idx}>★</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Full Testimonial Text */}
              <div className="bg-white/[0.03] p-5 rounded-xl border border-white/10 text-sm text-white/90 italic leading-relaxed font-sans relative">
                <span className="text-4xl text-gold/30 font-serif leading-none absolute top-2 left-2 select-none">“</span>
                <p className="relative z-10 pl-3">{selectedTestimonial.content}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                {selectedTestimonial.authorAvatar?.url ? (
                  <button
                    onClick={() =>
                      setActiveLuxuryImage({
                        url: selectedTestimonial.authorAvatar!.url,
                        title: selectedTestimonial.authorName,
                        subtitle: `${selectedTestimonial.authorRole} at ${selectedTestimonial.authorCompany}`,
                      })
                    }
                    className="text-xs font-mono text-gold/90 hover:text-gold flex items-center gap-1.5"
                  >
                    <span>🖼️</span> View Big Size Photo
                  </button>
                ) : selectedTestimonial.authorLinkedin ? (
                  <a
                    href={selectedTestimonial.authorLinkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold text-xs px-4 py-1.5 flex items-center gap-1.5 font-mono"
                  >
                    <span>💼</span> View LinkedIn Profile ↗
                  </a>
                ) : (
                  <div />
                )}
                <button
                  onClick={() => setSelectedTestimonial(null)}
                  className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Luxury Full-Screen Image Lightbox */}
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
  id: 'testimonials',
  title: 'Testimonials',
  icon: 'message-square',
  canFullscreen: true,
  defaultWidth: 800,
  defaultHeight: 600,
}, TestimonialsAppComponent)



