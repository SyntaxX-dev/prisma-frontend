'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CACHE_TAGS, CacheInvalidation } from '@/lib/cache/invalidate-tags';
import { getInProgressVideos, InProgressVideo } from '@/api/progress/get-in-progress-videos';

/**
 * Configuração de cache para vídeos em progresso
 * - staleTime: 2 minutos (dados considerados frescos)
 * - gcTime: 10 minutos (tempo no cache após não ser usado)
 */
const WATCHING_CACHE_CONFIG = {
  staleTime: 2 * 60 * 1000, // 2 minutos
  gcTime: 10 * 60 * 1000,   // 10 minutos
  refetchOnWindowFocus: false,
  refetchOnMount: true,
};

/**
 * Hook para buscar vídeos em progresso com cache
 *
 * Cenários de invalidação:
 * - Quando usuário começa a assistir um novo vídeo
 * - Quando usuário para de assistir um vídeo
 * - Quando progresso de vídeo é atualizado
 * - Quando vídeo é marcado como completo
 */
export function useInProgressVideos() {
  return useQuery({
    queryKey: [CACHE_TAGS.IN_PROGRESS_VIDEOS],
    queryFn: async (): Promise<InProgressVideo[]> => {
      const response = await getInProgressVideos();
      return response.data.videos;
    },
    ...WATCHING_CACHE_CONFIG,
  });
}

/**
 * Hook para gerenciar cache de watching
 */
export function useWatchingCache() {
  const queryClient = useQueryClient();

  return {
    /**
     * Invalidar cache de vídeos em progresso
     * Use após atualizar progresso de vídeo
     */
    invalidate: () => CacheInvalidation.invalidateWatching(queryClient),

    /**
     * Invalidar cache após completar vídeo
     * Invalida watching + progress + offensives
     */
    invalidateAfterCompletion: () => CacheInvalidation.invalidateVideoCompletion(queryClient),

    /**
     * Invalidar cache após ação de vídeo
     * Invalida watching + progress + offensives + dashboard
     */
    invalidateAfterVideoAction: () => CacheInvalidation.invalidateAfterVideoAction(queryClient),

    /**
     * Prefetch de vídeos em progresso
     * Use para melhorar performance ao navegar
     */
    prefetch: () => {
      return queryClient.prefetchQuery({
        queryKey: [CACHE_TAGS.IN_PROGRESS_VIDEOS],
        queryFn: async () => {
          const response = await getInProgressVideos();
          return response.data.videos;
        },
        ...WATCHING_CACHE_CONFIG,
      });
    },
  };
}
