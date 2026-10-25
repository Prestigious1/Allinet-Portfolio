'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { services } from '@/core/providers'
import { createOSApp } from '@/core/registry/AppRegistry'
import { EducationData } from '@/core/providers/portfolio/PortfolioProvider'
import { LuxuryImageModal } from '@/components/ui/LuxuryImageModal'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } },
}

function EducationAppComponent() {
  const [educationList, setEducationList] = useState<EducationData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEdu, setSelectedEdu] = useState<EducationData | null>(null)
  const [activeLuxuryImage, setActiveLuxuryImage] = useState<{ url: string; title: string; subtitle: string } | null>(null)

  useEffect(() => {
    let isMounted = true
    services.portfolio
      .getEducation()
      .then(data => {
        if (isMounted) {
          setEducationList(data)
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
        Fetching education records...
      </div>
    )
  }

  return (
    <div className="w-full h-full text-white overflow-y-auto p-6 space-y-6 bg-[#050014]/90 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display gradient-brand-text">Education & Qualifications</h1>
          <p className="text-white/50 text-xs font-mono mt-1">
            Academic background, degrees, and scholarly achievements (Click any item for full details)
          </p>
        </div>
        <span className="text-xs font-mono text-gold/80 px-2.5 py-1 rounded-full bg-gold/10 border border-gold/20 hidden sm:inline-block">
          {educationList.length} {educationList.length === 1 ? 'Record' : 'Records'}
        </span>
      </div>

      {/* Cards List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {educationList.map((edu, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            onClick={() => setSelectedEdu(edu)}
            className="glassmorphism rounded-xl p-5 border border-white/10 hover:border-gold/40 hover:bg-white/[0.06] transition-all cursor-pointer shadow-lg group relative"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-4">
                {edu.institutionLogo?.url ? (
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveLuxuryImage({
                        url: edu.institutionLogo!.url,
                        title: edu.institution,
                        subtitle: `${edu.degree} — ${edu.field}`,
                      })
                    }}
                    className="relative group/img cursor-zoom-in"
                  >
                    <img
                      src={edu.institutionLogo.url}
                      alt={edu.institution}
                      className="w-14 h-14 rounded-xl object-cover bg-white/5 border border-gold/30 shrink-0 shadow-lg group-hover/img:scale-105 group-hover/img:border-gold transition-all"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-gold text-xs transition-opacity font-mono">
                      🔍
                    </div>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-purple-900/40 border border-gold/30 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform shadow-lg">
                    🎓
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight group-hover:text-gold transition-colors flex items-center gap-2">
                    {edu.degree}
                    <span className="text-xs text-white/40 font-normal font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      ↗ Click to open details
                    </span>
                  </h3>
                  <p className="text-purple-light font-mono text-sm mt-0.5">
                    {edu.field} · <span className="text-white/80">{edu.institution}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:items-end font-mono text-xs text-white/50 shrink-0">
                <span>
                  {edu.startDate} – {edu.endDate ?? 'Present'}
                </span>
                {edu.grade && (
                  <span className="text-gold font-bold mt-1 px-2 py-0.5 rounded bg-gold/10 border border-gold/20 inline-block">
                    Grade: {edu.grade}
                  </span>
                )}
              </div>
            </div>

            {edu.description && (
              <p className="text-sm text-white/70 leading-relaxed mb-3 font-sans line-clamp-2">
                {edu.description}
              </p>
            )}

            <div className="flex items-center justify-between text-xs font-mono text-gold/80 pt-2 border-t border-white/5 mt-2">
              <span>{edu.achievements?.length ? `${edu.achievements.length} Key Achievements` : 'Degree Details'}</span>
              <span className="group-hover:translate-x-1 transition-transform">View Full Details →</span>
            </div>
          </motion.div>
        ))}

        {educationList.length === 0 && (
          <div className="text-center py-12 text-white/40 font-mono text-sm glassmorphism rounded-xl border border-white/5">
            No education entries found. Add records in the Payload CMS Admin panel.
          </div>
        )}
      </motion.div>

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedEdu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEdu(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="glassmorphism border border-gold/30 rounded-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto p-6 relative shadow-2xl text-white space-y-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedEdu(null)}
                className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center font-mono text-sm transition-all border border-white/10"
              >
                ✕
              </button>

              {/* Luxury Large Image Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pr-8">
                {selectedEdu.institutionLogo?.url ? (
                  <div
                    onClick={() =>
                      setActiveLuxuryImage({
                        url: selectedEdu.institutionLogo!.url,
                        title: selectedEdu.institution,
                        subtitle: `${selectedEdu.degree} — ${selectedEdu.field}`,
                      })
                    }
                    className="relative group/logo cursor-pointer shrink-0"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-gold/40 shadow-[0_0_25px_rgba(212,175,55,0.3)] bg-black/60 p-2 flex items-center justify-center group-hover/logo:border-gold transition-all">
                      <img
                        src={selectedEdu.institutionLogo.url}
                        alt={selectedEdu.institution}
                        className="max-w-full max-h-full object-contain group-hover/logo:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover/logo:opacity-100 flex flex-col items-center justify-center text-gold text-xs transition-opacity font-mono p-1 text-center font-bold">
                      <span>🔍 View Big Size</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gold/20 via-purple-900/40 to-black border-2 border-gold/30 flex items-center justify-center text-4xl shrink-0 shadow-[0_0_25px_rgba(212,175,55,0.2)]">
                    🎓
                  </div>
                )}

                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-white leading-tight font-display gradient-brand-text">{selectedEdu.degree}</h2>
                  <p className="text-gold font-mono text-base font-medium mt-1">{selectedEdu.field}</p>
                  <p className="text-white/80 font-mono text-sm mt-0.5">{selectedEdu.institution}</p>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-white/5 border border-white/10 font-mono text-xs">
                <div>
                  <span className="text-white/40 block">Study Period</span>
                  <span className="text-white font-medium text-sm">{selectedEdu.startDate} – {selectedEdu.endDate ?? 'Present'}</span>
                </div>
                {selectedEdu.grade && (
                  <div>
                    <span className="text-white/40 block">Grade / Honor</span>
                    <span className="text-gold font-bold text-sm">{selectedEdu.grade}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedEdu.description && (
                <div>
                  <h4 className="text-xs font-mono text-gold uppercase tracking-wider mb-2">Program Overview</h4>
                  <p className="text-sm text-white/80 leading-relaxed font-sans bg-white/[0.02] p-4 rounded-xl border border-white/5">
                    {selectedEdu.description}
                  </p>
                </div>
              )}

              {/* Achievements */}
              {selectedEdu.achievements && selectedEdu.achievements.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono text-gold uppercase tracking-wider mb-2">Key Highlights & Accomplishments</h4>
                  <ul className="space-y-2 font-sans text-sm">
                    {selectedEdu.achievements.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-white/80 bg-white/[0.03] p-3 rounded-lg border border-white/5">
                        <span className="text-gold shrink-0 mt-0.5">✦</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                {selectedEdu.institutionLogo?.url ? (
                  <button
                    onClick={() =>
                      setActiveLuxuryImage({
                        url: selectedEdu.institutionLogo!.url,
                        title: selectedEdu.institution,
                        subtitle: `${selectedEdu.degree} — ${selectedEdu.field}`,
                      })
                    }
                    className="text-xs font-mono text-gold/90 hover:text-gold flex items-center gap-1.5"
                  >
                    <span>🖼️</span> View Big Size Image
                  </button>
                ) : <div />}
                <button
                  onClick={() => setSelectedEdu(null)}
                  className="btn-gold text-xs px-5 py-2"
                >
                  Close Details
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
  id: 'education',
  title: 'Education',
  icon: 'graduation-cap',
  canFullscreen: true,
  defaultWidth: 800,
  defaultHeight: 600,
}, EducationAppComponent)



