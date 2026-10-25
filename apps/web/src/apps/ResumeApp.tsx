'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { services } from '@/core/providers'
import { createOSApp } from '@/core/registry/AppRegistry'
import { ExperienceData } from '@/core/providers/portfolio/PortfolioProvider'
import { LuxuryImageModal } from '@/components/ui/LuxuryImageModal'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

function ResumeAppComponent() {
  const [experience, setExperience] = useState<ExperienceData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExp, setSelectedExp] = useState<ExperienceData | null>(null)
  const [activeLuxuryImage, setActiveLuxuryImage] = useState<{ url: string; title: string; subtitle: string } | null>(null)

  useEffect(() => {
    let isMounted = true
    services.portfolio.getExperience()
      .then(data => { if (isMounted) { setExperience(data); setLoading(false) } })
      .catch(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [])

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center text-gold font-mono animate-pulse">Loading resume data...</div>
  }

  return (
    <div className="w-full h-full text-white overflow-y-auto p-6 space-y-6 bg-[#050014]/90">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold font-display gradient-brand-text">Curriculum Vitae</h1>
          <p className="text-purple-light font-mono text-sm mt-1">Click any role to read full details</p>
        </div>
        <a
          href="/resume.pdf"
          download
          className="btn-gold flex items-center gap-2 text-xs shrink-0"
        >
          <span>⬇</span> Download PDF
        </a>
      </div>

      {/* Experience Timeline */}
      <section>
        <h2 className="section-header">Work Experience</h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative ml-4"
        >
          {/* Timeline line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-gold via-purple to-transparent ml-[-1px]" />

          <div className="space-y-4 pl-8">
            {experience.map((exp, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="relative"
              >
                {/* Timeline dot */}
                <div
                  className="absolute -left-[33px] top-5 w-3 h-3 rounded-full border-2 border-gold"
                  style={{ background: '#0d0618', boxShadow: '0 0 8px rgba(212,175,55,0.6)' }}
                />

                <div
                  onClick={() => setSelectedExp(exp)}
                  className="glassmorphism rounded-xl p-5 border border-white/10 hover:border-gold/40 hover:bg-white/[0.04] transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-start gap-3 mb-2">
                    {/* Company Logo */}
                    {exp.companyLogo?.url ? (
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveLuxuryImage({
                            url: exp.companyLogo!.url,
                            title: exp.company,
                            subtitle: exp.role,
                          })
                        }}
                        className="relative group/logo shrink-0 cursor-zoom-in"
                      >
                        <img
                          src={exp.companyLogo.url}
                          alt={exp.company}
                          className="w-10 h-10 rounded-lg object-contain bg-white/5 p-1 border border-white/10 group-hover/logo:border-gold/40 transition-all"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover/logo:opacity-100 flex items-center justify-center text-gold text-xs transition-opacity">
                          🔍
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-lg shrink-0">
                        🏢
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className="font-bold text-white text-base leading-tight group-hover:text-gold transition-colors">{exp.role}</h3>
                          <p className="text-purple-light font-mono text-xs mt-0.5">
                            {exp.company}
                            {exp.companyUrl && (
                              <a
                                href={exp.companyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="ml-1 text-gold/70 hover:text-gold"
                              >↗</a>
                            )}
                            {' '}· {exp.type}
                            {exp.remote && <span className="ml-1 text-green-400/80">· Remote</span>}
                          </p>
                        </div>
                        <span className="text-xs text-white/40 font-mono shrink-0">
                          {exp.startDate} – {exp.endDate ?? 'Present'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-white/60 mb-3 leading-relaxed line-clamp-2 ml-13">{exp.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {(exp.techStack || []).slice(0, 4).map(t => (
                        <span key={t as string} className="tag-tech">{t as string}</span>
                      ))}
                      {(exp.techStack || []).length > 4 && (
                        <span className="tag-tech">+{(exp.techStack || []).length - 4}</span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-gold/60 group-hover:translate-x-1 transition-transform shrink-0 ml-2">
                      Full Details →
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {experience.length === 0 && (
              <div className="text-white/30 text-sm font-mono">
                No experience data found. Add records in Payload CMS Admin.
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Experience Detail Modal */}
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

              {/* Header */}
              <div className="flex items-start gap-4 pr-8">
                {selectedExp.companyLogo?.url ? (
                  <div
                    onClick={() => setActiveLuxuryImage({
                      url: selectedExp.companyLogo!.url,
                      title: selectedExp.company,
                      subtitle: selectedExp.role,
                    })}
                    className="relative group/logo cursor-zoom-in shrink-0"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.2)] bg-black/60 p-2 flex items-center justify-center group-hover/logo:border-gold transition-all">
                      <img
                        src={selectedExp.companyLogo.url}
                        alt={selectedExp.company}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover/logo:opacity-100 flex items-center justify-center text-gold text-xs font-bold transition-opacity">
                      🔍 Zoom
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gold/10 border-2 border-gold/20 flex items-center justify-center text-3xl shrink-0">
                    🏢
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-white font-display gradient-brand-text leading-tight">{selectedExp.role}</h2>
                  <p className="text-gold font-mono text-sm mt-0.5">
                    {selectedExp.company}
                    {selectedExp.companyUrl && (
                      <a href={selectedExp.companyUrl} target="_blank" rel="noopener noreferrer" className="ml-1 hover:text-white">↗</a>
                    )}
                  </p>
                  <p className="text-white/50 font-mono text-xs mt-0.5">
                    {selectedExp.type}{selectedExp.remote ? ' · Remote' : ''}
                    {selectedExp.location ? ` · ${selectedExp.location}` : ''}
                  </p>
                </div>
              </div>

              {/* Meta Grid */}
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

              {/* Full Description */}
              {selectedExp.description && (
                <div>
                  <h4 className="text-xs font-mono text-gold uppercase tracking-wider mb-2">Role Overview</h4>
                  <p className="text-sm text-white/80 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">
                    {selectedExp.description}
                  </p>
                </div>
              )}

              {/* Achievements */}
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

              {/* Tech Stack */}
              {(selectedExp.techStack || []).length > 0 && (
                <div>
                  <h4 className="text-xs font-mono text-gold uppercase tracking-wider mb-2">Technologies Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedExp.techStack || []).map(t => (
                      <span key={t as string} className="tag-tech">{t as string}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                {selectedExp.companyLogo?.url ? (
                  <button
                    onClick={() => setActiveLuxuryImage({
                      url: selectedExp.companyLogo!.url,
                      title: selectedExp.company,
                      subtitle: selectedExp.role,
                    })}
                    className="text-xs font-mono text-gold/90 hover:text-gold flex items-center gap-1.5"
                  >
                    <span>🖼️</span> View Logo Big Size
                  </button>
                ) : <div />}
                <button
                  onClick={() => setSelectedExp(null)}
                  className="btn-gold text-xs px-5 py-2"
                >
                  Close
                </button>
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
  id: 'resume',
  title: 'Resume',
  icon: 'document',
  canFullscreen: true,
  defaultWidth: 850,
  defaultHeight: 650,
}, ResumeAppComponent)
