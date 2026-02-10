import { QueryClient } from '@tanstack/react-query';

/**
 * Tags de cache do TanStack Query para invalidação centralizada
 *
 * GUIA DE USO:
 * - Cada tag representa um tipo de dado que pode ser cacheado
 * - Use tags específicas para invalidações granulares
 * - Use grupos para invalidações em lote relacionadas
 */
export const CACHE_TAGS = {
  // ==================== PERFIL DO USUÁRIO ====================
  PROFILE: 'profile',
  USER_PROFILE: 'user-profile',
  PROFILE_NOTIFICATIONS: 'profile-notifications',
  USER_SETTINGS: 'user-settings',

  // ==================== DASHBOARD ====================
  DASHBOARD: 'dashboard',
  DASHBOARD_STATS: 'dashboard-stats',
  DASHBOARD_RECENT: 'dashboard-recent',

  // ==================== CURSOS ====================
  COURSES: 'courses',
  COURSES_ALL: 'courses-all',
  COURSES_SEARCH: 'courses-search',
  COURSE_DETAIL: 'course-detail',
  SUB_COURSES: 'sub-courses',
  PRODUCER_COURSES: 'producer-courses',

  // ==================== COMUNIDADES ====================
  COMMUNITIES: 'communities',
  COMMUNITIES_LIST: 'communities-list',
  COMMUNITY_DETAIL: 'community-detail',
  COMMUNITY_MESSAGES: 'community-messages',
  COMMUNITY_MEMBERS: 'community-members',

  // ==================== WATCHING (EM PROGRESSO) ====================
  WATCHING: 'watching',
  IN_PROGRESS_VIDEOS: 'in-progress-videos',
  CONTINUE_WATCHING: 'continue-watching',

  // ==================== RESUMOS E MAPAS MENTAIS ====================
  SUMMARIES: 'summaries',
  MY_SUMMARIES: 'my-summaries',
  MIND_MAPS: 'mind-maps',
  MY_MIND_MAPS: 'my-mind-maps',
  AI_GENERATED_CONTENT: 'ai-generated-content',

  // ==================== QUESTÕES E QUIZ ====================
  QUESTIONS: 'questions',
  QUIZ_SESSIONS: 'quiz-sessions',
  QUIZ_RESULTS: 'quiz-results',

  // ==================== OFENSIVAS/STREAK ====================
  OFFENSIVES: 'offensives',
  STREAK: 'streak',
  DAILY_PROGRESS: 'daily-progress',

  // ==================== VÍDEOS ====================
  VIDEOS: 'videos',
  VIDEOS_BY_GUIDE: 'videos-by-guide',
  VIDEOS_BY_MODULE: 'videos-by-module',
  VIDEOS_WITH_PROGRESS: 'videos-with-progress',
  VIDEO_PROGRESS: 'video-progress',

  // ==================== MÓDULOS ====================
  MODULES: 'modules',
  MODULES_BY_SUBCOURSE: 'modules-by-subcourse',
  MODULE_VIDEOS: 'module-videos',

  // ==================== GUIAS ====================
  GUIDES: 'guides',
  GUIDE_LEVELS: 'guide-levels',
  GUIDE_DETAIL: 'guide-detail',

  // ==================== NÍVEIS ====================
  LEVELS: 'levels',
  LEVEL_DETAIL: 'level-detail',

  // ==================== PROGRESSO ====================
  PROGRESS: 'progress',
  USER_PROGRESS: 'user-progress',
  COURSE_PROGRESS: 'course-progress',
  SUBCOURSE_PROGRESS: 'subcourse-progress',

  // ==================== ASSINATURAS ====================
  SUBSCRIPTION: 'subscription',
  SUBSCRIPTION_PLANS: 'subscription-plans',
  PAYMENT_HISTORY: 'payment-history',

  // ==================== MENSAGENS E CHAT ====================
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
  DIRECT_MESSAGES: 'direct-messages',

  // ==================== NOTIFICAÇÕES ====================
  NOTIFICATIONS: 'notifications',
  UNREAD_NOTIFICATIONS: 'unread-notifications',

  // ==================== OPÇÕES ====================
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
    CACHE_TAGS.USER_SETTINGS,
  ],

  // Tudo relacionado ao dashboard
  DASHBOARD_ALL: [
    CACHE_TAGS.DASHBOARD,
    CACHE_TAGS.DASHBOARD_STATS,
    CACHE_TAGS.DASHBOARD_RECENT,
    CACHE_TAGS.COURSES_ALL,
    CACHE_TAGS.PRODUCER_COURSES,
  ],

  // Tudo relacionado a cursos
  COURSES_ALL: [
    CACHE_TAGS.COURSES,
    CACHE_TAGS.COURSES_ALL,
    CACHE_TAGS.COURSES_SEARCH,
    CACHE_TAGS.COURSE_DETAIL,
    CACHE_TAGS.SUB_COURSES,
    CACHE_TAGS.PRODUCER_COURSES,
  ],

  // Tudo relacionado a comunidades
  COMMUNITIES_ALL: [
    CACHE_TAGS.COMMUNITIES,
    CACHE_TAGS.COMMUNITIES_LIST,
    CACHE_TAGS.COMMUNITY_DETAIL,
    CACHE_TAGS.COMMUNITY_MESSAGES,
    CACHE_TAGS.COMMUNITY_MEMBERS,
  ],

  // Tudo relacionado a watching/em progresso
  WATCHING_ALL: [
    CACHE_TAGS.WATCHING,
    CACHE_TAGS.IN_PROGRESS_VIDEOS,
    CACHE_TAGS.CONTINUE_WATCHING,
    CACHE_TAGS.VIDEO_PROGRESS,
  ],

  // Tudo relacionado a resumos e mapas mentais
  AI_CONTENT_ALL: [
    CACHE_TAGS.SUMMARIES,
    CACHE_TAGS.MY_SUMMARIES,
    CACHE_TAGS.MIND_MAPS,
    CACHE_TAGS.MY_MIND_MAPS,
    CACHE_TAGS.AI_GENERATED_CONTENT,
  ],

  // Tudo relacionado a questões
  QUESTIONS_ALL: [
    CACHE_TAGS.QUESTIONS,
    CACHE_TAGS.QUIZ_SESSIONS,
    CACHE_TAGS.QUIZ_RESULTS,
  ],

  // Tudo relacionado a ofensivas
  OFFENSIVES_ALL: [
    CACHE_TAGS.OFFENSIVES,
    CACHE_TAGS.STREAK,
    CACHE_TAGS.DAILY_PROGRESS,
  ],

  // Tudo relacionado a vídeos
  VIDEOS_ALL: [
    CACHE_TAGS.VIDEOS,
    CACHE_TAGS.VIDEOS_BY_GUIDE,
    CACHE_TAGS.VIDEOS_BY_MODULE,
    CACHE_TAGS.VIDEOS_WITH_PROGRESS,
    CACHE_TAGS.VIDEO_PROGRESS,
  ],

  // Tudo relacionado a módulos
  MODULES_ALL: [
    CACHE_TAGS.MODULES,
    CACHE_TAGS.MODULES_BY_SUBCOURSE,
    CACHE_TAGS.MODULE_VIDEOS,
  ],

  // Tudo relacionado a progresso
  PROGRESS_ALL: [
    CACHE_TAGS.PROGRESS,
    CACHE_TAGS.USER_PROGRESS,
    CACHE_TAGS.COURSE_PROGRESS,
    CACHE_TAGS.SUBCOURSE_PROGRESS,
    CACHE_TAGS.VIDEO_PROGRESS,
  ],

  // Tudo relacionado a assinaturas
  SUBSCRIPTION_ALL: [
    CACHE_TAGS.SUBSCRIPTION,
    CACHE_TAGS.SUBSCRIPTION_PLANS,
    CACHE_TAGS.PAYMENT_HISTORY,
  ],

  // Tudo relacionado a mensagens
  MESSAGES_ALL: [
    CACHE_TAGS.MESSAGES,
    CACHE_TAGS.CONVERSATIONS,
    CACHE_TAGS.DIRECT_MESSAGES,
    CACHE_TAGS.COMMUNITY_MESSAGES,
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

  // Invalidar cada tag individualmente para garantir que todas sejam invalidadas
  const promises = tagsArray.map(tag =>
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        if (Array.isArray(queryKey)) {
          return queryKey.includes(tag);
        }
        return String(queryKey) === tag;
      },
      refetchType: options?.refetchType || 'active',
    })
  );

  return Promise.all(promises);
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
  const uniqueTags = [...new Set(allTags)];

  return invalidateCacheTags(queryClient, uniqueTags, options);
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

  tagsArray.forEach(tag => {
    queryClient.removeQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        if (Array.isArray(queryKey)) {
          return queryKey.includes(tag);
        }
        return String(queryKey) === tag;
      },
    });
  });
}

