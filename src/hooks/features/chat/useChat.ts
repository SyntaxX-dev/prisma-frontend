"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { env } from '@/lib/env';
import { sendMessage as sendMessageApi } from '@/api/messages/send-message';
import { getConversation } from '@/api/messages/get-conversation';
import { markMessagesAsRead } from '@/api/messages/mark-as-read';
import { Message } from '@/api/messages/send-message';

export function useChat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatUserId, setCurrentChatUserId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const currentChatUserIdRef = useRef<string | null>(null);

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

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('new_message', (message: Message) => {
      console.log('[useChat] 📨 Evento new_message recebido via Socket.IO:', message);
      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === message.id);
        if (exists) {
          console.log('[useChat] ⚠️ Mensagem já existe, ignorando duplicata do Socket.IO');
          return prev;
        }
        console.log('[useChat] ✅ Adicionando mensagem recebida via Socket.IO ao estado');
        const updated = [...prev, message];
        return updated.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    });

    newSocket.on('messages_read', (data: { receiverId: string; readAt: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === data.receiverId ? { ...msg, isRead: true } : msg
        )
      );
    });

    newSocket.on('typing', (data: { userId: string; isTyping: boolean }) => {
      console.log('[useChat] 📝 Evento typing recebido:', data);
      console.log('[useChat] currentChatUserIdRef atual:', currentChatUserIdRef.current);
      
      // Verificar se o evento é do usuário com quem estamos conversando
      // Usar ref para ter sempre o valor mais atual
      if (data.userId === currentChatUserIdRef.current) {
        console.log('[useChat] ✅ É do usuário atual, atualizando indicador');
        setIsTyping(data.isTyping);
        setTypingUserId(data.isTyping ? data.userId : null);
      } else {
        console.log('[useChat] ⚠️ Evento não é do usuário atual, ignorando');
      }
    });

    setSocket(newSocket);
    socketRef.current = newSocket;

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.close();
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, []);

  const loadConversation = useCallback(async (friendId: string) => {
    if (!friendId) return;

    try {
      setCurrentChatUserId(friendId);
      currentChatUserIdRef.current = friendId; // Atualizar ref também
      setMessages([]);
      // Limpar indicador de typing ao carregar nova conversa
      setIsTyping(false);
      setTypingUserId(null);

      const response = await getConversation(friendId);
      const sortedMessages = response.data.messages.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sortedMessages);

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
          // Remover mensagem otimista e adicionar a real
          const withoutTemp = prev.filter((msg) => msg.id !== tempId);
          const exists = withoutTemp.some((msg) => msg.id === realMessage.id);
          
          if (exists) {
            console.log('[useChat] ⚠️ Mensagem real já existe, mantendo');
            return withoutTemp;
          }
          
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

  return {
    socket,
    isConnected,
    messages,
    currentChatUserId,
    isTyping,
    typingUserId,
    loadConversation,
    sendMessage,
    sendTypingIndicator,
    setMessages,
  };
}

