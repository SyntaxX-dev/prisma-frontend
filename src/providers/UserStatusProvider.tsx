"use client";

import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { env } from '@/lib/env';
import { getUserStatus } from '@/api/users/get-user-status';
import { getBatchUserStatus } from '@/api/users/get-batch-user-status';
import type { UserStatusChangedEvent } from '@/types/user-status';
import { useProfile } from '@/hooks/features/profile/useProfile';

interface UserStatusContextType {
  statusMap: Map<string, 'online' | 'offline'>;
  getStatus: (userId: string) => Promise<'online' | 'offline'>;
  getBatchStatus: (userIds: string[]) => Promise<void>;
  isConnected: boolean;
}

const UserStatusContext = createContext<UserStatusContextType | undefined>(undefined);

export function UserStatusProvider({ children }: { children: ReactNode }) {
  const [statusMap, setStatusMap] = useState<Map<string, 'online' | 'offline'>>(new Map());
  const [socket, setSocket] = useState<Socket | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const statusMapRef = useRef<Map<string, 'online' | 'offline'>>(new Map());
  const { userProfile } = useProfile();
  
  // Manter ref sincronizada com o estado
  useEffect(() => {
    statusMapRef.current = statusMap;
  }, [statusMap]);

  // Ref para rastrear se já tentamos conectar
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      // Se não há token, desconectar se houver socket
      if (socketRef.current?.connected) {
        socketRef.current.disconnect();
        socketRef.current = null;
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
      }
      hasInitializedRef.current = false;
      return;
    }

    // Se já existe um socket conectado, não criar outro
    if (socketRef.current?.connected) {
      return;
    }

    // Se já tentamos inicializar, não tentar novamente a menos que o socket tenha sido desconectado
    if (hasInitializedRef.current && socketRef.current) {
      return;
    }

    let apiUrl = env.NEXT_PUBLIC_API_URL;
    const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
    const socketUrl = `${wsProtocol}://${apiUrl.replace(/^https?:\/\//, '')}/chat`;

    hasInitializedRef.current = true;

    const newSocket = io(socketUrl, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Listener para autenticação (se o backend usar)
    newSocket.on('authenticated', (data: any) => {
      // Autenticado com sucesso
    });

    // Listener para erros de autenticação
    newSocket.on('unauthorized', (data: any) => {
    });

    newSocket.on('connect', () => {
      socketRef.current = newSocket;
      setSocket(newSocket);

      // Função auxiliar para obter o ID do usuário atual
      const getCurrentUserId = () => {
        if (userProfile?.id) return userProfile.id;
        try {
          const stored = localStorage.getItem('user_profile');
          if (stored) {
            const parsed = JSON.parse(stored);
            return parsed?.id;
          }
        } catch {}
        return null;
      };

      const currentUserId = getCurrentUserId();

      // Marcar próprio usuário como online imediatamente ao conectar
      if (currentUserId) {
        setStatusMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(currentUserId, 'online');
          return newMap;
        });
      }

      // Limpar intervalo anterior se existir
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      // Iniciar heartbeat a cada 30 segundos
      heartbeatIntervalRef.current = setInterval(() => {
        if (newSocket.connected) {
          newSocket.emit('heartbeat');
          
          // Garantir que o próprio usuário está marcado como online
          const userId = getCurrentUserId();
          if (userId) {
            setStatusMap((prev) => {
              const newMap = new Map(prev);
              newMap.set(userId, 'online');
              return newMap;
            });
          }
        }
      }, 30000); // 30 segundos
    });

    newSocket.on('disconnect', (reason) => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    });

    newSocket.on('connect_error', (error) => {
    });

    newSocket.on('heartbeat_ack', (data: any) => {
    });

    // Registrar listener ANTES do connect para garantir que captura todos os eventos
    // Evento: mudança de status de amigos
    newSocket.on('user_status_changed', (data: UserStatusChangedEvent) => {
      // Verificar se o evento está no formato correto
      if (!data.userId || !data.status) {
        return;
      }
      
      setStatusMap((prev) => {
        const newMap = new Map(prev);
        const oldStatus = newMap.get(data.userId);
        newMap.set(data.userId, data.status);
        
        return newMap;
      });
    });
    
    // Log quando o socket recebe qualquer evento (para debug)
    // IMPORTANTE: Registrar ANTES do connect para capturar todos os eventos
    newSocket.onAny((eventName, ...args) => {
      if (eventName === 'user_status_changed') {
      }
      
      // Repassar eventos de chat para o useChat via eventos customizados
      // Isso é necessário porque o backend está enviando apenas para este socket
      if (eventName === 'new_message' || eventName === 'typing' || eventName === 'message_deleted' || eventName === 'message_edited') {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(`chat_${eventName}`, {
            detail: args[0],
          }));
        }
      }

      // Repassar eventos de comunidade para o useCommunityChat via eventos customizados
      if (eventName === 'new_community_message' || eventName === 'community_typing' || eventName === 'community_message_deleted' || eventName === 'community_message_edited') {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(`chat_${eventName}`, {
            detail: args[0],
          }));
        }
      }
    });

    // setSocket será chamado no evento 'connect'

    // Detectar fechamento de aba/navegador
    const handleBeforeUnload = () => {
      if (newSocket?.connected) {
        newSocket.disconnect();
      }
      // Tentar fazer logout no backend usando fetch com keepalive
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const apiUrl = env.NEXT_PUBLIC_API_URL;
          const logoutUrl = `${apiUrl}/auth/logout`;
          fetch(logoutUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
            keepalive: true,
          }).catch(() => {
            // Ignorar erros silenciosamente
          });
        } catch (error) {
        }
      }
    };

    // Detectar quando a página fica oculta (mudança de aba, minimizar, etc)
    const handleVisibilityChange = () => {
      if (document.hidden) {
      } else {
        // Garantir que o heartbeat está ativo
        if (newSocket?.connected) {
          newSocket.emit('heartbeat');
          // Garantir que o próprio usuário está marcado como online
          const getCurrentUserId = () => {
            if (userProfile?.id) return userProfile.id;
            try {
              const stored = localStorage.getItem('user_profile');
              if (stored) {
                const parsed = JSON.parse(stored);
                return parsed?.id;
              }
            } catch {}
            return null;
          };
          const userId = getCurrentUserId();
          if (userId) {
            setStatusMap((prev) => {
              const newMap = new Map(prev);
              newMap.set(userId, 'online');
              return newMap;
            });
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      
      // NÃO desconectar o socket aqui, pois outros componentes podem estar usando
      // O socket será desconectado apenas quando o componente for desmontado completamente
      // ou quando o token for removido
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executar apenas uma vez na montagem

  // Desconectar socket quando o token for removido
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('auth_token');
      if (!token && socketRef.current?.connected) {
        socketRef.current.disconnect();
        socketRef.current = null;
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
      }
    };

    // Verificar token periodicamente
    const interval = setInterval(checkToken, 1000);
    return () => clearInterval(interval);
  }, []);

  const pendingStatusRequestsRef = useRef<Set<string>>(new Set());
  
  const getStatus = useCallback(async (userId: string): Promise<'online' | 'offline'> => {
    // Verificar cache local primeiro usando a ref
    if (statusMapRef.current.has(userId)) {
      return statusMapRef.current.get(userId)!;
    }

    // Verificar se já há uma requisição pendente para este usuário
    if (pendingStatusRequestsRef.current.has(userId)) {
      return 'offline';
    }

    // Marcar como pendente
    pendingStatusRequestsRef.current.add(userId);

    // Buscar do servidor
    try {
      const response = await getUserStatus(userId);
      if (response.success) {
        setStatusMap((prev) => {
          const newMap = new Map(prev);
              // Garantir que estamos usando o userId correto
              const statusUserId = response.data.userId || userId;
              newMap.set(statusUserId, response.data.status);
              return newMap;
        });
        pendingStatusRequestsRef.current.delete(userId);
        return response.data.status;
      }
    } catch (error) {
      pendingStatusRequestsRef.current.delete(userId);
    }

    return 'offline';
  }, []);

  const pendingBatchRequestsRef = useRef<Set<string>>(new Set());
  
  const getBatchStatus = useCallback(async (userIds: string[]): Promise<void> => {
    // Filtrar apenas IDs que não estão no cache e não estão em requisições pendentes
    const missingIds = userIds.filter(
      id => !statusMapRef.current.has(id) && !pendingBatchRequestsRef.current.has(id)
    );

    if (missingIds.length === 0) {
      return;
    }

    // Marcar IDs como pendentes
    missingIds.forEach(id => pendingBatchRequestsRef.current.add(id));

    try {
      const response = await getBatchUserStatus(missingIds);
      if (response.success) {
        setStatusMap((current) => {
          const newMap = new Map(current);
          // A API retorna um array de status na mesma ordem dos IDs solicitados
          // Mapear cada status ao ID correspondente
          response.data.forEach((status, index) => {
            const requestedUserId = missingIds[index];
            if (!requestedUserId) {
              return;
            }
            // A API não retorna userId, então usar o ID solicitado
            // Verificar se o campo é userId ou id (fallback), mas usar o ID solicitado como padrão
            const statusUserId = status.userId || (status as any).id || requestedUserId;
            newMap.set(statusUserId, status.status);
            pendingBatchRequestsRef.current.delete(statusUserId);
          });
          return newMap;
        });
      } else {
      }
    } catch (error) {
      missingIds.forEach(id => pendingBatchRequestsRef.current.delete(id));
    }
  }, []);

  // Atualizar status do próprio usuário quando o perfil mudar
  useEffect(() => {
    if (userProfile?.id) {
      // Se o socket estiver conectado, marcar como online
      if (socket?.connected) {
        setStatusMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(userProfile.id, 'online');
          return newMap;
        });
      } else if (!statusMapRef.current.has(userProfile.id)) {
        // Se não estiver no mapa e não estiver conectado, buscar do servidor
        getStatus(userProfile.id);
      }
    }
  }, [userProfile?.id, socket?.connected, getStatus]);

  return (
    <UserStatusContext.Provider
      value={{
        statusMap,
        getStatus,
        getBatchStatus,
        isConnected: socket?.connected || false,
      }}
    >
      {children}
    </UserStatusContext.Provider>
  );
}

export function useUserStatus() {
  const context = useContext(UserStatusContext);
  if (context === undefined) {
    throw new Error('useUserStatus deve ser usado dentro de UserStatusProvider');
  }
  return context;
}

