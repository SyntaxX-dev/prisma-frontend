"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, useEffect } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryProvider configurado para cache persistente entre navegações
 *
 * Configurações:
 * - staleTime: 2 minutos - dados considerados frescos (não refetch automático)
 * - gcTime: 10 minutos - dados mantidos no cache após não serem usados
 * - refetchOnWindowFocus: false - não refetch ao focar janela
 * - refetchOnMount: 'always' - verifica cache mas permite revalidação
 *
 * O cache será mantido enquanto o usuário navegar entre páginas,
 * mas será invalidado em cenários específicos via CacheInvalidation.
 *
 * Cenários de invalidação:
 * - Após ações que modificam dados (criar, editar, deletar)
 * - Após login/logout
 * - Após completar vídeos
 * - Após gerar conteúdo com IA
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Dados considerados frescos por 2 minutos
            // Durante este período, não há refetch automático ao montar componente
            staleTime: 2 * 60 * 1000,

            // Dados mantidos no cache por 10 minutos após não serem usados
            // Permite cache ao recarregar a página se o tempo não expirou
            gcTime: 10 * 60 * 1000,

            // Número de tentativas em caso de erro
            retry: 1,

            // Não refetch ao focar a janela (evita requests desnecessários)
            refetchOnWindowFocus: false,

            // Verifica cache ao montar, mas permite revalidação se stale
            refetchOnMount: true,

            // Não refetch ao reconectar (evita requests em redes instáveis)
            refetchOnReconnect: false,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  // Limpar cache ao fazer logout (detectar remoção do token)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' && e.newValue === null) {
        // Token foi removido (logout), limpar todo o cache
        queryClient.clear();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
