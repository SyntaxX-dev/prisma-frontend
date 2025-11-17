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
    console.log('[UserStatusProvider] 🔄 useEffect executado');
    if (typeof window === 'undefined') {
      console.log('[UserStatusProvider] ⏭️ Window não disponível, saindo');
      return;
    }

    const token = localStorage.getItem('auth_token');
    console.log('[UserStatusProvider] 🔑 Token verificado:', { 
      hasToken: !!token, 
      tokenLength: token?.length || 0,
      socketExists: !!socketRef.current,
      socketConnected: socketRef.current?.connected || false,
      hasInitialized: hasInitializedRef.current,
    });
    
    if (!token) {
      console.log('[UserStatusProvider] ⚠️ Sem token, desconectando socket se existir');
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
      console.log('[UserStatusProvider] ✅ Socket já está conectado, reutilizando');
      return;
    }

    // Se já tentamos inicializar, não tentar novamente a menos que o socket tenha sido desconectado
    if (hasInitializedRef.current && socketRef.current) {
      console.log('[UserStatusProvider] ⏸️ Já inicializado, aguardando reconexão automática');
      return;
    }

    let apiUrl = env.NEXT_PUBLIC_API_URL;
    const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
    const socketUrl = `${wsProtocol}://${apiUrl.replace(/^https?:\/\//, '')}/chat`;

    console.log('[UserStatusProvider] 🔌 Criando nova conexão WebSocket para status');
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
      console.log('[UserStatusProvider] 🔐 Autenticado:', data);
      console.log('[UserStatusProvider] 🔐 Dados de autenticação:', {
        data,
        socketId: newSocket.id,
        connected: newSocket.connected,
      });
    });

    // Listener para erros de autenticação
    newSocket.on('unauthorized', (data: any) => {
      console.error('[UserStatusProvider] ❌ Não autorizado:', data);
    });

    newSocket.on('connect', () => {
      console.log('[UserStatusProvider] ✅ Conectado ao WebSocket para status');
      console.log('[UserStatusProvider] 📋 Socket ID:', newSocket.id);
      console.log('[UserStatusProvider] 📋 Socket conectado:', newSocket.connected);
      console.log('[UserStatusProvider] 📋 Socket auth:', newSocket.auth);
      console.log('[UserStatusProvider] 📋 Socket transport:', newSocket.io.engine.transport.name);
      console.log('[UserStatusProvider] 📋 Socket listeners registrados:', {
        hasUserStatusChanged: newSocket.hasListeners('user_status_changed'),
        hasAuthenticated: newSocket.hasListeners('authenticated'),
        hasHeartbeatAck: newSocket.hasListeners('heartbeat_ack'),
      });
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
          console.log('[UserStatusProvider] 💓 Enviando heartbeat');
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
      console.log('[UserStatusProvider] ❌ Desconectado do WebSocket, motivo:', reason);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('[UserStatusProvider] ❌ Erro ao conectar:', error);
    });

    newSocket.on('heartbeat_ack', (data: any) => {
      console.log('[UserStatusProvider] ✅ Heartbeat confirmado:', data);
    });

    // Registrar listener ANTES do connect para garantir que captura todos os eventos
    // Evento: mudança de status de amigos
    newSocket.on('user_status_changed', (data: UserStatusChangedEvent) => {
      console.log('[UserStatusProvider] 🔄 Status mudou:', data);
      console.log('[UserStatusProvider] 📊 Dados recebidos:', {
        userId: data.userId,
        status: data.status,
        lastSeen: data.lastSeen,
      });
      
      // Verificar se o evento está no formato correto
      if (!data.userId || !data.status) {
        console.error('[UserStatusProvider] ❌ Dados inválidos no evento user_status_changed:', data);
        return;
      }
      
      setStatusMap((prev) => {
        const newMap = new Map(prev);
        const oldStatus = newMap.get(data.userId);
        newMap.set(data.userId, data.status);
        
        console.log('[UserStatusProvider] ✅ Status atualizado no mapa:', {
          userId: data.userId,
          oldStatus: oldStatus || 'não estava no mapa',
          newStatus: data.status,
          mapSize: newMap.size,
        });
        
        return newMap;
      });
    });
    
    // Log quando o socket recebe qualquer evento (para debug)
    // IMPORTANTE: Registrar ANTES do connect para capturar todos os eventos
    newSocket.onAny((eventName, ...args) => {
      console.log('[UserStatusProvider] 📡 Evento recebido no socket:', eventName, {
        eventName,
        argsCount: args.length,
        firstArg: args[0],
        socketId: newSocket.id,
        connected: newSocket.connected,
      });
      if (eventName === 'user_status_changed') {
        console.log('[UserStatusProvider] 🎯 Evento user_status_changed detectado via onAny:', args);
      }
      
      // Repassar eventos de chat para o useChat via eventos customizados
      // Isso é necessário porque o backend está enviando apenas para este socket
      if (eventName === 'new_message' || eventName === 'typing' || eventName === 'message_deleted' || eventName === 'message_edited') {
        console.log('[UserStatusProvider] 🔄 Repassando evento de chat para useChat:', eventName);
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
      console.log('[UserStatusProvider] 🚪 Aba sendo fechada, desconectando WebSocket');
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
          console.log('[UserStatusProvider] 📤 Logout enviado via fetch com keepalive');
        } catch (error) {
          console.error('[UserStatusProvider] ❌ Erro ao enviar logout:', error);
        }
      }
    };

    // Detectar quando a página fica oculta (mudança de aba, minimizar, etc)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[UserStatusProvider] 👁️ Página ficou oculta (WebSocket continua conectado)');
      } else {
        console.log('[UserStatusProvider] 👁️ Página voltou a ficar visível');
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
      console.log('[UserStatusProvider] 🧹 Limpando socket e heartbeat');
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
        console.log('[UserStatusProvider] 🚪 Token removido, desconectando socket');
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
        console.log('[UserStatusProvider] ✅ getStatus: Status recebido:', response.data);
        setStatusMap((prev) => {
          const newMap = new Map(prev);
          // Garantir que estamos usando o userId correto
          const statusUserId = response.data.userId || userId;
          newMap.set(statusUserId, response.data.status);
          console.log('[UserStatusProvider] ✅ Status individual adicionado ao mapa:', {
            userId: statusUserId,
            status: response.data.status,
          });
          return newMap;
        });
        pendingStatusRequestsRef.current.delete(userId);
        return response.data.status;
      }
    } catch (error) {
      console.error('[UserStatusProvider] Erro ao buscar status:', error);
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
      console.log('[UserStatusProvider] ⏭️ getBatchStatus: Todos os IDs já estão no cache ou pendentes');
      console.log('[UserStatusProvider] 📊 Status atual no mapa para os IDs solicitados:', 
        userIds.map(id => ({ id, status: statusMapRef.current.get(id) || 'não encontrado' }))
      );
      return;
    }

    console.log('[UserStatusProvider] 🔍 getBatchStatus: Buscando status para:', missingIds);
    console.log('[UserStatusProvider] 📊 Status atual no mapa:', 
      Array.from(statusMapRef.current.entries()).map(([id, status]) => ({ id, status }))
    );

    // Marcar IDs como pendentes
    missingIds.forEach(id => pendingBatchRequestsRef.current.add(id));

    try {
      const response = await getBatchUserStatus(missingIds);
      if (response.success) {
        console.log('[UserStatusProvider] ✅ getBatchStatus: Status recebidos:', response.data);
        console.log('[UserStatusProvider] 🔍 Estrutura do primeiro item:', response.data[0]);
        console.log('[UserStatusProvider] 🔍 IDs solicitados:', missingIds);
        setStatusMap((current) => {
          const newMap = new Map(current);
          // A API retorna um array de status na mesma ordem dos IDs solicitados
          // Mapear cada status ao ID correspondente
          response.data.forEach((status, index) => {
            const requestedUserId = missingIds[index];
            if (!requestedUserId) {
              console.error('[UserStatusProvider] ❌ Índice sem userId correspondente:', { index, status, missingIds });
              return;
            }
            // A API não retorna userId, então usar o ID solicitado
            // Verificar se o campo é userId ou id (fallback), mas usar o ID solicitado como padrão
            const statusUserId = status.userId || (status as any).id || requestedUserId;
            newMap.set(statusUserId, status.status);
            pendingBatchRequestsRef.current.delete(statusUserId);
            console.log('[UserStatusProvider] ✅ Status adicionado ao mapa:', {
              userId: statusUserId,
              status: status.status,
              index,
              requestedId: requestedUserId,
              hasUserIdInResponse: !!status.userId,
            });
          });
          console.log('[UserStatusProvider] 📊 Mapa atualizado, tamanho:', newMap.size);
          console.log('[UserStatusProvider] 📊 Conteúdo do mapa:', Array.from(newMap.entries()));
          return newMap;
        });
      } else {
        console.error('[UserStatusProvider] ❌ getBatchStatus: Resposta sem sucesso:', response);
      }
    } catch (error) {
      console.error('[UserStatusProvider] ❌ Erro ao buscar status em lote:', error);
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

