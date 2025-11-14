"use client";

import { useEffect, useRef, useState } from 'react';
import { Message } from '@/api/messages/send-message';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface DirectChatViewProps {
  friendId: string;
  friendName: string;
  friendAvatar?: string | null;
  currentUserId: string;
  currentUserName: string;
  messages: Message[];
  isConnected: boolean;
  isTyping: boolean;
  onSend: (receiverId: string, content: string) => Promise<void>;
  onTyping: (receiverId: string, isTyping: boolean) => void;
}

export function DirectChatView({
  friendId,
  friendName,
  friendAvatar,
  currentUserId,
  currentUserName,
  messages,
  isConnected,
  isTyping,
  onSend,
  onTyping,
}: DirectChatViewProps) {
  const [message, setMessage] = useState('');
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
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">Nenhuma mensagem ainda. Comece a conversar!</p>
          </div>
        ) : (
          messages.map((msg: Message) => {
            const isOwn = msg.senderId === currentUserId;
            const messageDate = new Date(msg.createdAt);
            const timeAgo = formatDistanceToNow(messageDate, { addSuffix: true, locale: ptBR });

            return (
              <div key={msg.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage
                    src={isOwn ? undefined : friendAvatar || undefined}
                    alt={isOwn ? currentUserName : friendName}
                  />
                  <AvatarFallback className="bg-[#B3E240] text-black text-xs">
                    {(isOwn ? currentUserName : friendName).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isOwn
                        ? 'bg-[#B3E240] text-black'
                        : 'bg-[#29292E] text-white border border-[#323238]'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{timeAgo}</span>
                    {isOwn && msg.isRead && <span className="text-xs text-gray-400">✓✓</span>}
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
          placeholder={isConnected ? "Digite uma mensagem..." : "Conectando..."}
          disabled={!isConnected}
          className="min-h-[44px] max-h-[120px] resize-none bg-[#29292E] border-[#323238] text-white placeholder:text-gray-500 focus:border-[#B3E240]"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!isConnected || !message.trim()}
          className="bg-[#B3E240] hover:bg-[#B3E240]/80 text-black px-4 py-2 h-[44px] shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

