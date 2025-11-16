"use client";

import { useEffect, useRef, useState } from 'react';
import { Message } from '@/api/messages/send-message';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send, Pin, Trash2, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PinnedMessage } from '@/api/messages/get-pinned-messages';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DirectChatViewProps {
  friendId: string;
  friendName: string;
  friendAvatar?: string | null;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string | null;
  messages: Message[];
  isConnected: boolean;
  isTyping: boolean;
  onSend: (receiverId: string, content: string) => Promise<void>;
  onTyping: (receiverId: string, isTyping: boolean) => void;
  onPinMessage?: (messageId: string, friendId: string) => Promise<{ success: boolean; message?: string }>;
  onUnpinMessage?: (messageId: string) => Promise<{ success: boolean; message?: string }>;
  pinnedMessages?: PinnedMessage[];
  onEditMessage?: (messageId: string, content: string) => Promise<{ success: boolean; message?: string }>;
  onDeleteMessage?: (messageId: string) => Promise<{ success: boolean; message?: string }>;
}

export function DirectChatView({
  friendId,
  friendName,
  friendAvatar,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  messages,
  isConnected,
  isTyping,
  onSend,
  onTyping,
  onPinMessage,
  onUnpinMessage,
  pinnedMessages = [],
  onEditMessage,
  onDeleteMessage,
}: DirectChatViewProps) {
  const [message, setMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('[DirectChatView] Mensagens atualizadas:', messages.length, 'mensagens');
    console.log('[DirectChatView] IDs das mensagens:', messages.map(m => ({ id: m.id, senderId: m.senderId, content: m.content.substring(0, 20) })));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !isConnected) {
      console.log('[DirectChatView] ⚠️ Não pode enviar:', { hasMessage: !!message.trim(), isConnected });
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
        console.error('Erro ao editar mensagem:', result.message);
        // TODO: Mostrar toast de erro
      }
      return;
    }
    
    const messageToSend = message.trim();
    console.log('[DirectChatView] 📤 Iniciando envio de mensagem:', messageToSend);
    console.log('[DirectChatView] Estado atual de mensagens antes de enviar:', messages.length);
    try {
      await onSend(friendId, messageToSend);
      console.log('[DirectChatView] ✅ Mensagem enviada com sucesso');
      setMessage('');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      onTyping(friendId, false);
      
      // Aguardar um pouco e verificar se a mensagem foi adicionada
      setTimeout(() => {
        console.log('[DirectChatView] Estado de mensagens após envio:', messages.length);
      }, 500);
    } catch (error) {
      console.error('[DirectChatView] ❌ Erro ao enviar mensagem:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

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

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pt-12 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">Nenhuma mensagem ainda. Comece a conversar!</p>
          </div>
        ) : (
          messages.map((msg: Message) => {
            const isOwn = msg.senderId === currentUserId;
            const messageDate = new Date(msg.createdAt);
            const timeAgo = formatDistanceToNow(messageDate, { addSuffix: true, locale: ptBR });
            const isPinned = pinnedMessages.some(p => p.messageId === msg.id);
            const isHovered = hoveredMessageId === msg.id;
            const isEditing = editingMessageId === msg.id;

            const handlePin = async () => {
              if (isPinned && onUnpinMessage) {
                const result = await onUnpinMessage(msg.id);
                if (result.success) {
                  console.log('Mensagem desfixada');
                }
              } else if (!isPinned && onPinMessage) {
                const result = await onPinMessage(msg.id, friendId);
                if (result.success) {
                  console.log('Mensagem fixada');
                } else {
                  console.error('Erro ao fixar:', result.message);
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
                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''} group relative`}
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage
                    src={isOwn ? (currentUserAvatar || undefined) : (friendAvatar || undefined)}
                    alt={isOwn ? currentUserName : friendName}
                  />
                  <AvatarFallback className="bg-[#B3E240] text-black text-xs">
                    {(isOwn ? currentUserName : friendName).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div 
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%] relative`}
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
                          <Pin className={`w-4 h-4 ${isPinned ? 'text-[#B3E240] fill-[#B3E240]' : 'text-gray-400'}`} />
                        </motion.button>
                        
                        {/* Bolinha 2 - Editar/Cancelar */}
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

                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isOwn
                        ? 'bg-[#B3E240] text-black'
                        : 'bg-[#29292E] text-white border border-[#323238]'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{msg.content}</p>
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

        {isTyping && (
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarImage
                src={friendAvatar || undefined}
                alt={friendName}
              />
              <AvatarFallback className="bg-[#B3E240] text-black text-xs">
                {friendName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="bg-[#29292E] border border-[#323238] rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">{friendName}</span>
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
      <div className="flex items-end gap-2 p-4 border-t border-white/10 bg-[#1a1a1a]">
        <Textarea
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isConnected ? (editingMessageId ? "Edite sua mensagem..." : "Digite uma mensagem...") : "Conectando..."}
          disabled={!isConnected}
          className="!h-[44px] !max-h-[44px] resize-none bg-[#29292E] border-[#323238] text-white placeholder:text-gray-500 focus:border-[#B3E240] overflow-y-auto overflow-x-hidden"
          rows={1}
          style={{ 
            wordBreak: 'break-word', 
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            height: '44px',
            maxHeight: '44px'
          }}
        />
        <Button
          onClick={handleSend}
          disabled={!isConnected || !message.trim()}
          className="bg-[#B3E240] hover:bg-[#B3E240]/80 text-black px-4 py-2 h-[44px] shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
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

