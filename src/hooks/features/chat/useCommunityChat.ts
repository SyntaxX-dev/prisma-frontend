"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { env } from '@/lib/env';
import { sendCommunityMessage } from '@/api/communities/send-community-message';
import { getCommunityMessages } from '@/api/communities/get-community-messages';
import { editCommunityMessage } from '@/api/communities/edit-community-message';
import { deleteCommunityMessage } from '@/api/communities/delete-community-message';
import { pinCommunityMessage } from '@/api/communities/pin-community-message';
import { unpinCommunityMessage } from '@/api/communities/unpin-community-message';
import { getPinnedCommunityMessages } from '@/api/communities/get-pinned-community-messages';
import type {
  CommunityMessage,
  PinnedCommunityMessage,
  NewCommunityMessageEvent,
  CommunityMessageDeletedEvent,
  CommunityMessageEditedEvent,
} from '@/types/community-chat';

export function useCommunityChat(communityId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<PinnedCommunityMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const currentCommunityIdRef = useRef<string | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!communityId) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    if (socketRef.current?.connected && currentCommunityIdRef.current === communityId) return;

    // Desconectar socket anterior se mudou de comunidade
    if (socketRef.current && currentCommunityIdRef.current !== communityId) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    let apiUrl = env.NEXT_PUBLIC_API_URL;
    const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
    const socketUrl = `${wsProtocol}://${apiUrl.replace(/^https?:\/\//, '')}/chat`;

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

    newSocket.on('connect', () => {
      console.log('[useCommunityChat] ✅ Conectado ao WebSocket');
      console.log('[useCommunityChat] Socket ID:', newSocket.id);
      setIsConnected(true);
      socketRef.current = newSocket;
      currentCommunityIdRef.current = communityId;
      setSocket(newSocket);
      console.log('[useCommunityChat] communityId definido:', communityId);

      // Iniciar heartbeat a cada 30 segundos
      heartbeatIntervalRef.current = setInterval(() => {
        if (newSocket.connected) {
          console.log('[useCommunityChat] 💓 Enviando heartbeat');
          newSocket.emit('heartbeat');
        }
      }, 30000); // 30 segundos
    });

    newSocket.on('heartbeat_ack', (data: any) => {
      console.log('[useCommunityChat] ✅ Heartbeat confirmado:', data);
    });

    newSocket.on('disconnect', () => {
      console.log('[useCommunityChat] ❌ Desconectado do WebSocket');
      setIsConnected(false);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('[useCommunityChat] ❌ Erro de conexão:', error);
      setIsConnected(false);
    });

    // Log quando o socket recebe qualquer evento (para debug)
    newSocket.onAny((eventName, ...args) => {
      console.log('[useCommunityChat] 📡 Evento recebido no socket:', eventName, {
        eventName,
        argsCount: args.length,
        firstArg: args[0],
        socketId: newSocket.id,
        connected: newSocket.connected,
      });
      if (eventName === 'new_community_message') {
        console.log('[useCommunityChat] 🎯 Evento new_community_message detectado via onAny:', args);
      }
    });

    // Evento: nova mensagem na comunidade
    newSocket.on('new_community_message', (data: NewCommunityMessageEvent) => {
      console.log('[useCommunityChat] 📨 Nova mensagem recebida:', data);
      console.log('[useCommunityChat] currentCommunityIdRef atual:', currentCommunityIdRef.current);
      console.log('[useCommunityChat] communityId do parâmetro:', communityId);
      console.log('[useCommunityChat] data.communityId:', data.communityId);

      // Usar ref para ter sempre o valor mais atualizado
      const currentCommunityId = currentCommunityIdRef.current || communityId;
      
      // Só adicionar se for da comunidade atual
      if (data.communityId === currentCommunityId) {
        console.log('[useCommunityChat] ✅ Mensagem é da comunidade atual, adicionando');
        setMessages((prev) => {
          // Verificar se a mensagem já existe (evitar duplicatas) 
          const exists = prev.some((msg) => msg.id === data.id);   
          if (exists) {
            console.log('[useCommunityChat] ⚠️ Mensagem já existe, ignorando');
            return prev;
          }
          console.log('[useCommunityChat] ✅ Adicionando nova mensagem ao estado');
          // Converter NewCommunityMessageEvent para CommunityMessage adicionando propriedades faltantes
          const communityMessage: CommunityMessage = {
            ...data,
            edited: false,
            updatedAt: null,
          };
          return [...prev, communityMessage];
        });
      } else {
        console.log('[useCommunityChat] ⚠️ Mensagem não é da comunidade atual, ignorando:', {
          messageCommunityId: data.communityId,
          currentCommunityId: currentCommunityId,
        });
      }
    });

    // Evento: mensagem deletada na comunidade
    newSocket.on('community_message_deleted', (data: CommunityMessageDeletedEvent) => {
      console.log('[useCommunityChat] 🗑️ Mensagem deletada recebida:', data);

      // Só atualizar se for da comunidade atual
      if (data.communityId === communityId) {
        setMessages((prev) => {
          const messageExists = prev.some((msg) => msg.id === data.messageId);
          if (!messageExists) {
            console.log('[useCommunityChat] ⚠️ Mensagem não encontrada na UI, ignorando');
            return prev;
          }

          console.log('[useCommunityChat] ✅ Atualizando mensagem deletada na UI');
          return prev.map((msg) =>
            msg.id === data.messageId ? { ...msg, content: data.message.content } : msg
          );
        });

        // Se a mensagem estava fixada, atualizar lista de fixadas
        setPinnedMessages((prev) => {
          const wasPinned = prev.some((p) => p.messageId === data.messageId);
          if (wasPinned && communityId) {
            // Recarregar mensagens fixadas para remover a deletada
            getPinnedCommunityMessages(communityId)
              .then((response) => {
                if (response.success) {
                  setPinnedMessages(response.data);
                }
              })
              .catch((error) => {
                console.error('[useCommunityChat] Erro ao recarregar mensagens fixadas após deletar:', error);
              });
          }
          return prev;
        });
      }
    });

    // Evento: mensagem editada na comunidade em tempo real
    newSocket.on('community_message_edited', (data: CommunityMessageEditedEvent) => {
      console.log('[useCommunityChat] ✏️ Mensagem editada recebida:', data);

      // Só atualizar se for da comunidade atual
      if (data.communityId === communityId) {
        setMessages((prev) => {
          const messageExists = prev.some((msg) => msg.id === data.id);
          if (!messageExists) {
            console.log('[useCommunityChat] ⚠️ Mensagem não encontrada na UI, ignorando');
            return prev;
          }

          console.log('[useCommunityChat] ✅ Atualizando mensagem editada na UI');
          return prev.map((msg) =>
            msg.id === data.id
              ? { ...msg, content: data.content, edited: true, updatedAt: data.updatedAt }
              : msg
          );
        });
      }
    });

    setSocket(newSocket);

    // Atualizar ref imediatamente também
    currentCommunityIdRef.current = communityId;

    return () => {
      console.log('[useCommunityChat] 🧹 Limpando socket e heartbeat');
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      newSocket.disconnect();
      socketRef.current = null;
      currentCommunityIdRef.current = null;
    };
  }, [communityId]);

  // Atualizar ref quando communityId mudar (mesmo que o socket já esteja conectado)
  useEffect(() => {
    if (communityId) {
      console.log('[useCommunityChat] 🔄 Atualizando currentCommunityIdRef:', communityId);
      currentCommunityIdRef.current = communityId;
    }
  }, [communityId]);

  const loadMessages = useCallback(async (limit: number = 50, offset: number = 0) => {
    if (!communityId) return;
    try {
      console.log('[useCommunityChat] 📥 Carregando mensagens:', { communityId, limit, offset });
      const response = await getCommunityMessages(communityId, limit, offset);
      if (response.success) {
        // Ordenar mensagens por data de criação
        const sortedMessages = response.data.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);
        console.log('[useCommunityChat] ✅ Mensagens carregadas:', sortedMessages.length);
      } else {
        const errorMessage = 'message' in response ? response.message : 'Erro ao carregar mensagens';
        console.error('[useCommunityChat] ❌ Erro ao carregar mensagens:', errorMessage);
      }
    } catch (error) {
      console.error('[useCommunityChat] ❌ Erro ao carregar mensagens:', error);
    }
  }, [communityId]);

  const loadPinnedMessages = useCallback(async () => {
    if (!communityId) return;
    try {
      console.log('[useCommunityChat] 📌 Carregando mensagens fixadas:', { communityId });
      const response = await getPinnedCommunityMessages(communityId);
      if (response.success) {
        setPinnedMessages(response.data);
        console.log('[useCommunityChat] ✅ Mensagens fixadas carregadas:', response.data.length);
      } else {
        const errorMessage = 'message' in response ? response.message : 'Erro ao carregar mensagens fixadas';
        console.error('[useCommunityChat] ❌ Erro ao carregar mensagens fixadas:', errorMessage);
      }
    } catch (error) {
      console.error('[useCommunityChat] ❌ Erro ao carregar mensagens fixadas:', error);
    }
  }, [communityId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!communityId) return { success: false, message: 'Comunidade não selecionada' };
    try {
      console.log('[useCommunityChat] 📤 Enviando mensagem:', { communityId, content });
      const response = await sendCommunityMessage(communityId, content);
      if (response.success) {
        // A mensagem será adicionada via WebSocket, mas podemos adicionar otimisticamente
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === response.data.id);
          if (exists) return prev;
          return [...prev, response.data];
        });
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('[useCommunityChat] ❌ Erro ao enviar mensagem:', error);
      return { success: false, message: 'Erro ao enviar mensagem' };
    }
  }, [communityId]);

  const editMessageHandler = useCallback(async (messageId: string, content: string) => {
    if (!communityId) return { success: false, message: 'Comunidade não selecionada' };
    try {
      console.log('[useCommunityChat] ✏️ Editando mensagem:', { communityId, messageId, content });
      const response = await editCommunityMessage(communityId, messageId, content);
      if (response.success) {
        // Atualizar a mensagem na lista
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: response.data.content, edited: true }
              : msg
          )
        );
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('[useCommunityChat] ❌ Erro ao editar mensagem:', error);
      return { success: false, message: 'Erro ao editar mensagem' };
    }
  }, [communityId]);

  const deleteMessageHandler = useCallback(async (messageId: string) => {
    if (!communityId) return { success: false, message: 'Comunidade não selecionada' };
    try {
      console.log('[useCommunityChat] 🗑️ Excluindo mensagem:', { communityId, messageId });
      const response = await deleteCommunityMessage(communityId, messageId);
      if (response.success) {
        // Não remover a mensagem aqui - o evento WebSocket community_message_deleted
        // será recebido e atualizará a mensagem com "Mensagem apagada"
        console.log('[useCommunityChat] ✅ Mensagem deletada com sucesso, aguardando evento WebSocket');
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('[useCommunityChat] ❌ Erro ao excluir mensagem:', error);
      return { success: false, message: 'Erro ao excluir mensagem' };
    }
  }, [communityId]);

  const pinMessageHandler = useCallback(async (messageId: string) => {
    if (!communityId) return { success: false, message: 'Comunidade não selecionada' };
    try {
      console.log('[useCommunityChat] 📌 Fixando mensagem:', { communityId, messageId });
      const response = await pinCommunityMessage(communityId, messageId);
      if (response.success) {
        // Recarregar mensagens fixadas
        await loadPinnedMessages();
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('[useCommunityChat] ❌ Erro ao fixar mensagem:', error);
      return { success: false, message: 'Erro ao fixar mensagem' };
    }
  }, [communityId, loadPinnedMessages]);

  const unpinMessageHandler = useCallback(async (messageId: string) => {
    if (!communityId) return { success: false, message: 'Comunidade não selecionada' };
    try {
      console.log('[useCommunityChat] 📌 Desfixando mensagem:', { communityId, messageId });
      const response = await unpinCommunityMessage(communityId, messageId);
      if (response.success) {
        // Recarregar mensagens fixadas
        await loadPinnedMessages();
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('[useCommunityChat] ❌ Erro ao desfixar mensagem:', error);
      return { success: false, message: 'Erro ao desfixar mensagem' };
    }
  }, [communityId, loadPinnedMessages]);

  return {
    messages,
    pinnedMessages,
    isConnected,
    sendMessage,
    editMessage: editMessageHandler,
    deleteMessage: deleteMessageHandler,
    pinMessage: pinMessageHandler,
    unpinMessage: unpinMessageHandler,
    loadMessages,
    loadPinnedMessages,
    setMessages,
  };
}

