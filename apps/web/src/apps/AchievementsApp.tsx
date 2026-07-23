'use client'

import React from 'react'
import { createOSApp } from '@/core/registry/AppRegistry'
import { useAchievementsStore } from '@/store/achievements.store'

function AchievementsAppComponent() {
  const { achievements, totalPoints, unlockedCount } = useAchievementsStore()
  
  // Static mock achievements until CMS is seeded
  const mockAchievements = [
    {
      id: 'first_boot',
      title: 'System Initialized',
      description: 'Boot up ALLINET OS for the first time.',
      icon: 'power',
      rarity: 'common',
      points: 10,
      unlockedAt: Date.now() - 86400000
    },
    {
      id: 'hacker_man',
      title: 'I\'m In',
      description: 'Find and open the secret Terminal app.',
      icon: 'terminal',
      rarity: 'uncommon',
      points: 50,
      unlockedAt: null
    },
    {
      id: 'easter_egg',
      title: 'Curiosity Killed the Cat',
      description: 'Find the hidden easter egg in the 3D scene.',
      icon: 'egg',
      rarity: 'legendary',
      points: 100,
      unlockedAt: null,
      secret: true
    }
  ]

  const displayAchievements = Object.keys(achievements).length > 0 
    ? Object.values(achievements) 
    : mockAchievements

  const activeCount = Object.keys(achievements).length > 0 ? unlockedCount : 1
  const activePoints = Object.keys(achievements).length > 0 ? totalPoints : 10
  const totalAvailable = displayAchievements.length

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400 border-yellow-400/50 shadow-[0_0_15px_rgba(250,204,21,0.3)]'
      case 'rare': return 'text-purple-400 border-purple-400/50 shadow-[0_0_15px_rgba(192,132,252,0.3)]'
      case 'uncommon': return 'text-blue-400 border-blue-400/50'
      case 'common': default: return 'text-gray-300 border-gray-500/50'
    }
  }

  return (
    <div className="w-full h-full bg-[#050014] text-white p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-4">Achievements</h1>
          <div className="flex justify-center gap-8 text-sm">
            <div className="bg-white/5 px-6 py-3 rounded-lg border border-white/10">
              <span className="text-gray-400 block mb-1">Unlocked</span>
              <span className="text-2xl font-mono font-bold text-white">{activeCount} / {totalAvailable}</span>
            </div>
            <div className="bg-white/5 px-6 py-3 rounded-lg border border-white/10">
              <span className="text-gray-400 block mb-1">Total Score</span>
              <span className="text-2xl font-mono font-bold text-gold">{activePoints} pts</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayAchievements.map(ach => {
            const isUnlocked = !!ach.unlockedAt
            const isSecret = ach.secret && !isUnlocked

            return (
              <div 
                key={ach.id}
                className={`p-6 rounded-xl border relative overflow-hidden transition-all duration-500 ${
                  isUnlocked 
                    ? `bg-white/10 ${getRarityColor(ach.rarity)}` 
                    : 'bg-black/50 border-white/5 opacity-60 grayscale'
                }`}
              >
                {/* Rarity label */}
                <div className="absolute top-2 right-2 text-[10px] uppercase tracking-wider font-bold opacity-70">
                  {isSecret ? '???' : ach.rarity}
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-black/50 border ${isUnlocked ? 'border-current' : 'border-white/20'}`}>
                    <span className="text-2xl">{isSecret ? '🔒' : '🏆'}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight text-white">
                      {isSecret ? 'Hidden Achievement' : ach.title}
                    </h3>
                    <div className="text-xs font-mono mt-1 opacity-80">
                      {ach.points} pts
                    </div>
                  </div>
                </div>
                
                <p className="text-sm opacity-80 text-gray-300">
                  {isSecret ? 'Keep exploring the OS to unlock this secret achievement.' : ach.description}
                </p>

                {isUnlocked && (
                  <div className="mt-4 text-xs font-mono opacity-50">
                    Unlocked: {new Date(ach.unlockedAt!).toLocaleDateString()}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default createOSApp({
  id: 'achievements',
  title: 'Achievements',
  icon: 'trophy',
  canFullscreen: true,
  defaultWidth: 850,
  defaultHeight: 650
}, AchievementsAppComponent)
