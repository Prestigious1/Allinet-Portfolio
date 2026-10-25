'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { services } from '@/core/providers'
import { createOSApp } from '@/core/registry/AppRegistry'
import { SkillData } from '@/core/providers/portfolio/PortfolioProvider'
import { LuxuryImageModal } from '@/components/ui/LuxuryImageModal'

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

function SkillCard({
  skill,
  delay,
  onClick,
}: {
  skill: SkillData
  delay: number
  onClick: () => void
}) {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      onClick={onClick}
      className="glassmorphism rounded-xl p-4 border border-white/10 hover:border-gold/40 cursor-pointer group transition-all hover:bg-white/[0.05] hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-center gap-3 mb-3">
        {skill.iconUrl?.url ? (
          <img
            src={skill.iconUrl.url}
            alt={skill.name}
            className="w-8 h-8 rounded-lg object-contain bg-white/5 p-1 group-hover:scale-110 transition-transform shrink-0"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 group-hover:scale-110 transition-transform"
            style={{ background: `${skill.color ?? '#a78bfa'}22`, border: `1px solid ${skill.color ?? '#a78bfa'}55` }}
          >
            ⚡
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline gap-1">
            <span className="text-sm font-semibold text-white group-hover:text-gold transition-colors truncate">{skill.name}</span>
            <span className="text-xs font-mono shrink-0" style={{ color: skill.color ?? '#a78bfa' }}>{skill.level}%</span>
          </div>
          <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">{skill.category}</span>
        </div>
      </div>

      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${skill.level}%` }}
          transition={{ delay: delay + 0.1, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${skill.color ?? '#a78bfa'}88, ${skill.color ?? '#a78bfa'})`,
            boxShadow: `0 0 8px ${skill.color ?? '#a78bfa'}55`,
          }}
        />
      </div>

      <div className="mt-2 text-right">
        <span className="text-[10px] font-mono text-white/20 group-hover:text-gold/60 transition-colors">Details →</span>
      </div>
    </motion.div>
  )
}

