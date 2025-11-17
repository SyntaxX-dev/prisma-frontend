"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { env } from '@/lib/env';
import { sendMessage as sendMessageApi } from '@/api/messages/send-message';
import { getConversation } from '@/api/messages/get-conversation';
import { markMessagesAsRead } from '@/api/messages/mark-as-read';
import { Message } from '@/api/messages/send-message';
import { pinMessage } from '@/api/messages/pin-message';
import { unpinMessage } from '@/api/messages/unpin-message';
import { getPinnedMessages, PinnedMessage } from '@/api/messages/get-pinned-messages';
import { editMessage } from '@/api/messages/edit-message';
import { deleteMessage } from '@/api/messages/delete-message';
import type { MessageEditedEvent } from '@/types/message-events';

export function useChat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatUserId, setCurrentChatUserId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const currentChatUserIdRef = useRef<string | null>(null);

  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    if (socketRef.current?.connected) return;

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

    // IMPORTANTE: Registrar TODOS os listeners IMEDIATAMENTE após criar o socket
    // Isso garante que capturem todos os eventos desde o início, mesmo antes do connect
    
    // Log quando o socket recebe qualquer evento (para debug) - registrar PRIMEIRO
    // IMPORTANTE: Este listener deve capturar TODOS os eventos, incluindo new_message e typing
    newSocket.onAny((eventName, ...args) => {
      console.log('[useChat] 📡 Evento recebido no socket:', eventName, {
        eventName,
        argsCount: args.length,
        firstArg: args[0],
        socketId: newSocket.id,
        connected: newSocket.connected,
        timestamp: new Date().toISOString(),
      });
      if (eventName === 'new_message') {
        console.log('[useChat] 🎯 Evento new_message detectado via onAny:', args);
        console.log('[useChat] 🔍 Verificando se listener está registrado...');
        console.log('[useChat] 🔍 hasListeners(new_message):', newSocket.hasListeners('new_message'));
      }
      if (eventName === 'typing') {
        console.log('[useChat] 🎯 Evento typing detectado via onAny:', args);
        console.log('[useChat] 🔍 Verificando se listener está registrado...');
        console.log('[useChat] 🔍 hasListeners(typing):', newSocket.hasListeners('typing'));
      }
    });

    // Registrar listener de new_message IMEDIATAMENTE
    console.log('[useChat] 📝 Registrando listener para new_message...');
    newSocket.on('new_message', (message: Message) => {
      const receivedAt = new Date().toISOString();
      const messageCreatedAt = message.createdAt;
      const delay = new Date(receivedAt).getTime() - new Date(messageCreatedAt).getTime();
      
      console.log('[useChat] 📨 Evento new_message recebido via Socket.IO:', message);
      console.log('[useChat] ⏰ Timestamps:', {
        messageCreatedAt,
        receivedAt,
        delayMs: delay,
        delaySeconds: (delay / 1000).toFixed(2),
      });
      console.log('[useChat] Socket conectado:', newSocket.connected);
      console.log('[useChat] Socket ID:', newSocket.id);
      console.log('[useChat] currentChatUserIdRef atual:', currentChatUserIdRef.current);
      console.log('[useChat] message.senderId:', message.senderId);
      console.log('[useChat] message.receiverId:', message.receiverId);
      
      // Verificar se o socket está conectado
      if (!newSocket.connected) {
        console.log('[useChat] ⚠️ Socket não está conectado, ignorando mensagem');
        return;
      }
      
      // Obter ID do usuário atual do token
      let currentUserId = '';
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          currentUserId = payload.sub || payload.userId || payload.id || '';
        }
      } catch (e) {
        console.error('[useChat] Erro ao decodificar token:', e);
        return;
      }
      
      console.log('[useChat] currentUserId do token:', currentUserId);
      
      // Verificar se a mensagem pertence à conversa atual
      // A mensagem pertence à conversa se:
      // 1. O currentChatUserIdRef (amigo) está definido E
      // 2. A mensagem é EXATAMENTE entre currentUserId e currentChatUserIdRef
      const currentChatUserId = currentChatUserIdRef.current;
      
      // Se não temos currentChatUserId, não podemos verificar, então ignorar
      if (!currentChatUserId) {
        console.log('[useChat] ⚠️ currentChatUserIdRef não está definido, ignorando mensagem');
        console.log('[useChat] 💡 Dica: Isso pode acontecer se a conversa ainda não foi carregada');
        return;
      }
      
      // Se não temos currentUserId, não podemos verificar corretamente
      if (!currentUserId) {
        console.log('[useChat] ⚠️ currentUserId não está disponível, ignorando mensagem');
        return;
      }
      
      // Verificar se a mensagem é EXATAMENTE entre os dois participantes da conversa
      // A mensagem deve ter senderId E receiverId correspondendo exatamente a currentUserId e currentChatUserId (em qualquer ordem)
      const isFromCurrentConversation =
        // Caso 1: currentUserId é o sender e currentChatUserId é o receiver
        (message.senderId === currentUserId && message.receiverId === currentChatUserId) ||
        // Caso 2: currentChatUserId é o sender e currentUserId é o receiver
        (message.senderId === currentChatUserId && message.receiverId === currentUserId);

      console.log('[useChat] Verificação de conversa:', {
        currentChatUserId,
        currentUserId,
        messageSenderId: message.senderId,
        messageReceiverId: message.receiverId,
        isFromCurrentConversation,
        case1: message.senderId === currentUserId && message.receiverId === currentChatUserId,
        case2: message.senderId === currentChatUserId && message.receiverId === currentUserId,
      });

      if (!isFromCurrentConversation) {
        console.log('[useChat] ⚠️ Mensagem não é da conversa atual, ignorando:', {
          messageSenderId: message.senderId,
          messageReceiverId: message.receiverId,
          currentChatUserId: currentChatUserId,
          currentUserId: currentUserId,
        });
        return;
      }

      console.log('[useChat] ✅ Mensagem é da conversa atual, adicionando');
      setMessages((prev) => {
        // Verificar se a mensagem já existe (pode ter sido adicionada pela API response ou por outro evento)
        const exists = prev.some((msg) => msg.id === message.id);
        if (exists) {
          console.log('[useChat] ⚠️ Mensagem já existe, ignorando duplicata do Socket.IO');
          console.log('[useChat] 💡 Isso é normal se a mensagem foi adicionada pela resposta da API');
          return prev;
        }
        
        // Verificar se há uma mensagem otimista temporária com o mesmo conteúdo e timestamp similar
        // Isso pode acontecer se o evento WebSocket chegar antes da resposta da API
        const hasSimilarOptimistic = prev.some((msg) => 
          msg.id.startsWith('temp-') && 
          msg.content === message.content &&
          msg.senderId === message.senderId &&
          msg.receiverId === message.receiverId
        );
        
        if (hasSimilarOptimistic) {
          console.log('[useChat] 🔄 Encontrada mensagem otimista similar, substituindo pela real');
          // Remover mensagens otimistas similares e adicionar a real
          const withoutOptimistic = prev.filter((msg) => 
            !(msg.id.startsWith('temp-') && 
              msg.content === message.content &&
              msg.senderId === message.senderId &&
              msg.receiverId === message.receiverId)
          );
          const updated = [...withoutOptimistic, message];
          const sorted = updated.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          console.log('[useChat] 📊 Total de mensagens após substituir otimista:', sorted.length);
          return sorted;
        }
        
        console.log('[useChat] ✅ Adicionando mensagem recebida via Socket.IO ao estado');
        const updated = [...prev, message];
        const sorted = updated.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        console.log('[useChat] 📊 Total de mensagens após adicionar:', sorted.length);
        return sorted;
      });
    });

    newSocket.on('messages_read', (data: { receiverId: string; readAt: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === data.receiverId ? { ...msg, isRead: true } : msg
        )
      );
    });

    newSocket.on('typing', (data: { userId?: string; receiverId?: string; senderId?: string; isTyping: boolean }) => {
      console.log('[useChat] 📝 Evento typing recebido:', data);
      console.log('[useChat] Socket conectado:', newSocket.connected);
      console.log('[useChat] Socket ID:', newSocket.id);
      console.log('[useChat] currentChatUserIdRef atual:', currentChatUserIdRef.current);
      
      // Verificar se o socket está conectado
      if (!newSocket.connected) {
        console.log('[useChat] ⚠️ Socket não está conectado, ignorando evento typing');
        return;
      }
      
      // Obter ID do usuário atual do token
      let currentUserId = '';
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          currentUserId = payload.sub || payload.userId || payload.id || '';
        }
      } catch (e) {
        console.error('[useChat] Erro ao decodificar token para typing:', e);
        return;
      }
      
      // O backend pode enviar o evento de diferentes formas:
      // 1. { userId, isTyping } - onde userId é quem está digitando
      // 2. { senderId, receiverId, isTyping } - onde senderId é quem está digitando e receiverId é quem deve ver
      const typingUserId = data.userId || data.senderId;
      const targetUserId = data.receiverId;
      const currentChatUserId = currentChatUserIdRef.current;
      
      console.log('[useChat] Dados do evento typing:', {
        typingUserId,
        targetUserId,
        currentChatUserId,
        currentUserId,
        isTyping: data.isTyping,
      });
      
      // Se não temos currentChatUserId, não podemos verificar
      if (!currentChatUserId) {
        console.log('[useChat] ⚠️ currentChatUserIdRef não está definido, ignorando evento typing');
        return;
      }
      
      // Verificar se o evento é para a conversa atual
      // O evento é relevante se:
      // 1. O usuário digitando é o amigo (currentChatUserId) E o target é o usuário atual, OU
      // 2. O userId/senderId é o amigo (currentChatUserId)
      const isRelevantForCurrentChat =
        // Caso 1: O amigo está digitando e o target é o usuário atual (ou não há target)
        (typingUserId === currentChatUserId && (targetUserId === currentUserId || !targetUserId)) ||
        // Caso 2: O evento tem userId/senderId igual ao amigo (sem verificação de target)
        (typingUserId === currentChatUserId);
      
      if (isRelevantForCurrentChat) {
        console.log('[useChat] ✅ Evento typing é da conversa atual, atualizando indicador');
        setIsTyping(data.isTyping);
        setTypingUserId(data.isTyping ? currentChatUserId : null);
      } else {
        console.log('[useChat] ⚠️ Evento typing não é da conversa atual, ignorando:', {
          typingUserId,
          targetUserId,
          currentChatUserId,
          currentUserId,
        });
      }
    });

    newSocket.on('message_deleted', (data: { messageId: string; message: Message }) => {
      console.log('[useChat] 🗑️ Evento message_deleted recebido:', data);
      
      // Verificar se a mensagem deletada pertence à conversa atual
      const isFromCurrentConversation = 
        data.message.senderId === currentChatUserIdRef.current || 
        data.message.receiverId === currentChatUserIdRef.current;
      
      if (!isFromCurrentConversation) {
        console.log('[useChat] ⚠️ Mensagem deletada não é da conversa atual, ignorando');
        return;
      }
      
      // Atualizar a mensagem na lista com o conteúdo "Mensagem apagada"
      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg.id === data.messageId);
        if (!messageExists) {
          console.log('[useChat] ⚠️ Mensagem não encontrada na UI, ignorando');
          return prev;
        }
        
        console.log('[useChat] ✅ Atualizando mensagem deletada na UI');
        return prev.map((msg) =>
          msg.id === data.messageId ? data.message : msg
        );
      });
      
      // Se a mensagem estava fixada, atualizar a lista de fixadas
      setPinnedMessages((prev) => {
        const wasPinned = prev.some((p) => p.messageId === data.messageId);
        if (wasPinned && currentChatUserIdRef.current) {
          // Recarregar mensagens fixadas para remover a deletada
          getPinnedMessages(currentChatUserIdRef.current)
            .then((response) => {
              if (response.success) {
                setPinnedMessages(response.data);
              }
            })
            .catch((error) => {
              console.error('[useChat] Erro ao recarregar mensagens fixadas após deletar:', error);
            });
        }
        return prev;
      });
    });

    // Evento: mensagem editada em tempo real
    newSocket.on('message_edited', (data: MessageEditedEvent) => {
      console.log('[useChat] ✏️ Evento message_edited recebido:', data);

      // Verificar se a mensagem editada pertence à conversa atual
      // A mensagem pertence à conversa se o currentChatUserIdRef é o senderId ou receiverId
      const isFromCurrentConversation =
        data.senderId === currentChatUserIdRef.current ||
        data.receiverId === currentChatUserIdRef.current;

      if (!isFromCurrentConversation) {
        console.log('[useChat] ⚠️ Mensagem editada não é da conversa atual, ignorando');
        return;
      }

      // Atualizar a mensagem na lista com novo conteúdo e flag edited
      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg.id === data.id);
        if (!messageExists) {
          console.log('[useChat] ⚠️ Mensagem não encontrada na UI, ignorando');
          return prev;
        }

        console.log('[useChat] ✅ Atualizando mensagem editada na UI');
        return prev.map((msg) =>
          msg.id === data.id
            ? { ...msg, content: data.content, edited: true, updatedAt: data.updatedAt }
            : msg
        );
      });
    });

    // Registrar listeners de eventos básicos (connect, disconnect, etc.)
    newSocket.on('connect', () => {
      console.log('[useChat] ✅ Conectado ao WebSocket');
      console.log('[useChat] Socket ID:', newSocket.id);
      console.log('[useChat] Socket URL:', socketUrl);
      console.log('[useChat] 🔍 Verificando listeners registrados...');
      console.log('[useChat] 🔍 Socket listeners:', {
        hasNewMessageListener: newSocket.hasListeners('new_message'),
        hasTypingListener: newSocket.hasListeners('typing'),
        hasHeartbeatAckListener: newSocket.hasListeners('heartbeat_ack'),
        hasOnAnyListener: newSocket.hasListeners('*'), // onAny pode não aparecer aqui
      });
      console.log('[useChat] 🔍 Socket conectado:', newSocket.connected);
      console.log('[useChat] 🔍 Socket transport:', (newSocket as any).io?.engine?.transport?.name);
      setIsConnected(true);
      socketRef.current = newSocket; // Atualizar ref quando conectar
      setSocket(newSocket);
      
      // Emitir um evento de teste para verificar se o socket está funcionando
      console.log('[useChat] 🧪 Emitindo evento de teste...');
      newSocket.emit('test_connection', { timestamp: new Date().toISOString() });

      // Iniciar heartbeat a cada 30 segundos
      heartbeatIntervalRef.current = setInterval(() => {
        if (newSocket.connected) {
          console.log('[useChat] 💓 Enviando heartbeat');
          newSocket.emit('heartbeat');
        }
      }, 30000); // 30 segundos
    });

    newSocket.on('heartbeat_ack', (data: any) => {
      console.log('[useChat] ✅ Heartbeat confirmado:', data);
    });

    newSocket.on('disconnect', () => {
      console.log('[useChat] ❌ Desconectado do WebSocket');
      setIsConnected(false);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('[useChat] ❌ Erro de conexão:', error);
      setIsConnected(false);
    });

    // Definir socket imediatamente para que os listeners funcionem
    setSocket(newSocket);
    socketRef.current = newSocket;

    return () => {
      console.log('[useChat] 🧹 Limpando socket e heartbeat');
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.close();
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, []);

  // Atualizar ref quando currentChatUserId mudar (mesmo que o socket já esteja conectado)
  useEffect(() => {
    if (currentChatUserId) {
      console.log('[useChat] 🔄 Atualizando currentChatUserIdRef:', currentChatUserId);
      currentChatUserIdRef.current = currentChatUserId;
    }
  }, [currentChatUserId]);

  // Escutar eventos customizados repassados pelo UserStatusProvider
  // Isso é necessário porque o backend está enviando eventos apenas para o socket do UserStatusProvider
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleNewMessage = (event: CustomEvent<Message>) => {
      console.log('[useChat] 📨 Evento new_message recebido via evento customizado:', event.detail);
      const message = event.detail;
      
      // Usar a mesma lógica do listener do socket
      const receivedAt = new Date().toISOString();
      const messageCreatedAt = message.createdAt;
      const delay = new Date(receivedAt).getTime() - new Date(messageCreatedAt).getTime();

      console.log('[useChat] ⏰ Timestamps:', {
        messageCreatedAt,
        receivedAt,
        delayMs: delay,
        delaySeconds: (delay / 1000).toFixed(2),
      });

      // Obter ID do usuário atual do token
      let currentUserId = '';
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          currentUserId = payload.sub || payload.userId || payload.id || '';
        }
      } catch (e) {
        console.error('[useChat] Erro ao decodificar token:', e);
        return;
      }

      const currentChatUserId = currentChatUserIdRef.current;

      if (!currentChatUserId || !currentUserId) {
        console.log('[useChat] ⚠️ currentChatUserIdRef ou currentUserId não está definido, ignorando mensagem');
        return;
      }

      const isFromCurrentConversation =
        (message.senderId === currentUserId && message.receiverId === currentChatUserId) ||
        (message.senderId === currentChatUserId && message.receiverId === currentUserId);

      if (!isFromCurrentConversation) {
        console.log('[useChat] ⚠️ Mensagem não é da conversa atual, ignorando');
        return;
      }

      console.log('[useChat] ✅ Mensagem é da conversa atual, adicionando');
      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === message.id);
        if (exists) {
          console.log('[useChat] ⚠️ Mensagem já existe, ignorando duplicata');
          return prev;
        }

        const hasSimilarOptimistic = prev.some((msg) =>
          msg.id.startsWith('temp-') &&
          msg.content === message.content &&
          msg.senderId === message.senderId &&
          msg.receiverId === message.receiverId
        );

        if (hasSimilarOptimistic) {
          console.log('[useChat] 🔄 Encontrada mensagem otimista similar, substituindo pela real');
          const withoutOptimistic = prev.filter((msg) =>
            !(msg.id.startsWith('temp-') &&
              msg.content === message.content &&
              msg.senderId === message.senderId &&
              msg.receiverId === message.receiverId)
          );
          const updated = [...withoutOptimistic, message];
          const sorted = updated.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          return sorted;
        }

        console.log('[useChat] ✅ Adicionando mensagem recebida via evento customizado ao estado');
        const updated = [...prev, message];
        const sorted = updated.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return sorted;
      });
    };

    const handleTyping = (event: CustomEvent<{ userId?: string; receiverId?: string; senderId?: string; isTyping: boolean }>) => {
      console.log('[useChat] 📝 Evento typing recebido via evento customizado:', event.detail);
      const data = event.detail;

      let currentUserId = '';
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          currentUserId = payload.sub || payload.userId || payload.id || '';
        }
      } catch (e) {
        console.error('[useChat] Erro ao decodificar token para typing:', e);
        return;
      }

      const typingUserId = data.userId || data.senderId;
      const targetUserId = data.receiverId;
      const currentChatUserId = currentChatUserIdRef.current;

      if (!currentChatUserId) {
        console.log('[useChat] ⚠️ currentChatUserIdRef não está definido, ignorando evento typing');
        return;
      }

      const isRelevantForCurrentChat =
        (typingUserId === currentChatUserId && (targetUserId === currentUserId || !targetUserId)) ||
        (typingUserId === currentChatUserId);

      if (isRelevantForCurrentChat) {
        console.log('[useChat] ✅ Evento typing é da conversa atual, atualizando indicador');
        setIsTyping(data.isTyping);
        setTypingUserId(data.isTyping ? currentChatUserId : null);
      } else {
        console.log('[useChat] ⚠️ Evento typing não é da conversa atual, ignorando');
      }
    };

    const handleMessageDeleted = (event: CustomEvent<{ messageId: string; message: Message }>) => {
      console.log('[useChat] 🗑️ Evento message_deleted recebido via evento customizado:', event.detail);
      const data = event.detail;

      const isFromCurrentConversation =
        data.message.senderId === currentChatUserIdRef.current ||
        data.message.receiverId === currentChatUserIdRef.current;

      if (!isFromCurrentConversation) {
        console.log('[useChat] ⚠️ Mensagem deletada não é da conversa atual, ignorando');
        return;
      }

      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg.id === data.messageId);
        if (!messageExists) {
          console.log('[useChat] ⚠️ Mensagem não encontrada na UI, ignorando');
          return prev;
        }

        console.log('[useChat] ✅ Atualizando mensagem deletada na UI');
        return prev.map((msg) =>
          msg.id === data.messageId ? data.message : msg
        );
      });

      setPinnedMessages((prev) => {
        const wasPinned = prev.some((p) => p.messageId === data.messageId);
        if (wasPinned && currentChatUserIdRef.current) {
          getPinnedMessages(currentChatUserIdRef.current)
            .then((response) => {
              if (response.success) {
                setPinnedMessages(response.data);
              }
            })
            .catch((error) => {
              console.error('[useChat] Erro ao recarregar mensagens fixadas após deletar:', error);
            });
        }
        return prev;
      });
    };

    const handleMessageEdited = (event: CustomEvent<MessageEditedEvent>) => {
      console.log('[useChat] ✏️ Evento message_edited recebido via evento customizado:', event.detail);
      const data = event.detail;

      const isFromCurrentConversation =
        data.senderId === currentChatUserIdRef.current ||
        data.receiverId === currentChatUserIdRef.current;

      if (!isFromCurrentConversation) {
        console.log('[useChat] ⚠️ Mensagem editada não é da conversa atual, ignorando');
        return;
      }

      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg.id === data.id);
        if (!messageExists) {
          console.log('[useChat] ⚠️ Mensagem não encontrada na UI, ignorando');
          return prev;
        }

        console.log('[useChat] ✅ Atualizando mensagem editada na UI');
        return prev.map((msg) =>
          msg.id === data.id
            ? { ...msg, content: data.content, edited: true, updatedAt: data.updatedAt }
            : msg
        );
      });
    };

    window.addEventListener('chat_new_message', handleNewMessage as EventListener);
    window.addEventListener('chat_typing', handleTyping as EventListener);
    window.addEventListener('chat_message_deleted', handleMessageDeleted as EventListener);
    window.addEventListener('chat_message_edited', handleMessageEdited as EventListener);

    return () => {
      window.removeEventListener('chat_new_message', handleNewMessage as EventListener);
      window.removeEventListener('chat_typing', handleTyping as EventListener);
      window.removeEventListener('chat_message_deleted', handleMessageDeleted as EventListener);
      window.removeEventListener('chat_message_edited', handleMessageEdited as EventListener);
    };
  }, [currentChatUserId]);

  const loadConversation = useCallback(async (friendId: string) => {
    if (!friendId) return;

    try {
      console.log('[useChat] 🔄 Carregando conversa com friendId:', friendId);
      // Atualizar ref IMEDIATAMENTE antes de qualquer outra operação
      // Isso garante que os listeners do socket tenham o valor correto
      currentChatUserIdRef.current = friendId;
      setCurrentChatUserId(friendId);
      console.log('[useChat] ✅ currentChatUserIdRef atualizado para:', friendId);
      
      setMessages([]);
      setPinnedMessages([]);
      // Limpar indicador de typing ao carregar nova conversa
      setIsTyping(false);
      setTypingUserId(null);

      const response = await getConversation(friendId);
      const sortedMessages = response.data.messages.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sortedMessages);

      // Carregar mensagens fixadas
      try {
        const pinnedResponse = await getPinnedMessages(friendId);
        if (pinnedResponse.success) {
          setPinnedMessages(pinnedResponse.data);
        }
      } catch (error) {
        console.error('[useChat] Erro ao carregar mensagens fixadas:', error);
      }

      await markMessagesAsRead(friendId);
    } catch (error) {
      console.error('[useChat] Erro ao carregar conversa:', error);
    }
  }, []);

  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!content.trim()) return;
    
    // Obter userId do token JWT
    let senderId = '';
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        senderId = payload.sub || payload.userId || payload.id || '';
      }
    } catch (e) {
      console.error('[useChat] Erro ao decodificar token:', e);
    }
    
    // Criar mensagem otimista temporária
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMessage: Message = {
      id: tempId,
      senderId: senderId,
      receiverId: receiverId,
      content: content.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    console.log('[useChat] 📤 Enviando mensagem para:', receiverId);
    console.log('[useChat] Conteúdo:', content);
    console.log('[useChat] Adicionando mensagem otimista temporária:', optimisticMessage.id);
    
    // Adicionar mensagem otimista imediatamente
    setMessages((prev) => {
      const updated = [...prev, optimisticMessage];
      return updated.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
    
    try {
      const response = await sendMessageApi(receiverId, content);
      console.log('[useChat] ✅ Resposta da API após enviar:', JSON.stringify(response, null, 2));
      
      // Substituir mensagem otimista pela mensagem real da API
      // O backend retorna a mensagem diretamente em data, não em data.message
      if (response && response.success && response.data) {
        const realMessage = response.data;
        console.log('[useChat] 📝 Mensagem real retornada pela API:', realMessage);
        
        setMessages((prev) => {
          // Verificar se a mensagem real já existe (pode ter sido adicionada pelo evento WebSocket)
          const alreadyExists = prev.some((msg) => msg.id === realMessage.id);
          
          if (alreadyExists) {
            console.log('[useChat] ⚠️ Mensagem real já existe (provavelmente adicionada pelo WebSocket), removendo apenas otimista');
            // Apenas remover a mensagem otimista, mantendo a real que já existe
            return prev.filter((msg) => msg.id !== tempId);
          }
          
          // Remover mensagem otimista e adicionar a real
          const withoutTemp = prev.filter((msg) => msg.id !== tempId);
          console.log('[useChat] ✅ Substituindo mensagem otimista pela real');
          const updated = [...withoutTemp, realMessage];
          return updated.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      } else {
        console.error('[useChat] ❌ Resposta da API não contém mensagem. Mantendo mensagem otimista.');
        console.error('[useChat] Estrutura da resposta:', {
          response,
          hasSuccess: !!response?.success,
          hasData: !!response?.data
        });
      }
    } catch (error) {
      console.error('[useChat] ❌ Erro ao enviar mensagem:', error);
      // Remover mensagem otimista em caso de erro
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      throw error;
    }
  }, [currentChatUserId]);

  const sendTypingIndicator = useCallback((receiverId: string, isTyping: boolean) => {
    if (!socketRef.current || !socketRef.current.connected) return;
    socketRef.current.emit('typing', {
      receiverId,
      isTyping,
    });
  }, []);

  const pinMessageHandler = useCallback(async (messageId: string, friendId: string) => {
    if (!currentChatUserId) return;
    
    try {
      const response = await pinMessage(messageId, friendId);
      if (response.success) {
        // Recarregar mensagens fixadas
        const pinnedResponse = await getPinnedMessages(friendId);
        if (pinnedResponse.success) {
          setPinnedMessages(pinnedResponse.data);
        }
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('[useChat] Erro ao fixar mensagem:', error);
      return { success: false, message: 'Erro ao fixar mensagem' };
    }
  }, [currentChatUserId]);

  const unpinMessageHandler = useCallback(async (messageId: string) => {
    if (!currentChatUserId) return;
    
    try {
      const response = await unpinMessage(messageId);
      if (response.success) {
        // Recarregar mensagens fixadas
        const pinnedResponse = await getPinnedMessages(currentChatUserId);
        if (pinnedResponse.success) {
          setPinnedMessages(pinnedResponse.data);
        }
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('[useChat] Erro ao desfixar mensagem:', error);
      return { success: false, message: 'Erro ao desfixar mensagem' };
    }
  }, [currentChatUserId]);

  const editMessageHandler = useCallback(async (messageId: string, content: string) => {
    try {
      const response = await editMessage(messageId, content);
      if (response.success) {
        // Atualizar a mensagem na lista
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: response.data.content }
              : msg
          )
        );
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('[useChat] Erro ao editar mensagem:', error);
      return { success: false, message: 'Erro ao editar mensagem' };
    }
  }, []);

  const deleteMessageHandler = useCallback(async (messageId: string) => {
    try {
      const response = await deleteMessage(messageId);
      if (response.success) {
        // Não remover a mensagem aqui - o evento WebSocket message_deleted
        // será recebido e atualizará a mensagem com "Mensagem apagada"
        // A atualização da lista de fixadas também será feita pelo evento WebSocket
        console.log('[useChat] ✅ Mensagem deletada com sucesso, aguardando evento WebSocket');
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('[useChat] Erro ao excluir mensagem:', error);
      return { success: false, message: 'Erro ao excluir mensagem' };
    }
  }, []);

  return {
    socket,
    isConnected,
    messages,
    currentChatUserId,
    isTyping,
    typingUserId,
    pinnedMessages,
    loadConversation,
    sendMessage,
    sendTypingIndicator,
    pinMessage: pinMessageHandler,
    unpinMessage: unpinMessageHandler,
    editMessage: editMessageHandler,
    deleteMessage: deleteMessageHandler,
    setMessages,
  };
}

