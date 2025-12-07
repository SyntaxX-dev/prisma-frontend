"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { 
  Send, 
  Paperclip, 
  Smile, 
  Pin,
  Trash2,
  Pencil,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "motion/react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Community } from "@/types/community";
import type { CommunityMessage, PinnedCommunityMessage } from "@/types/community-chat";
import { getCommunityMembers, type CommunityMember } from "@/api/communities/get-community-members";
import { getUserProfile } from "@/api/auth/get-user-profile";
import { FileUploadZone } from "../chat/FileUploadZone";
import { FilePreview } from "../chat/FilePreview";
import { useFileUpload } from "@/hooks/features/chat/useFileUpload";
import type { MessageAttachment } from "@/types/file-upload";

interface CommunityChatProps {
  community: Community;
  messages: CommunityMessage[];
  pinnedMessages?: PinnedCommunityMessage[];
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string | null;
  searchQuery?: string;
  currentSearchIndex?: number;
  onSearchIndexChange?: (index: number) => void;
  onSendMessage: (content?: string, attachments?: MessageAttachment[]) => Promise<void>;
  onEditMessage?: (messageId: string, content: string) => Promise<{ success: boolean; message?: string }>;
  onDeleteMessage?: (messageId: string) => Promise<{ success: boolean; message?: string }>;
  onPinMessage?: (messageId: string) => Promise<{ success: boolean; message?: string }>;
  onUnpinMessage?: (messageId: string) => Promise<{ success: boolean; message?: string }>;
  onStartVideoCall?: () => void;
  onStartVoiceCall?: () => void;
  isConnected?: boolean;
  isTyping?: boolean;
  typingUserId?: string | null;
  onTyping?: (isTyping: boolean) => void;
  isLoadingMessages?: boolean;
}

