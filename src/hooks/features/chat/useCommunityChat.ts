"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { env } from '@/lib/env';
import { sendCommunityMessage } from '@/api/communities/send-community-message';
import type { MessageAttachment, MessageAttachmentResponse } from '@/types/file-upload';
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

// Socket compartilhado globalmente entre useChat e useCommunityChat
// Importar do useChat (mesma referência)
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

export function useCommunityChat(communityId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<PinnedCommunityMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const currentCommunityIdRef = useRef<string | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingAttachmentFetchesRef = useRef<Set<string>>(new Set());

  // Função auxiliar para registrar todos os listeners de comunidade
  const registerCommunityListeners = useCallback((socket: Socket, commId: string) => {
    if (!socket) {
      return;
    }
    
    // Remover listeners antigos para evitar duplicatas
    if (socket.connected) {
      socket.off('new_community_message');
      socket.off('community_typing');
      socket.off('community_message_deleted');
      socket.off('community_message_edited');
    }
    
    // Registrar listener de new_community_message
    socket.on('new_community_message', (data: NewCommunityMessageEvent) => {
      const currentCommunityId = currentCommunityIdRef.current || commId;
      if (data.communityId === currentCommunityId) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === data.id);
          if (exists) {
            return prev;
          }
          
          const currentTime = Date.now();
          const hasSimilarOptimistic = prev.some((msg) => {
            if (!msg.id.startsWith('temp-')) return false;
            if (msg.senderId !== data.senderId) return false;
            if (msg.communityId !== data.communityId) return false;
            
            const optimisticTime = new Date(msg.createdAt).getTime();
            const timeDiff = currentTime - optimisticTime;
            if (timeDiff > 5000) return false;
            
            const optimisticHasAttachments = (msg.attachments?.length || 0) > 0;
            if (optimisticHasAttachments) {
              return true;
            }
            
            const contentsMatch = (!msg.content && !data.content) || msg.content === data.content;
            return contentsMatch;
          });
          
          if (hasSimilarOptimistic) {
            const optimisticMsg = prev.find((msg) => {
              if (!msg.id.startsWith('temp-')) return false;
              if (msg.senderId !== data.senderId) return false;
              if (msg.communityId !== data.communityId) return false;
              const contentsMatch = (!msg.content && !data.content) || msg.content === data.content;
              return contentsMatch;
            });
            
            const withoutOptimistic = prev.filter((msg) => {
              if (!msg.id.startsWith('temp-')) return true;
              if (msg.senderId !== data.senderId) return true;
              if (msg.communityId !== data.communityId) return true;
              const contentsMatch = (!msg.content && !data.content) || msg.content === data.content;
              return !contentsMatch;
            });
            
            const finalAttachments = data.attachments && data.attachments.length > 0
              ? data.attachments
              : (optimisticMsg?.attachments && optimisticMsg.attachments.length > 0
                  ? optimisticMsg.attachments
                  : []);
            
            const communityMessage: CommunityMessage = {
              ...data,
              edited: false,
              updatedAt: null,
              attachments: finalAttachments,
              clientId: optimisticMsg?.id,
            };
            const updated = [...withoutOptimistic, communityMessage];
            const sorted = updated.sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            return sorted;
          }
          
          const currentTimeForSimilar = Date.now();
          const optimisticWithAttachments = prev.find((msg) => {
            if (!msg.id.startsWith('temp-')) return false;
            if (msg.senderId !== data.senderId) return false;
            if (msg.communityId !== data.communityId) return false;
            const optimisticTime = new Date(msg.createdAt).getTime();
            const timeDiff = currentTimeForSimilar - optimisticTime;
            if (timeDiff > 5000) return false;
            return (msg.attachments?.length || 0) > 0;
          });
          
          const finalAttachmentsForSimilar = data.attachments && data.attachments.length > 0
            ? data.attachments
            : (optimisticWithAttachments?.attachments && optimisticWithAttachments.attachments.length > 0
                ? optimisticWithAttachments.attachments
                : []);
          
          const communityMessage: CommunityMessage = {
            ...data,
            edited: false,
            updatedAt: null,
            attachments: finalAttachmentsForSimilar,
            clientId: optimisticWithAttachments?.id,
          };
          const updated = [...prev, communityMessage];
          const sorted = updated.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          
          // Se a mensagem não tem attachments, SEMPRE tentar buscar da API
          // (o backend pode não estar enviando attachments no WebSocket)
          if ((!finalAttachmentsForSimilar || finalAttachmentsForSimilar.length === 0) && data.id && !data.id.startsWith('temp-')) {
            // Verificar se já estamos buscando attachments para esta mensagem
            if (pendingAttachmentFetchesRef.current.has(data.id)) {
              return sorted;
            }
            
            const messageTime = new Date(data.createdAt).getTime();
            const timeDiff = Date.now() - messageTime;
            
            // Sempre tentar buscar se não tiver attachments (mesmo que não seja recente)
            // O backend pode não estar enviando attachments no WebSocket
            if (timeDiff < 30000) { // 30 segundos para dar mais tempo
              // Marcar que estamos buscando attachments para esta mensagem
              pendingAttachmentFetchesRef.current.add(data.id);
              
              // Fazer múltiplas tentativas com intervalos crescentes
              const attempts = [500, 1000, 2000];
              attempts.forEach((delay, index) => {
                setTimeout(async () => {
                  try {
                    // Verificar se a mensagem já tem attachments usando setMessages com callback
                    let shouldContinue = true;
                    setMessages((prev) => {
                      const currentMsg = prev.find((msg) => msg.id === data.id);
                      if (currentMsg && currentMsg.attachments && currentMsg.attachments.length > 0) {
                        pendingAttachmentFetchesRef.current.delete(data.id);
                        shouldContinue = false;
                      }
                      return prev; // Não alterar o estado, apenas verificar
                    });
                    
                    if (!shouldContinue) {
                      return;
                    }
                    
                    const { getCommunityMessages } = await import('@/api/communities/get-community-messages');
                    const response = await getCommunityMessages(data.communityId, 10, 0); // Buscar mais mensagens para garantir
                    
                    if (response.success && response.data.length > 0) {
                      // Procurar a mensagem específica na lista
                      const foundMessage = response.data.find((msg: CommunityMessage) => msg.id === data.id);
                      
                      if (foundMessage && foundMessage.attachments && foundMessage.attachments.length > 0) {
                        setMessages((prev) => {
                          // Verificar novamente se a mensagem ainda não tem attachments
                          const msg = prev.find((m) => m.id === data.id);
                          if (msg && msg.attachments && msg.attachments.length > 0) {
                            return prev;
                          }
                          
                          const updated = prev.map((msg) => 
                            msg.id === data.id 
                              ? { ...msg, attachments: foundMessage.attachments }
                              : msg
                          );
                          return updated;
                        });
                        // Remover da lista de buscas pendentes após sucesso
                        pendingAttachmentFetchesRef.current.delete(data.id);
                      } else {
                        // Se foi a última tentativa e não encontrou, remover da lista
                        if (index === attempts.length - 1) {
                          pendingAttachmentFetchesRef.current.delete(data.id);
                        }
                      }
                    } else {
                      // Se foi a última tentativa e não encontrou, remover da lista
                      if (index === attempts.length - 1) {
                        pendingAttachmentFetchesRef.current.delete(data.id);
                      }
                    }
                  } catch (error) {
                    // Se foi a última tentativa e deu erro, remover da lista
                    if (index === attempts.length - 1) {
                      pendingAttachmentFetchesRef.current.delete(data.id);
                    }
                  }
                }, delay);
              });
            }
          }
          
          return sorted;
        });
      }
    });

    // Registrar listener de community_message_deleted
    socket.on('community_message_deleted', (data: CommunityMessageDeletedEvent) => {
      const currentCommunityId = currentCommunityIdRef.current || commId;
      if (data.communityId === currentCommunityId) {
        setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
        setPinnedMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
      }
    });

    // Registrar listener de community_message_edited
    socket.on('community_message_edited', (data: CommunityMessageEditedEvent) => {
      const currentCommunityId = currentCommunityIdRef.current || commId;
      if (data.communityId === currentCommunityId) {
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
      }
    });

    // Registrar listener de community_typing
    socket.on('community_typing', (data: { userId: string; communityId: string; isTyping: boolean }) => {
      const currentCommunityId = currentCommunityIdRef.current || commId;
      if (data.communityId === currentCommunityId) {
        setIsTyping(data.isTyping);
        setTypingUserId(data.isTyping ? data.userId : null);
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    // Se não há communityId, apenas limpar estado mas NÃO desconectar o socket compartilhado
    // O socket pode estar sendo usado pelo useChat
    if (!communityId) {
      socketRef.current = null;
      currentCommunityIdRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setMessages([]);
      setPinnedMessages([]);
      setIsTyping(false);
      setTypingUserId(null);
      return;
    }

    // Verificar se já existe um socket compartilhado
    if (window.__sharedChatSocket) {
      const wasAlreadyUsingSharedSocket = socketRef.current === window.__sharedChatSocket;
      socketRef.current = window.__sharedChatSocket;
      setSocket(window.__sharedChatSocket);
      currentCommunityIdRef.current = communityId;
      
      // Incrementar contador apenas se ainda não estava usando o socket compartilhado
      if (!wasAlreadyUsingSharedSocket) {
        window.__sharedChatSocketListenersCount++;
      }
      
      // Se o socket está conectado, usar imediatamente
      if (window.__sharedChatSocket.connected) {
        setIsConnected(true);
        registerCommunityListeners(window.__sharedChatSocket, communityId);
        
        // Iniciar heartbeat se ainda não estiver ativo
        if (!heartbeatIntervalRef.current) {
          heartbeatIntervalRef.current = setInterval(() => {
            if (window.__sharedChatSocket?.connected) {
              window.__sharedChatSocket.emit('heartbeat');
            }
          }, 30000);
        }
      } else {
        // Se o socket está desconectado, tentar reconectar
        setIsConnected(false);
        
        // Registrar listeners quando o socket conectar
        window.__sharedChatSocket.once('connect', () => {
          setIsConnected(true);
          registerCommunityListeners(window.__sharedChatSocket!, communityId);
          
          // Iniciar heartbeat se ainda não estiver ativo
          if (!heartbeatIntervalRef.current) {
            heartbeatIntervalRef.current = setInterval(() => {
              if (window.__sharedChatSocket?.connected) {
                window.__sharedChatSocket.emit('heartbeat');
              }
            }, 30000);
          }
        });
        
        // Tentar reconectar
        window.__sharedChatSocket.connect();
      }
      
      return;
    }

    if (socketRef.current?.connected && currentCommunityIdRef.current === communityId) return;

    // Desconectar socket anterior se mudou de comunidade (apenas se não for compartilhado)
    if (socketRef.current && currentCommunityIdRef.current !== communityId && socketRef.current !== window.__sharedChatSocket) {
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

    // Tornar este socket o compartilhado
    window.__sharedChatSocket = newSocket;
    if (window.__sharedChatSocketListenersCount === 0) {
      window.__sharedChatSocketListenersCount = 1;
    } else {
      window.__sharedChatSocketListenersCount++;
    }

    newSocket.on('connect', () => {
      setIsConnected(true);
      socketRef.current = newSocket;
      currentCommunityIdRef.current = communityId;
      setSocket(newSocket);

      // Registrar listeners de comunidade quando o socket conectar
      registerCommunityListeners(newSocket, communityId);

      // Iniciar heartbeat a cada 30 segundos
      heartbeatIntervalRef.current = setInterval(() => {
        if (newSocket.connected) {
          newSocket.emit('heartbeat');
        }
      }, 30000); // 30 segundos
    });

    newSocket.on('heartbeat_ack', (data: any) => {
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    });

    newSocket.on('connect_error', (error) => {
      setIsConnected(false);
    });

    // Log quando o socket recebe qualquer evento (para debug)
    newSocket.onAny((eventName, ...args) => {
      if (eventName === 'new_community_message') {
      }
      if (eventName === 'community_typing') {
      }
    });

    // Eventos redundantes removidos (já registrados por registerCommunityListeners)


    setSocket(newSocket);

    // Atualizar ref imediatamente também
    currentCommunityIdRef.current = communityId;

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      
      // Decrementar contador de listeners apenas se este socket é o compartilhado
      if (newSocket === window.__sharedChatSocket) {
        window.__sharedChatSocketListenersCount--;
        
        // NÃO desconectar o socket se ainda há outros listeners (useChat pode estar usando)
        // Sempre manter o socket compartilhado conectado se há pelo menos 1 listener
        if (window.__sharedChatSocketListenersCount <= 0) {
          window.__sharedChatSocketListenersCount = 0;
          // NÃO desconectar o socket - deixar para o useChat gerenciar
          // window.__sharedChatSocket = null;
        }
      } else {
        // Este é um socket antigo que não é mais o compartilhado, desconectar
        if (newSocket.connected) {
          newSocket.disconnect();
        }
      }
      
      socketRef.current = null;
      currentCommunityIdRef.current = null;
    };
  }, [communityId]);

  // Atualizar ref quando communityId mudar (mesmo que o socket já esteja conectado)
  useEffect(() => {
    if (communityId) {
      currentCommunityIdRef.current = communityId;
    }
  }, [communityId]);

  const loadMessages = useCallback(async (limit: number = 50, offset: number = 0) => {
    if (!communityId) return;
    try {
      const response = await getCommunityMessages(communityId, limit, offset);
      if (response.success) {
        // Ordenar mensagens por data de criação
        const sortedMessages = response.data.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);
      } else {
        const errorMessage = 'message' in response ? response.message : 'Erro ao carregar mensagens';
      }
    } catch (error) {
    }
  }, [communityId]);

  const loadPinnedMessages = useCallback(async () => {
    if (!communityId) return;
    try {
      const response = await getPinnedCommunityMessages(communityId);
      if (response.success) {
        setPinnedMessages(response.data);
      } else {
        const errorMessage = 'message' in response ? response.message : 'Erro ao carregar mensagens fixadas';
      }
    } catch (error) {
    }
  }, [communityId]);

  const sendMessage = useCallback(async (content?: string, attachments?: MessageAttachment[]) => {
    if (!communityId) return { success: false, message: 'Comunidade não selecionada' };
    if (!content?.trim() && (!attachments || attachments.length === 0)) {
      return { success: false, message: 'Mensagem ou anexo é obrigatório' };
    }
    
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
    const optimisticMessage: CommunityMessage = {
      id: tempId,
      communityId: communityId,
      senderId: senderId,
      content: content?.trim() || '',
      createdAt: new Date().toISOString(),
      edited: false,
      updatedAt: null,
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
      const response = await sendCommunityMessage(communityId, content, attachments);
      if (response.success) {
        // A mensagem será adicionada via WebSocket, mas podemos adicionar/atualizar com a resposta da API
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === response.data.id);
          if (exists) {
            // Se a mensagem já existe (adicionada pelo WebSocket), atualizar os attachments se a resposta da API tiver
            return prev.map((msg) => {
              if (msg.id === response.data.id) {
                // Se a mensagem não tem attachments mas a resposta da API tem, atualizar
                if ((!msg.attachments || msg.attachments.length === 0) && attachments && attachments.length > 0) {
                  const mappedAttachments: MessageAttachmentResponse[] =
                    attachments.map((attachment, index) => ({
                      id: attachment.cloudinaryPublicId || `temp-${response.data.id}-${index}`,
                      fileUrl: attachment.fileUrl,
                      fileName: attachment.fileName,
                      fileType: attachment.fileType,
                      fileSize: attachment.fileSize,
                      thumbnailUrl: attachment.thumbnailUrl || attachment.fileUrl,
                      width: attachment.width ?? null,
                      height: attachment.height ?? null,
                      duration: attachment.duration ?? null,
                    }));
                  return { ...msg, attachments: mappedAttachments };
                }
              }
              return msg;
            });
          }

          // Verificar se há uma mensagem otimista similar para substituir
          // IMPORTANTE: Buscar por conteúdo e sender, não por quantidade de attachments
          const optimisticMsg = prev.find((msg) => {
            if (!msg.id.startsWith('temp-')) return false;
            if (msg.senderId !== response.data.senderId) return false;
            if (msg.communityId !== response.data.communityId) return false;
            const contentsMatch = (!msg.content && !response.data.content) || msg.content === response.data.content;
            return contentsMatch;
          });

          if (optimisticMsg) {
            // Remover mensagens otimistas similares (qualquer mensagem otimista com mesmo conteúdo e sender)
            const withoutOptimistic = prev.filter((msg) => {
              if (!msg.id.startsWith('temp-')) return true;
              if (msg.senderId !== response.data.senderId) return true;
              if (msg.communityId !== response.data.communityId) return true;
              const contentsMatch = (!msg.content && !response.data.content) || msg.content === response.data.content;
              return !contentsMatch; // Manter apenas mensagens com conteúdo diferente
            });

            // Preservar attachments da mensagem otimista se a resposta da API não tiver attachments
            // mas a otimista tiver (caso o backend ainda não tenha processado os attachments)
            const finalAttachments = attachments && attachments.length > 0
              ? attachments.map((attachment, index) => ({
                  id: attachment.cloudinaryPublicId || `temp-${response.data.id}-${index}`,
                  fileUrl: attachment.fileUrl,
                  fileName: attachment.fileName,
                  fileType: attachment.fileType,
                  fileSize: attachment.fileSize,
                  thumbnailUrl: attachment.thumbnailUrl || attachment.fileUrl,
                  width: attachment.width ?? null,
                  height: attachment.height ?? null,
                  duration: attachment.duration ?? null,
                }))
              : (optimisticMsg.attachments && optimisticMsg.attachments.length > 0
                      ? optimisticMsg.attachments
                      : []);
    
            const messageWithAttachments: CommunityMessage = {
              ...response.data,
              attachments: finalAttachments,
              clientId: optimisticMsg.id,
            };

            const updated = [...withoutOptimistic, messageWithAttachments];
            const sorted = updated.sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            return sorted;
          }

          // Se não há mensagem otimista, verificar se a mensagem real já existe (adicionada pelo WebSocket)
          const alreadyExists = prev.some((msg) => msg.id === response.data.id);
          
          if (alreadyExists) {
            // Se a mensagem já existe (adicionada pelo WebSocket), atualizar os attachments se a resposta da API tiver
            return prev.map((msg) => {
              if (msg.id === response.data.id) {
                // Se a mensagem não tem attachments mas a resposta da API tem, atualizar
                if ((!msg.attachments || msg.attachments.length === 0) && attachments && attachments.length > 0) {
                  const mappedAttachments: MessageAttachmentResponse[] =
                    attachments.map((attachment, index) => ({
                      id: attachment.cloudinaryPublicId || `temp-${response.data.id}-${index}`,
                      fileUrl: attachment.fileUrl,
                      fileName: attachment.fileName,
                      fileType: attachment.fileType,
                      fileSize: attachment.fileSize,
                      thumbnailUrl: attachment.thumbnailUrl || attachment.fileUrl,
                      width: attachment.width ?? null,
                      height: attachment.height ?? null,
                      duration: attachment.duration ?? null,
                    }));
                  return { ...msg, attachments: mappedAttachments };
                }
              }
              return msg;
            });
          }

          // Se não há mensagem otimista e a mensagem real não existe, adicionar normalmente
          const mappedAttachments: MessageAttachmentResponse[] =
            attachments?.map((attachment, index) => ({
              id: attachment.cloudinaryPublicId || `temp-${response.data.id}-${index}`,
              fileUrl: attachment.fileUrl,
              fileName: attachment.fileName,
              fileType: attachment.fileType,
              fileSize: attachment.fileSize,
              thumbnailUrl: attachment.thumbnailUrl || attachment.fileUrl,
              width: attachment.width ?? null,
              height: attachment.height ?? null,
              duration: attachment.duration ?? null,
            })) || [];

          const messageWithAttachments: CommunityMessage = {
            ...response.data,
            attachments: mappedAttachments,
          };

          const updated = [...prev, messageWithAttachments];
          const sorted = updated.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          return sorted;
        });
        return { success: true };
      } else {
        // Remover mensagem otimista em caso de erro
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        return { success: false, message: response.message };
      }
    } catch (error) {
      // Remover mensagem otimista em caso de erro
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      return { success: false, message: 'Erro ao enviar mensagem' };
    }
  }, [communityId]);

  const editMessageHandler = useCallback(async (messageId: string, content: string) => {
    if (!communityId) return { success: false, message: 'Comunidade não selecionada' };
    try {
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
      return { success: false, message: 'Erro ao editar mensagem' };
    }
  }, [communityId]);

  const deleteMessageHandler = useCallback(async (messageId: string) => {
    if (!communityId) return { success: false, message: 'Comunidade não selecionada' };
    try {
      const response = await deleteCommunityMessage(communityId, messageId);
      if (response.success) {
        // Não remover a mensagem aqui - o evento WebSocket community_message_deleted
        // será recebido e atualizará a mensagem com "Mensagem apagada"
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: 'Erro ao excluir mensagem' };
    }
  }, [communityId]);

  const pinMessageHandler = useCallback(async (messageId: string) => {
    if (!communityId) return { success: false, message: 'Comunidade não selecionada' };
    try {
      const response = await pinCommunityMessage(communityId, messageId);
      if (response.success) {
        // Recarregar mensagens fixadas
        await loadPinnedMessages();
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: 'Erro ao fixar mensagem' };
    }
  }, [communityId, loadPinnedMessages]);

  const unpinMessageHandler = useCallback(async (messageId: string) => {
    if (!communityId) return { success: false, message: 'Comunidade não selecionada' };
    try {
      const response = await unpinCommunityMessage(communityId, messageId);
      if (response.success) {
        // Recarregar mensagens fixadas
        await loadPinnedMessages();
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: 'Erro ao desfixar mensagem' };
    }
  }, [communityId, loadPinnedMessages]);

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!socketRef.current || !socketRef.current.connected || !communityId) {
      return;
    }
    
    // O backend adiciona o userId automaticamente do token JWT
    // Enviar apenas communityId e isTyping conforme documentação
    const payload = {
      communityId,
          isTyping,
        };
        
        socketRef.current.emit('community_typing', payload);
  }, [communityId]);

  return {
    messages,
    pinnedMessages,
    isConnected,
    isTyping,
    typingUserId,
    sendMessage,
    sendTypingIndicator,
    editMessage: editMessageHandler,
    deleteMessage: deleteMessageHandler,
    pinMessage: pinMessageHandler,
    unpinMessage: unpinMessageHandler,
    loadMessages,
    loadPinnedMessages,
    setMessages,
  };
}

