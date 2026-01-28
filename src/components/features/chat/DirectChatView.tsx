"use client";

import { useEffect, useRef, useState, useMemo } from 'react';
import { Message } from '@/api/messages/send-message';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, Pin, Trash2, Pencil, X, Smile, Paperclip, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PinnedMessage } from '@/api/messages/get-pinned-messages';
import { motion, AnimatePresence } from 'motion/react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { FileUploadZone } from './FileUploadZone';
import { FilePreview } from './FilePreview';
import { useFileUpload } from '@/hooks/features/chat/useFileUpload';
import type { MessageAttachment } from '@/types/file-upload';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUserStatus } from '@/providers/UserStatusProvider';

interface DirectChatViewProps {
  friendId: string;
  friendName: string;
  friendAvatar?: string | null;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string | null;
  messages: Message[];
  searchQuery?: string;
  currentSearchIndex?: number;
  onSearchIndexChange?: (index: number) => void;
  isConnected: boolean;
  isTyping: boolean;
  typingUserId?: string | null;
  onSend: (receiverId: string, content?: string, attachments?: MessageAttachment[]) => Promise<void>;
  onTyping: (receiverId: string, isTyping: boolean) => void;
  onPinMessage?: (messageId: string, friendId: string) => Promise<{ success: boolean; message?: string }>;
  onUnpinMessage?: (messageId: string) => Promise<{ success: boolean; message?: string }>;
  pinnedMessages?: PinnedMessage[];
  onEditMessage?: (messageId: string, content: string) => Promise<{ success: boolean; message?: string }>;
  onDeleteMessage?: (messageId: string) => Promise<{ success: boolean; message?: string }>;
  onStartCall?: (receiverId: string) => Promise<void>;
  isLoadingMessages?: boolean;
}

