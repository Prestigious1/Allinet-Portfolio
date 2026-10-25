import React from 'react';
import { useVisibleAchievements, useTotalPoints, useAchievementsStore } from '@/store/achievements.store';
import type { Achievement } from '@/store/achievements.store';

// Card component for a single achievement
const AchievementCard: React.FC<{ achievement: Achievement; onReveal?: () => void }> = ({ achievement, onReveal }) => {
  const { title, description, icon, rarity, secret, unlockedAt, points } = achievement;

  const bg = {
    common: 'bg-gray-800',
    uncommon: 'bg-blue-900',
    rare: 'bg-purple-900',
    legendary: 'bg-amber-900',
  }[rarity];

  const border = secret && !unlockedAt ? 'border-dashed border-2 border-gray-600' : 'border-2';

  return (
    <div className={`relative p-4 rounded-xl text-center text-white ${bg} ${border} hover:scale-105 transition-transform`}>
      {icon && <img src={icon} alt={title} className="mx-auto mb-2 w-12 h-12" />}
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-300">{description}</p>
      <p className="mt-1 text-xs">{points} pts</p>
      {secret && !unlockedAt && onReveal && (
        <button
          onClick={onReveal}
          className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl"
        >
          <span className="text-xs underline">Reveal</span>
        </button>
      )}
    </div>
  );
};

export const AchievementPanel: React.FC = () => {
  const achievements = useVisibleAchievements();
  const totalPoints = useTotalPoints();
  // Pull the raw action (not a hook) so it can safely be used inside .map()
  const revealSecret = useAchievementsStore((state) => state.revealSecret);

  return (
    <section className="p-6 bg-gray-900 rounded-xl shadow-xl">
      <header className="mb-4 text-center">
        <h2 className="text-2xl font-bold text-white">Achievements</h2>
        <p className="text-sm text-gray-400">Total Points: {totalPoints}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {achievements.map((a) => (
          <AchievementCard key={a.id} achievement={a} onReveal={() => revealSecret(a.id)} />
        ))}
      </div>
    </section>
  );
};
