'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CACHE_TAGS, CacheInvalidation } from '@/lib/cache/invalidate-tags';
import { getCommunities } from '@/api/communities/get-communities';
import type { Community } from '@/types/community';

/**
 * Configuração de cache para comunidades
 * - staleTime: 3 minutos (dados considerados frescos)
 * - gcTime: 10 minutos (tempo no cache após não ser usado)
 */
const COMMUNITIES_CACHE_CONFIG = {
  staleTime: 3 * 60 * 1000, // 3 minutos
  gcTime: 10 * 60 * 1000,   // 10 minutos
  refetchOnWindowFocus: false,
  refetchOnMount: true,
};

/**
 * Hook para buscar lista de comunidades com cache
 *
 * Cenários de invalidação:
 * - Quando usuário cria uma nova comunidade
 * - Quando usuário entra em uma comunidade
 * - Quando usuário sai de uma comunidade
 * - Quando configurações de comunidade são alteradas
 */
export function useCommunities() {
  return useQuery({
    queryKey: [CACHE_TAGS.COMMUNITIES_LIST],
    queryFn: async (): Promise<Community[]> => {
      const response = await getCommunities();

      let communitiesData: Community[] = [];

      if (response.success) {
        if (Array.isArray(response.data)) {
          communitiesData = response.data;
        } else if (response.data && Array.isArray((response.data as any).communities)) {
          communitiesData = (response.data as any).communities;
        }
      }

      return communitiesData;
    },
    ...COMMUNITIES_CACHE_CONFIG,
  });
}

/**
 * Hook para buscar comunidades filtradas por participação
 */
export function useUserCommunities() {
  const { data: communities = [], ...rest } = useCommunities();

  const userCommunities = communities.filter(
    (c) => c.isMember || c.isOwner
  );

  return {
    data: userCommunities,
    ...rest,
  };
}

/**
 * Hook para gerenciar cache de comunidades
 */
export function useCommunitiesCache() {
  const queryClient = useQueryClient();

  return {
    /**
     * Invalidar cache de lista de comunidades
     * Use após criar, entrar ou sair de uma comunidade
     */
    invalidateList: () => CacheInvalidation.invalidateCommunities(queryClient),

    /**
     * Invalidar cache de uma comunidade específica
     * @param communityId - ID da comunidade
     */
    invalidateCommunity: (communityId: string) =>
      CacheInvalidation.invalidateCommunityById(queryClient, communityId),

    /**
     * Invalidar tudo relacionado a comunidades
     */
    invalidateAll: () => CacheInvalidation.invalidateCommunities(queryClient),

    /**
     * Prefetch de comunidades
     * Use para melhorar performance ao navegar
     */
    prefetch: () => {
      return queryClient.prefetchQuery({
        queryKey: [CACHE_TAGS.COMMUNITIES_LIST],
        queryFn: async () => {
          const response = await getCommunities();
          if (response.success) {
            if (Array.isArray(response.data)) {
              return response.data;
            } else if (response.data && Array.isArray((response.data as any).communities)) {
              return (response.data as any).communities;
            }
          }
          return [];
        },
        ...COMMUNITIES_CACHE_CONFIG,
      });
    },
  };
}
