import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import React from 'react'

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

export const PORTFOLIO_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'event-master',
    title: 'Event Master',
    description: 'Completed a venue booking reservation in the interactive hall booking engine',
    icon: '🎪',
    rarity: 'common',
    points: 25,
  },
  {
    id: 'crisis-averted',
    title: 'Crisis Averted',
    description: 'Resolved a venue turnaround scheduling collision or double-booking conflict',
    icon: '🛡️',
    rarity: 'rare',
    points: 50,
  },
  {
    id: 'operations-controller',
    title: 'Operations Controller',
    description: 'Mastered venue operations desk challenge (booking, promo, no-show, appeal) in under 60 seconds',
    icon: '⏱️',
    rarity: 'legendary',
    points: 100,
  },
  {
    id: 'fleet-operator',
    title: 'Fleet Operator',
    description: 'Executed complete end-to-end laundry service pipeline in under 60 seconds',
    icon: '🧺',
    rarity: 'legendary',
    points: 100,
  },
]

export function getInitialAchievements(): Record<string, Achievement> {
  const map: Record<string, Achievement> = {}
  PORTFOLIO_ACHIEVEMENTS.forEach((ach) => {
    map[ach.id] = { ...ach }
  })
  return map
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
  revealSecret: (id: string) => void // reveals a secret achievement without unlocking
}

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      achievements: getInitialAchievements(),
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
        
        if (!achievement || achievement.unlockedAt || achievement.secret) {
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
        
        console.log(`[Achievement Unlocked] ${achievement.title} (+${achievement.points} pts)`)

        // Dispatch browser event for UI toasts
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          try {
            window.dispatchEvent(
              new CustomEvent('allinet:achievement-unlocked', {
                detail: { ...achievement, unlockedAt: now },
              })
            )
          } catch {
            // Event dispatch fallback
          }
        }

        return true
      },

      revealSecret: (id) => {
        set((state) => {
          const ach = state.achievements[id]
          if (ach && ach.secret) {
            ach.secret = false
          }
          return { achievements: { ...state.achievements } }
        })
      },

      getAchievement: (id) => get().achievements[id],
      getUnlockedAchievements: () =>
        Object.values(get().achievements)
          .filter(a => a.unlockedAt)
          .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
    }),
    {
      name: 'allinet-achievements-storage',
      storage: createJSONStorage(() => {
        const memoryStore: Record<string, string> = {};
        return {
          getItem: (key: string) => {
            const value = memoryStore[key];
            return value === undefined ? null : value;
          },
          setItem: (key: string, value: string) => {
            memoryStore[key] = value;
          },
          removeItem: (key: string) => {
            delete memoryStore[key];
          },
        };
      }),
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

// ----- Export selector hooks -----
export const useAchievement = (id: string) => useAchievementsStore(state => state.achievements[id]);
export const useUnlockedAchievements = () => useAchievementsStore(state => state.getUnlockedAchievements());
export const useTotalPoints = () => useAchievementsStore(state => state.totalPoints);
export const useVisibleAchievements = () => {
  const achievements = useAchievementsStore(state => state.achievements);
  return React.useMemo(() => Object.values(achievements).filter(a => !a.secret), [achievements]);
};
export const useRevealSecret = (id: string) => {
  const reveal = useAchievementsStore(state => state.revealSecret);
  return () => reveal(id);
};