export function DirectChatView({
  friendId,
  friendName,
  friendAvatar,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  messages,
  searchQuery = '',
  currentSearchIndex = 0,
  onSearchIndexChange,
  isConnected,
  isTyping,
  typingUserId,
  onSend,
  onTyping,
  onPinMessage,
  onUnpinMessage,
  pinnedMessages = [],
  onEditMessage,
  onDeleteMessage,
  onStartCall,
  isLoadingMessages = false,
}: DirectChatViewProps) {
  const [message, setMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<MessageAttachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { statusMap, getStatus } = useUserStatus();
  const hasLoadedFriendStatusRef = useRef<string | null>(null);
  const hasScrolledToBottomRef = useRef<string | null>(null);

  const { uploading, uploadFiles, ErrorModal } = useFileUpload({
    isCommunity: false,
    onUploadComplete: (attachments) => {
      setPendingAttachments((prev) => [...prev, ...attachments]);
    },
  });

  // Buscar status do amigo quando o componente montar ou friendId mudar
  useEffect(() => {
    if (friendId && friendId !== hasLoadedFriendStatusRef.current) {
      hasLoadedFriendStatusRef.current = friendId;
      // Sempre tentar buscar, a função getStatus já verifica o cache internamente
      getStatus(friendId);
    }
  }, [friendId, getStatus]);

  // Scroll para o final quando as mensagens mudarem ou quando o chat for aberto
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      // Sempre fazer scroll para o final quando abrir o chat ou quando as mensagens mudarem
      // Usar um pequeno delay para garantir que o DOM foi totalmente renderizado
      const scrollToBottom = () => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      };

      // Marcar que já rolou para este chat
      hasScrolledToBottomRef.current = friendId;

      // Usar requestAnimationFrame para garantir que o DOM foi atualizado
      requestAnimationFrame(() => {
        scrollToBottom();
        // Fazer scroll novamente após um pequeno delay para garantir que todas as mensagens foram renderizadas
        setTimeout(scrollToBottom, 100);
        // Fazer scroll uma terceira vez após mais um delay para garantir que imagens/anexos foram carregados
        setTimeout(scrollToBottom, 300);
      });
    }
  }, [messages, friendId]);

  // Escutar evento para fazer scroll até uma mensagem específica (pinned messages)
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
    const handleScrollToSearch = (event: CustomEvent<{ query: string; index?: number }>) => {
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

    window.addEventListener('scrollToSearch', handleScrollToSearch as EventListener);
    return () => {
      window.removeEventListener('scrollToSearch', handleScrollToSearch as EventListener);
    };
  }, [messages, currentSearchIndex]);

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
    setMessage((prev) => prev + emojiData.emoji);
    setIsEmojiPickerOpen(false);
  };

  const handleFilesSelected = async (files: File[]) => {
    try {
      await uploadFiles(files);
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
    if ((!message.trim() && pendingAttachments.length === 0) || !isConnected) {
      return;
    }

    // Se estiver editando, fazer a edição ao invés de enviar nova mensagem
    if (editingMessageId && onEditMessage) {
      const result = await onEditMessage(editingMessageId, message.trim());
      if (result.success) {
        setEditingMessageId(null);
        setHoveredMessageId(null);
        setMessage('');
      } else {
        // TODO: Mostrar toast de erro
      }
      return;
    }

    const messageToSend = message.trim() || undefined;
    const attachmentsToSend =
      pendingAttachments.length > 0
        ? prepareAttachmentsForSend(pendingAttachments)
        : undefined;

    setMessage('');
    setPendingAttachments([]);

    try {
      await onSend(friendId, messageToSend, attachmentsToSend);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      onTyping(friendId, false);

      // Aguardar um pouco e verificar se a mensagem foi adicionada
      setTimeout(() => {
      }, 500);
    } catch (error) {
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);

    // Sempre enviar indicador de digitação quando o usuário digita (mesmo que não tenha anexos)
    // O sendTypingIndicator já verifica internamente se o socket está conectado
    if (onTyping) {
      // Limpar timeout anterior se existir
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      // Sempre enviar typing: true quando o usuário digita
      onTyping(friendId, true);

      // Criar novo timeout para parar de digitar após 2 segundos
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(friendId, false);
        typingTimeoutRef.current = null; // Limpar a referência após executar
      }, 2000);
    } else {
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape' && editingMessageId) {
      e.preventDefault();
      setEditingMessageId(null);
      setMessage('');
    }
  };

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

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] w-full max-w-full overflow-hidden">
      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-2 md:p-4 pt-12 space-y-3 md:space-y-4 w-full max-w-full">
        {isLoadingMessages ? (
          <div className="flex flex-col gap-4">
            {[
              { width: '120px' },
              { width: '180px' },
              { width: '150px' },
            ].map((size, i) => (
              <div key={`left-${i}`} className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full bg-[#29292E] shrink-0" />
                <div className="flex flex-col items-start max-w-[70%]">
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
                <div className="flex flex-col items-end max-w-[70%]">
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
            <div className="text-center max-w-md px-6">
              {/* Animated Icon Container */}
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  {/* Outer glow */}
                  <div
                    className="absolute inset-0 rounded-[28px] animate-pulse"
                    style={{
                      background: 'radial-gradient(circle, rgba(189, 24, 180, 0.3) 0%, transparent 70%)',
                      transform: 'scale(1.5)',
                      filter: 'blur(20px)',
                    }}
                  />

                  {/* Main container */}
                  <div
                    className="relative w-28 h-28 rounded-[28px] flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(145deg, rgba(40, 40, 48, 0.9) 0%, rgba(25, 25, 32, 0.95) 100%)',
                      border: '1px solid rgba(189, 24, 180, 0.3)',
                      boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 20px 40px -10px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    {/* Inner gradient */}
                    <div
                      className="absolute inset-0 rounded-[28px]"
                      style={{
                        background: 'radial-gradient(circle at 30% 30%, rgba(189, 24, 180, 0.15) 0%, transparent 60%)',
                      }}
                    />

                    <Send className="w-12 h-12 text-[#bd18b4] relative z-10" strokeWidth={1.5} />

                    {/* Floating sparkles */}
                    <div
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center animate-bounce"
                      style={{
                        background: 'linear-gradient(135deg, #bd18b4, #9333ea)',
                        animationDuration: '2s',
                      }}
                    >
                      <Smile className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Text content */}
              <h3
                className="text-2xl font-bold mb-3"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Inicie uma conversa
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Envie uma mensagem para <span className="text-[#bd18b4] font-medium">{friendName}</span> e comece a conversar!
              </p>

              {/* Decorative dots */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: i === 2
                        ? 'linear-gradient(135deg, #bd18b4, #9333ea)'
                        : 'rgba(189, 24, 180, 0.3)',
                      animation: `pulse 2s ease-in-out infinite`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg: Message) => {
            const isOwn = msg.senderId === currentUserId;
            const messageDate = new Date(msg.createdAt);
            const timeAgo = formatDistanceToNow(messageDate, { addSuffix: true, locale: ptBR });
            const isPinned = pinnedMessages.some(p => p.messageId === msg.id);
            const isHovered = hoveredMessageId === msg.id;
            const isEditing = editingMessageId === msg.id;

            // Verificar se a mensagem ainda pode ser editada (15 minutos após o envio)
            const now = new Date();
            const timeDiff = now.getTime() - messageDate.getTime();
            const minutesDiff = timeDiff / (1000 * 60);
            const canEdit = minutesDiff <= 15;

            const handlePin = async () => {
              if (isPinned && onUnpinMessage) {
                const result = await onUnpinMessage(msg.id);
                if (result.success) {
                }
              } else if (!isPinned && onPinMessage) {
                const result = await onPinMessage(msg.id, friendId);
                if (result.success) {
                } else {
                }
              }
            };

            const handleEdit = () => {
              setEditingMessageId(msg.id);
              setMessage(msg.content);
              // Focar no input
              setTimeout(() => {
                const textarea = document.querySelector('textarea[placeholder*="Digite"], textarea[placeholder*="Edite"]') as HTMLTextAreaElement;
                textarea?.focus();
              }, 100);
            };

            const handleCancelEdit = () => {
              setEditingMessageId(null);
              setHoveredMessageId(null);
              setMessage('');
            };

            const handleDelete = () => {
              setMessageToDelete(msg.id);
              setDeleteConfirmOpen(true);
            };

            return (
              <div
                key={msg.id}
                ref={(el) => {
                  if (el) {
                    messageRefs.current.set(msg.id, el);
                  } else {
                    messageRefs.current.delete(msg.id);
                  }
                }}
                className={`flex gap-2 md:gap-3 ${isOwn ? 'flex-row-reverse' : ''} group relative w-full max-w-full`}
              >
                <div className="relative shrink-0">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage
                      src={isOwn ? (currentUserAvatar || undefined) : (friendAvatar || undefined)}
                      alt={isOwn ? currentUserName : friendName}
                    />
                    <AvatarFallback className="bg-[#bd18b4] text-black text-xs">
                      {(isOwn ? currentUserName : friendName).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%] md:max-w-[70%] flex-1 min-w-0 relative`}
                  onMouseEnter={() => setHoveredMessageId(msg.id)}
                  onMouseLeave={() => !isEditing && setHoveredMessageId(null)}
                >
                  {/* Ícones de ação no hover - 3 bolinhas separadas com animação */}
                  <AnimatePresence>
                    {(isHovered || isEditing) && isOwn && (
                      <>
                        {/* Bolinha 1 - Pin */}
                        <motion.button
                          initial={{ opacity: 0, scale: 0.5, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.5, y: 5 }}
                          transition={{ duration: 0.2, delay: 0 }}
                          onClick={handlePin}
                          className={`absolute ${isOwn ? 'right-0' : 'left-0'} -top-10 w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-white/10 hover:bg-[#29292E] transition-colors z-10 shadow-lg cursor-pointer`}
                          title={isPinned ? 'Desfixar mensagem' : 'Fixar mensagem'}
                        >
                          <Pin className={`w-4 h-4 ${isPinned ? 'text-[#bd18b4] fill-[#bd18b4]' : 'text-gray-400'}`} />
                        </motion.button>

                        {/* Bolinha 2 - Editar/Cancelar */}
                        {canEdit && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.5, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.5, y: 5 }}
                            transition={{ duration: 0.2, delay: 0.05 }}
                            onClick={isEditing ? handleCancelEdit : handleEdit}
                            className={`absolute ${isOwn ? 'right-10' : 'left-10'} ${isEditing ? '-top-12' : '-top-10'} w-8 h-8 flex items-center justify-center rounded-full ${isEditing ? 'bg-red-600 border-red-600 hover:bg-red-700' : 'bg-[#1a1a1a] border border-white/10 hover:bg-[#29292E]'} transition-colors z-10 shadow-lg cursor-pointer`}
                            title={isEditing ? 'Cancelar edição' : 'Editar mensagem'}
                          >
                            {isEditing ? (
                              <X className="w-4 h-4 text-white" />
                            ) : (
                              <Pencil className="w-4 h-4 text-gray-400" />
                            )}
                          </motion.button>
                        )}
                        {!canEdit && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.5, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.5, y: 5 }}
                            transition={{ duration: 0.2, delay: 0.05 }}
                            disabled
                            className={`absolute ${isOwn ? 'right-10' : 'left-10'} -top-10 w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-white/10 opacity-40 cursor-not-allowed z-10 shadow-lg`}
                            title="Tempo de edição expirado (15 minutos)"
                          >
                            <Pencil className="w-4 h-4 text-gray-600" />
                          </motion.button>
                        )}

                        {/* Bolinha 3 - Deletar */}
                        <motion.button
                          initial={{ opacity: 0, scale: 0.5, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.5, y: 5 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                          onClick={handleDelete}
                          className={`absolute ${isOwn ? 'right-20' : 'left-20'} -top-10 w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-white/10 hover:bg-[#29292E] transition-colors z-10 shadow-lg cursor-pointer`}
                          title="Deletar mensagem"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </motion.button>
                      </>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col gap-2">
                    {msg.content && (
                      <div
                        className={`rounded-lg px-4 py-2 ${isOwn
                            ? 'bg-[#bd18b4] text-black'
                            : 'bg-[#29292E] text-white border border-[#323238]'
                          }`}
                      >
                        <p
                          className="text-sm whitespace-pre-wrap break-words"
                          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                          dangerouslySetInnerHTML={{
                            __html: highlightText(msg.content, searchQuery)
                          }}
                        />
                      </div>
                    )}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {msg.attachments.map((attachment) => {
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
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{timeAgo}</span>
                    {msg.edited && (
                      <span className="text-xs text-gray-500 italic">(editado)</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {(() => {
          const shouldShow = isTyping && typingUserId && typingUserId === friendId && typingUserId !== currentUserId;
          return shouldShow;
        })() && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarImage
                  src={friendAvatar || undefined}
                  alt={friendName}
                />
                <AvatarFallback className="bg-[#bd18b4] text-black text-xs">
                  {friendName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="bg-[#29292E] border border-[#323238] rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{friendName} está digitando</span>
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
      </div>

      {/* Input */}
      <FileUploadZone
        onFilesSelected={handleFilesSelected}
        disabled={!isConnected || uploading}
        className="fixed inset-0"
      />
      <div className="flex flex-col gap-2 p-2 md:p-4 border-t border-white/10 bg-[#1a1a1a] w-full max-w-full overflow-hidden">
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
        <div className="flex items-end gap-1.5 md:gap-2 w-full max-w-full min-w-0">
          <textarea
            value={message}
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
          <div className="relative shrink-0" ref={emojiPickerRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
              className={`text-gray-500 hover:text-white hover:bg-[#1a1a1a] rounded-lg w-8 h-8 md:w-9 md:h-9 cursor-pointer ${isEmojiPickerOpen ? 'bg-[#1a1a1a] text-white' : ''}`}
            >
              <Smile className="w-3.5 h-3.5 md:w-4 md:h-4" />
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
          {/* Botão de chamada de voz temporariamente desabilitado */}
          {/* {onStartCall && (
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              try {
                await onStartCall(friendId);
              } catch (error) {
                console.error('Erro ao iniciar chamada:', error);
              }
            }}
            disabled={true}
            className="text-gray-500 hover:text-white hover:bg-[#1a1a1a] rounded-lg w-9 h-9 cursor-not-allowed shrink-0 opacity-50"
            title="Chamada de voz desabilitada"
          >
            <Phone className="w-4 h-4" />
          </Button>
        )} */}
          <Button
            onClick={handleSend}
            disabled={!isConnected || (!message.trim() && pendingAttachments.length === 0) || uploading}
            className="bg-[#bd18b4] hover:bg-[#bd18b4]/80 text-black px-3 md:px-4 py-2 h-[32px] shrink-0"
          >
            {uploading ? (
              <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
            )}
          </Button>
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
                    // TODO: Mostrar toast de erro
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

