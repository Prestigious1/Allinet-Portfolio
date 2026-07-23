'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { services } from '@/core/providers'
import { createOSApp } from '@/core/registry/AppRegistry'
import { SkillData } from '@/core/providers/portfolio/PortfolioProvider'

function SkillBar({ skill, delay }: { skill: SkillData; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 25 }}
      className="space-y-1.5"
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-white/85">{skill.name}</span>
        <span className="text-xs font-mono" style={{ color: skill.color ?? '#a78bfa' }}>{skill.level}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${skill.level}%` }}
          transition={{ delay: delay + 0.1, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${skill.color ?? '#a78bfa'}99, ${skill.color ?? '#a78bfa'})`,
            boxShadow: `0 0 8px ${skill.color ?? '#a78bfa'}66`,
          }}
        />
      </div>
    </motion.div>
  )
}

function SkillsAppComponent() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [skills, setSkills] = useState<SkillData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    services.portfolio.getSkills().then(data => {
      setSkills(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center text-gold animate-pulse">Scanning skill matrix...</div>
  }

  // Derive unique categories from the data
  const rawCategories = Array.from(new Set(skills.map(s => s.category)))
  const categories = ['All', ...rawCategories]

  const filtered = activeCategory === 'All'
    ? skills
    : skills.filter(s => s.category === activeCategory)

  // Stats
  const avgLevel = skills.length > 0
    ? Math.round(skills.reduce((a, s) => a + s.level, 0) / skills.length)
    : 0
  const masteredCount = skills.filter(s => s.level >= 90).length

  return (
    <div className="w-full h-full text-white overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-display gradient-brand-text">Technical Skills</h2>
        <p className="text-white/40 text-sm mt-1">{skills.length} skills across {rawCategories.length} domains</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Skills Tracked', value: skills.length, icon: '📊' },
          { label: 'Avg. Proficiency', value: `${avgLevel}%`, icon: '🎯' },
          { label: 'Mastered (90%+)', value: masteredCount, icon: '⭐' },
        ].map(stat => (
          <div key={stat.label} className="glassmorphism rounded-xl p-4 text-center border border-white/5">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold gradient-brand-text font-display">{stat.value}</div>
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
              activeCategory === cat
                ? 'border-gold/60 bg-gold/15 text-gold'
                : 'border-white/10 bg-white/5 text-white/50 hover:text-white hover:border-white/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((skill, i) => (
          <SkillBar key={skill.name} skill={skill} delay={i * 0.04} />
        ))}
      </div>
    </div>
  )
}

export default createOSApp({
  id: 'skills',
  title: 'Skills',
  icon: 'chart',
  canFullscreen: true,
  defaultWidth: 700,
  defaultHeight: 600,
}, SkillsAppComponent)
