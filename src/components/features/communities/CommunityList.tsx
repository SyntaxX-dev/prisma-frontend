"use client";

import React, { useRef, useEffect } from 'react';
import { Plus, Home, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Community } from "@/types/community";
import { motion, useInView } from 'motion/react';
import AnimatedList from "@/components/shared/AnimatedList";
import { useRouter } from "next/navigation";
import { useUserStatus } from "@/providers/UserStatusProvider";

interface NavItemProps {
  item: { id: string; label: string; avatarUrl?: string; active?: boolean };
  index: number;
  onSelect: (id: string) => void;
}

interface CommunityItemProps {
  community: Community;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  getInitials: (name: string) => string;
  formatTime: (timestamp: string) => string;
  onCommunityClick?: (community: Community, event: React.MouseEvent) => void;
  isConversation?: boolean;
  userId?: string;
}

const NavItem: React.FC<NavItemProps> = ({ item, index, onSelect }) => {
  const itemRef = useRef<HTMLButtonElement>(null);
  const inView = useInView(itemRef, {
    amount: 0.1,
    once: false,
    margin: "0px 0px 200px 0px"
  });

  const handleClick = () => {
    onSelect(item.id);
  };

  return (
    <motion.button
      ref={itemRef}
      onClick={handleClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.15) }}
      className="w-14 h-14 rounded-xl overflow-hidden transition-all hover:scale-105 cursor-pointer shrink-0"
      style={{
        border: item.active ? '2px solid #bd18b4' : 'none',
      }}
    >
      <Avatar className="w-full h-full rounded-xl">
        <AvatarImage src={item.avatarUrl} alt={item.label} className="rounded-xl" />
        <AvatarFallback
          className="text-xs font-medium rounded-xl"
          style={{
            background: '#bd18b4',
            color: '#000',
          }}
        >
          {item.label}
        </AvatarFallback>
      </Avatar>
    </motion.button>
  );
};

interface CommunityItemProps {
  community: Community;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  getInitials: (name: string) => string;
  formatTime: (timestamp: string) => string;
  onCommunityClick?: (community: Community, event: React.MouseEvent) => void;
  isConversation?: boolean;
  userId?: string;
  statusMap?: Map<string, 'online' | 'offline'>;
}

const CommunityItem: React.FC<CommunityItemProps> = ({
  community,
  index,
  isSelected,
  onSelect,
  getInitials,
  formatTime,
  isConversation = false,
  userId,
  onCommunityClick,
  statusMap,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const inView = useInView(itemRef, {
    amount: 0.1,
    once: false,
    margin: "0px 0px 200px 0px"
  });

  const handleClick = (e: React.MouseEvent) => {
    // Se for uma conversa direta (começa com "chat-"), usar onSelect diretamente
    if (community.id.startsWith('chat-')) {
      onSelect(community.id);
    } else if (onCommunityClick) {
      onCommunityClick(community, e);
    } else {
      onSelect(community.id);
    }
  };

  return (
    <motion.div
      ref={itemRef}
      data-index={index}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.15) }}
      className="mb-2"
    >
      <button
        onClick={handleClick}
        className="w-full p-3 rounded-2xl transition-all hover:scale-[1.01] cursor-pointer border border-white/10"
        style={{
          background: isSelected ? 'rgb(30, 30, 30)' : 'rgb(14, 14, 14)',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <Avatar className="w-12 h-12 rounded-xl">
              <AvatarImage src={community.avatarUrl || undefined} className="rounded-xl" />
              <AvatarFallback
                className="font-semibold text-sm rounded-xl"
                style={{
                  background: '#bd18b4',
                  color: '#000',
                }}
              >
                {getInitials(community.name)}
              </AvatarFallback>
            </Avatar>
            {/* Indicador de online - apenas para conversas */}
            {isConversation && userId && statusMap && (
              <div
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1a1a1a] transition-colors"
                style={{
                  background: statusMap.get(userId) === 'online' ? '#bd18b4' : '#666'
                }}
              />
            )}
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-white text-sm">
                {community.name}
              </h3>
            </div>

            <p className="text-xs text-gray-400 truncate">
              {community.lastMessage?.sender ? `${community.lastMessage.sender}: ` : ''}
              {community.lastMessage
                ? community.lastMessage.content
                : community.description}
            </p>
          </div>

          {community.lastMessage && (
            <span className="text-[10px] text-gray-500 shrink-0">
              {formatTime(community.lastMessage.timestamp)}
            </span>
          )}
        </div>
      </button>
    </motion.div>
  );
};

interface ConversationItem {
  otherUser: {
    id: string;
    name: string;
    email: string;
    profileImage?: string | null;
  };
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    isRead: boolean;
    createdAt: string;
    readAt?: string | null;
  };
  unreadCount: number;
  isFromMe: boolean;
}

interface CommunityListProps {
  communities: Community[];
  selectedCommunityId?: string;
  onSelectCommunity: (communityId: string) => void;
  onCreateCommunity: () => void;
  onCommunityClick?: (community: Community, event: React.MouseEvent) => void;
  conversations?: ConversationItem[];
  selectedChatUserId?: string | null;
  onSelectConversation?: (userId: string) => void;
}

