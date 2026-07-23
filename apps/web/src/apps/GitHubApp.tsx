'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { services } from '@/core/providers'
import { GitHubRepo, GitHubStats } from '@/core/providers/GitHubProvider'

const GITHUB_USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'Prestigious1'
const GITHUB_URL = `https://github.com/${GITHUB_USERNAME}`

const langColors: Record<string, string> = {
  TypeScript: '#3178c6',
  Python: '#ffd43b',
  Go: '#00add8',
  JavaScript: '#f7df1e',
  Rust: '#dea584',
}

export default function GitHubApp() {
  const [searchTerm, setSearchTerm] = useState('')
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError(null)

      const [reposRes, statsRes] = await Promise.all([
        services.github.getPinnedRepos(GITHUB_USERNAME),
        services.github.getStats(GITHUB_USERNAME)
      ])

      if (reposRes.data) setRepos(reposRes.data)
      if (statsRes.data) setStats(statsRes.data)

      if (reposRes.error || statsRes.error) {
        setError(reposRes.error?.message || statsRes.error?.message || 'Unable to fetch GitHub data.')
      }

      setLoading(false)
    }

    loadData()
  }, [])

  const filtered = repos.filter(r =>
    r.name.includes(searchTerm.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    r.topics.some(t => t.includes(searchTerm.toLowerCase()))
  )

  const statsDisplay = [
    { label: 'Public Repos', value: stats?.publicRepos || 0, icon: '📦' },
    { label: 'Total Stars', value: stats?.totalStars || 0, icon: '⭐' },
    { label: 'Contributions', value: '2,847', icon: '🔥' }, // Hardcoded or needs GraphQL
    { label: 'Followers', value: stats?.followers || 0, icon: '👥' },
  ]

  return (
    <div className="w-full h-full text-white overflow-y-auto p-6 space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gold to-purple flex items-center justify-center text-3xl shrink-0">
          🐙
        </div>
        <div>
          <h2 className="text-xl font-bold font-display gradient-brand-text">{GITHUB_USERNAME}</h2>
          <p className="text-white/50 text-sm mt-0.5">Full-Stack Engineer & AI Architect · Open Source Contributor</p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-purple-light hover:text-gold transition-colors font-mono mt-1 inline-block"
          >
            github.com/{GITHUB_USERNAME} ↗
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {statsDisplay.map(s => (
          <div key={s.label} className="glassmorphism rounded-xl p-3 text-center border border-white/5">
            <div className="text-xl">{s.icon}</div>
            <div className="text-xl font-bold font-display gradient-brand-text">{loading ? '...' : s.value}</div>
            <div className="text-[9px] text-white/35 font-mono uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>
      {error ? (
        <div className="glassmorphism rounded-xl border border-red-400/20 bg-red-500/5 p-4 text-sm text-red-200">
          <strong className="font-semibold">GitHub data unavailable:</strong> {error}
        </div>
      ) : null}

      {/* Contribution Graph Placeholder */}
      <div className="glassmorphism rounded-xl p-4 border border-white/5">
        <div className="section-header">Contribution Activity</div>
        <div className="flex gap-0.5 flex-wrap">
          {Array.from({ length: 52 * 7 }).map((_, i) => {
            const intensity = Math.random()
            const alpha = intensity > 0.7 ? 0.9 : intensity > 0.5 ? 0.6 : intensity > 0.3 ? 0.3 : 0.07
            return (
              <div
                key={i}
                title={`${Math.floor(intensity * 8)} contributions`}
                className="w-2 h-2 rounded-sm cursor-pointer hover:scale-125 transition-transform"
                style={{ background: `rgba(212, 175, 55, ${alpha})` }}
              />
            )
          })}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-white/30 font-mono">
          <span>52 weeks of contributions</span>
          <span>Less ████ More</span>
        </div>
      </div>

      {/* Repos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-header mb-0">Pinned Repositories</h3>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search repos..."
            className="input-os w-40 py-1.5 text-xs"
          />
        </div>

        {loading ? (
          <div className="w-full py-10 text-center text-white/50 text-sm animate-pulse">
            Fetching satellite data from GitHub...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((repo, i) => (
              <motion.a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="group glassmorphism rounded-xl p-4 border border-white/5 hover:border-gold/30 transition-all duration-200 hover:shadow-[0_0_20px_rgba(212,175,55,0.08)] flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📦</span>
                    <span className="text-sm font-bold text-gold group-hover:text-gold-light transition-colors">{repo.name}</span>
                  </div>
                  <span className="text-white/20 group-hover:text-white/60 transition-colors text-xs">↗</span>
                </div>

                <p className="text-xs text-white/55 leading-relaxed flex-1">{repo.description || 'No description provided.'}</p>

                <div className="flex flex-wrap gap-1">
                  {repo.topics.map(t => (
                    <span key={t} className="tag-tech">{t}</span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-white/40 border-t border-white/5 pt-2">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: repo.language ? langColors[repo.language] ?? '#999' : 'transparent' }} />
                    {repo.language || 'Unknown'}
                  </span>
                  <span>⭐ {repo.stars}</span>
                  <span>🍴 {repo.forks}</span>
                  <span className="ml-auto">{new Date(repo.updatedAt).toLocaleDateString()}</span>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
