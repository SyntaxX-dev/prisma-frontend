'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CACHE_TAGS, CacheInvalidation } from '@/lib/cache/invalidate-tags';
import { env } from '@/lib/env';

interface SubCourse {
  id: string;
  courseId: string;
  name: string;
  description: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  channelThumbnailUrl?: string;
}

interface SubCoursesResponse {
  success: boolean;
  data: SubCourse[];
}

/**
 * Configuração de cache para subcursos
 * - staleTime: 5 minutos (dados considerados frescos)
 * - gcTime: 15 minutos (tempo no cache após não ser usado)
 */
const SUBCOURSES_CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutos
  gcTime: 15 * 60 * 1000,   // 15 minutos
  refetchOnWindowFocus: false,
  refetchOnMount: true,
};

/**
 * Função para buscar subcursos de um curso
 */
async function fetchSubCourses(courseId: string): Promise<SubCourse[]> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/courses/${courseId}/sub-courses`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: SubCoursesResponse = await response.json();

  if (data.success) {
    return data.data;
  }

  return [];
}

/**
 * Hook para buscar subcursos de um curso com cache
 *
 * Cenários de invalidação:
 * - Quando novos subcursos são adicionados ao curso
 * - Quando subcursos são removidos
 * - Quando ordem dos subcursos é alterada
 *
 * @param courseId - ID do curso pai
 */
export function useSubCourses(courseId: string | undefined) {
  return useQuery({
    queryKey: [CACHE_TAGS.SUB_COURSES, courseId],
    queryFn: () => fetchSubCourses(courseId!),
    enabled: !!courseId,
    ...SUBCOURSES_CACHE_CONFIG,
  });
}

/**
 * Hook para gerenciar cache de subcursos
 */
export function useSubCoursesCache() {
  const queryClient = useQueryClient();

  return {
    /**
     * Invalidar cache de subcursos de um curso específico
     * @param courseId - ID do curso
     */
    invalidate: (courseId?: string) =>
      CacheInvalidation.invalidateSubCourses(queryClient, courseId),

    /**
     * Invalidar todo cache de cursos e subcursos
     */
    invalidateAll: () => CacheInvalidation.invalidateCourses(queryClient),

    /**
     * Prefetch de subcursos
     * @param courseId - ID do curso
     */
    prefetch: (courseId: string) => {
      return queryClient.prefetchQuery({
        queryKey: [CACHE_TAGS.SUB_COURSES, courseId],
        queryFn: () => fetchSubCourses(courseId),
        ...SUBCOURSES_CACHE_CONFIG,
      });
    },
  };
}
