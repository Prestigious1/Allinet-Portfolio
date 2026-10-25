'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { createOSApp } from '@/core/registry/AppRegistry'
import { services } from '@/core/providers'
import { ExperienceData } from '@/core/providers/portfolio/PortfolioProvider'
import { LuxuryImageModal } from '@/components/ui/LuxuryImageModal'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

function TimelineAppComponent() {
  const [experiences, setExperiences] = useState<ExperienceData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExp, setSelectedExp] = useState<ExperienceData | null>(null)
  const [activeLuxuryImage, setActiveLuxuryImage] = useState<{ url: string; title: string; subtitle: string } | null>(null)

  useEffect(() => {
    let isMounted = true
    services.portfolio.getExperience()
      .then(data => { if (isMounted) { setExperiences(data); setLoading(false) } })
      .catch(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [])

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center text-gold font-mono animate-pulse">Initializing timeline...</div>
  }

  return (
    <div className="w-full h-full bg-[#050014]/90 text-white p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display gradient-brand-text text-center">Career Journey</h1>
        <p className="text-white/40 text-xs font-mono mt-1 text-center">Click any milestone for full details</p>
      </div>

      {/* Timeline */}
      <div className="relative ml-4 max-w-2xl mx-auto">
        {/* Vertical line */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-gold via-purple to-transparent" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-5 pl-8"
        >
          {experiences.map((exp, index) => (
            <motion.div key={index} variants={itemVariants} className="relative">
              {/* Timeline dot */}
              <div
                className="absolute -left-[33px] top-5 w-3 h-3 rounded-full border-2 border-gold z-10"
                style={{ background: '#0d0618', boxShadow: '0 0 10px rgba(212,175,55,0.7)' }}
              />

              <div
                onClick={() => setSelectedExp(exp)}
                className="glassmorphism border border-white/10 hover:border-gold/40 hover:bg-white/[0.04] p-5 rounded-xl cursor-pointer group transition-all shadow-sm"
              >
                <div className="flex items-start gap-3 mb-2">
                  {/* Company Logo */}
                  {exp.companyLogo?.url ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveLuxuryImage({ url: exp.companyLogo!.url, title: exp.company, subtitle: exp.role })
                      }}
                      className="relative shrink-0 cursor-zoom-in group/logo"
                    >
                      <img
                        src={exp.companyLogo.url}
                        alt={exp.company}
                        className="w-10 h-10 rounded-lg object-contain bg-white/5 p-1 border border-white/10 group-hover/logo:border-gold/40 transition-all"
                      />
                      <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover/logo:opacity-100 flex items-center justify-center text-gold text-xs transition-opacity">🔍</div>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-base shrink-0">🏢</div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <span className="text-gold font-mono text-xs font-bold tracking-wider block mb-0.5">
                          {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : '– Present'}
                          {exp.isCurrent && <span className="ml-2 text-green-400 text-[10px]">● Active</span>}
                        </span>
                        <h3 className="text-base font-bold text-white group-hover:text-gold transition-colors leading-tight">{exp.role}</h3>
                        <p className="text-white/50 font-mono text-xs mt-0.5">{exp.company} · {exp.type}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-white/60 line-clamp-2 mb-3 leading-relaxed">{exp.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {(exp.techStack || []).slice(0, 3).map(tech => (
                      <span key={tech as string} className="tag-tech">{tech}</span>
                    ))}
                    {(exp.techStack || []).length > 3 && (
                      <span className="tag-tech">+{(exp.techStack || []).length - 3}</span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-gold/50 group-hover:translate-x-1 transition-transform shrink-0 ml-2">Details →</span>
                </div>
              </div>
            </motion.div>
          ))}

          {experiences.length === 0 && (
            <div className="text-white/30 text-sm font-mono text-center py-10">
              No timeline data found. Add experience records in Payload CMS Admin.
            </div>
          )}
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedExp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedExp(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="glassmorphism border border-gold/30 rounded-2xl max-w-xl w-full max-h-[88vh] overflow-y-auto p-6 relative shadow-2xl text-white space-y-5"
            >
              <button
                onClick={() => setSelectedExp(null)}
                className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center font-mono text-sm transition-all border border-white/10"
              >
                ✕
              </button>

              <div className="flex items-start gap-4 pr-8">
                {selectedExp.companyLogo?.url ? (
                  <div
                    onClick={() => setActiveLuxuryImage({ url: selectedExp.companyLogo!.url, title: selectedExp.company, subtitle: selectedExp.role })}
                    className="relative group/logo cursor-zoom-in shrink-0"
                  >
                    <div className="w-16 h-16 rounded-xl border-2 border-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.2)] bg-black/60 p-2 flex items-center justify-center group-hover/logo:border-gold transition-all">
                      <img src={selectedExp.companyLogo.url} alt={selectedExp.company} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover/logo:opacity-100 flex items-center justify-center text-gold text-xs font-bold transition-opacity">🔍</div>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gold/10 border-2 border-gold/20 flex items-center justify-center text-3xl shrink-0">🏢</div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-white font-display gradient-brand-text leading-tight">{selectedExp.role}</h2>
                  <p className="text-gold font-mono text-sm mt-0.5">{selectedExp.company}</p>
                  <p className="text-white/50 font-mono text-xs mt-0.5">
                    {selectedExp.type}{selectedExp.remote ? ' · Remote' : ''}{selectedExp.location ? ` · ${selectedExp.location}` : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-white/5 border border-white/10 font-mono text-xs">
                <div>
                  <span className="text-white/40 block">Period</span>
                  <span className="text-white font-medium text-sm">{selectedExp.startDate} – {selectedExp.endDate ?? 'Present'}</span>
                </div>
                {selectedExp.isCurrent && (
                  <div>
                    <span className="text-white/40 block">Status</span>
                    <span className="text-green-400 font-bold text-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" /> Currently Active
                    </span>
                  </div>
                )}
              </div>

              {selectedExp.description && (
                <div>
                  <h4 className="text-xs font-mono text-gold uppercase tracking-wider mb-2">Role Overview</h4>
                  <p className="text-sm text-white/80 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">{selectedExp.description}</p>
                </div>
              )}

              {selectedExp.achievements && selectedExp.achievements.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono text-gold uppercase tracking-wider mb-2">Key Achievements</h4>
                  <ul className="space-y-2 text-sm">
                    {selectedExp.achievements.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5 text-white/80 bg-white/[0.03] p-3 rounded-lg border border-white/5">
                        <span className="text-gold shrink-0 mt-0.5">✦</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(selectedExp.techStack || []).length > 0 && (
                <div>
                  <h4 className="text-xs font-mono text-gold uppercase tracking-wider mb-2">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedExp.techStack || []).map(t => (
                      <span key={t as string} className="tag-tech">{t as string}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button onClick={() => setSelectedExp(null)} className="btn-gold text-xs px-5 py-2">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
  id: 'timeline',
  title: 'Timeline',
  icon: 'clock',
  canFullscreen: true,
  defaultWidth: 800,
  defaultHeight: 620,
}, TimelineAppComponent)
