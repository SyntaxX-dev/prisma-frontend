import { QueryClient } from '@tanstack/react-query';

/**
 * Tags de cache do TanStack Query para invalidação centralizada
 */
export const CACHE_TAGS = {
  // Perfil do usuário
  PROFILE: 'profile',
  USER_PROFILE: 'user-profile',
  PROFILE_NOTIFICATIONS: 'profile-notifications',
  
  // Cursos
  COURSES: 'courses',
  COURSES_ALL: 'courses-all',
  COURSES_SEARCH: 'courses-search',
  
  // Ofensivas/Streak
  OFFENSIVES: 'offensives',
  STREAK: 'streak',
  
  // Vídeos
  VIDEOS: 'videos',
  VIDEOS_BY_GUIDE: 'videos-by-guide',
  VIDEOS_BY_MODULE: 'videos-by-module',
  VIDEOS_WITH_PROGRESS: 'videos-with-progress',
  
  // Módulos
  MODULES: 'modules',
  MODULES_BY_SUBCOURSE: 'modules-by-subcourse',
  
  // Guias
  GUIDES: 'guides',
  GUIDE_LEVELS: 'guide-levels',
  
  // Níveis
  LEVELS: 'levels',
  
  // Progresso
  PROGRESS: 'progress',
  USER_PROGRESS: 'user-progress',
  COURSE_PROGRESS: 'course-progress',
  
  // Opções
  OPTIONS: 'options',
  COLLEGE_COURSE_OPTIONS: 'college-course-options',
  CONTEST_OPTIONS: 'contest-options',
} as const;

/**
 * Tipos para as tags de cache
 */
export type CacheTag = typeof CACHE_TAGS[keyof typeof CACHE_TAGS];

/**
 * Grupos de tags relacionadas para invalidação em lote
 */
export const CACHE_TAG_GROUPS = {
  // Tudo relacionado ao perfil
  PROFILE_ALL: [
    CACHE_TAGS.PROFILE,
    CACHE_TAGS.USER_PROFILE,
    CACHE_TAGS.PROFILE_NOTIFICATIONS,
  ],
  
  // Tudo relacionado a cursos
  COURSES_ALL: [
    CACHE_TAGS.COURSES,
    CACHE_TAGS.COURSES_ALL,
    CACHE_TAGS.COURSES_SEARCH,
  ],
  
  // Tudo relacionado a ofensivas
  OFFENSIVES_ALL: [
    CACHE_TAGS.OFFENSIVES,
    CACHE_TAGS.STREAK,
  ],
  
  // Tudo relacionado a vídeos
  VIDEOS_ALL: [
    CACHE_TAGS.VIDEOS,
    CACHE_TAGS.VIDEOS_BY_GUIDE,
    CACHE_TAGS.VIDEOS_BY_MODULE,
    CACHE_TAGS.VIDEOS_WITH_PROGRESS,
  ],
  
  // Tudo relacionado a progresso
  PROGRESS_ALL: [
    CACHE_TAGS.PROGRESS,
    CACHE_TAGS.USER_PROGRESS,
    CACHE_TAGS.COURSE_PROGRESS,
  ],
  
  // Tudo relacionado a opções
  OPTIONS_ALL: [
    CACHE_TAGS.OPTIONS,
    CACHE_TAGS.COLLEGE_COURSE_OPTIONS,
    CACHE_TAGS.CONTEST_OPTIONS,
  ],
} as const;

/**
 * Função para invalidar tags específicas
 */
export function invalidateCacheTags(
  queryClient: QueryClient,
  tags: CacheTag | CacheTag[],
  options?: {
    exact?: boolean;
    refetchType?: 'active' | 'inactive' | 'all' | 'none';
  }
) {
  const tagsArray = Array.isArray(tags) ? tags : [tags];
  
  return queryClient.invalidateQueries({
    queryKey: tagsArray,
    exact: options?.exact || false,
    refetchType: options?.refetchType || 'active',
  });
}

/**
 * Função para invalidar grupos de tags
 */