/**
 * Função para limpar todo o cache
 */
export function clearAllCache(queryClient: QueryClient) {
  return queryClient.clear();
}

/**
 * ==================== CENÁRIOS DE INVALIDAÇÃO ====================
 *
 * Funções específicas para cenários comuns de invalidação.
 * Use estas funções quando uma ação do usuário requer atualização de cache.
 */
export const CacheInvalidation = {
  // ==================== PERFIL ====================
  /**
   * Invalidar cache do perfil após atualizações
   * Cenário: Usuário atualiza foto, nome, bio, etc.
   */
  invalidateProfile: (queryClient: QueryClient) => {
    return invalidateCacheTagGroups(queryClient, ['PROFILE_ALL']);
  },

  // ==================== CURSOS ====================
  /**
   * Invalidar cache de cursos após mudanças
   * Cenário: Novo curso adicionado, curso atualizado, progresso alterado
   */
  invalidateCourses: (queryClient: QueryClient) => {
    return invalidateCacheTagGroups(queryClient, ['COURSES_ALL']);
  },

  /**
   * Invalidar cache de um curso específico
   * Cenário: Usuário entra/sai de um curso, progresso atualizado
   */
  invalidateCourseById: (queryClient: QueryClient, courseId: string) => {
    return queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        if (Array.isArray(queryKey)) {
          return queryKey.includes(CACHE_TAGS.COURSE_DETAIL) && queryKey.includes(courseId);
        }
        return false;
      },
    });
  },

  /**
   * Invalidar cache de subcursos
   * Cenário: Novo subcurso adicionado, subcurso atualizado
   */
  invalidateSubCourses: (queryClient: QueryClient, courseId?: string) => {
    if (courseId) {
      return queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          if (Array.isArray(queryKey)) {
            return queryKey.includes(CACHE_TAGS.SUB_COURSES) && queryKey.includes(courseId);
          }
          return false;
        },
      });
    }
    return invalidateCacheTags(queryClient, CACHE_TAGS.SUB_COURSES);
  },

  // ==================== COMUNIDADES ====================
  /**
   * Invalidar cache de comunidades
   * Cenário: Nova comunidade criada, usuário entrou/saiu de comunidade
   */
  invalidateCommunities: (queryClient: QueryClient) => {
    return invalidateCacheTagGroups(queryClient, ['COMMUNITIES_ALL']);
  },

  /**
   * Invalidar cache de uma comunidade específica
   * Cenário: Configurações da comunidade alteradas, novo membro
   */
  invalidateCommunityById: (queryClient: QueryClient, communityId: string) => {
    return queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        if (Array.isArray(queryKey)) {
          return (queryKey.includes(CACHE_TAGS.COMMUNITY_DETAIL) ||
                  queryKey.includes(CACHE_TAGS.COMMUNITY_MEMBERS)) &&
                 queryKey.includes(communityId);
        }
        return false;
      },
    });
  },

  // ==================== WATCHING ====================
  /**
   * Invalidar cache de vídeos em progresso
   * Cenário: Usuário começou a assistir um vídeo, progresso atualizado
   */
  invalidateWatching: (queryClient: QueryClient) => {
    return invalidateCacheTagGroups(queryClient, ['WATCHING_ALL']);
  },

  /**
   * Invalidar cache quando um vídeo é marcado como completo
   * Cenário: Vídeo completado, progresso do curso atualizado
   */
  invalidateVideoCompletion: (queryClient: QueryClient) => {
    return invalidateCacheTagGroups(queryClient, ['WATCHING_ALL', 'PROGRESS_ALL', 'OFFENSIVES_ALL']);
  },

  // ==================== RESUMOS E MAPAS MENTAIS ====================
  /**
   * Invalidar cache de conteúdo gerado por IA
   * Cenário: Novo resumo/mapa mental criado, conteúdo deletado
   */
  invalidateAIContent: (queryClient: QueryClient) => {
    return invalidateCacheTagGroups(queryClient, ['AI_CONTENT_ALL']);
  },

  /**
   * Invalidar apenas resumos
   * Cenário: Novo resumo gerado
   */
  invalidateSummaries: (queryClient: QueryClient) => {
    return invalidateCacheTags(queryClient, [CACHE_TAGS.SUMMARIES, CACHE_TAGS.MY_SUMMARIES]);
  },

  /**
   * Invalidar apenas mapas mentais
   * Cenário: Novo mapa mental gerado
   */
  invalidateMindMaps: (queryClient: QueryClient) => {
    return invalidateCacheTags(queryClient, [CACHE_TAGS.MIND_MAPS, CACHE_TAGS.MY_MIND_MAPS]);
  },

  // ==================== QUESTÕES ====================
  /**
   * Invalidar cache de questões
   * Cenário: Quiz completado, novo quiz iniciado
   */
  invalidateQuestions: (queryClient: QueryClient) => {
    return invalidateCacheTagGroups(queryClient, ['QUESTIONS_ALL']);
  },

  // ==================== OFENSIVAS ====================
  /**
   * Invalidar cache de ofensivas após mudanças
   * Cenário: Dia completado, streak atualizado
   */
  invalidateOffensives: (queryClient: QueryClient) => {
    return invalidateCacheTagGroups(queryClient, ['OFFENSIVES_ALL']);
  },

  // ==================== VÍDEOS ====================
  /**
   * Invalidar cache de vídeos após mudanças
   * Cenário: Vídeo assistido, progresso atualizado
   */
  invalidateVideos: (queryClient: QueryClient) => {
    return invalidateCacheTagGroups(queryClient, ['VIDEOS_ALL']);
  },

  /**
   * Invalidar cache de vídeos de um módulo específico
   */
  invalidateModuleVideos: (queryClient: QueryClient, moduleId: string) => {
    return queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        if (Array.isArray(queryKey)) {
          return queryKey.includes(CACHE_TAGS.MODULE_VIDEOS) && queryKey.includes(moduleId);
        }
        return false;
      },
    });
  },

  // ==================== PROGRESSO ====================
  /**
   * Invalidar cache de progresso após mudanças
   * Cenário: Vídeo completado, curso completado
   */
  invalidateProgress: (queryClient: QueryClient) => {
    return invalidateCacheTagGroups(queryClient, ['PROGRESS_ALL']);
  },

  // ==================== ASSINATURAS ====================
  /**
   * Invalidar cache de assinatura
   * Cenário: Plano alterado, pagamento realizado
   */
  invalidateSubscription: (queryClient: QueryClient) => {
    return invalidateCacheTagGroups(queryClient, ['SUBSCRIPTION_ALL']);
  },

  // ==================== MENSAGENS ====================
  /**
   * Invalidar cache de mensagens
   * Cenário: Nova mensagem recebida/enviada
   */
  invalidateMessages: (queryClient: QueryClient) => {
    return invalidateCacheTagGroups(queryClient, ['MESSAGES_ALL']);
  },

  // ==================== OPÇÕES ====================
  /**
   * Invalidar cache de opções após mudanças
   */
  invalidateOptions: (queryClient: QueryClient) => {
    return invalidateCacheTagGroups(queryClient, ['OPTIONS_ALL']);
  },

  // ==================== AUTENTICAÇÃO ====================
  /**
   * Invalidar cache após login/logout
   * Cenário: Usuário faz login/logout, dados precisam ser recarregados
   */
  invalidateAfterAuth: (queryClient: QueryClient) => {
    return invalidateAllCache(queryClient);
  },

  // ==================== UTILITÁRIOS ====================
  /**
   * Invalidar cache específico por ID
   */
  invalidateById: (queryClient: QueryClient, tag: CacheTag, id: string) => {
    return queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        if (Array.isArray(queryKey)) {
          return queryKey.includes(tag) && queryKey.includes(id);
        }
        return false;
      },
    });
  },

  /**
   * Invalidar múltiplas tags relacionadas a uma ação de vídeo
   * Cenário: Usuário marca vídeo como completo - precisa atualizar
   * watching, progresso, offensivas e dashboard
   */
  invalidateAfterVideoAction: (queryClient: QueryClient) => {
    return invalidateCacheTagGroups(queryClient, [
      'WATCHING_ALL',
      'PROGRESS_ALL',
      'OFFENSIVES_ALL',
      'DASHBOARD_ALL',
    ]);
  },

  /**
   * Invalidar cache após criar conteúdo com IA
   * Cenário: Novo resumo ou mapa mental gerado
   */
  invalidateAfterAIGeneration: (queryClient: QueryClient, type: 'summary' | 'mindmap') => {
    if (type === 'summary') {
      return invalidateCacheTags(queryClient, [CACHE_TAGS.SUMMARIES, CACHE_TAGS.MY_SUMMARIES]);
    }
    return invalidateCacheTags(queryClient, [CACHE_TAGS.MIND_MAPS, CACHE_TAGS.MY_MIND_MAPS]);
  },
};
