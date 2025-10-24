"use client";

import { useQuery } from '@tanstack/react-query';
import { getOffensives } from '@/api/offensives/get-offensives';
import { OffensivesData } from '@/types/offensives';

export function useOffensives() {
  return useQuery({
    queryKey: ['offensives'],
    queryFn: async (): Promise<OffensivesData> => {
      const response = await getOffensives();
      if (!response.success) {
        throw new Error('Erro ao buscar ofensivas');
      }
      return response.data;
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}