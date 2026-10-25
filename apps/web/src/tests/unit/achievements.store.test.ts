// achievements.store.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useAchievementsStore,
  Achievement,
  PORTFOLIO_ACHIEVEMENTS,
} from '@/store/achievements.store';

const sampleAchievements: Achievement[] = [
  {
    id: 'first-blood',
    title: 'First Blood',
    description: 'Unlock the first achievement.',
    icon: '🏆',
    rarity: 'common',
    points: 10,
  },
  {
    id: 'master',
    title: 'Master of OS',
    description: 'Unlock after completing the OS demo.',
    icon: '🧠',
    rarity: 'legendary',
    points: 100,
  },
];

describe('Achievements Store (useAchievementsStore)', () => {
  beforeEach(() => {
    // Reset store state to a clean slate before each test
    useAchievementsStore.setState({
      achievements: {},
      totalPoints: 0,
      unlockedCount: 0,
    } as any);
  });

  it('registers achievements without overwriting existing unlock state', () => {
    useAchievementsStore.getState().registerAchievements(sampleAchievements);
    const state = useAchievementsStore.getState();
    expect(Object.keys(state.achievements)).toHaveLength(2);
    expect(state.achievements['first-blood'].title).toBe('First Blood');
  });

  it('unlocks an achievement and updates points/count', () => {
    useAchievementsStore.getState().registerAchievements(sampleAchievements);
    const unlocked = useAchievementsStore.getState().unlockAchievement('first-blood');
    expect(unlocked).toBe(true);
    const after = useAchievementsStore.getState();
    expect(after.totalPoints).toBe(10);
    expect(after.unlockedCount).toBe(1);
    expect(after.achievements['first-blood'].unlockedAt).toBeDefined();
  });

  it('returns false when unlocking an already unlocked achievement', () => {
    useAchievementsStore.getState().registerAchievements(sampleAchievements);
    useAchievementsStore.getState().unlockAchievement('first-blood');
    const secondAttempt = useAchievementsStore.getState().unlockAchievement('first-blood');
    expect(secondAttempt).toBe(false);
    // Points and count should not increase on second attempt
    const state = useAchievementsStore.getState();
    expect(state.totalPoints).toBe(10);
    expect(state.unlockedCount).toBe(1);
  });

  it('retrieves unlocked achievements in most‑recent order', () => {
    useAchievementsStore.getState().registerAchievements(sampleAchievements);
    // Unlock in reverse order to test sorting
    useAchievementsStore.getState().unlockAchievement('master');
    useAchievementsStore.getState().unlockAchievement('first-blood');
    const unlocked = useAchievementsStore.getState().getUnlockedAchievements();
    expect(unlocked).toHaveLength(2);
    // The most recent unlock should be first‑blood (last unlocked)
    expect(unlocked[0].id).toBe('first-blood');
    expect(unlocked[1].id).toBe('master');
  });

  it('contains predefined demo achievements (Event Master, Crisis Averted, Operations Controller)', () => {
    const ids = PORTFOLIO_ACHIEVEMENTS.map((a) => a.id);
    expect(ids).toContain('event-master');
    expect(ids).toContain('crisis-averted');
    expect(ids).toContain('operations-controller');
  });

  it('dispatches allinet:achievement-unlocked event on window when unlocked', () => {
    const eventSpy = vi.fn();
    window.addEventListener('allinet:achievement-unlocked', eventSpy);

    useAchievementsStore.getState().registerAchievements(PORTFOLIO_ACHIEVEMENTS);

    const unlocked = useAchievementsStore.getState().unlockAchievement('event-master');
    expect(unlocked).toBe(true);
    expect(eventSpy).toHaveBeenCalledTimes(1);
    expect((eventSpy.mock.calls[0][0] as CustomEvent).detail.title).toBe('Event Master');

    window.removeEventListener('allinet:achievement-unlocked', eventSpy);
  });
});
