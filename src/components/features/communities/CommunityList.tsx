"use client";

import { Plus, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Community } from "@/types/community";

interface CommunityListProps {
  communities: Community[];
  selectedCommunityId?: string;
  onSelectCommunity: (communityId: string) => void;
  onCreateCommunity: () => void;
}

export function CommunityList({
  communities,
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

  const navItems = [
    { id: 'work', label: 'Work', active: false, avatarUrl: 'https://picsum.photos/seed/work1/200' },
    { id: 'icg', label: 'ICG', active: false, avatarUrl: 'https://picsum.photos/seed/icg2/200' },
    { id: 'sp', label: 'SP', active: false, avatarUrl: 'https://picsum.photos/seed/sp3/200' },
    { id: 'bff', label: 'BFF', active: false, avatarUrl: 'https://picsum.photos/seed/bff4/200' },
    { id: 'mj', label: 'MJ', active: false, avatarUrl: 'https://picsum.photos/seed/mj5/200' },
    { id: 'gi', label: 'GI', active: false, avatarUrl: 'https://picsum.photos/seed/gi6/200' },
  ];

  return (
    <div className="flex gap-3 h-full">
      {/* Sidebar Cilíndrica - Navegação */}
      <div 
        className="w-[76px] flex flex-col items-center py-4 gap-3 rounded-xl"
        style={{
          background: 'rgb(30, 30, 30)',
        }}
      >
        {/* Logo */}
        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
          <img 
            src="/logo-prisma.svg" 
            alt="Prisma Logo" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Navigation Items */}
        <div className="flex-1 flex flex-col items-center gap-3 py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              className="w-14 h-14 rounded-xl overflow-hidden transition-all hover:scale-105 cursor-pointer"
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
            </button>
          ))}
        </div>

          {/* Add Button */}
          <button 
            onClick={onCreateCommunity}
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 cursor-pointer"
            style={{
              background: '#C9FE02',
              color: '#000',
            }}
          >
            <Plus className="w-5 h-5" />
          </button>
        {/* Settings */}
        <button 
          className="w-14 h-14 rounded-xl flex items-center justify-center text-gray-400 transition-all hover:scale-105 flex-shrink-0 cursor-pointer"
          style={{
            background: 'rgb(30, 30, 30)',
          }}
        >
          <Settings className="w-5 h-5" />
        </button>

      </div>

      {/* Lista de Chats - Ilhas */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2">
        {communities.map((community) => (
          <button
            key={community.id}
            onClick={() => onSelectCommunity(community.id)}
            className="w-full p-3 rounded-2xl transition-all hover:scale-[1.01] cursor-pointer"
            style={{
              background: selectedCommunityId === community.id ? 'rgb(48, 48, 48)' : 'rgb(30, 30, 30)',
            }}
          >
            <div className="flex items-start gap-3">
              <div className="relative flex-shrink-0">
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
                <span className="text-[10px] text-gray-500 flex-shrink-0">
                  {formatTime(community.lastMessage.timestamp)}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}