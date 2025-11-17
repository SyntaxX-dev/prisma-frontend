"use client";

import { 
  Phone,
  Video,
  Pin,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  File,
  Loader2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Community } from "@/types/community";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCommunityMembers } from "@/api/communities/get-community-members";
import type { CommunityMember } from "@/api/communities/get-community-members";
import type { PinnedCommunityMessage } from "@/types/community-chat";
import { getUserProfile } from "@/api/auth/get-user-profile";
import { useUserStatus } from "@/providers/UserStatusProvider";

interface CommunityInfoProps {
  community: Community;
  onStartVideoCall?: () => void;
  onStartVoiceCall?: () => void;
  isFromSidebar?: boolean; // Indica se a comunidade vem da sidebar (API) ou é uma conversa mockada
  pinnedMessages?: PinnedCommunityMessage[];
  currentUserId?: string;
  friendName?: string;
  friendAvatar?: string | null;
}

export function CommunityInfo({ 
  community, 
  onStartVideoCall, 
  onStartVoiceCall, 
  isFromSidebar = false,
  pinnedMessages = [],
  currentUserId,
  friendName,
  friendAvatar,
}: CommunityInfoProps) {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string>("photos");
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [memberMap, setMemberMap] = useState<Map<string, { name: string; avatar?: string }>>(new Map());
  const { statusMap, getBatchStatus } = useUserStatus();
  
  // Ref para evitar chamadas duplicadas
  const hasLoadedMembers = useRef<string | null>(null);
  const hasLoadedMemberStatusRef = useRef<string>('');
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Carregar membros apenas quando o usuário for membro da comunidade
  useEffect(() => {
    const shouldLoad = isFromSidebar && community.id && (community.isMember || community.isOwner);
    
    if (shouldLoad) {
      // Verificar se já carregou para esta comunidade específica
      if (hasLoadedMembers.current !== community.id) {
        hasLoadedMembers.current = community.id;
        loadMembers();
      }
    } else {
      // Limpar membros se não for membro ou não for da sidebar
      setMembers([]);
      hasLoadedMembers.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [community.id, isFromSidebar, community.isMember, community.isOwner]);

  const loadMembers = async () => {
    try {
      setIsLoadingMembers(true);
      setMembersError(null);
      const response = await getCommunityMembers({
        communityId: community.id,
        limit: 50, // Carregar até 50 membros
        offset: 0,
      });
      
      if (response.success && response.data) {
        const membersList = response.data.members || [];
        setMembers(membersList);
        
        // Criar mapa de membros para fácil acesso
        const newMemberMap = new Map<string, { name: string; avatar?: string }>();
        membersList.forEach((member: CommunityMember) => {
          newMemberMap.set(member.id, {
            name: member.name,
            avatar: member.profileImage || undefined,
          });
        });
        setMemberMap(newMemberMap);
        
        // Buscar status de todos os membros (incluindo o próprio usuário se estiver na lista)
        const memberIds = membersList.map(m => m.id);
        const membersKey = memberIds.sort().join(',');
        
        // Só buscar se a lista de membros mudou
        if (memberIds.length > 0 && membersKey !== hasLoadedMemberStatusRef.current) {
          hasLoadedMemberStatusRef.current = membersKey;
          getBatchStatus(memberIds);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar membros:', error);
      setMembersError(error.message || "Erro ao carregar membros");
      // Em caso de erro, manter array vazio
      setMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Buscar perfis de usuários das mensagens fixadas que não estão na lista de membros
  useEffect(() => {
    const loadPinnedMessageUsers = async () => {
      if (!pinnedMessages.length || memberMap.size === 0) return;

      const missingUserIds = Array.from(
        new Set(
          pinnedMessages
            .map(pinned => pinned.message.senderId)
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
            console.error(`[CommunityInfo] Erro ao buscar perfil do usuário ${userId}:`, error);
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
        console.error('[CommunityInfo] Erro ao carregar usuários das mensagens fixadas:', error);
      }
    };

    loadPinnedMessageUsers();
  }, [pinnedMessages, currentUserId, memberMap]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };

  const mockPhotos = [
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200",
    "https://images.unsplash.com/photo-1506812574058-fc75fa93fead?w=200",
    "https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?w=200",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200",
  ];

  const mockFiles = [
    { name: "Contract for the provision of printing services", type: "pdf" },
    { name: "Changes in the schedule of the department of material...", type: "doc" },
    { name: "Contract for the provision of printing services", type: "pdf" },
  ];

  const mockLinks = [
    { title: "Economic Policy", url: "https://www.fffm.economic-policy" },
    { title: "Microsoft", url: "https://www.microsoft.com/" },
    { title: "Contact information", url: "https://www.fffm.neweconomic-policy" },
    { title: "Official Guide to Government...", url: "https://www.usa.gov" },
  ];

  return (
    <div className="w-[300px] flex flex-col h-full gap-3">
      {/* Quick Actions - Ilha 1 */}
      <div 
        className="p-4 rounded-2xl border border-white/10"
        style={{
          background: 'rgb(14, 14, 14)',
        }}
      >
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onStartVoiceCall}
            className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer"
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: '#C9FE02',
              }}
            >
              <Phone className="w-4 h-4 text-black" />
            </div>
          </button>
          <button 
            onClick={onStartVideoCall}
            className="flex flex-col items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgb(26, 26, 26)' }}>
              <Video className="w-4 h-4 text-gray-400" />
            </div>
          </button>
        </div>
      </div>

      {/* Members ou Mensagens Fixadas - Ilha 2 */}
      <div 
        className="rounded-2xl overflow-hidden border border-white/10"
        style={{
          background: 'rgb(14, 14, 14)',
        }}
      >
        <div className="p-4">
          {isFromSidebar ? (
            <>
              <h3 className="text-white font-medium text-sm mb-3">Members</h3>
              <div className="space-y-2"
                style={{
                  maxHeight: '250px',
                  overflowY: 'auto',
                }}
              >
                {isLoadingMembers ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                ) : membersError ? (
                  <div className="text-xs text-red-400 py-2 px-2">
                    {membersError}
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-xs text-gray-500 py-2 px-2">
                    Nenhum membro encontrado
                  </div>
                ) : (
                  members.map((member) => (
                    <div 
                      key={member.id} 
                      onClick={() => router.push(`/profile?userId=${member.id}`)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-[rgb(26,26,26)] transition-colors cursor-pointer"
                    >
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.profileImage || undefined} alt={member.name} />
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
                        {/* Indicador de online */}
                        <div 
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 transition-colors`}
                          style={{ 
                            background: (statusMap.get(member.id) === 'online' || (currentUserId && member.id === currentUserId && statusMap.get(currentUserId) === 'online')) ? '#C9FE02' : '#666',
                            borderColor: 'rgb(30, 30, 30)' 
                          }} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-white truncate">{member.name}</p>
                          {member.isOwner && (
                            <span className="text-xs text-[#C9FE02] font-medium">👑</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-white font-medium text-sm mb-3">Mensagens Fixadas</h3>
              <div className="space-y-2"
                style={{
                  maxHeight: '250px',
                  overflowY: 'auto',
                }}
              >
                {pinnedMessages.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">Nenhuma mensagem fixada</p>
                ) : (
                  pinnedMessages.map((pinnedMsg) => {
                    const isFromCurrentUser = pinnedMsg.message.senderId === currentUserId;
                    const member = memberMap.get(pinnedMsg.message.senderId);
                    const senderName = isFromCurrentUser 
                      ? 'Você' 
                      : (member?.name || friendName || 'Usuário');
                    const senderAvatar = isFromCurrentUser 
                      ? undefined 
                      : (member?.avatar || friendAvatar || undefined);
                    
                    return (
                      <div 
                        key={pinnedMsg.id} 
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-[rgb(26,26,26)] transition-colors cursor-pointer"
                      >
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarImage src={senderAvatar || undefined} alt={senderName} />
                          <AvatarFallback 
                            className="text-xs font-medium"
                            style={{
                              background: '#C9FE02',
                              color: '#000',
                            }}
                          >
                            {senderName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm text-white font-medium truncate">{senderName}</p>
                            <span className="text-xs text-gray-500 shrink-0">{pinnedMsg.timeSincePinned}</span>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2">{pinnedMsg.message.content}</p>
                        </div>
                        <Pin className="w-3 h-3 text-gray-500 shrink-0 mt-1" />
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Files - Ilha 3 */}
      <div 
        className="rounded-2xl overflow-hidden flex-1 border border-white/10"
        style={{
          background: 'rgb(14, 14, 14)',
        }}
      >
        <div className="p-4 h-full flex flex-col">
          <button
            onClick={() => toggleSection("photos")}
            className="w-full flex items-center justify-between py-2 text-white hover:text-gray-300 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Files</span>
              <span className="text-xs text-gray-500">115</span>
            </div>
            {expandedSection === "photos" ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          {expandedSection === "photos" && (
            <div className="mt-2 flex-1 overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">115 photos</span>
                <button className="text-xs text-gray-500 hover:text-white cursor-pointer">^</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {mockPhotos.map((photo, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg overflow-hidden"
                    style={{ background: 'rgb(26, 26, 26)' }}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}