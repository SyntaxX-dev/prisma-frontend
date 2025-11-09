"use client";

import React, { useRef } from 'react';
import { Plus, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Community } from "@/types/community";
import { motion, useInView } from 'motion/react';
import AnimatedList from "@/components/shared/AnimatedList";

interface NavItemProps {
  item: { id: string; label: string; avatarUrl?: string; active?: boolean };
  index: number;
  onSelect: (id: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({ item, index, onSelect }) => {
  const itemRef = useRef<HTMLButtonElement>(null);
  const inView = useInView(itemRef, { 
    amount: 0.1, 
    once: false,
    margin: "0px 0px 200px 0px"
  });

  return (
    <motion.button
      ref={itemRef}
      onClick={() => onSelect(item.id)}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.15) }}
      className="w-14 h-14 rounded-xl overflow-hidden transition-all hover:scale-105 cursor-pointer shrink-0"
      style={{
        border: item.active ? '2px solid #C9FE02' : 'none',
      }}
    >
      <Avatar className="w-full h-full rounded-xl">
        <AvatarImage src={item.avatarUrl} alt={item.label} className="rounded-xl" />
        <AvatarFallback 
          className="text-xs font-medium rounded-xl"
          style={{
            background: '#C9FE02',
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
}

const CommunityItem: React.FC<CommunityItemProps> = ({
  community,
  index,
  isSelected,
  onSelect,
  getInitials,
  formatTime,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const inView = useInView(itemRef, { 
    amount: 0.1, 
    once: false,
    margin: "0px 0px 200px 0px"
  });

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
        onClick={() => onSelect(community.id)}
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
                  background: '#C9FE02',
                  color: '#000',
                }}
              >
                {getInitials(community.name)}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1a1a1a]" style={{ background: '#C9FE02' }} />
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

interface CommunityListProps {
  communities: Community[];
  mockCommunities?: Community[]; // Comunidades mockadas para a lista de chats
  selectedCommunityId?: string;
  onSelectCommunity: (communityId: string) => void;
  onCreateCommunity: () => void;
}

export function CommunityList({
  communities,
  mockCommunities = [],
  selectedCommunityId,
  onSelectCommunity,
  onCreateCommunity,
}: CommunityListProps) {
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
  const navItems = communities.map((community) => ({
    id: community.id,
    label: getInitials(community.name),
    active: selectedCommunityId === community.id,
    avatarUrl: community.avatarUrl || undefined,
  }));

  // Usar comunidades mockadas para a lista de chats, ou as da API se não houver mocks
  const chatCommunities = mockCommunities.length > 0 ? mockCommunities : communities;

  return (
    <div className="flex gap-3 h-full">
      {/* Sidebar Cilíndrica - Navegação */}
      <div 
        className="w-[76px] flex flex-col items-center py-4 gap-3 rounded-xl border border-white/10 sidebar-container"
        style={{
          background: 'rgb(14, 14, 14)',
        }}
      >
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
              navItems.map((item, index) => (
                <NavItem 
                  key={item.id} 
                  item={item} 
                  index={index} 
                  onSelect={onSelectCommunity}
                />
              ))
            )}
          </div>
        </div>

          {/* Add Button */}
          <button 
            onClick={onCreateCommunity}
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all hover:scale-105 cursor-pointer"
            style={{
              background: '#C9FE02',
              color: '#000',
            }}
          >
            <Plus className="w-5 h-5" />
          </button>
        {/* Settings */}
        <button 
          className="w-14 h-14 rounded-xl flex items-center justify-center text-gray-400 transition-all hover:scale-105 shrink-0 cursor-pointer"
          style={{
            background: 'rgb(30, 30, 30)',
          }}
        >
          <Settings className="w-5 h-5" />
        </button>

      </div>

      {/* Lista de Chats - Ilhas com AnimatedList */}
      <div className="flex-1 flex flex-col pr-2 overflow-hidden min-h-0">
        <AnimatedList
          showGradients={true}
          enableArrowNavigation={true}
          displayScrollbar={true}
          maxHeight="100%"
          className="h-full"
          onItemSelect={(item, index) => {
            const community = chatCommunities[index];
            if (community) {
              onSelectCommunity(community.id);
            }
          }}
        >
          {chatCommunities.map((community, index) => (
            <CommunityItem
              key={community.id}
              community={community}
              index={index}
              isSelected={selectedCommunityId === community.id}
              onSelect={onSelectCommunity}
              getInitials={getInitials}
              formatTime={formatTime}
            />
          ))}
        </AnimatedList>
      </div>
    </div>
  );
}