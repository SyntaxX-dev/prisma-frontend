"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';

// Schema de validação para search params
const searchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  level: z.enum(['Iniciante', 'Intermediário', 'Avançado']).optional(),
  technology: z.string().optional(),
  year: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  sort: z.enum(['title', 'year', 'level', 'createdAt']).default('title'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

type SearchParams = z.infer<typeof searchParamsSchema>;

// Função para validar search params
function validateSearchParams(params: Record<string, string | string[] | undefined>): SearchParams {
  try {
    console.log('🔍 Validando search params:', params);
    const result = searchParamsSchema.parse(params);
    console.log('✅ Search params validados:', result);
    return result;
  } catch (error) {
    console.warn('❌ Erro na validação dos search params:', error);
    const defaultResult = searchParamsSchema.parse({});
    console.log('🔄 Usando search params padrão:', defaultResult);
    return defaultResult;
  }
}

// Função para criar URL com search params
function createSearchUrl(basePath: string, params: Partial<SearchParams>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.set(key, String(value));
      }
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function useSearch() {
  const router = useRouter();
  const nextSearchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Parse e valida os search params atuais
  const currentParams = validateSearchParams(
    Object.fromEntries(nextSearchParams.entries())
  );

  const [searchQuery, setSearchQuery] = useState(currentParams.q || '');

  useEffect(() => {
    setSearchQuery(currentParams.q || '');
  }, [currentParams.q]);

  // Função para atualizar search params
  const updateSearchParams = useCallback((
    updates: Partial<SearchParams> | ((prev: SearchParams) => Partial<SearchParams>)
  ) => {
    const newParams = typeof updates === 'function' 
      ? { ...currentParams, ...updates(currentParams) }
      : { ...currentParams, ...updates };

    // Cria a nova URL
    const newUrl = createSearchUrl('/dashboard', newParams);
    
    // Debounce para evitar muitas navegações
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setIsLoading(true);
    
    debounceRef.current = setTimeout(() => {
      router.push(newUrl);
      setIsLoading(false);
    }, 500);
  }, [currentParams, router]);

  // Função para atualizar apenas a query de busca (compatibilidade com código existente)
  const updateSearch = useCallback((query: string) => {
    setSearchQuery(query);
    updateSearchParams({ q: query || undefined });
  }, [updateSearchParams]);

  // Função para limpar todos os search params
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setIsLoading(false);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    router.replace('/dashboard', { scroll: false });
  }, [router]);

  // Função para resetar para valores padrão
  const resetSearchParams = useCallback(() => {
    const defaultParams = searchParamsSchema.parse({});
    const newUrl = createSearchUrl('/dashboard', defaultParams);
    router.push(newUrl);
  }, [router]);

  // Cleanup do debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    // Compatibilidade com código existente
    searchQuery,
    updateSearch,
    clearSearch,
    isSearching: searchQuery.length > 0,
    isLoading,
    
    // Novas funcionalidades
    searchParams: currentParams,
    updateSearchParams,
    resetSearchParams,
  };
}