export function CommunityChat({
  community,
  messages,
  pinnedMessages = [],
  currentUserId,
  currentUserName,
  currentUserAvatar,
  searchQuery = '',
  currentSearchIndex = 0,
  onSearchIndexChange,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onPinMessage,
  onUnpinMessage,
  onStartVideoCall,
  onStartVoiceCall,
  isConnected = false,
  isTyping = false,
  typingUserId,
  onTyping,
  isLoadingMessages = false,
}: CommunityChatProps) {
  const [messageInput, setMessageInput] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<MessageAttachment[]>([]);
  
  const { uploading, uploadFiles, ErrorModal } = useFileUpload({
    isCommunity: true,
    communityId: community.id,
    onUploadComplete: (attachments) => {
      setPendingAttachments((prev) => {
        const updated = [...prev, ...attachments];
        return updated;
      });
    },
  });
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [memberMap, setMemberMap] = useState<Map<string, { name: string; avatar?: string }>>(new Map());
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasScrolledToBottomRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      // Sempre fazer scroll para o final quando abrir o chat ou quando as mensagens mudarem
      // Usar um pequeno delay para garantir que o DOM foi totalmente renderizado
      const scrollToBottom = () => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      };
      
      // Marcar que já rolou para esta comunidade
      hasScrolledToBottomRef.current = community.id;
      
      // Usar requestAnimationFrame para garantir que o DOM foi atualizado
      requestAnimationFrame(() => {
        scrollToBottom();
        // Fazer scroll novamente após um pequeno delay para garantir que todas as mensagens foram renderizadas
        setTimeout(scrollToBottom, 100);
        // Fazer scroll uma terceira vez após mais um delay para garantir que imagens/anexos foram carregados
        setTimeout(scrollToBottom, 300);
      });
    }
  }, [messages, community.id]);

  // Escutar evento para fazer scroll até uma mensagem específica
  useEffect(() => {
    const handleScrollToMessage = (event: CustomEvent<{ messageId: string }>) => {
      const { messageId } = event.detail;
      const messageElement = messageRefs.current.get(messageId);
      
      if (messageElement) {
        // Aguardar um pouco para garantir que o DOM está atualizado
        setTimeout(() => {
          messageElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Adicionar um destaque temporário na mensagem
          messageElement.style.transition = 'all 0.3s ease';
          messageElement.style.backgroundColor = 'rgba(179, 226, 64, 0.1)';
          messageElement.style.padding = '8px';
          messageElement.style.borderRadius = '16px';
          setTimeout(() => {
            messageElement.style.backgroundColor = '';
            messageElement.style.padding = '';
            messageElement.style.borderRadius = '';
            setTimeout(() => {
              messageElement.style.transition = '';
            }, 300);
          }, 2000);
        }, 100);
      }
    };

    window.addEventListener('scrollToMessage', handleScrollToMessage as EventListener);
    return () => {
      window.removeEventListener('scrollToMessage', handleScrollToMessage as EventListener);
    };
  }, []);

  // Escutar evento para fazer scroll até mensagem encontrada na busca
  useEffect(() => {
    const handleScrollToCommunitySearch = (event: CustomEvent<{ query: string; index?: number }>) => {
      const { query, index = 0 } = event.detail;
      if (!query.trim()) return;

      // Encontrar todas as mensagens que contém o termo de busca (palavras completas)
      const queryLower = query.trim().toLowerCase();
      const escapedQuery = queryLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedQuery}\\b`, 'i');
      const matchingMessages = messages.filter((msg) =>
        regex.test(msg.content)
      );

      // Usar o índice fornecido ou o índice atual
      const targetIndex = index !== undefined ? index : currentSearchIndex;
      const foundMessage = matchingMessages[targetIndex];

      if (foundMessage) {
        const messageElement = messageRefs.current.get(foundMessage.id);
        if (messageElement) {
          setTimeout(() => {
            messageElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            
            // Adicionar um destaque temporário na mensagem
            messageElement.style.transition = 'all 0.3s ease';
            messageElement.style.backgroundColor = 'rgba(179, 226, 64, 0.2)';
            messageElement.style.borderRadius = '8px';
            
            setTimeout(() => {
              messageElement.style.backgroundColor = '';
              messageElement.style.borderRadius = '';
            }, 2000);
          }, 100);
        }
      }
    };

    window.addEventListener('scrollToCommunitySearch', handleScrollToCommunitySearch as EventListener);
    return () => {
      window.removeEventListener('scrollToCommunitySearch', handleScrollToCommunitySearch as EventListener);
    };
  }, [messages, currentSearchIndex]);

  // Função para destacar o texto da busca (usando dangerouslySetInnerHTML para evitar re-renderizações)
  const highlightText = useMemo(() => {
    return (text: string, query: string) => {
      if (!query.trim()) {
        // Escapar HTML para segurança
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
      
      // Escapar HTML do texto primeiro
      const escapedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Usar word boundaries para destacar apenas palavras completas
      const regex = new RegExp(`\\b(${escapedQuery})\\b`, 'gi');
      // Usar span com display: inline-block e line-height: inherit para não alterar layout
      const highlighted = escapedText.replace(regex, '<span style="background-color: #bd18b4; color: black; display: inline; line-height: inherit; padding: 0; border-radius: 2px; box-decoration-break: clone;">$1</span>');
      return highlighted;
    };
  }, []);

  // Fechar emoji picker quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setIsEmojiPickerOpen(false);
      }
    };

    if (isEmojiPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEmojiPickerOpen]);

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setMessageInput((prev) => prev + emojiData.emoji);
    setIsEmojiPickerOpen(false);
  };

  // Carregar informações dos membros da comunidade
  useEffect(() => {
    const loadMembers = async () => {
      if (!community.id) return;
      
      try {
        setIsLoadingMembers(true);
        const response = await getCommunityMembers({
          communityId: community.id,
          limit: 100,
          offset: 0,
        });

        if (response.success && response.data.members) {
          const newMemberMap = new Map<string, { name: string; avatar?: string }>();
          
          // Adicionar membros da comunidade
          response.data.members.forEach((member: CommunityMember) => {
            newMemberMap.set(member.id, {
              name: member.name,
              avatar: member.profileImage || undefined,
            });
          });

          // Adicionar usuário atual se não estiver na lista
          if (currentUserId && currentUserName) {
            newMemberMap.set(currentUserId, {
              name: currentUserName,
              avatar: currentUserAvatar || undefined,
            });
          }

          setMemberMap(newMemberMap);
        }
      } catch (error) {
      } finally {
        setIsLoadingMembers(false);
      }
    };

    loadMembers();
  }, [community.id, currentUserId, currentUserName, currentUserAvatar]);

  // Buscar perfis de usuários que não estão na lista de membros (caso apareçam nas mensagens)
  useEffect(() => {
    const loadMissingUsers = async () => {
      if (!messages.length) return;

      const missingUserIds = Array.from(
        new Set(
          messages
            .map(msg => msg.senderId)
            .filter(id => id !== currentUserId && !memberMap.has(id))
        )
      );

      if (missingUserIds.length === 0) return;

      try {
        const userPromises = missingUserIds.map(async (userId) => {
          try {
            const response = await getUserProfile(userId);
            if (response.success && response.data) {
              return {
                id: userId,
                name: response.data.name,
                avatar: response.data.profileImage || undefined,
              };
            }
          } catch (error) {
          }
          return null;
        });

        const users = (await Promise.all(userPromises)).filter(Boolean) as Array<{
          id: string;
          name: string;
          avatar?: string;
        }>;

        if (users.length > 0) {
          setMemberMap((prev) => {
            const newMap = new Map(prev);
            users.forEach((user) => {
              newMap.set(user.id, { name: user.name, avatar: user.avatar });
            });
            return newMap;
          });
        }
      } catch (error) {
      }
    };

    if (memberMap.size > 0) {
      loadMissingUsers();
    }
  }, [messages, currentUserId, memberMap]);

  const handleFilesSelected = async (files: File[]) => {
    try {
      await uploadFiles(files, (index, progress) => {
      });
    } catch (error) {
      // Erro já é tratado pelo hook e exibido no modal
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const prepareAttachmentsForSend = (attachments: MessageAttachment[]) => {
    return attachments
      .filter(
        (attachment): attachment is MessageAttachment =>
          Boolean(
            attachment &&
            attachment.fileUrl &&
            attachment.cloudinaryPublicId &&
            attachment.fileType
          )
      )
      .map((attachment) => ({
        ...attachment,
        thumbnailUrl: attachment.thumbnailUrl || attachment.fileUrl,
      }));
  };

  const handleSend = async () => {
    if ((!messageInput.trim() && pendingAttachments.length === 0) || !isConnected) return;

    // Se estiver editando, fazer a edição ao invés de enviar nova mensagem
    if (editingMessageId && onEditMessage) {
      const result = await onEditMessage(editingMessageId, messageInput.trim());
      if (result.success) {
        setEditingMessageId(null);
        setHoveredMessageId(null);
        setMessageInput("");
      }
      return;
    }

    const messageToSend = messageInput.trim() || undefined;
    const attachmentsToSend =
      pendingAttachments.length > 0
        ? prepareAttachmentsForSend(pendingAttachments)
        : undefined;
    
    try {
      await onSendMessage(messageToSend, attachmentsToSend);
      setMessageInput("");
      setPendingAttachments([]);
      
      // Parar de digitar após enviar
      if (onTyping && typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      if (onTyping) {
        onTyping(false);
      }
    } catch (error) {
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessageInput(newValue);

    // Sempre enviar indicador de digitação quando o usuário digita (mesmo que não tenha anexos)
    // O sendTypingIndicator já verifica internamente se o socket está conectado
    if (onTyping) {
      // Limpar timeout anterior se existir
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      // Sempre enviar typing: true quando o usuário digita
      onTyping(true);

      // Criar novo timeout para parar de digitar após 2 segundos
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
        typingTimeoutRef.current = null;
      }, 2000);
    } else {
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape' && editingMessageId) {
      e.preventDefault();
      setEditingMessageId(null);
      setMessageInput("");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ptBR });
    } catch {
      return "";
    }
  };

  const isOwn = (senderId: string) => senderId === currentUserId;

  // Typing indicator data
  const shouldShowTyping = isTyping && typingUserId && typingUserId !== currentUserId;
  const typingMember = shouldShowTyping ? memberMap.get(typingUserId) : undefined;
  const avatarSrc = typingMember?.avatar ?? undefined;

  return (
    <div 
      className="flex-1 flex flex-col h-full rounded-2xl overflow-hidden border border-white/10 w-full max-w-full"
      style={{
        background: 'rgb(14, 14, 14)',
      }}
    >
      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-2 md:p-5 pt-12 space-y-3 md:space-y-6 pb-32 w-full max-w-full">
        {isLoadingMessages ? (
          <div className="flex flex-col gap-4">
            {[
              { width: '120px' },
              { width: '180px' },
              { width: '150px' },
            ].map((size, i) => (
              <div key={`left-${i}`} className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full bg-[#29292E] shrink-0" />
                <div className="flex flex-col items-start max-w-[75%] md:max-w-[70%] flex-1 min-w-0">
                  <Skeleton 
                    className="rounded-2xl px-4 py-2.5 bg-[#29292E] border border-[#323238]"
                    style={{ width: size.width, height: '32px' }}
                  />
                  <Skeleton className="h-3 w-16 mt-1 bg-[#29292E]" />
                </div>
              </div>
            ))}
            {[
              { width: '100px' },
              { width: '160px' },
            ].map((size, i) => (
              <div key={`right-${i}`} className="flex gap-3 flex-row-reverse">
                <Skeleton className="w-8 h-8 rounded-full bg-[#29292E] shrink-0" />
                <div className="flex flex-col items-end max-w-[75%] md:max-w-[70%] flex-1 min-w-0">
                  <Skeleton 
                    className="rounded-2xl px-4 py-2.5 bg-[#29292E]"
                    style={{ width: size.width, height: '32px' }}
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <Skeleton className="h-3 w-16 bg-[#29292E]" />
                    <Skeleton className="h-3 w-4 bg-[#29292E]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgb(26, 26, 26)' }}>
                <Smile className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-500 text-sm">
                Nenhuma mensagem ainda. Comece a conversar!
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const messageIsOwn = isOwn(message.senderId);
              const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
              const showName = showAvatar && !messageIsOwn;
              const member = memberMap.get(message.senderId) || { 
                name: messageIsOwn ? (currentUserName || "Você") : "Usuário", 
                avatar: messageIsOwn ? (currentUserAvatar || undefined) : undefined 
              };
              const isPinned = pinnedMessages.some(p => p.messageId === message.id);
              const isHovered = hoveredMessageId === message.id;
              const isEditing = editingMessageId === message.id;
              const timeAgo = formatTime(message.createdAt);
              
              // Verificar se a mensagem ainda pode ser editada (15 minutos após o envio)
              const messageDate = new Date(message.createdAt);
              const now = new Date();
              const timeDiff = now.getTime() - messageDate.getTime();
              const minutesDiff = timeDiff / (1000 * 60);
              const canEdit = minutesDiff <= 15;

              const handlePin = async () => {
                if (isPinned && onUnpinMessage) {
                  await onUnpinMessage(message.id);
                } else if (!isPinned && onPinMessage) {
                  await onPinMessage(message.id);
                }
              };

              const handleEdit = () => {
                setEditingMessageId(message.id);
                setMessageInput(message.content);
                setTimeout(() => {
                  const textarea = document.querySelector('textarea[placeholder*="mensagem"]') as HTMLTextAreaElement;
                  textarea?.focus();
                }, 100);
              };

              const handleCancelEdit = () => {
                setEditingMessageId(null);
                setHoveredMessageId(null);
                setMessageInput("");
              };

              const handleDelete = () => {
                setMessageToDelete(message.id);
                setDeleteConfirmOpen(true);
              };
              
              return (
                <div
                  key={message.id}
                  ref={(el) => {
                    if (el) {
                      messageRefs.current.set(message.id, el);
                    } else {
                      messageRefs.current.delete(message.id);
                    }
                  }}
                  className={`flex gap-2 md:gap-3 ${messageIsOwn ? "flex-row-reverse" : ""} group relative w-full max-w-full`}
                >
                  <div className="w-8 flex-shrink-0">
                    {showAvatar && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage 
                          src={messageIsOwn ? (currentUserAvatar || member.avatar) : member.avatar} 
                          alt={member.name}
                        />
                        <AvatarFallback 
                          className="text-xs font-medium"
                          style={{
                            background: '#bd18b4',
                            color: '#000',
                          }}
                        >
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  <div
                    className={`flex flex-col max-w-[75%] md:max-w-[70%] flex-1 min-w-0 ${
                      messageIsOwn ? "items-end" : "items-start"
                    } relative`}
                    onMouseEnter={() => setHoveredMessageId(message.id)}
                    onMouseLeave={() => !isEditing && setHoveredMessageId(null)}
                  >
                    {showName && (
                      <span className="text-xs text-gray-500 mb-1 px-1">
                        {member.name}
                      </span>
                    )}

                    {/* Ícones de ação no hover */}
                    <AnimatePresence>
                      {(isHovered || isEditing) && (messageIsOwn || onPinMessage) && (
                        <>
                          {/* Pin - qualquer membro pode fixar */}
                          {onPinMessage && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.5, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.5, y: 5 }}
                              transition={{ duration: 0.2, delay: 0 }}
                              onClick={handlePin}
                              className={`absolute ${messageIsOwn ? 'right-0' : 'left-0'} -top-10 w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-white/10 hover:bg-[#29292E] transition-colors z-10 shadow-lg cursor-pointer`}
                              title={isPinned ? 'Desfixar mensagem' : 'Fixar mensagem'}
                            >
                              <Pin className={`w-4 h-4 ${isPinned ? 'text-[#bd18b4] fill-[#bd18b4]' : 'text-gray-400'}`} />
                            </motion.button>
                          )}

                          {/* Editar/Cancelar - apenas o autor */}
                          {messageIsOwn && onEditMessage && canEdit && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.5, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.5, y: 5 }}
                              transition={{ duration: 0.2, delay: 0.05 }}
                              onClick={isEditing ? handleCancelEdit : handleEdit}
                              className={`absolute ${messageIsOwn ? 'right-10' : 'left-10'} ${isEditing ? '-top-12' : '-top-10'} w-8 h-8 flex items-center justify-center rounded-full ${isEditing ? 'bg-red-600 border-red-600 hover:bg-red-700' : 'bg-[#1a1a1a] border border-white/10 hover:bg-[#29292E]'} transition-colors z-10 shadow-lg cursor-pointer`}
                              title={isEditing ? 'Cancelar edição' : 'Editar mensagem'}
                            >
                              {isEditing ? (
                                <X className="w-4 h-4 text-white" />
                              ) : (
                                <Pencil className="w-4 h-4 text-gray-400" />
                              )}
                            </motion.button>
                          )}
                          {messageIsOwn && onEditMessage && !canEdit && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.5, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.5, y: 5 }}
                              transition={{ duration: 0.2, delay: 0.05 }}
                              disabled
                              className={`absolute ${messageIsOwn ? 'right-10' : 'left-10'} -top-10 w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-white/10 opacity-40 cursor-not-allowed z-10 shadow-lg`}
                              title="Tempo de edição expirado (15 minutos)"
                            >
                              <Pencil className="w-4 h-4 text-gray-600" />
                            </motion.button>
                          )}

                          {/* Deletar - apenas o autor */}
                          {messageIsOwn && onDeleteMessage && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.5, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.5, y: 5 }}
                              transition={{ duration: 0.2, delay: 0.1 }}
                              onClick={handleDelete}
                              className={`absolute ${messageIsOwn ? 'right-20' : 'left-20'} -top-10 w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-white/10 hover:bg-[#29292E] transition-colors z-10 shadow-lg cursor-pointer`}
                              title="Deletar mensagem"
                            >
                              <Trash2 className="w-4 h-4 text-gray-400" />
                            </motion.button>
                          )}
                        </>
                      )}
                    </AnimatePresence>
                    
                    <div className="group relative">
                      <div className="flex flex-col gap-2">
                        {message.content && (
                          <div
                            className={`px-3 py-2 rounded-lg ${
                              messageIsOwn
                                ? "rounded-tr-sm bg-[#bd18b4] text-black"
                                : "rounded-tl-sm bg-[#29292E] text-white border border-[#323238]"
                            }`}
                          >
                            <p 
                              className={`text-sm leading-relaxed break-words ${messageIsOwn ? 'text-black' : 'text-white'}`} 
                              style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                              dangerouslySetInnerHTML={{ 
                                __html: highlightText(message.content, searchQuery)
                              }}
                            />
                          </div>
                        )}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="flex flex-col gap-2">
                            {message.attachments.map((attachment) => {
                              const isImage = attachment.fileType.startsWith("image/");
                              if (isImage) {
                                return (
                                  <div
                                    key={attachment.id}
                                    className="relative w-full max-w-lg rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(attachment.fileUrl, "_blank")}
                                  >
                                    <img
                                      src={attachment.thumbnailUrl || attachment.fileUrl}
                                      alt={attachment.fileName}
                                      className="w-full h-auto object-cover"
                                      style={{ maxHeight: '600px' }}
                                    />
                                  </div>
                                );
                              }
                              return (
                                <FilePreview
                                  key={attachment.id}
                                  attachment={attachment}
                                  size="medium"
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                      
                      <div className={`flex items-center gap-1 mt-1 px-1 ${messageIsOwn ? "justify-end" : "justify-start"}`}>
                        <span className="text-[10px] text-gray-600">
                          {timeAgo}
                        </span>
                        {message.edited && (
                          <span className="text-[10px] text-gray-500 italic">(editado)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing indicator */}
            {shouldShowTyping && typingMember && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage
                    src={avatarSrc}
                    alt={typingMember?.name || "Usuário"}
                  />
                  <AvatarFallback className="bg-[#bd18b4] text-black text-xs">
                    {(typingMember?.name || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-[#29292E] border border-[#323238] rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {typingMember?.name || "Alguém"} está digitando
                    </span>
                    <div className="flex items-center gap-1">
                      <span 
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full inline-block"
                        style={{
                          animation: 'typing-dot 1.4s infinite ease-in-out',
                          animationDelay: '0ms'
                        }}
                      />
                      <span 
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full inline-block"
                        style={{
                          animation: 'typing-dot 1.4s infinite ease-in-out',
                          animationDelay: '200ms'
                        }}
                      />
                      <span 
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full inline-block"
                        style={{
                          animation: 'typing-dot 1.4s infinite ease-in-out',
                          animationDelay: '400ms'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <FileUploadZone
        onFilesSelected={handleFilesSelected}
        disabled={!isConnected || uploading}
        className="fixed inset-0"
      />
      <div 
        className="p-2 md:p-4 border-t border-white/10 bg-[#1a1a1a] w-full max-w-full overflow-hidden"
      >
        <div className="flex flex-col gap-2 w-full max-w-full">
          {/* Preview de arquivos pendentes */}
          {pendingAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-2">
              {pendingAttachments.map((attachment, index) => (
                <div key={index} className="relative">
                  <FilePreview
                    attachment={{
                      id: `pending-${index}`,
                      fileUrl: attachment.fileUrl,
                      fileName: attachment.fileName,
                      fileType: attachment.fileType,
                      fileSize: attachment.fileSize,
                      thumbnailUrl: attachment.thumbnailUrl || null,
                      width: attachment.width || null,
                      height: attachment.height || null,
                      duration: attachment.duration || null,
                    }}
                    onRemove={() => handleRemoveAttachment(index)}
                    showRemove={true}
                    size="small"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1.5 md:gap-2 w-full max-w-full min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = 'image/*,application/pdf';
              input.onchange = (e) => {
                const files = Array.from((e.target as HTMLInputElement).files || []);
                if (files.length > 0) {
                  handleFilesSelected(files);
                }
              };
              input.click();
            }}
            disabled={!isConnected || uploading}
            className="text-gray-500 hover:text-white hover:bg-[#1a1a1a] rounded-lg w-8 h-8 md:w-9 md:h-9 cursor-pointer shrink-0"
            title="Anexar arquivo"
          >
            <Paperclip className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </Button>

          <textarea
            value={messageInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isConnected ? (editingMessageId ? "Edite sua mensagem..." : "Digite uma mensagem...") : "Conectando..."}
            disabled={!isConnected}
            className="resize-none bg-[#29292E] border border-[#323238] text-white placeholder:text-gray-500 focus:border-[#bd18b4] focus:outline-none focus:ring-0 rounded-md px-2 md:px-3 py-1.5 text-sm flex-1 min-w-0 overflow-y-auto overflow-x-hidden max-w-full"
            rows={1}
            style={{
              wordBreak: 'break-word', 
              overflowWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              height: '32px',
              maxHeight: '32px',
              minHeight: '32px',
              lineHeight: '1.25rem'
            }}
          />

          <div className="relative" ref={emojiPickerRef}>
          <Button
            variant="ghost"
            size="icon"
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
              className={`text-gray-500 hover:text-white hover:bg-[#1a1a1a] rounded-lg w-9 h-9 cursor-pointer ${isEmojiPickerOpen ? 'bg-[#1a1a1a] text-white' : ''}`}
          >
            <Smile className="w-4 h-4" />
          </Button>
            {isEmojiPickerOpen && (
              <div className="absolute bottom-full right-0 mb-2 z-50">
                <div className="bg-[#202024] border border-[#323238] rounded-lg shadow-lg">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme={Theme.DARK}
                    width={300}
                    height={350}
                    skinTonesDisabled
                    searchDisabled={false}
                  />
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleSend}
            disabled={(!messageInput.trim() && pendingAttachments.length === 0) || !isConnected || uploading}
            size="icon"
            className="rounded-lg w-9 h-9 cursor-pointer"
            style={{
              background: (messageInput.trim() || pendingAttachments.length > 0) && isConnected ? '#bd18b4' : 'rgb(26, 26, 26)',
              color: (messageInput.trim() || pendingAttachments.length > 0) && isConnected ? '#000' : '#666',
            }}
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
          </div>
        </div>
      </div>
      {ErrorModal}

      {/* Modal de confirmação para deletar */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Excluir mensagem</DialogTitle>
            <DialogDescription className="text-gray-400">
              Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => {
                setDeleteConfirmOpen(false);
                setMessageToDelete(null);
              }}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (messageToDelete && onDeleteMessage) {
                  const result = await onDeleteMessage(messageToDelete);
                  if (result.success) {
                  } else {
                  }
                }
                setDeleteConfirmOpen(false);
                setMessageToDelete(null);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
