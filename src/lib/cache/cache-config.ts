/**
 * Configuracao de cache por tier para React Query
 *
 * LONG:     Dados que mudam raramente (cursos, producers, opcoes)
 * MEDIUM:   Dados que mudam com acao do usuario (perfil, offensivas, subscription)
 * SHORT:    Dados que mudam com frequencia (progresso, videos em andamento, busca)
 * REALTIME: Dados via WebSocket (mensagens, status, notificacoes)
 */
export const CACHE_TIERS = {
  /** 30min staleTime / 1h gcTime - cursos, producers, opcoes */
  LONG: {
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  },

  /** 10min staleTime / 30min gcTime - perfil, offensivas, subscription, comunidades */
  MEDIUM: {
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  },

  /** 2min staleTime / 10min gcTime - progresso, watching, busca, AI content */
  SHORT: {
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },

  /** Sem cache - dados real-time via WebSocket */
  REALTIME: {
    staleTime: 0,
    gcTime: 0,
  },
} as const;

/** Max age para persistencia no localStorage (30 minutos) */
export const PERSIST_MAX_AGE = 30 * 60 * 1000;

/** Versao do cache - incrementar ao fazer deploy com breaking changes nos dados */
export const CACHE_VERSION = '1';
