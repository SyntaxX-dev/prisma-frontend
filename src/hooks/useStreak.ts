import { useState, useEffect } from 'react';
import { useOffensives } from './useOffensives';

interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastStudyDate: string | null;
  isActive: boolean;
}

export function useStreak() {
  const { data: offensivesData, isLoading } = useOffensives();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    bestStreak: 0,
    lastStudyDate: null,
    isActive: false
  });

  useEffect(() => {
    if (offensivesData && !isLoading) {
      const newStreakData: StreakData = {
        currentStreak: offensivesData.stats.currentStreak,
        bestStreak: offensivesData.stats.longestStreak,
        lastStudyDate: offensivesData.currentOffensive?.lastVideoCompletedAt || null,
        isActive: offensivesData.stats.currentStreak > 0
      };

      setStreakData(newStreakData);
    }
  }, [offensivesData, isLoading]);

  const checkStreakStatus = () => {
    if (!offensivesData) {
      return false;
    }
    return offensivesData.stats.currentStreak > 0;
  };

  const addStudyDay = () => {
    setStreakData(prev => ({
      ...prev,
      currentStreak: prev.currentStreak + 1,
      bestStreak: Math.max(prev.bestStreak, prev.currentStreak + 1),
      lastStudyDate: new Date().toISOString(),
      isActive: true
    }));
  };

  const breakStreak = () => {
    setStreakData(prev => ({
      ...prev,
      currentStreak: 0,
      isActive: false
    }));
  };

  return {
    streakData,
    isStreakActive: checkStreakStatus(),
    addStudyDay,
    breakStreak
  };
}