export function invalidateCacheTagGroups(
  queryClient: QueryClient,
  groups: (keyof typeof CACHE_TAG_GROUPS)[],
  options?: {
    exact?: boolean;
    refetchType?: 'active' | 'inactive' | 'all' | 'none';
  }
) {
  const allTags = groups.flatMap(group => CACHE_TAG_GROUPS[group]);
  
  return queryClient.invalidateQueries({
    queryKey: allTags,
    exact: options?.exact || false,
    refetchType: options?.refetchType || 'active',
  });
}

/**
 * Função para invalidar todas as queries
 */
export function invalidateAllCache(queryClient: QueryClient) {
  return queryClient.invalidateQueries();
}

/**
 * Função para remover queries específicas do cache
 */
export function removeCacheQueries(
  queryClient: QueryClient,
  tags: CacheTag | CacheTag[]
) {
  const tagsArray = Array.isArray(tags) ? tags : [tags];
  
  return queryClient.removeQueries({
    queryKey: tagsArray,
  });
}

/**
 * Função para limpar todo o cache
 */
export function clearAllCache(queryClient: QueryClient) {
  return queryClient.clear();
}

/**
 * Funções específicas para casos comuns
 */
export const CacheInvalidation = {
  /**
   * Invalidar cache do perfil após atualizações
   */
  invalidateProfile: (queryClient: QueryClient) => {
    return invalidateCacheTagGroups(queryClient, ['PROFILE_ALL']);
  },
  
  /**
   * Invalidar cache de cursos após mudanças
   */
  invalidateCourses: (queryClient: QueryClient) => {
    return invalidateCacheTagGroups(queryClient, ['COURSES_ALL']);
  },
  
  /**
   * Invalidar cache de ofensivas após mudanças
   */
  invalidateOffensives: (queryClient: QueryClient) => {
    return invalidateCacheTagGroups(queryClient, ['OFFENSIVES_ALL']);
  },
  
  /**
   * Invalidar cache de vídeos após mudanças
   */
  invalidateVideos: (queryClient: QueryClient) => {
    return invalidateCacheTagGroups(queryClient, ['VIDEOS_ALL']);
  },
  
  /**
   * Invalidar cache de progresso após mudanças
   */
  invalidateProgress: (queryClient: QueryClient) => {
    return invalidateCacheTagGroups(queryClient, ['PROGRESS_ALL']);
  },
  
  /**
   * Invalidar cache de opções após mudanças
   */
  invalidateOptions: (queryClient: QueryClient) => {
    return invalidateCacheTagGroups(queryClient, ['OPTIONS_ALL']);
  },
  
  /**
   * Invalidar cache após login/logout
   */
  invalidateAfterAuth: (queryClient: QueryClient) => {
    return invalidateAllCache(queryClient);
  },
  
  /**
   * Invalidar cache específico por ID
   */
  invalidateById: (queryClient: QueryClient, tag: CacheTag, id: string) => {
    return queryClient.invalidateQueries({
      queryKey: [tag, id],
    });
  },
};

/**
 * Hook para usar invalidação de cache em componentes
 */
export function useCacheInvalidation() {
  // Esta função pode ser expandida para incluir o queryClient
  // quando usado dentro de componentes React
  return {
    invalidateTags: invalidateCacheTags,
    invalidateGroups: invalidateCacheTagGroups,
    invalidateAll: invalidateAllCache,
    removeQueries: removeCacheQueries,
    clearAll: clearAllCache,
    ...CacheInvalidation,
  };
}

/**
 * Exemplos de uso:
 * 
 * // Invalidar tags específicas
 * invalidateCacheTags(queryClient, [CACHE_TAGS.PROFILE, CACHE_TAGS.USER_PROFILE]);
 * 
 * // Invalidar grupos
 * invalidateCacheTagGroups(queryClient, ['PROFILE_ALL', 'COURSES_ALL']);
 * 
 * // Usar funções específicas
 * CacheInvalidation.invalidateProfile(queryClient);
 * CacheInvalidation.invalidateCourses(queryClient);
 * 
 * // Invalidar por ID
 * CacheInvalidation.invalidateById(queryClient, CACHE_TAGS.VIDEOS, 'video-123');
 */