function SkillsAppComponent() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [skills, setSkills] = useState<SkillData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState<SkillData | null>(null)
  const [activeLuxuryImage, setActiveLuxuryImage] = useState<{ url: string; title: string; subtitle: string } | null>(null)

  useEffect(() => {
    let isMounted = true
    services.portfolio.getSkills()
      .then(data => { if (isMounted) { setSkills(data); setLoading(false) } })
      .catch(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [])

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center text-gold font-mono animate-pulse">Scanning skill matrix...</div>
  }

  const rawCategories = Array.from(new Set(skills.map(s => s.category)))
  const categories = ['All', ...rawCategories]

  const filtered = activeCategory === 'All'
    ? skills
    : skills.filter(s => s.category === activeCategory)

  const avgLevel = skills.length > 0 ? Math.round(skills.reduce((a, s) => a + s.level, 0) / skills.length) : 0
  const masteredCount = skills.filter(s => s.level >= 90).length

  const getProficiencyLabel = (level: number) => {
    if (level >= 90) return { label: 'Expert', color: '#d4af37' }
    if (level >= 75) return { label: 'Advanced', color: '#a78bfa' }
    if (level >= 55) return { label: 'Proficient', color: '#61dafb' }
    if (level >= 35) return { label: 'Intermediate', color: '#68a063' }
    return { label: 'Beginner', color: '#9ca3af' }
  }

  return (
    <div className="w-full h-full text-white overflow-y-auto p-6 space-y-5 bg-[#050014]/90">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display gradient-brand-text">Technical Skills</h1>
          <p className="text-white/40 text-xs font-mono mt-1">{skills.length} skills · Click any skill for details</p>
        </div>
        <span className="text-xs font-mono text-gold/80 px-2.5 py-1 rounded-full bg-gold/10 border border-gold/20 hidden sm:inline-block">
          {rawCategories.length} domains
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Skills Tracked', value: skills.length, icon: '📊' },
          { label: 'Avg. Proficiency', value: `${avgLevel}%`, icon: '🎯' },
          { label: 'Expert (90%+)', value: masteredCount, icon: '⭐' },
        ].map(stat => (
          <div key={stat.label} className="glassmorphism rounded-xl p-4 text-center border border-white/5">
            <div className="text-xl mb-1">{stat.icon}</div>
            <div className="text-xl font-bold gradient-brand-text font-display">{stat.value}</div>
            <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 font-mono ${
              activeCategory === cat
                ? 'border-gold/60 bg-gold/15 text-gold shadow-[0_0_8px_rgba(212,175,55,0.15)]'
                : 'border-white/10 bg-white/5 text-white/50 hover:text-white hover:border-white/20'
            }`}
          >
            {cat}
            <span className="ml-1.5 text-[9px] opacity-60">
              {cat === 'All' ? skills.length : skills.filter(s => s.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
        {filtered.map((skill, i) => (
          <SkillCard
            key={skill.name}
            skill={skill}
            delay={i * 0.03}
            onClick={() => setSelectedSkill(skill)}
          />
        ))}
      </div>

      {/* Skill Detail Modal */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSkill(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="glassmorphism border border-gold/30 rounded-2xl max-w-sm w-full p-6 relative shadow-2xl text-white space-y-5"
            >
              <button
                onClick={() => setSelectedSkill(null)}
                className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center font-mono text-sm transition-all border border-white/10"
              >
                ✕
              </button>

              {/* Icon + Name */}
              <div className="flex items-center gap-4 pr-8">
                {selectedSkill.iconUrl?.url ? (
                  <div
                    className="w-16 h-16 rounded-2xl overflow-hidden bg-black/60 border-2 flex items-center justify-center p-2 cursor-zoom-in shadow-lg"
                    style={{ borderColor: `${selectedSkill.color ?? '#a78bfa'}66`, boxShadow: `0 0 20px ${selectedSkill.color ?? '#a78bfa'}33` }}
                    onClick={() => selectedSkill.iconUrl?.url && setActiveLuxuryImage({
                      url: selectedSkill.iconUrl.url,
                      title: selectedSkill.name,
                      subtitle: selectedSkill.category,
                    })}
                  >
                    <img src={selectedSkill.iconUrl.url} alt={selectedSkill.name} className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2 shadow-lg"
                    style={{ background: `${selectedSkill.color ?? '#a78bfa'}22`, borderColor: `${selectedSkill.color ?? '#a78bfa'}55` }}
                  >
                    ⚡
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-white font-display">{selectedSkill.name}</h2>
                  <p className="font-mono text-xs mt-0.5 uppercase tracking-wider text-white/50">{selectedSkill.category}</p>
                  {selectedSkill.years && (
                    <p className="text-xs text-white/40 font-mono mt-0.5">{selectedSkill.years}+ years experience</p>
                  )}
                </div>
              </div>

              {/* Proficiency Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-white/50">Proficiency</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold" style={{ color: getProficiencyLabel(selectedSkill.level).color }}>
                      {getProficiencyLabel(selectedSkill.level).label}
                    </span>
                    <span className="text-sm font-bold font-mono" style={{ color: selectedSkill.color ?? '#a78bfa' }}>
                      {selectedSkill.level}%
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedSkill.level}%` }}
                    transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${selectedSkill.color ?? '#a78bfa'}88, ${selectedSkill.color ?? '#a78bfa'})`,
                      boxShadow: `0 0 12px ${selectedSkill.color ?? '#a78bfa'}66`,
                    }}
                  />
                </div>
              </div>

              {/* Official URL */}
              {selectedSkill.officialUrl && (
                <a
                  href={selectedSkill.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold text-xs py-2.5 flex items-center justify-center gap-2 w-full font-bold"
                >
                  <span>🔗</span> Official Docs ↗
                </a>
              )}

              <button
                onClick={() => setSelectedSkill(null)}
                className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-mono transition-all border border-white/10"
              >
                Close
              </button>
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
  id: 'skills',
  title: 'Skills',
  icon: 'chart',
  canFullscreen: true,
  defaultWidth: 750,
  defaultHeight: 620,
}, SkillsAppComponent)
