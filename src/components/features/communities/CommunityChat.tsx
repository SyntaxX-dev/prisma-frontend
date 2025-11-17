"use client";

import { useState, useEffect, useRef } from "react";
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

interface CommunityChatProps {
  community: Community;
  messages: CommunityMessage[];
  pinnedMessages?: PinnedCommunityMessage[];
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string | null;
  onSendMessage: (content: string) => Promise<void>;
  onEditMessage?: (messageId: string, content: string) => Promise<{ success: boolean; message?: string }>;
  onDeleteMessage?: (messageId: string) => Promise<{ success: boolean; message?: string }>;
  onPinMessage?: (messageId: string) => Promise<{ success: boolean; message?: string }>;
  onUnpinMessage?: (messageId: string) => Promise<{ success: boolean; message?: string }>;
  onStartVideoCall?: () => void;
  onStartVoiceCall?: () => void;
  isConnected?: boolean;
}

export function CommunityChat({
  community,
  messages,
  pinnedMessages = [],
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onPinMessage,
  onUnpinMessage,
  onStartVideoCall,
  onStartVoiceCall,
  isConnected = false,
}: CommunityChatProps) {
  const [messageInput, setMessageInput] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [memberMap, setMemberMap] = useState<Map<string, { name: string; avatar?: string }>>(new Map());
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        console.error('[CommunityChat] Erro ao carregar membros:', error);
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
            console.error(`[CommunityChat] Erro ao buscar perfil do usuário ${userId}:`, error);
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
        console.error('[CommunityChat] Erro ao carregar usuários faltantes:', error);
      }
    };

    if (memberMap.size > 0) {
      loadMissingUsers();
    }
  }, [messages, currentUserId, memberMap]);

  const handleSend = async () => {
    if (!messageInput.trim() || !isConnected) return;

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

    try {
      await onSendMessage(messageInput.trim());
      setMessageInput("");
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
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

  return (
    <div 
      className="flex-1 flex flex-col h-full rounded-2xl overflow-hidden border border-white/10"
      style={{
        background: 'rgb(14, 14, 14)',
      }}
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 pt-12 space-y-6 pb-32">
        {messages.length === 0 ? (
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
                  className={`flex gap-3 ${messageIsOwn ? "flex-row-reverse" : ""} group relative`}
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
                            background: '#C9FE02',
                            color: '#000',
                          }}
                        >
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  <div
                    className={`flex flex-col max-w-[70%] ${
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
                              <Pin className={`w-4 h-4 ${isPinned ? 'text-[#B3E240] fill-[#B3E240]' : 'text-gray-400'}`} />
                            </motion.button>
                          )}

                          {/* Editar/Cancelar - apenas o autor */}
                          {messageIsOwn && onEditMessage && (
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
                      <div
                        className={`px-3 py-2 rounded-lg ${
                          messageIsOwn
                            ? "rounded-tr-sm bg-[#B3E240] text-black"
                            : "rounded-tl-sm bg-[#29292E] text-white border border-[#323238]"
                        }`}
                      >
                        <p className={`text-sm leading-relaxed break-words ${messageIsOwn ? 'text-black' : 'text-white'}`} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                          {message.content}
                        </p>
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
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div 
        className="p-4 border-t border-white/10 bg-[#1a1a1a]"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-white hover:bg-[#1a1a1a] rounded-lg w-9 h-9 cursor-pointer"
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isConnected ? (editingMessageId ? "Edite sua mensagem..." : "Digite uma mensagem...") : "Conectando..."}
            disabled={!isConnected}
            className="resize-none bg-[#29292E] border border-[#323238] text-white placeholder:text-gray-500 focus:border-[#B3E240] focus:outline-none focus:ring-0 rounded-md px-3 py-1.5 text-sm flex-1 overflow-y-auto overflow-x-hidden"
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
            disabled={!messageInput.trim() || !isConnected}
            size="icon"
            className="rounded-lg w-9 h-9 cursor-pointer"
            style={{
              background: messageInput.trim() && isConnected ? '#C9FE02' : 'rgb(26, 26, 26)',
              color: messageInput.trim() && isConnected ? '#000' : '#666',
            }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

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
                    console.log('Mensagem excluída com sucesso');
                  } else {
                    console.error('Erro ao excluir mensagem:', result.message);
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
