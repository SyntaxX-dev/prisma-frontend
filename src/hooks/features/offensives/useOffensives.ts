"use client";

import { useQuery } from '@tanstack/react-query';
import { getOffensives } from '@/api/offensives/get-offensives';
import { OffensivesData } from '@/types/offensives';
import { CACHE_TAGS } from '@/lib/cache/invalidate-tags';

export function useOffensives(enabled: boolean = true) {
  return useQuery({
    queryKey: [CACHE_TAGS.OFFENSIVES],
    queryFn: async (): Promise<OffensivesData> => {
      const response = await getOffensives();
      if (!response.success) {
        throw new Error('Erro ao buscar ofensivas');
      }
      return response.data;
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutos - dados considerados frescos
    gcTime: 30 * 60 * 1000, // 30 minutos - manter no cache
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Não refetch automático ao montar
    refetchOnReconnect: true, // Refetch apenas ao reconectar
    // Sempre permitir acesso aos dados do cache, mesmo quando disabled
    placeholderData: (previousData) => previousData,
  });
}