export function CommunityList({
  communities,
  selectedCommunityId,
  onSelectCommunity,
  onCreateCommunity,
  onCommunityClick,
  conversations = [],
  selectedChatUserId,
  onSelectConversation,
}: CommunityListProps) {
  const { statusMap, getBatchStatus } = useUserStatus();
  const hasLoadedConversationStatusRef = useRef<string>('');

  // Buscar status dos usuários das conversas
  useEffect(() => {
    const userIds = conversations.map(c => c.otherUser.id);
    const conversationsKey = userIds.sort().join(',');

    // Só buscar se a lista de conversas mudou
    if (userIds.length > 0 && conversationsKey !== hasLoadedConversationStatusRef.current) {
      hasLoadedConversationStatusRef.current = conversationsKey;
      getBatchStatus(userIds);
    }
  }, [conversations, getBatchStatus]);

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
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

      if (diffInMinutes < 60) return `${diffInMinutes} m`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  // Usar as comunidades da API como navItems
  // Só marcar como ativo se não houver chat de usuário selecionado
  const navItems = communities.map((community) => ({
    id: community.id,
    label: getInitials(community.name),
    active: selectedCommunityId === community.id && !selectedChatUserId,
    avatarUrl: community.avatarUrl || undefined,
  }));

  // Converter conversas para formato de Community para exibição
  const conversationCommunities: Community[] = conversations.map((conv) => ({
    id: `chat-${conv.otherUser.id}`,
    name: conv.otherUser.name,
    description: conv.lastMessage?.content || '',
    avatarUrl: conv.otherUser.profileImage || undefined,
    memberCount: 2,
    isOwner: false,
    isMember: true,
    lastMessage: conv.lastMessage ? {
      content: conv.lastMessage.content,
      sender: conv.isFromMe ? 'Você' : conv.otherUser.name,
      timestamp: conv.lastMessage.createdAt,
    } : undefined,
    createdAt: conv.lastMessage?.createdAt || new Date().toISOString(),
  }));

  // Apenas conversas diretas de usuários
  const chatCommunities = conversationCommunities;

  const router = useRouter();

  return (
    <div className="flex gap-3 h-full">
      {/* Sidebar Cilíndrica - Navegação */}
      <div
        className="w-[76px] flex flex-col items-center py-4 gap-3 rounded-xl border border-white/10 sidebar-container"
        style={{
          background: 'rgb(14, 14, 14)',
        }}
      >
        {/* Botão Voltar ao Dashboard */}
        <button
          onClick={() => router.push('/dashboard')}
          className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all hover:scale-105 cursor-pointer"
          style={{
            background: 'rgb(30, 30, 30)',
            color: '#bd18b4',
          }}
          title="Voltar ao Dashboard"
        >
          <Home className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="w-12 h-12 flex items-center justify-center shrink-0">
          <img
            src="/logo-prisma.svg"
            alt="Prisma Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Navigation Items - Comunidades da API */}
        <div
          className="flex-1 flex flex-col items-center gap-3 py-2 overflow-y-auto overflow-x-hidden min-h-0 w-full sidebar-scrollbar"
        >
          <div className="flex flex-col items-center gap-3 w-full sidebar-items-container">
            {communities.length === 0 ? (
              <div className="text-gray-500 text-xs py-2">Nenhuma comunidade</div>
            ) : (
              navItems.map((item, index) => {
                return (
                  <NavItem
                    key={item.id}
                    item={item}
                    index={index}
                    onSelect={onSelectCommunity}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={onCreateCommunity}
          className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all hover:scale-105 cursor-pointer"
          style={{
            background: '#bd18b4',
            color: '#000',
          }}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Lista de Chats - Ilhas com AnimatedList */}
      <div className="w-[320px] flex flex-col pr-2 overflow-hidden min-h-0 shrink-0">
        {chatCommunities.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: 'linear-gradient(145deg, rgba(30, 30, 38, 0.8) 0%, rgba(20, 20, 28, 0.8) 100%)',
                border: '1px solid rgba(189, 24, 180, 0.2)',
              }}
            >
              <MessageCircle className="w-8 h-8 text-gray-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-white font-semibold text-sm mb-2">Sem conversas ainda</h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Inicie um chat direto ou entre em uma comunidade para começar.
            </p>

            <div className="mt-8 flex flex-col gap-2 w-full">
              <button
                onClick={onCreateCommunity}
                className="w-full py-3 rounded-xl text-xs font-medium text-white transition-all hover:scale-[1.02] cursor-pointer border border-white/5"
                style={{
                  background: 'rgba(189, 24, 180, 0.1)',
                }}
              >
                Explorar Comunidades
              </button>
            </div>
          </div>
        ) : (
          <AnimatedList
            showGradients={true}
            enableArrowNavigation={true}
            displayScrollbar={true}
            maxHeight="100%"
            className="h-full"
            onItemSelect={(item, index) => {
              const community = chatCommunities[index];
              if (community) {
                // Verificar se é uma conversa direta (começa com "chat-")
                if (community.id.startsWith('chat-')) {
                  const userId = community.id.replace('chat-', '');
                  if (onSelectConversation) {
                    onSelectConversation(userId);
                  }
                } else {
                  onSelectCommunity(community.id);
                }
              }
            }}
          >
            {chatCommunities.map((community, index) => {
              const isConversation = community.id.startsWith('chat-');
              const userId = isConversation ? community.id.replace('chat-', '') : undefined;

              return (
                <CommunityItem
                  key={community.id}
                  community={community}
                  index={index}
                  isSelected={
                    isConversation
                      ? selectedChatUserId === userId
                      : selectedCommunityId === community.id
                  }
                  onSelect={(id) => {
                    if (id.startsWith('chat-')) {
                      const userId = id.replace('chat-', '');
                      if (onSelectConversation) {
                        onSelectConversation(userId);
                      }
                    } else {
                      onSelectCommunity(id);
                    }
                  }}
                  getInitials={getInitials}
                  formatTime={formatTime}
                  onCommunityClick={onCommunityClick}
                  isConversation={isConversation}
                  userId={userId}
                  statusMap={statusMap}
                />
              );
            })}
          </AnimatedList>
        )}
      </div>
    </div>
  );
}