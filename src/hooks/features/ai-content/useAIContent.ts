'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CACHE_TAGS, CacheInvalidation } from '@/lib/cache/invalidate-tags';
import { listUserMindMaps, MindMapData } from '@/api/mind-map/generate-mind-map';

/**
 * Configuração de cache para conteúdo gerado por IA
 * - staleTime: 5 minutos (dados considerados frescos)
 * - gcTime: 15 minutos (tempo no cache após não ser usado)
 */
const AI_CONTENT_CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutos
  gcTime: 15 * 60 * 1000,   // 15 minutos
  refetchOnWindowFocus: false,
  refetchOnMount: true,
};

/**
 * Hook para buscar resumos do usuário com cache
 *
 * Cenários de invalidação:
 * - Quando usuário gera um novo resumo
 * - Quando usuário deleta um resumo
 */
export function useMySummaries() {
  return useQuery({
    queryKey: [CACHE_TAGS.MY_SUMMARIES],
    queryFn: async (): Promise<MindMapData[]> => {
      const response = await listUserMindMaps();
      if (response.success && response.data && Array.isArray(response.data.mindMaps)) {
        // Filtrar apenas resumos de texto
        return response.data.mindMaps.filter(
          (map) => map.generationType === 'text'
        );
      }
      return [];
    },
    ...AI_CONTENT_CACHE_CONFIG,
  });
}

/**
 * Hook para buscar mapas mentais do usuário com cache
 *
 * Cenários de invalidação:
 * - Quando usuário gera um novo mapa mental
 * - Quando usuário deleta um mapa mental
 */
export function useMyMindMaps() {
  return useQuery({
    queryKey: [CACHE_TAGS.MY_MIND_MAPS],
    queryFn: async (): Promise<MindMapData[]> => {
      const response = await listUserMindMaps();
      if (response.success && response.data && Array.isArray(response.data.mindMaps)) {
        // Filtrar apenas mapas mentais
        return response.data.mindMaps.filter(
          (map) => (map.generationType || 'mindmap') === 'mindmap'
        );
      }
      return [];
    },
    ...AI_CONTENT_CACHE_CONFIG,
  });
}

/**
 * Hook para buscar todo conteúdo gerado por IA
 */
export function useAllAIContent() {
  return useQuery({
    queryKey: [CACHE_TAGS.AI_GENERATED_CONTENT],
    queryFn: async (): Promise<{ summaries: MindMapData[]; mindMaps: MindMapData[] }> => {
      const response = await listUserMindMaps();
      if (response.success && response.data && Array.isArray(response.data.mindMaps)) {
        const summaries = response.data.mindMaps.filter(
          (map) => map.generationType === 'text'
        );
        const mindMaps = response.data.mindMaps.filter(
          (map) => (map.generationType || 'mindmap') === 'mindmap'
        );
        return { summaries, mindMaps };
      }
      return { summaries: [], mindMaps: [] };
    },
    ...AI_CONTENT_CACHE_CONFIG,
  });
}

/**
 * Hook para gerenciar cache de conteúdo IA
 */
export function useAIContentCache() {
  const queryClient = useQueryClient();

  return {
    /**
     * Invalidar cache de resumos
     * Use após gerar ou deletar um resumo
     */
    invalidateSummaries: () => CacheInvalidation.invalidateSummaries(queryClient),

    /**
     * Invalidar cache de mapas mentais
     * Use após gerar ou deletar um mapa mental
     */
    invalidateMindMaps: () => CacheInvalidation.invalidateMindMaps(queryClient),

    /**
     * Invalidar todo cache de conteúdo IA
     */
    invalidateAll: () => CacheInvalidation.invalidateAIContent(queryClient),

    /**
     * Invalidar após geração de conteúdo
     * @param type - 'summary' ou 'mindmap'
     */
    invalidateAfterGeneration: (type: 'summary' | 'mindmap') =>
      CacheInvalidation.invalidateAfterAIGeneration(queryClient, type),

    /**
     * Prefetch de resumos
     */
    prefetchSummaries: () => {
      return queryClient.prefetchQuery({
        queryKey: [CACHE_TAGS.MY_SUMMARIES],
        queryFn: async () => {
          const response = await listUserMindMaps();
          if (response.success && response.data && Array.isArray(response.data.mindMaps)) {
            return response.data.mindMaps.filter((map) => map.generationType === 'text');
          }
          return [];
        },
        ...AI_CONTENT_CACHE_CONFIG,
      });
    },

    /**
     * Prefetch de mapas mentais
     */
    prefetchMindMaps: () => {
      return queryClient.prefetchQuery({
        queryKey: [CACHE_TAGS.MY_MIND_MAPS],
        queryFn: async () => {
          const response = await listUserMindMaps();
          if (response.success && response.data && Array.isArray(response.data.mindMaps)) {
            return response.data.mindMaps.filter(
              (map) => (map.generationType || 'mindmap') === 'mindmap'
            );
          }
          return [];
        },
        ...AI_CONTENT_CACHE_CONFIG,
      });
    },
  };
}
