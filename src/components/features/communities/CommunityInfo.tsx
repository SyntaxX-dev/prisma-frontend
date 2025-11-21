"use client";

import { 
  Phone,
  Video,
  Pin,
  X,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  File,
  Loader2,
  Trash2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Community } from "@/types/community";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCommunityMembers } from "@/api/communities/get-community-members";
import type { CommunityMember } from "@/api/communities/get-community-members";
import { removeCommunityMember } from "@/api/communities/remove-community-member";
import type { PinnedCommunityMessage } from "@/types/community-chat";
import { getUserProfile } from "@/api/auth/get-user-profile";
import { useUserStatus } from "@/providers/UserStatusProvider";
import { ChatAttachmentsGallery } from "@/components/features/chat/ChatAttachmentsGallery";
import { useChatAttachments } from "@/hooks/features/chat/useChatAttachments";

interface CommunityInfoProps {
  community: Community;
  onStartVideoCall?: () => void;
  onStartVoiceCall?: () => void;
  isFromSidebar?: boolean; // Indica se a comunidade vem da sidebar (API) ou é uma conversa mockada
  pinnedMessages?: PinnedCommunityMessage[];
  currentUserId?: string;
  friendName?: string;
  friendAvatar?: string | null;
  onUnpinMessage?: (messageId: string) => Promise<{ success: boolean; message?: string }>;
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
  onUnpinMessage,
}: CommunityInfoProps) {
  const router = useRouter();
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [memberMap, setMemberMap] = useState<Map<string, { name: string; avatar?: string }>>(new Map());
  const { statusMap, getBatchStatus } = useUserStatus();
  const [memberToRemove, setMemberToRemove] = useState<CommunityMember | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  
  // Ref para evitar chamadas duplicadas
  const hasLoadedMembers = useRef<string | null>(null);
  const hasLoadedMemberStatusRef = useRef<string>('');
  
  // Determinar se é chat pessoal ou comunidade
  const isPersonalChat = community.id.startsWith('chat-');
  const chatId = isPersonalChat ? community.id.replace('chat-', '') : community.id;
  const chatType = isPersonalChat ? 'personal' : 'community';
  
  // Buscar attachments
  const { attachments, loading: loadingAttachments } = useChatAttachments(chatType, chatId);
  
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
        
        // Verificar se o usuário atual é o dono
        setIsCurrentUserOwner(response.data.isCurrentUserOwner || false);
        
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

    loadPinnedMessageUsers();
  }, [pinnedMessages, currentUserId, memberMap]);


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
            disabled={true}
            className="flex flex-col items-center gap-2 p-2 rounded-lg transition-colors cursor-not-allowed opacity-50"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgb(26, 26, 26)' }}>
              <Phone className="w-4 h-4 text-gray-400" />
            </div>
          </button>
          <button 
            onClick={onStartVideoCall}
            disabled={true}
            className="flex flex-col items-center gap-2 p-2 rounded-lg transition-colors cursor-not-allowed opacity-50"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgb(26, 26, 26)' }}>
              <Video className="w-4 h-4 text-gray-400" />
            </div>
          </button>
        </div>
      </div>

      {/* Members - Ilha 2 */}
      {isFromSidebar && (
        <div 
          className="rounded-2xl overflow-hidden border border-white/10"
          style={{
            background: 'rgb(14, 14, 14)',
          }}
        >
          <div className="p-4">
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
                    {isCurrentUserOwner && !member.isOwner && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMemberToRemove(member);
                          setIsRemoveDialogOpen(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300 cursor-pointer"
                        title="Remover membro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação para remover membro */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent className="bg-[#1a1a1a] border border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Remover membro da comunidade
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tem certeza que deseja remover <strong className="text-white">{memberToRemove?.name}</strong> desta comunidade? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (memberToRemove && community.id) {
                  try {
                    setIsRemovingMember(true);
                    
                    const response = await removeCommunityMember({
                      communityId: community.id,
                      memberId: memberToRemove.id,
                    });
                    
                    if (response.success) {
                      // Remover da lista localmente
                      setMembers(prev => prev.filter(m => m.id !== memberToRemove.id));
                      setMemberMap(prev => {
                        const newMap = new Map(prev);
                        newMap.delete(memberToRemove.id);
                        return newMap;
                      });
                      
                      setIsRemoveDialogOpen(false);
                      setMemberToRemove(null);
                      
                      // Recarregar membros para garantir sincronização
                      if (hasLoadedMembers.current === community.id) {
                        loadMembers();
                      }
                    } else {
                      alert('Erro ao remover membro: ' + response.message);
                    }
                  } catch (error: any) {
                    console.error('Erro ao remover membro:', error);
                    alert('Erro ao remover membro: ' + (error.message || 'Erro desconhecido'));
                  } finally {
                    setIsRemovingMember(false);
                  }
                }
              }}
              className={cn(buttonVariants({ variant: "destructive" }), "cursor-pointer")}
              disabled={isRemovingMember}
            >
              {isRemovingMember ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mensagens Fixadas - Ilha 2 ou 3 */}
      <div 
        className="rounded-2xl overflow-hidden border border-white/10"
        style={{
          background: 'rgb(14, 14, 14)',
        }}
      >
        <div className="p-4">
          <h3 className="text-white font-medium text-sm mb-3">Mensagens Fixadas</h3>
          <div className="space-y-2"
            style={{
              maxHeight: pinnedMessages && pinnedMessages.length > 3 ? '180px' : 'none',
              overflowY: pinnedMessages && pinnedMessages.length > 3 ? 'auto' : 'visible',
            }}
          >
            {pinnedMessages && pinnedMessages.length > 0 ? (
              pinnedMessages.map((pinnedMsg) => {
                const isFromCurrentUser = pinnedMsg.message.senderId === currentUserId;
                const member = memberMap.get(pinnedMsg.message.senderId);
                const senderName = isFromCurrentUser 
                  ? 'Você' 
                  : (member?.name || friendName || 'Usuário');
                const senderAvatar = isFromCurrentUser 
                  ? undefined 
                  : (member?.avatar || friendAvatar || undefined);
                
                const handleUnpin = async (e: React.MouseEvent) => {
                  e.stopPropagation(); // Prevenir que o clique dispare o scroll
                  if (onUnpinMessage) {
                    const result = await onUnpinMessage(pinnedMsg.messageId);
                    if (result.success) {
                    } else {
                    }
                  }
                };

                return (
                  <div 
                    key={pinnedMsg.id} 
                    onClick={() => {
                      // Disparar evento customizado para fazer scroll até a mensagem
                      window.dispatchEvent(new CustomEvent('scrollToMessage', { 
                        detail: { messageId: pinnedMsg.messageId } 
                      }));
                    }}
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
                    <button
                      onClick={handleUnpin}
                      className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-[rgb(26,26,26)] transition-colors cursor-pointer shrink-0 mt-1"
                      title="Desfixar mensagem"
                    >
                      <X className="w-3 h-3 text-gray-500 hover:text-white" />
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-500 text-center py-4">Nenhuma mensagem fixada</p>
            )}
          </div>
        </div>
      </div>

      {/* Files - Ilha 3 */}
      <div 
        className="rounded-2xl overflow-hidden flex-1 border border-white/10"
        style={{
          background: 'rgb(14, 14, 14)',
        }}
      >
        <ChatAttachmentsGallery
          attachments={attachments}
          loading={loadingAttachments}
        />
      </div>
    </div>
  );
}