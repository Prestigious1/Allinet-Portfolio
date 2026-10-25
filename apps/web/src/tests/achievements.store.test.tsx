import { act, renderHook } from '@testing-library/react';
import { useAchievementsStore, useVisibleAchievements } from '@/store/achievements.store';
import type { Achievement } from '@/store/achievements.store';

const sample: Achievement[] = [
  {
    id: 'first',
    title: 'First Steps',
    description: 'Unlock the first achievement.',
    icon: '/icons/first.svg',
    rarity: 'common',
    points: 10,
    unlockedAt: undefined,
  },
  {
    id: 'secret',
    title: 'Hidden Gem',
    description: 'A secret achievement.',
    icon: '/icons/secret.svg',
    rarity: 'legendary',
    secret: true,
    points: 100,
    unlockedAt: undefined,
  },
];

describe('Achievements store', () => {
  beforeEach(() => {
    act(() => {
      // Clear any persisted data then fully reset state
      useAchievementsStore.persist.clearStorage();
      useAchievementsStore.setState({
        achievements: {},
        totalPoints: 0,
        unlockedCount: 0,
      });
      // Register fresh copies so previous tests cannot mutate them
      useAchievementsStore.getState().registerAchievements(
        sample.map(a => ({ ...a }))
      );
    });
  });

  test('registers achievements', () => {
    const store = useAchievementsStore.getState();
    expect(Object.keys(store.achievements)).toHaveLength(2);
  });

  test('unlocks achievement and updates totals', () => {
    act(() => {
      const ok = useAchievementsStore.getState().unlockAchievement('first');
      expect(ok).toBe(true);
    });
    const store = useAchievementsStore.getState();
    expect(store.achievements.first.unlockedAt).toBeDefined();
    expect(store.totalPoints).toBe(10);
    expect(store.unlockedCount).toBe(1);
  });

  test('does not unlock secret achievement directly', () => {
    act(() => {
      const ok = useAchievementsStore.getState().unlockAchievement('secret');
      expect(ok).toBe(false);
    });
    const store = useAchievementsStore.getState();
    expect(store.achievements.secret.unlockedAt).toBeUndefined();
  });

  test('revealSecret removes secret flag', () => {
    act(() => {
      useAchievementsStore.getState().revealSecret('secret');
    });
    const ach = useAchievementsStore.getState().achievements.secret;
    expect(ach.secret).toBeFalsy();
  });

  test('selectors return proper data', () => {
    const { result: totalResult } = renderHook(() => useAchievementsStore(state => state.totalPoints));
    const { result: visibleResult } = renderHook(() => useVisibleAchievements());
    expect(totalResult.current).toBe(0);
    // Only non‑secret achievements should be visible initially
    expect(visibleResult.current).toHaveLength(1);
  });
});
