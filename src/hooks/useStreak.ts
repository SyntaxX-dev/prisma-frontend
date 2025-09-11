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

  // Mock data - em produção viria de uma API
  useEffect(() => {
    // Simula dados mockados baseados no sistema de ofensiva
    const mockData: StreakData = {
      currentStreak: 0, // Usuário não tem ofensiva ativa
      bestStreak: 13, // Melhor ofensiva foi de 13 dias
      lastStudyDate: null, // Não estudou recentemente
      isActive: false // Ofensiva inativa
    };

    setStreakData(mockData);
  }, []);

  // Função para verificar se a ofensiva está ativa
  const checkStreakStatus = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (!streakData.lastStudyDate) {
      return false;
    }

    // Se estudou hoje, ofensiva ativa
    if (streakData.lastStudyDate === today) {
      return true;
    }

    // Se estudou ontem, ofensiva ainda ativa
    if (streakData.lastStudyDate === yesterday) {
      return true;
    }

    // Se não estudou nos últimos 2 dias, ofensiva quebrada
    return false;
  };

  // Função para adicionar um dia de estudo
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

  // Função para quebrar a ofensiva
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
