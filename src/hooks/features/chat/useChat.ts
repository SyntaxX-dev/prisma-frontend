"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { sendMessage as sendMessageApi } from '@/api/messages/send-message';
import type { MessageAttachment } from '@/types/file-upload';
import { getConversation } from '@/api/messages/get-conversation';
import { markMessagesAsRead } from '@/api/messages/mark-as-read';
import { Message } from '@/api/messages/send-message';
import { pinMessage } from '@/api/messages/pin-message';
import { unpinMessage } from '@/api/messages/unpin-message';
import { getPinnedMessages, PinnedMessage } from '@/api/messages/get-pinned-messages';
import { editMessage } from '@/api/messages/edit-message';
import { deleteMessage } from '@/api/messages/delete-message';
import type { MessageEditedEvent } from '@/types/message-events';

// Socket compartilhado globalmente entre useChat e useCommunityChat
declare global {
  var __sharedChatSocket: Socket | null;
  var __sharedChatSocketListenersCount: number;
}

if (typeof window !== 'undefined') {
  if (!window.__sharedChatSocket) {
    window.__sharedChatSocket = null;
  }
  if (typeof window.__sharedChatSocketListenersCount === 'undefined') {
    window.__sharedChatSocketListenersCount = 0;
  }
}

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
  const pendingAttachmentFetchesRef = useRef<Set<string>>(new Set());

  // Função auxiliar para registrar todos os listeners do chat direto
  const registerDirectChatListeners = useCallback((socket: Socket) => {
    if (!socket) {
      return;
    }

    // Remover listeners antigos para evitar duplicatas
    // IMPORTANTE: Só remover se o socket estiver conectado e tiver listeners
    if (socket.connected) {
      socket.off('new_message');
      socket.off('typing');
      socket.off('message_deleted');
      socket.off('message_edited');
      socket.off('messages_read');
    }

    // Registrar listener de new_message
    socket.on('new_message', (message: Message) => {
      const receivedAt = new Date().toISOString();
      const messageCreatedAt = message.createdAt;
      const delay = new Date(receivedAt).getTime() - new Date(messageCreatedAt).getTime();

      // Verificar se o socket está conectado
      if (!socket.connected) {
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
        return;
      }

      // Verificar se a mensagem pertence à conversa atual
      const currentChatUserId = currentChatUserIdRef.current;

      if (!currentChatUserId || !currentUserId) {
        return;
      }

      const isFromCurrentConversation =
        (message.senderId === currentUserId && message.receiverId === currentChatUserId) ||
        (message.senderId === currentChatUserId && message.receiverId === currentUserId);

      if (!isFromCurrentConversation) {
        return;
      }

      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === message.id);
        if (exists) {
          return prev;
        }

        const hasSimilarOptimistic = prev.some((msg) => {
          if (!msg.id.startsWith('temp-')) return false;
          if (msg.senderId !== message.senderId) return false;
          if (msg.receiverId !== message.receiverId) return false;
          const contentsMatch = (!msg.content && !message.content) || msg.content === message.content;
          if (!contentsMatch) return false;

          const optimisticAttachmentsLength = msg.attachments?.length || 0;
          const incomingAttachmentsLength = message.attachments?.length || 0;
          const attachmentsMatch =
            optimisticAttachmentsLength === incomingAttachmentsLength ||
            (optimisticAttachmentsLength > 0 && incomingAttachmentsLength === 0);

          return attachmentsMatch;
        });

        if (hasSimilarOptimistic) {
          const optimisticMsg = prev.find((msg) => {
            if (!msg.id.startsWith('temp-')) return false;
            if (msg.senderId !== message.senderId) return false;
            if (msg.receiverId !== message.receiverId) return false;
            const contentsMatch = (!msg.content && !message.content) || msg.content === message.content;
            if (!contentsMatch) return false;

            const optimisticAttachmentsLength = msg.attachments?.length || 0;
            const incomingAttachmentsLength = message.attachments?.length || 0;
            const attachmentsMatch =
              optimisticAttachmentsLength === incomingAttachmentsLength ||
              (optimisticAttachmentsLength > 0 && incomingAttachmentsLength === 0);

            return attachmentsMatch;
          });

          const withoutOptimistic = prev.filter((msg) => {
            if (!msg.id.startsWith('temp-')) return true;
            if (msg.senderId !== message.senderId) return true;
            if (msg.receiverId !== message.receiverId) return true;
            const contentsMatch =
              (!msg.content && !message.content) || msg.content === message.content;
            if (!contentsMatch) return true;

            const optimisticAttachmentsLength = msg.attachments?.length || 0;
            const incomingAttachmentsLength = message.attachments?.length || 0;
            const attachmentsMatch =
              optimisticAttachmentsLength === incomingAttachmentsLength ||
              (optimisticAttachmentsLength > 0 && incomingAttachmentsLength === 0);

            return !attachmentsMatch;
          });

          const finalAttachments = message.attachments && message.attachments.length > 0
            ? message.attachments
            : (optimisticMsg?.attachments && optimisticMsg.attachments.length > 0
              ? optimisticMsg.attachments
              : []);

          const messageWithAttachments: Message = {
            ...message,
            attachments: finalAttachments,
            clientId: optimisticMsg?.id,
          };

          const updated = [...withoutOptimistic, messageWithAttachments];
          const sorted = updated.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          return sorted;
        }

        const currentTimeForSimilar = Date.now();
        const similarOptimistic = prev.find((msg) => {
          if (!msg.id.startsWith('temp-')) return false;
          if (msg.senderId !== message.senderId) return false;
          if (msg.receiverId !== message.receiverId) return false;

          const optimisticTime = new Date(msg.createdAt).getTime();
          const timeDiff = currentTimeForSimilar - optimisticTime;
          if (timeDiff > 5000) return false;

          const optimisticHasAttachments = (msg.attachments?.length || 0) > 0;
          if (optimisticHasAttachments) return true;

          const contentsMatch = (!msg.content && !message.content) || msg.content === message.content;
          return contentsMatch;
        });

        const finalAttachments = message.attachments && message.attachments.length > 0
          ? message.attachments
          : (similarOptimistic?.attachments && similarOptimistic.attachments.length > 0
            ? similarOptimistic.attachments
            : []);

        if (similarOptimistic && finalAttachments.length > 0 && (!message.attachments || message.attachments.length === 0)) {
        }

        const messageWithAttachments: Message = {
          ...message,
          attachments: finalAttachments,
          clientId: similarOptimistic?.id,
        };

        const updated = [...prev, messageWithAttachments];
        const sorted = updated.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        if ((!finalAttachments || finalAttachments.length === 0) && message.id && !message.id.startsWith('temp-')) {
          if (pendingAttachmentFetchesRef.current.has(message.id)) {
            return sorted;
          }

          const messageTime = new Date(message.createdAt).getTime();
          const timeDiff = Date.now() - messageTime;

          if (timeDiff < 30000) {
            pendingAttachmentFetchesRef.current.add(message.id);

            const friendId = message.receiverId === currentUserId ? message.senderId : message.receiverId;

            const attempts = [500, 1000, 2000];
            attempts.forEach((delay, index) => {
              setTimeout(async () => {
                try {
                  let shouldContinue = true;
                  setMessages((prev) => {
                    const currentMsg = prev.find((msg) => msg.id === message.id);
                    if (currentMsg && currentMsg.attachments && currentMsg.attachments.length > 0) {
                      pendingAttachmentFetchesRef.current.delete(message.id);
                      shouldContinue = false;
                    }
                    return prev;
                  });

                  if (!shouldContinue) {
                    return;
                  }

                  const { getConversation } = await import('@/api/messages/get-conversation');
                  const response = await getConversation(friendId, 10, 0);

                  if (response.success && response.data.messages.length > 0) {
                    const foundMessage = response.data.messages.find((msg: Message) => msg.id === message.id);

                    if (foundMessage && foundMessage.attachments && foundMessage.attachments.length > 0) {
                      setMessages((prev) => {
                        const msg = prev.find((m) => m.id === message.id);
                        if (msg && msg.attachments && msg.attachments.length > 0) {
                          return prev;
                        }

                        const updated = prev.map((msg) =>
                          msg.id === message.id
                            ? { ...msg, attachments: foundMessage.attachments }
                            : msg
                        );
                        return updated;
                      });
                      pendingAttachmentFetchesRef.current.delete(message.id);
                    } else {
                      if (index === attempts.length - 1) {
                        pendingAttachmentFetchesRef.current.delete(message.id);
                      }
                    }
                  } else {
                    if (index === attempts.length - 1) {
                      pendingAttachmentFetchesRef.current.delete(message.id);
                    }
                  }
                } catch (error) {
                  if (index === attempts.length - 1) {
                    pendingAttachmentFetchesRef.current.delete(message.id);
                  }
                }
              }, delay);
            });
          }
        }

        return sorted;
      });
    });

    // Registrar listener de typing
    socket.on('typing', (data: { userId?: string; receiverId?: string; senderId?: string; isTyping: boolean }) => {
      if (!socket.connected) {
        return;
      }

      let currentUserId = '';
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          currentUserId = payload.sub || payload.userId || payload.id || '';
        }
      } catch (e) {
        return;
      }

      const typingUserId = data.userId || data.senderId;
      const currentChatUserId = currentChatUserIdRef.current;

      if (!currentChatUserId) {
        return;
      }

      // Verificar se o evento é relevante para a conversa atual
      // O evento é relevante se:
      // 1. O usuário que está digitando é o amigo da conversa atual (typingUserId === currentChatUserId)
      // 2. E o evento é direcionado para o usuário atual (targetUserId === currentUserId ou não especificado)
      // OU simplesmente se o usuário que está digitando é o amigo da conversa atual
      const isRelevantForCurrentChat = typingUserId === currentChatUserId;

      if (isRelevantForCurrentChat) {
        setIsTyping(data.isTyping);
        setTypingUserId(data.isTyping ? typingUserId : null);
      }
    });

    // Registrar listener de message_deleted
    socket.on('message_deleted', (data: { messageId: string; message: Message }) => {
      const isFromCurrentConversation =
        data.message.senderId === currentChatUserIdRef.current ||
        data.message.receiverId === currentChatUserIdRef.current;

      if (!isFromCurrentConversation) {
        return;
      }

      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg.id === data.messageId);
        if (!messageExists) {
          return prev;
        }

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
            });
        }
        return prev;
      });
    });

    // Registrar listener de message_edited
    socket.on('message_edited', (data: MessageEditedEvent) => {
      const isFromCurrentConversation =
        data.senderId === currentChatUserIdRef.current ||
        data.receiverId === currentChatUserIdRef.current;

      if (!isFromCurrentConversation) {
        return;
      }

      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg.id === data.id);
        if (!messageExists) {
          return prev;
        }

        return prev.map((msg) =>
          msg.id === data.id
            ? { ...msg, content: data.content, edited: true, updatedAt: data.updatedAt }
            : msg
        );
      });
    });

    // Registrar listener de messages_read
    socket.on('messages_read', (data: { receiverId: string; readAt: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === data.receiverId ? { ...msg, isRead: true } : msg
        )
      );
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // O UserStatusProvider é o dono do socket compartilhado (window.__sharedChatSocket).
    // useChat apenas reutiliza esse socket e registra seus listeners via eventos customizados.
    // Não criamos socket próprio aqui para evitar que o backend sobrescreva o socketId do usuário.

    const syncWithSharedSocket = () => {
      if (window.__sharedChatSocket) {
        const sharedSocket = window.__sharedChatSocket;
        socketRef.current = sharedSocket;
        setSocket(sharedSocket);
        setIsConnected(sharedSocket.connected);
        console.log('[useChat] 🔗 Sincronizado com socket compartilhado. connected:', sharedSocket.connected, 'id:', sharedSocket.id);
      } else {
        console.warn('[useChat] ⚠️ window.__sharedChatSocket ainda não existe');
      }
    };

    syncWithSharedSocket();

    // Verificar periodicamente até o socket compartilhado estar disponível e conectado.
    // O interval se auto-cancela assim que o socket estiver pronto.
    const checkInterval = setInterval(() => {
      if (window.__sharedChatSocket?.connected) {
        syncWithSharedSocket();
        clearInterval(checkInterval);
      }
    }, 500);

    // Escutar evento de conexão do socket compartilhado via evento customizado
    const handleSocketConnected = () => {
      syncWithSharedSocket();
      clearInterval(checkInterval);
    };
    window.addEventListener('chat_socket_connected', handleSocketConnected);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('chat_socket_connected', handleSocketConnected);
    };
  }, []);

  // Atualizar ref quando currentChatUserId mudar
  useEffect(() => {
    if (currentChatUserId) {
      currentChatUserIdRef.current = currentChatUserId;
      setIsTyping(false);
      setTypingUserId(null);
    } else {
      currentChatUserIdRef.current = null;
      setIsTyping(false);
      setTypingUserId(null);
    }
  }, [currentChatUserId]);

  // Escutar eventos customizados repassados pelo UserStatusProvider
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleNewMessage = (event: CustomEvent<Message>) => {
      const message = event.detail;
      console.log('[useChat] 📨 handleNewMessage recebido:', message);

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
      console.log('[useChat] currentUserId:', currentUserId, 'currentChatUserId:', currentChatUserId);

      if (!currentChatUserId || !currentUserId) {
        console.warn('[useChat] ⚠️ currentChatUserId ou currentUserId vazio, ignorando mensagem');
        return;
      }

      const isFromCurrentConversation =
        (message.senderId === currentUserId && message.receiverId === currentChatUserId) ||
        (message.senderId === currentChatUserId && message.receiverId === currentUserId);

      if (!isFromCurrentConversation) {
        console.warn('[useChat] ⚠️ Mensagem não é da conversa atual, ignorando:', {
          messageSenderId: message.senderId,
          messageReceiverId: message.receiverId,
          currentUserId,
          currentChatUserId,
        });
        return;
      }
      console.log('[useChat] ✅ Mensagem é da conversa atual, adicionando ao estado');

      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === message.id);
        if (exists) {
          return prev;
        }

        const hasSimilarOptimistic = prev.some((msg) => {
          if (!msg.id.startsWith('temp-')) return false;
          if (msg.senderId !== message.senderId) return false;
          if (msg.receiverId !== message.receiverId) return false;
          const contentsMatch = (!msg.content && !message.content) || msg.content === message.content;
          if (!contentsMatch) return false;

          const optimisticAttachmentsLength = msg.attachments?.length || 0;
          const incomingAttachmentsLength = message.attachments?.length || 0;
          const attachmentsMatch =
            optimisticAttachmentsLength === incomingAttachmentsLength ||
            (optimisticAttachmentsLength > 0 && incomingAttachmentsLength === 0);

          return attachmentsMatch;
        });

        if (hasSimilarOptimistic) {
          const optimisticMsg = prev.find((msg) => {
            if (!msg.id.startsWith('temp-')) return false;
            if (msg.senderId !== message.senderId) return false;
            if (msg.receiverId !== message.receiverId) return false;
            const contentsMatch = (!msg.content && !message.content) || msg.content === message.content;
            if (!contentsMatch) return false;

            const optimisticAttachmentsLength = msg.attachments?.length || 0;
            const incomingAttachmentsLength = message.attachments?.length || 0;
            const attachmentsMatch =
              optimisticAttachmentsLength === incomingAttachmentsLength ||
              (optimisticAttachmentsLength > 0 && incomingAttachmentsLength === 0);

            return attachmentsMatch;
          });

          const withoutOptimistic = prev.filter((msg) => {
            if (!msg.id.startsWith('temp-')) return true;
            if (msg.senderId !== message.senderId) return true;
            if (msg.receiverId !== message.receiverId) return true;
            const contentsMatch =
              (!msg.content && !message.content) || msg.content === message.content;
            if (!contentsMatch) return true;

            const optimisticAttachmentsLength = msg.attachments?.length || 0;
            const incomingAttachmentsLength = message.attachments?.length || 0;
            const attachmentsMatch =
              optimisticAttachmentsLength === incomingAttachmentsLength ||
              (optimisticAttachmentsLength > 0 && incomingAttachmentsLength === 0);

            return !attachmentsMatch;
          });

          const finalAttachments = message.attachments && message.attachments.length > 0
            ? message.attachments
            : (optimisticMsg?.attachments && optimisticMsg.attachments.length > 0
              ? optimisticMsg.attachments
              : []);

          const messageWithAttachments: Message = {
            ...message,
            attachments: finalAttachments,
            clientId: optimisticMsg?.id,
          };

          const updated = [...withoutOptimistic, messageWithAttachments];
          const sorted = updated.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          return sorted;
        }


        const currentTimeForCustom = Date.now();
        const similarOptimistic = prev.find((msg) => {
          if (!msg.id.startsWith('temp-')) return false;
          if (msg.senderId !== message.senderId) return false;
          if (msg.receiverId !== message.receiverId) return false;

          const optimisticTime = new Date(msg.createdAt).getTime();
          const timeDiff = currentTimeForCustom - optimisticTime;
          if (timeDiff > 5000) return false;

          const optimisticHasAttachments = (msg.attachments?.length || 0) > 0;
          if (optimisticHasAttachments) return true;

          const contentsMatch = (!msg.content && !message.content) || msg.content === message.content;
          return contentsMatch;
        });

        const finalAttachments = message.attachments && message.attachments.length > 0
          ? message.attachments
          : (similarOptimistic?.attachments && similarOptimistic.attachments.length > 0
            ? similarOptimistic.attachments
            : []);

        if (similarOptimistic && finalAttachments.length > 0 && (!message.attachments || message.attachments.length === 0)) {
        }

        const messageWithAttachments: Message = {
          ...message,
          attachments: finalAttachments,
          clientId: similarOptimistic?.id,
        };

        const updated = [...prev, messageWithAttachments];
        const sorted = updated.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return sorted;
      });
    };

    const handleTyping = (event: CustomEvent<{ userId?: string; receiverId?: string; senderId?: string; isTyping: boolean }>) => {
      const data = event.detail;

      let currentUserId = '';
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          currentUserId = payload.sub || payload.userId || payload.id || '';
        }
      } catch (e) {
        return;
      }

      const typingUserId = data.userId || data.senderId;
      const targetUserId = data.receiverId;
      const currentChatUserId = currentChatUserIdRef.current;

      if (!currentChatUserId) {
        return;
      }

      const isRelevantForCurrentChat =
        (typingUserId === currentChatUserId && (targetUserId === currentUserId || !targetUserId)) ||
        (typingUserId === currentChatUserId);

      if (isRelevantForCurrentChat) {
        setIsTyping(data.isTyping);
        setTypingUserId(data.isTyping ? currentChatUserId : null);
      } else {
      }
    };

    const handleMessageDeleted = (event: CustomEvent<{ messageId: string; message: Message }>) => {
      const data = event.detail;

      const isFromCurrentConversation =
        data.message.senderId === currentChatUserIdRef.current ||
        data.message.receiverId === currentChatUserIdRef.current;

      if (!isFromCurrentConversation) {
        return;
      }

      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg.id === data.messageId);
        if (!messageExists) {
          return prev;
        }

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
            });
        }
        return prev;
      });
    };

    const handleMessageEdited = (event: CustomEvent<MessageEditedEvent>) => {
      const data = event.detail;

      const isFromCurrentConversation =
        data.senderId === currentChatUserIdRef.current ||
        data.receiverId === currentChatUserIdRef.current;

      if (!isFromCurrentConversation) {
        return;
      }

      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg.id === data.id);
        if (!messageExists) {
          return prev;
        }

        return prev.map((msg) =>
          msg.id === data.id
            ? { ...msg, content: data.content, edited: true, updatedAt: data.updatedAt }
            : msg
        );
      });
    };

    const handleMessagesRead = (event: CustomEvent<{ receiverId: string; readAt: string }>) => {
      const data = event.detail;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === data.receiverId ? { ...msg, isRead: true } : msg
        )
      );
    };

    window.addEventListener('chat_new_message', handleNewMessage as EventListener);
    window.addEventListener('chat_typing', handleTyping as EventListener);
    window.addEventListener('chat_message_deleted', handleMessageDeleted as EventListener);
    window.addEventListener('chat_message_edited', handleMessageEdited as EventListener);
    window.addEventListener('chat_messages_read', handleMessagesRead as EventListener);

    return () => {
      window.removeEventListener('chat_new_message', handleNewMessage as EventListener);
      window.removeEventListener('chat_typing', handleTyping as EventListener);
      window.removeEventListener('chat_message_deleted', handleMessageDeleted as EventListener);
      window.removeEventListener('chat_message_edited', handleMessageEdited as EventListener);
      window.removeEventListener('chat_messages_read', handleMessagesRead as EventListener);
    };
  }, [currentChatUserId]);

  const loadConversation = useCallback(async (friendId: string) => {
    if (!friendId) {
      return;
    }

    try {
      currentChatUserIdRef.current = friendId;
      setCurrentChatUserId(friendId);

      setMessages([]);
      setPinnedMessages([]);
      setIsTyping(false);
      setTypingUserId(null);

      const response = await getConversation(friendId);
      const sortedMessages = response.data.messages.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sortedMessages);

      try {
        const pinnedResponse = await getPinnedMessages(friendId);
        if (pinnedResponse.success) {
          setPinnedMessages(pinnedResponse.data);
        }
      } catch (error) {
        console.error('[useChat] Erro ao carregar mensagens fixadas', error);
      }

      await markMessagesAsRead(friendId);
    } catch (error) {
      console.error('[useChat] Erro ao carregar conversa', error);
    }
  }, []);

  const sendMessage = useCallback(async (receiverId: string, content?: string, attachments?: MessageAttachment[]) => {
    if (!content?.trim() && (!attachments || attachments.length === 0)) return;

    // Obter userId do token JWT
    let senderId = '';
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        senderId = payload.sub || payload.userId || payload.id || '';
      }
    } catch (e) {
    }

    // Criar mensagem otimista temporária
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMessage: Message = {
      id: tempId,
      senderId: senderId,
      receiverId: receiverId,
      content: content?.trim() || '',
      isRead: false,
      createdAt: new Date().toISOString(),
      attachments: attachments?.map((att, index) => ({
        id: `temp-attachment-${index}`,
        fileUrl: att.fileUrl,
        fileName: att.fileName,
        fileType: att.fileType,
        fileSize: att.fileSize,
        thumbnailUrl: att.thumbnailUrl || null,
        width: att.width || null,
        height: att.height || null,
        duration: att.duration || null,
      })),
    };


    // Adicionar mensagem otimista imediatamente
    setMessages((prev) => {
      const updated = [...prev, optimisticMessage];
      return updated.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });

    try {
      const response = await sendMessageApi(receiverId, content, attachments);

      // Substituir mensagem otimista pela mensagem real da API
      // O backend retorna a mensagem diretamente em data, não em data.message
      if (response && response.success && response.data) {
        const realMessage = response.data;

        setMessages((prev) => {
          // Encontrar a mensagem otimista para preservar seus attachments
          const optimisticMsg = prev.find((msg) => msg.id === tempId);
          const optimisticAttachments = optimisticMsg?.attachments || [];


          // Preservar attachments da mensagem otimista se a resposta da API não tiver attachments
          const finalAttachments = (realMessage.attachments && realMessage.attachments.length > 0)
            ? realMessage.attachments
            : (optimisticAttachments.length > 0 ? optimisticAttachments : []);


          // Verificar se a mensagem real já existe (pode ter sido adicionada pelo evento WebSocket)
          const alreadyExists = prev.some((msg) => msg.id === realMessage.id);

          if (alreadyExists) {
            // Atualizar a mensagem existente com attachments se ela não tiver
            return prev.map((msg) => {
              if (msg.id === realMessage.id) {
                // Se a mensagem não tem attachments mas temos attachments preservados, adicionar
                if ((!msg.attachments || msg.attachments.length === 0) && finalAttachments.length > 0) {
                  return { ...msg, attachments: finalAttachments };
                }
                return msg;
              }
              // Remover mensagem otimista
              if (msg.id === tempId) {
                return null;
              }
              return msg;
            }).filter((msg): msg is Message => msg !== null);
          }

          // Remover mensagem otimista e adicionar a real com attachments preservados
          const withoutTemp = prev.filter((msg) => msg.id !== tempId);
          const messageWithAttachments = {
            ...realMessage,
            attachments: finalAttachments,
          };
          const updated = [...withoutTemp, messageWithAttachments];
          return updated.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      }
    } catch (error) {
      // Remover mensagem otimista em caso de erro
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      throw error;
    }
  }, [currentChatUserId]);

  const sendTypingIndicator = useCallback((receiverId: string, isTyping: boolean) => {
    // Usar o socket compartilhado se disponível, caso contrário usar o socket local
    const activeSocket = window.__sharedChatSocket?.connected
      ? window.__sharedChatSocket
      : socketRef.current;

    if (!activeSocket) {
      return;
    }

    if (!activeSocket.connected) {
      return;
    }

    // Verificar se há uma conversa selecionada
    if (!currentChatUserIdRef.current) {
      return;
    }

    // Verificar se o receiverId corresponde à conversa atual
    if (receiverId !== currentChatUserIdRef.current) {
      return;
    }

    try {
      activeSocket.emit('typing', {
        receiverId,
        isTyping,
      });
    } catch (error) {
      console.error('[useChat] Erro ao emitir evento typing', error);
    }
  }, []);

  const pinMessageHandler = useCallback(async (messageId: string, friendId: string): Promise<{ success: boolean; message?: string }> => {
    if (!currentChatUserId) {
      return { success: false, message: 'Chat não selecionado' };
    }

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
      return { success: false, message: 'Erro ao fixar mensagem' };
    }
  }, [currentChatUserId]);

  const unpinMessageHandler = useCallback(async (messageId: string): Promise<{ success: boolean; message?: string }> => {
    if (!currentChatUserId) {
      return { success: false, message: 'Chat não selecionado' };
    }

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
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
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
