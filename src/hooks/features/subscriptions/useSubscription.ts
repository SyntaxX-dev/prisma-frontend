'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CACHE_TAGS, CacheInvalidation } from '@/lib/cache/invalidate-tags';
import { getSubscription } from '@/api/subscriptions/get-subscription';

/**
 * Configuração de cache para assinaturas
 * - staleTime: 5 minutos (dados considerados frescos)
 * - gcTime: 15 minutos (tempo no cache após não ser usado)
 */
const SUBSCRIPTION_CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutos
  gcTime: 15 * 60 * 1000,   // 15 minutos
  refetchOnWindowFocus: false,
  refetchOnMount: true,
};

/**
 * Hook para buscar dados de assinatura do usuário com cache
 *
 * Cenários de invalidação:
 * - Quando usuário troca de plano
 * - Quando pagamento é processado
 * - Quando assinatura é cancelada
 * - Quando mudança de plano pendente é cancelada
 */
export function useSubscription() {
  return useQuery({
    queryKey: [CACHE_TAGS.SUBSCRIPTION],
    queryFn: async () => {
      const response = await getSubscription();
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    },
    ...SUBSCRIPTION_CACHE_CONFIG,
  });
}

/**
 * Hook para gerenciar cache de assinatura
 */
export function useSubscriptionCache() {
  const queryClient = useQueryClient();

  return {
    /**
     * Invalidar cache de assinatura
     * Use após trocar de plano, cancelar ou pagar
     */
    invalidate: () => CacheInvalidation.invalidateSubscription(queryClient),

    /**
     * Prefetch de dados de assinatura
     */
    prefetch: () => {
      return queryClient.prefetchQuery({
        queryKey: [CACHE_TAGS.SUBSCRIPTION],
        queryFn: async () => {
          const response = await getSubscription();
          if (response.success && response.data) {
            return response.data;
          }
          return null;
        },
        ...SUBSCRIPTION_CACHE_CONFIG,
      });
    },
  };
}
