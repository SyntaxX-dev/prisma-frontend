"use client";

import { useQueryClient } from '@tanstack/react-query';
import { 
  invalidateCacheTags, 
  invalidateCacheTagGroups, 
  invalidateAllCache,
  removeCacheQueries,
  clearAllCache,
  CacheInvalidation,
  CACHE_TAGS,
  CACHE_TAG_GROUPS,
  type CacheTag
} from '@/lib/cache/invalidate-tags';

/**
 * Hook para invalidação de cache do TanStack Query
 */
export function useCacheInvalidation() {
  const queryClient = useQueryClient();

  return {
    /**
     * Invalidar tags específicas
     */
    invalidateTags: (
      tags: CacheTag | CacheTag[],
      options?: {
        exact?: boolean;
        refetchType?: 'active' | 'inactive' | 'all' | 'none';
      }
    ) => {
      return invalidateCacheTags(queryClient, tags, options);
    },

    /**
     * Invalidar grupos de tags
     */
    invalidateGroups: (
      groups: (keyof typeof CACHE_TAG_GROUPS)[],
      options?: {
        exact?: boolean;
        refetchType?: 'active' | 'inactive' | 'all' | 'none';
      }
    ) => {
      return invalidateCacheTagGroups(queryClient, groups, options);
    },

    /**
     * Invalidar todas as queries
     */
    invalidateAll: () => {
      return invalidateAllCache(queryClient);
    },

    /**
     * Remover queries específicas do cache
     */
    removeQueries: (tags: CacheTag | CacheTag[]) => {
      return removeCacheQueries(queryClient, tags);
    },

    /**
     * Limpar todo o cache
     */
    clearAll: () => {
      return clearAllCache(queryClient);
    },

    /**
     * Funções específicas para casos comuns
     */
    profile: () => CacheInvalidation.invalidateProfile(queryClient),
    courses: () => CacheInvalidation.invalidateCourses(queryClient),
    offensives: () => CacheInvalidation.invalidateOffensives(queryClient),
    videos: () => CacheInvalidation.invalidateVideos(queryClient),
    progress: () => CacheInvalidation.invalidateProgress(queryClient),
    options: () => CacheInvalidation.invalidateOptions(queryClient),
    afterAuth: () => CacheInvalidation.invalidateAfterAuth(queryClient),
    
    /**
     * Invalidar por ID específico
     */
    byId: (tag: CacheTag, id: string) => {
      return CacheInvalidation.invalidateById(queryClient, tag, id);
    },

    /**
     * Acesso às constantes de tags
     */
    TAGS: CACHE_TAGS,
    TAG_GROUPS: CACHE_TAG_GROUPS,
  };
}

/**
 * Hook específico para invalidação de perfil
 */
export function useProfileCacheInvalidation() {
  const { invalidateTags, TAGS } = useCacheInvalidation();

  return {
    /**
     * Invalidar todo o cache do perfil
     */
    invalidateAll: () => {
      return invalidateTags([
        TAGS.PROFILE,
        TAGS.USER_PROFILE,
        TAGS.PROFILE_NOTIFICATIONS,
      ]);
    },

    /**
     * Invalidar apenas dados básicos do perfil
     */
    invalidateBasic: () => {
      return invalidateTags(TAGS.USER_PROFILE);
    },

    /**
     * Invalidar apenas notificações
     */
    invalidateNotifications: () => {
      return invalidateTags(TAGS.PROFILE_NOTIFICATIONS);
    },
  };
}

/**
 * Hook específico para invalidação de cursos
 */
export function useCoursesCacheInvalidation() {
  const { invalidateTags, TAGS } = useCacheInvalidation();

  return {
    /**
     * Invalidar todo o cache de cursos
     */
    invalidateAll: () => {
      return invalidateTags([
        TAGS.COURSES,
        TAGS.COURSES_ALL,
        TAGS.COURSES_SEARCH,
      ]);
    },

    /**
     * Invalidar apenas busca de cursos
     */
    invalidateSearch: () => {
      return invalidateTags(TAGS.COURSES_SEARCH);
    },

    /**
     * Invalidar apenas todos os cursos
     */
    invalidateAllCourses: () => {
      return invalidateTags(TAGS.COURSES_ALL);
    },
  };
}

/**
 * Hook específico para invalidação de ofensivas
 */
export function useOffensivesCacheInvalidation() {
  const { invalidateTags, TAGS } = useCacheInvalidation();

  return {
    /**
     * Invalidar todo o cache de ofensivas
     */
    invalidateAll: () => {
      return invalidateTags([
        TAGS.OFFENSIVES,
        TAGS.STREAK,
      ]);
    },

    /**
     * Invalidar apenas ofensivas
     */
    invalidateOffensives: () => {
      return invalidateTags(TAGS.OFFENSIVES);
    },

    /**
     * Invalidar apenas streak
     */
    invalidateStreak: () => {
      return invalidateTags(TAGS.STREAK);
    },
  };
}

/**
 * Hook específico para invalidação de progresso
 */
export function useProgressCacheInvalidation() {
  const { invalidateTags, TAGS } = useCacheInvalidation();

  return {
    /**
     * Invalidar todo o cache de progresso
     */
    invalidateAll: () => {
      return invalidateTags([
        TAGS.PROGRESS,
        TAGS.USER_PROGRESS,
        TAGS.COURSE_PROGRESS,
      ]);
    },

    /**
     * Invalidar apenas progresso do usuário
     */
    invalidateUserProgress: () => {
      return invalidateTags(TAGS.USER_PROGRESS);
    },

    /**
     * Invalidar apenas progresso do curso
     */
    invalidateCourseProgress: () => {
      return invalidateTags(TAGS.COURSE_PROGRESS);
    },
  };
}

/**
 * Exemplos de uso:
 * 
 * // Em um componente
 * const { invalidateTags, profile, courses } = useCacheInvalidation();
 * 
 * // Invalidar tags específicas
 * await invalidateTags([CACHE_TAGS.PROFILE, CACHE_TAGS.USER_PROFILE]);
 * 
 * // Usar funções específicas
 * await profile();
 * await courses();
 * 
 * // Hook específico para perfil
 * const { invalidateAll, invalidateBasic } = useProfileCacheInvalidation();
 * await invalidateAll();
 * await invalidateBasic();
 */
