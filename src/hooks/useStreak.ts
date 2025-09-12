import { useState, useEffect } from 'react';

interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastStudyDate: string | null;
  isActive: boolean;
}

export function useStreak() {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    bestStreak: 0,
    lastStudyDate: null,
    isActive: false
  });

  useEffect(() => {
    const mockData: StreakData = {
      currentStreak: 0,
      bestStreak: 13,
      lastStudyDate: null,
      isActive: false
    };

    setStreakData(mockData);
  }, []);

  const checkStreakStatus = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (!streakData.lastStudyDate) {
      return false;
    }

    if (streakData.lastStudyDate === today) {
      return true;
    }

    if (streakData.lastStudyDate === yesterday) {
      return true;
    }

    return false;
  };

  const addStudyDay = () => {
    const today = new Date().toISOString().split('T')[0];
    
    setStreakData(prev => {
      const isNewDay = prev.lastStudyDate !== today;
      
      if (isNewDay) {
        return {
          ...prev,
          currentStreak: prev.currentStreak + 1,
          bestStreak: Math.max(prev.bestStreak, prev.currentStreak + 1),
          lastStudyDate: today,
          isActive: true
        };
      }
      
      return prev;
    });
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
