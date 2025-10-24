import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOffensives } from '../api/offensives/get-offensives';
import { OffensivesData, OffensiveHistory } from '../types/offensives';

export function useOffensives() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['offensives'],
    queryFn: getOffensives,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });


  const [offensivesData, setOffensivesData] = useState<OffensivesData | null>(null);

  useEffect(() => {
    if (data?.success && data.data) {
      setOffensivesData(data.data);
    }
  }, [data]);

  const getOffensiveForDate = (date: Date): OffensiveHistory | null => {
    if (!offensivesData?.history) return null;
    
    const dateString = date.toISOString().split('T')[0];
    return offensivesData.history.find(offensive => 
      offensive.date.startsWith(dateString)
    ) || null;
  };

  const hasOffensiveOnDay = (date: Date): boolean => {
    // Verificar histórico primeiro
    const offensive = getOffensiveForDate(date);
    if (offensive?.hasOffensive) {
      return true;
    }
    
    // Verificar se é o dia atual da ofensiva
    if (offensivesData?.currentOffensive) {
      const currentOffensiveDate = new Date(offensivesData.currentOffensive.lastVideoCompletedAt);
      
      // Normalizar as datas para comparação (remover horas, minutos, segundos)
      const checkDateStr = date.toISOString().split('T')[0];
      const offensiveDateStr = currentOffensiveDate.toISOString().split('T')[0];
      
      if (checkDateStr === offensiveDateStr) {
        return true;
      }
    }
    
    return false;
  };

  const getOffensiveTypeForDay = (date: Date): string | null => {
    // Verificar histórico primeiro
    const offensive = getOffensiveForDate(date);
    if (offensive?.type) {
      return offensive.type;
    }
    
    // Verificar se é o dia atual da ofensiva
    if (offensivesData?.currentOffensive) {
      const currentOffensiveDate = new Date(offensivesData.currentOffensive.lastVideoCompletedAt);
      
      // Normalizar as datas para comparação (remover horas, minutos, segundos)
      const checkDateStr = date.toISOString().split('T')[0];
      const offensiveDateStr = currentOffensiveDate.toISOString().split('T')[0];
      
      if (checkDateStr === offensiveDateStr) {
        return offensivesData.currentOffensive.type;
      }
    }
    
    return null;
  };

  const getOffensivesInMonth = (year: number, month: number): OffensiveHistory[] => {
    if (!offensivesData?.history) return [];
    
    const historyOffensives = offensivesData.history.filter(offensive => {
      const offensiveDate = new Date(offensive.date);
      return offensiveDate.getUTCFullYear() === year && 
             offensiveDate.getUTCMonth() === month;
    });

    // Adicionar a ofensiva atual se estiver no mês
    if (offensivesData.currentOffensive) {
      const currentOffensiveDate = new Date(offensivesData.currentOffensive.lastVideoCompletedAt);
      if (currentOffensiveDate.getUTCFullYear() === year && 
          currentOffensiveDate.getUTCMonth() === month) {
        
        // Verificar se já não está no histórico
        const currentDateString = currentOffensiveDate.toISOString().split('T')[0];
        const alreadyInHistory = historyOffensives.some(offensive => 
          offensive.date.startsWith(currentDateString)
        );
        
        if (!alreadyInHistory) {
          historyOffensives.push({
            date: currentOffensiveDate.toISOString(),
            hasOffensive: true,
            type: offensivesData.currentOffensive.type
          });
        }
      }
    }

    return historyOffensives;
  };

  const getConsecutiveOffensiveDays = (): Date[] => {
    if (!offensivesData?.currentOffensive) {
      return [];
    }
    
    const days: Date[] = [];
    const startDate = new Date(offensivesData.currentOffensive.streakStartDate);
    const consecutiveDays = offensivesData.currentOffensive.consecutiveDays;
    
    // Adicionar todos os dias consecutivos da ofensiva atual
    for (let i = 0; i < consecutiveDays; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  return {
    offensivesData,
    isLoading,
    error,
    refetch,
    getOffensiveForDate,
    hasOffensiveOnDay,
    getOffensiveTypeForDay,
    getOffensivesInMonth,
    getConsecutiveOffensiveDays,
  };
}
