import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'legendary'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: AchievementRarity
  secret?: boolean
  points: number
  unlockedAt?: number
}

interface AchievementsState {
  achievements: Record<string, Achievement>
  totalPoints: number
  unlockedCount: number
  
  // Actions
  unlockAchievement: (id: string) => boolean // returns true if newly unlocked
  getAchievement: (id: string) => Achievement | undefined
  getUnlockedAchievements: () => Achievement[]
  registerAchievements: (achievements: Achievement[]) => void
}

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      achievements: {},
      totalPoints: 0,
      unlockedCount: 0,

      registerAchievements: (achievements) => {
        set((state) => {
          const newAchievements = { ...state.achievements }
          achievements.forEach(ach => {
            if (!newAchievements[ach.id]) {
              newAchievements[ach.id] = ach
            } else {
              // Update metadata but keep unlock status
              newAchievements[ach.id] = { ...ach, unlockedAt: newAchievements[ach.id].unlockedAt }
            }
          })
          return { achievements: newAchievements }
        })
      },

      unlockAchievement: (id) => {
        const state = get()
        const achievement = state.achievements[id]
        
        if (!achievement || achievement.unlockedAt) {
          return false // Not found or already unlocked
        }

        const now = Date.now()
        set((state) => ({
          achievements: {
            ...state.achievements,
            [id]: { ...achievement, unlockedAt: now }
          },
          totalPoints: state.totalPoints + achievement.points,
          unlockedCount: state.unlockedCount + 1
        }))
        
        // In a real app, we might also dispatch a toast notification here
        console.log(`[Achievement Unlocked] ${achievement.title} (+${achievement.points} pts)`)
        
        // Also send to backend for server-side verification if needed
        // fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ event: 'achievement_unlock', data: { id } }) })

        return true
      },

      getAchievement: (id) => get().achievements[id],
      getUnlockedAchievements: () => Object.values(get().achievements).filter(a => a.unlockedAt).sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
    }),
    {
      name: 'allinet-achievements-storage',
      // Only persist the unlock states to avoid caching stale achievement descriptions
      partialize: (state) => ({ 
        unlockedStates: Object.entries(state.achievements)
          .filter(([_, a]) => a.unlockedAt)
          .reduce((acc, [id, a]) => ({ ...acc, [id]: a.unlockedAt as number }), {} as Record<string, number>),
        totalPoints: state.totalPoints,
        unlockedCount: state.unlockedCount
      }),
      merge: (persistedState: any, currentState) => {
        const mergedAchievements = { ...currentState.achievements }
        if (persistedState.unlockedStates) {
          Object.entries(persistedState.unlockedStates as Record<string, number>).forEach(([id, timestamp]) => {
            if (mergedAchievements[id]) {
              mergedAchievements[id].unlockedAt = timestamp
            }
          })
        }
        return {
          ...currentState,
          achievements: mergedAchievements,
          totalPoints: persistedState.totalPoints || 0,
          unlockedCount: persistedState.unlockedCount || 0
        }
      }
    }
  )
)
