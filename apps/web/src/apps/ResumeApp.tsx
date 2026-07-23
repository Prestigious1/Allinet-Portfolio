'use client'

import React, { useEffect, useState } from 'react'
import { motion, Variants } from 'framer-motion'
import { services } from '@/core/providers'
import { createOSApp } from '@/core/registry/AppRegistry'
import { ExperienceData } from '@/core/providers/portfolio/PortfolioProvider'

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

  useEffect(() => {
    services.portfolio.getExperience().then(data => {
      setExperience(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center text-gold animate-pulse">Loading resume data...</div>
  }

  return (
    <div className="w-full h-full text-white overflow-y-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display gradient-brand-text">Curriculum Vitae</h1>
          <p className="text-purple-light font-mono text-sm mt-1">Full-Stack Engineer & AI Architect</p>
        </div>
        <a
          href="/resume.pdf"
          download
          className="btn-gold flex items-center gap-2 text-xs"
        >
          <span>⬇</span> Download PDF
        </a>
      </div>

      {/* Experience Timeline */}
      <section>
        <h2 className="section-header">Experience</h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative ml-4"
        >
          {/* Timeline line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-gold via-purple to-transparent ml-[-1px]" />

          <div className="space-y-6 pl-8">
            {experience.map((exp, i) => (
              <motion.div key={i} variants={itemVariants} className="relative">
                {/* Timeline dot */}
                <div
                  className="absolute -left-[33px] top-1.5 w-3 h-3 rounded-full border-2 border-gold"
                  style={{ background: '#0d0618', boxShadow: '0 0 8px rgba(212,175,55,0.6)' }}
                />

                <div className="glassmorphism rounded-xl p-5 border border-white/5 hover:border-gold/20 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">{exp.role}</h3>
                      <p className="text-purple-light font-mono text-xs mt-0.5">{exp.company} · {exp.type}</p>
                    </div>
                    <span className="text-xs text-white/40 font-mono shrink-0 mt-0.5">
                      {exp.startDate} – {exp.endDate ?? 'Present'}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 mb-3 leading-relaxed">{exp.description}</p>
                  {exp.location && (
                    <p className="text-xs text-white/30 font-mono mb-3">📍 {exp.location}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {(exp.techStack || []).map(t => (
                      <span key={t as string} className="tag-tech">{t as string}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}

            {experience.length === 0 && (
              <div className="text-white/30 text-sm font-mono pl-4">No experience data found.</div>
            )}
          </div>
        </motion.div>
      </section>
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
