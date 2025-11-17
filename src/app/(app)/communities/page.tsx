"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Settings } from "lucide-react";
import { CommunityList } from "@/components/features/communities/CommunityList";
import { CommunityChat } from "@/components/features/communities/CommunityChat";
import { CommunityInfo } from "@/components/features/communities/CommunityInfo";
import { CreateCommunityModal } from "@/components/features/communities/CreateCommunityModal";
import { VoiceCallScreen } from "@/components/features/communities/VoiceCallScreen";
import type { Community, CommunityMessage } from "@/types/community";
import { LoadingGrid } from "@/components/ui/loading-grid";
import { VideoCallScreen } from "@/components/features/communities/VideoCallScreens";
import DotGrid from "@/components/shared/DotGrid";
import { getCommunities } from "@/api/communities/get-communities";
import { CommunityJoinTooltip } from "@/components/features/communities/CommunityJoinTooltip";
import { NotificationsDropdown } from "@/components/features/notifications/NotificationsDropdown";
import { getConversations, Conversation } from "@/api/messages/get-conversations";
import { DirectChatView } from "@/components/features/chat/DirectChatView";
import { ChatSkeleton } from "@/components/features/chat/ChatSkeleton";
import { ChatHeaderSkeleton } from "@/components/features/chat/ChatHeaderSkeleton";
import { ChatSidebarSkeleton } from "@/components/features/chat/ChatSidebarSkeleton";
import { getUserProfile } from "@/api/auth/get-user-profile";
import { useProfile } from "@/hooks/features/profile";
import { useChat } from "@/hooks/features/chat/useChat";
import { useCommunityChat } from "@/hooks/features/chat/useCommunityChat";
import { useUserStatus } from "@/providers/UserStatusProvider";
import { Message } from "@/api/messages/send-message";
import type { CommunityMessage as CommunityMessageType } from "@/types/community-chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

// Mock data
const MOCK_COMMUNITIES: Community[] = [
  {
    id: "1",
    name: "Office chat",
    description: "I want to ask you to pick...",
    avatarUrl: "https://cdn.eadplataforma.app/client/gui/upload/product/photo/20052022_1653071584reactJS.png",
    memberCount: 45,
    isOwner: true,
    isMember: true,
    lastMessage: {
      content: "I want to ask you to pick...",
      sender: "Harry Fettel",
      timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "2",
    name: "Harry Fettel",
    description: "Our company needs to prepare",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    memberCount: 2,
    isOwner: false,
    isMember: true,
    lastMessage: {
      content: "Our company needs to prepare",
      sender: "Harry Fettel",
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "3",
    name: "Frank Garcia",
    description: "Our company needs to prepare",
    avatarUrl: "https://i.pravatar.cc/150?img=33",
    memberCount: 2,
    isOwner: false,
    isMember: true,
    lastMessage: {
      content: "Our company needs to prepare",
      sender: "Frank Garcia",
      timestamp: new Date(Date.now() - 24 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "4",
    name: "Maria Gonzalez",
    description: "Our company needs to prepare",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
    memberCount: 2,
    isOwner: false,
    isMember: true,
    lastMessage: {
      content: "Our company needs to prepare",
      sender: "Maria Gonzalez",
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "5",
    name: "Sarah Johnson",
    description: "Can we schedule a meeting?",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    memberCount: 2,
    isOwner: false,
    isMember: true,
    lastMessage: {
      content: "Can we schedule a meeting?",
      sender: "Sarah Johnson",
      timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "6",
    name: "Design Team",
    description: "New design mockups are ready",
    avatarUrl: "https://picsum.photos/seed/design1/200",
    memberCount: 12,
    isOwner: false,
    isMember: true,
    lastMessage: {
      content: "New design mockups are ready",
      sender: "Alex Chen",
      timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "7",
    name: "Michael Brown",
    description: "Thanks for the update!",
    avatarUrl: "https://i.pravatar.cc/150?img=8",
    memberCount: 2,
    isOwner: false,
    isMember: true,
    lastMessage: {
      content: "Thanks for the update!",
      sender: "Michael Brown",
      timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "8",
    name: "Marketing Group",
    description: "Campaign launch next week",
    avatarUrl: "https://picsum.photos/seed/marketing1/200",
    memberCount: 8,
    isOwner: true,
    isMember: true,
    lastMessage: {
      content: "Campaign launch next week",
      sender: "Emma Wilson",
      timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "9",
    name: "David Lee",
    description: "I'll send the files tomorrow",
    avatarUrl: "https://i.pravatar.cc/150?img=20",
    memberCount: 2,
    isOwner: false,
    isMember: true,
    lastMessage: {
      content: "I'll send the files tomorrow",
      sender: "David Lee",
      timestamp: new Date(Date.now() - 300 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "10",
    name: "Development Team",
    description: "Bug fix deployed successfully",
    avatarUrl: "https://picsum.photos/seed/dev1/200",
    memberCount: 15,
    isOwner: false,
    isMember: true,
    lastMessage: {
      content: "Bug fix deployed successfully",
      sender: "Tom Anderson",
      timestamp: new Date(Date.now() - 360 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "11",
    name: "Lisa Martinez",
    description: "See you at the conference",
    avatarUrl: "https://i.pravatar.cc/150?img=52",
    memberCount: 2,
    isOwner: false,
    isMember: true,
    lastMessage: {
      content: "See you at the conference",
      sender: "Lisa Martinez",
      timestamp: new Date(Date.now() - 420 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "12",
    name: "Project Alpha",
    description: "Meeting notes from yesterday",
    avatarUrl: "https://picsum.photos/seed/alpha1/200",
    memberCount: 6,
    isOwner: true,
    isMember: true,
    lastMessage: {
      content: "Meeting notes from yesterday",
      sender: "Robert Kim",
      timestamp: new Date(Date.now() - 480 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "13",
    name: "James Wilson",
    description: "The report is ready for review",
    avatarUrl: "https://i.pravatar.cc/150?img=16",
    memberCount: 2,
    isOwner: false,
    isMember: true,
    lastMessage: {
      content: "The report is ready for review",
      sender: "James Wilson",
      timestamp: new Date(Date.now() - 540 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "14",
    name: "Sales Team",
    description: "Q4 targets achieved!",
    avatarUrl: "https://picsum.photos/seed/sales1/200",
    memberCount: 10,
    isOwner: false,
    isMember: true,
    lastMessage: {
      content: "Q4 targets achieved!",
      sender: "Patricia Davis",
      timestamp: new Date(Date.now() - 600 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "15",
    name: "Emily Taylor",
    description: "Great work on the presentation",
    avatarUrl: "https://i.pravatar.cc/150?img=60",
    memberCount: 2,
    isOwner: false,
    isMember: true,
    lastMessage: {
      content: "Great work on the presentation",
      sender: "Emily Taylor",
      timestamp: new Date(Date.now() - 720 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "16",
    name: "Product Team",
    description: "New feature released",
    avatarUrl: "https://picsum.photos/seed/product1/200",
    memberCount: 9,
    isOwner: false,
    isMember: true,
    lastMessage: {
      content: "New feature released",
      sender: "Chris Moore",
      timestamp: new Date(Date.now() - 840 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "17",
    name: "Daniel Rodriguez",
    description: "Let's catch up this weekend",
    avatarUrl: "https://i.pravatar.cc/150?img=28",
    memberCount: 2,
    isOwner: false,
    isMember: true,
    lastMessage: {
      content: "Let's catch up this weekend",
      sender: "Daniel Rodriguez",
      timestamp: new Date(Date.now() - 960 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "18",
    name: "Support Team",
    description: "Ticket #1234 resolved",
    avatarUrl: "https://picsum.photos/seed/support1/200",
    memberCount: 7,
    isOwner: false,
    isMember: true,
    lastMessage: {
      content: "Ticket #1234 resolved",
      sender: "Jennifer White",
      timestamp: new Date(Date.now() - 1080 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 16 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "19",
    name: "Amanda Thompson",
    description: "Thanks for your help!",
    avatarUrl: "https://i.pravatar.cc/150?img=35",
    memberCount: 2,
    isOwner: false,
    isMember: true,
    lastMessage: {
      content: "Thanks for your help!",
      sender: "Amanda Thompson",
      timestamp: new Date(Date.now() - 1200 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "20",
    name: "Operations",
    description: "System maintenance scheduled",
    avatarUrl: "https://picsum.photos/seed/ops1/200",
    memberCount: 5,
    isOwner: true,
    isMember: true,
    lastMessage: {
      content: "System maintenance scheduled",
      sender: "Kevin Martinez",
      timestamp: new Date(Date.now() - 1320 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "21",
    name: "Ryan Clark",
    description: "The documents are in the shared folder",
    avatarUrl: "https://i.pravatar.cc/150?img=42",
    memberCount: 2,
    isOwner: false,
    isMember: true,
    lastMessage: {
      content: "The documents are in the shared folder",
      sender: "Ryan Clark",
      timestamp: new Date(Date.now() - 1440 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "22",
    name: "Research Group",
    description: "Initial findings published",
    avatarUrl: "https://picsum.photos/seed/research1/200",
    memberCount: 11,
    isOwner: false,
    isMember: true,
    lastMessage: {
      content: "Initial findings published",
      sender: "Sophie Green",
      timestamp: new Date(Date.now() - 1560 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 19 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: "23",
    name: "Jessica Adams",
    description: "Looking forward to our collaboration",
    avatarUrl: "https://i.pravatar.cc/150?img=55",
    memberCount: 2,
    isOwner: false,
    isMember: true,
    lastMessage: {
      content: "Looking forward to our collaboration",
      sender: "Jessica Adams",
      timestamp: new Date(Date.now() - 1680 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(),
  },
];

const MOCK_MESSAGES: Record<string, CommunityMessage[]> = {
  "1": [
    {
      id: "1",
      communityId: "1",
      senderId: "user1",
      senderName: "Harry Fettel",
      senderAvatar: "https://i.pravatar.cc/150?img=12",
      content: "Hey guys! Don't forget about our meeting next week! I'll be waiting for you at the 'Cozy Corner' cafe at 6:00 PM. Don't be late!",
      timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
      isOwn: false,
    },
    {
      id: "2",
      communityId: "1",
      senderId: "user2",
      senderName: "Conner Garcia",
      senderAvatar: "https://i.pravatar.cc/150?img=15",
      content: "Absolutely, I'll be there! Looking forward to catching up and discussing everything.",
      timestamp: new Date(Date.now() - 110 * 60000).toISOString(),
      isOwn: false,
    },
    {
      id: "3",
      communityId: "1",
      senderId: "user1",
      senderName: "Harry Fettel",
      senderAvatar: "https://i.pravatar.cc/150?img=12",
      content: "Great! See you there.",
      timestamp: new Date(Date.now() - 100 * 60000).toISOString(),
      isOwn: false,
    },
    {
      id: "4",
      communityId: "1",
      senderId: "user3",
      senderName: "Jenny Li",
      senderAvatar: "https://i.pravatar.cc/150?img=45",
      content: "I have a new game plan",
      timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
      isOwn: false,
    },
    {
      id: "5",
      communityId: "1",
      senderId: "user4",
      senderName: "Jaden Parker",
      senderAvatar: "https://i.pravatar.cc/150?img=25",
      content: "Let's discuss this tomorrow",
      timestamp: new Date(Date.now() - 80 * 60000).toISOString(),
      isOwn: false,
    },
    {
      id: "6",
      communityId: "1",
      senderId: "user5",
      senderName: "Frank Garcia",
      senderAvatar: "https://i.pravatar.cc/150?img=33",
      content: "We will start celebrating Oleg's birthday soon",
      timestamp: new Date(Date.now() - 70 * 60000).toISOString(),
      isOwn: false,
    },
    {
      id: "7",
      communityId: "1",
      senderId: "user5",
      senderName: "Frank Garcia",
      senderAvatar: "https://i.pravatar.cc/150?img=33",
      content: "We're already starting, hurry up if it's late",
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
      isOwn: false,
    },
    {
      id: "8",
      communityId: "1",
      senderId: "current",
      senderName: "You",
      senderAvatar: "https://i.pravatar.cc/150?img=68",
      content: "I'm stuck in traffic, I'll be there a little later",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      isOwn: true,
    },
  ],
};

const MOCK_CALL_PARTICIPANTS = [
  { id: "1", name: "João Silva", avatarUrl: "https://i.pravatar.cc/150?img=13", isMuted: false, isVideoOff: false, isSpeaking: true },
  { id: "2", name: "Maria Santos", avatarUrl: "https://i.pravatar.cc/150?img=47", isMuted: false, isVideoOff: true, isSpeaking: false },
  { id: "3", name: "Pedro Costa", avatarUrl: "https://i.pravatar.cc/150?img=33", isMuted: true, isVideoOff: false, isSpeaking: false },
  { id: "4", name: "Ana Oliveira", avatarUrl: "https://i.pravatar.cc/150?img=45", isMuted: false, isVideoOff: false, isSpeaking: false },
];

// Funções para gerenciar última conversa no localStorage
const LAST_CONVERSATION_KEY = 'last_conversation_communities';

interface LastConversation {
  type: 'community' | 'chat';
  id: string;
}

const saveLastConversation = (type: 'community' | 'chat', id: string) => {
  if (typeof window !== 'undefined') {
    try {
      const lastConversation: LastConversation = { type, id };
      localStorage.setItem(LAST_CONVERSATION_KEY, JSON.stringify(lastConversation));
      console.log('[CommunitiesPage] 💾 Última conversa salva:', lastConversation);
    } catch (error) {
      console.error('[CommunitiesPage] Erro ao salvar última conversa:', error);
    }
  }
};

const loadLastConversation = (): LastConversation | null => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LAST_CONVERSATION_KEY);
      if (saved) {
        const lastConversation = JSON.parse(saved) as LastConversation;
        console.log('[CommunitiesPage] 📂 Última conversa carregada:', lastConversation);
        return lastConversation;
      }
    } catch (error) {
      console.error('[CommunitiesPage] Erro ao carregar última conversa:', error);
    }
  }
  return null;
};

export default function CommunitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatUserId = searchParams.get('chat');
  const communityIdFromUrl = searchParams.get('community');
  
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | undefined>(communityIdFromUrl || undefined);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [tooltipCommunity, setTooltipCommunity] = useState<Community | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | undefined>();
  
  // Estados para chat direto
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(chatUserId || null);
  const [chatUser, setChatUser] = useState<{ id: string; name: string; profileImage?: string | null } | null>(null);
  const [isLoadingChatUser, setIsLoadingChatUser] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  
  // Estados para loading do chat da comunidade
  const [isLoadingCommunityMessages, setIsLoadingCommunityMessages] = useState(false);
  const [isLoadingCommunityPinnedMessages, setIsLoadingCommunityPinnedMessages] = useState(false);
  
  // Combinar comunidades da API com mocks para busca
  const allCommunities = [...communities, ...MOCK_COMMUNITIES];
  
  // Call states
  const [isInVideoCall, setIsInVideoCall] = useState(false);
  const [isInVoiceCall, setIsInVoiceCall] = useState(false);

  // Ref para evitar chamadas duplicadas
  const hasLoadedCommunities = useRef(false);
  const hasRestoredLastConversation = useRef(false);
  
  // Hook para obter dados do usuário logado
  const { userProfile } = useProfile();
  
  // Hook para status online
  const { statusMap, getBatchStatus, getStatus } = useUserStatus();
  
  // Buscar status do próprio usuário quando o perfil estiver disponível
  useEffect(() => {
    if (userProfile?.id) {
      getStatus(userProfile.id);
    }
  }, [userProfile?.id, getStatus]);
  
  // Hook para chat direto
  const {
    messages: directMessages,
    isConnected,
    isTyping,
    typingUserId,
    loadConversation,
    sendMessage,
    sendTypingIndicator,
    pinMessage,
    unpinMessage,
    pinnedMessages,
    editMessage,
    deleteMessage,
  } = useChat();

  // Hook para chat de comunidades
  const {
    messages: communityMessages,
    pinnedMessages: communityPinnedMessages,
    isConnected: isCommunityConnected,
    sendMessage: sendCommunityMessage,
    editMessage: editCommunityMessage,
    deleteMessage: deleteCommunityMessage,
    pinMessage: pinCommunityMessage,
    unpinMessage: unpinCommunityMessage,
    loadMessages: loadCommunityMessages,
    loadPinnedMessages: loadCommunityPinnedMessages,
  } = useCommunityChat(selectedCommunityId || null);

  // Definir loadChatUser antes dos useEffects que o usam
  const loadChatUser = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      setIsLoadingChatUser(true);
      // Mock delay para visualizar skeletons (1.5 segundos)
      await new Promise(resolve => setTimeout(resolve, 1500));
      const response = await getUserProfile(userId);
      if (response.success && response.data) {
        const userData = {
          id: response.data.id,
          name: response.data.name,
          profileImage: response.data.profileImage,
        };
        setChatUser(userData);
        
        // Adicionar à lista de conversas se não existir
        setConversations(prev => {
          const exists = prev.some(c => c.otherUser.id === userId);
          if (!exists) {
            return [{
              otherUser: {
                id: userData.id,
                name: userData.name,
                email: '',
                profileImage: userData.profileImage,
              },
              unreadCount: 0,
              isFromMe: false,
            }, ...prev];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('[CommunitiesPage] Erro ao carregar usuário do chat:', error);
    } finally {
      setIsLoadingChatUser(false);
    }
  }, []);

  // Load communities - apenas uma vez
  useEffect(() => {
    if (!hasLoadedCommunities.current) {
      hasLoadedCommunities.current = true;
      loadCommunities();
    }
  }, []);

  // Este useEffect foi removido - a restauração agora é feita no useEffect abaixo (linha 709)
  // que verifica searchParams diretamente, evitando conflitos

  // Resetar flag quando não há parâmetros na URL e comunidades foram carregadas
  // Isso permite restaurar a última conversa toda vez que entrar em /communities sem parâmetros
  useEffect(() => {
    const chatParam = searchParams.get('chat');
    const communityParam = searchParams.get('community');
    
    // Se não há parâmetros na URL e comunidades já foram carregadas, resetar flag
    // Isso permite restaurar quando entrar na página sem parâmetros
    if (!chatParam && !communityParam && !isLoadingCommunities && communities.length > 0) {
      // Só resetar se ainda não foi restaurado nesta verificação
      // Isso evita loops infinitos
      if (hasRestoredLastConversation.current) {
        // Se já foi restaurado mas não há parâmetros, significa que o usuário voltou à página
        // Resetar para permitir restaurar novamente
        hasRestoredLastConversation.current = false;
      }
    }
  }, [searchParams, isLoadingCommunities, communities]);

  // Carregar conversas
  useEffect(() => {
    loadConversations();
  }, []);

  // Sincronizar communityId com URL
  // IMPORTANTE: Não interferir se houver um chat na URL
  useEffect(() => {
    const chatParam = searchParams.get('chat');
    const communityParam = searchParams.get('community');
    
    // Só sincronizar communityId se não houver chat na URL
    if (!chatParam) {
      if (communityParam && communityParam !== selectedCommunityId) {
        setSelectedCommunityId(communityParam);
      } else if (!communityParam && selectedCommunityId) {
        // Se não há param na URL mas há estado, manter estado (pode ser seleção inicial)
        // Não limpar aqui para evitar loops
      }
    }
  }, [searchParams, selectedCommunityId]);

  // Salvar última conversa quando há parâmetros na URL (chat ou community)
  // Isso garante que ao sair e voltar, o estado seja restaurado
  useEffect(() => {
    const chatParam = searchParams.get('chat');
    const communityParam = searchParams.get('community');
    
    // Salvar automaticamente quando há parâmetros na URL
    if (chatParam) {
      saveLastConversation('chat', chatParam);
      console.log('[CommunitiesPage] 💾 Chat salvo automaticamente:', chatParam);
    } else if (communityParam) {
      saveLastConversation('community', communityParam);
      console.log('[CommunitiesPage] 💾 Comunidade salva automaticamente:', communityParam);
    }
  }, [searchParams]);

  // Atualizar chatUserId quando mudar na URL e restaurar última conversa se necessário
  useEffect(() => {
    const chatParam = searchParams.get('chat');
    const communityParam = searchParams.get('community');
    
    // Se não há parâmetros na URL e ainda não restauramos, restaurar última conversa
    // Priorizar chats sobre comunidades se ambos estiverem salvos
    if (!chatParam && !communityParam && !hasRestoredLastConversation.current && !isLoadingCommunities) {
      const lastConversation = loadLastConversation();
      if (lastConversation) {
        console.log('[CommunitiesPage] 🔄 Restaurando última conversa ao entrar na página:', lastConversation);
        hasRestoredLastConversation.current = true;
        
        // Priorizar chats - se for chat, restaurar imediatamente
        if (lastConversation.type === 'chat') {
          // Para chats, podemos restaurar mesmo sem conversations carregado
          // loadChatUser será chamado automaticamente quando a URL for atualizada
          setSelectedChatUserId(lastConversation.id);
          const params = new URLSearchParams();
          params.set('chat', lastConversation.id);
          router.push(`/communities?${params.toString()}`);
          return;
        } else if (lastConversation.type === 'community') {
          // Para comunidades, precisamos que communities esteja carregado
          if (communities.length > 0) {
            const community = communities.find(c => c.id === lastConversation.id);
            if (community && (community.isMember || community.isOwner)) {
              setSelectedCommunityId(lastConversation.id);
              const params = new URLSearchParams();
              params.set('community', lastConversation.id);
              router.push(`/communities?${params.toString()}`);
              return;
            }
          }
        }
      }
    }
    
    // Processar parâmetros da URL
    if (chatParam) {
      setSelectedChatUserId(chatParam);
      loadChatUser(chatParam);
      // Marcar como restaurado quando há parâmetros na URL
      hasRestoredLastConversation.current = true;
    } else if (communityParam) {
      // Marcar como restaurado quando há parâmetros na URL
      hasRestoredLastConversation.current = true;
    } else if (!chatParam && !communityParam) {
      // Só limpar se não houver parâmetros
      setSelectedChatUserId(null);
      setChatUser(null);
    }
  }, [searchParams, isLoadingCommunities, communities, router, loadChatUser]);

  // Carregar conversa quando chatUserId mudar
  useEffect(() => {
    if (selectedChatUserId) {
      setIsLoadingConversation(true);
      // Mock delay para visualizar skeletons (2 segundos)
      setTimeout(() => {
      loadConversation(selectedChatUserId);
      }, 2000);
    } else {
      setIsLoadingConversation(false);
    }
  }, [selectedChatUserId, loadConversation]);

  // Detectar quando as mensagens foram carregadas
  useEffect(() => {
    if (selectedChatUserId && directMessages.length > 0) {
      // Pequeno delay para garantir que tudo foi renderizado
      const timer = setTimeout(() => {
        setIsLoadingConversation(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedChatUserId, directMessages.length]);

  const loadConversations = async () => {
    try {
      const response = await getConversations();
      console.log('[CommunitiesPage] Conversas recebidas da API:', response);
      if (response.success) {
        setConversations(response.data.conversations || []);
      } else {
        console.warn('[CommunitiesPage] ⚠️ Resposta não foi bem-sucedida:', response);
        setConversations([]);
      }
    } catch (error) {
      console.error('[CommunitiesPage] Erro ao carregar conversas:', error);
      setConversations([]);
    }
  };

  // Load messages when community is selected
  useEffect(() => {
    if (selectedCommunityId) {
      setIsLoadingCommunityMessages(true);
      setIsLoadingCommunityPinnedMessages(true);
      // Mock delay para visualizar skeletons (2 segundos)
      const loadTimer = setTimeout(() => {
        loadCommunityMessages(50, 0);
        loadCommunityPinnedMessages();
      }, 2000);
      return () => clearTimeout(loadTimer);
    } else {
      setIsLoadingCommunityMessages(false);
      setIsLoadingCommunityPinnedMessages(false);
    }
  }, [selectedCommunityId, loadCommunityMessages, loadCommunityPinnedMessages]);

  // Detectar quando as mensagens da comunidade foram carregadas
  useEffect(() => {
    if (selectedCommunityId && communityMessages.length >= 0 && isLoadingCommunityMessages) {
      // Aguardar um pouco após as mensagens serem carregadas para garantir que tudo foi renderizado
      const timer = setTimeout(() => {
        setIsLoadingCommunityMessages(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedCommunityId, communityMessages.length, isLoadingCommunityMessages]);

  // Detectar quando as mensagens fixadas da comunidade foram carregadas
  useEffect(() => {
    if (selectedCommunityId && isLoadingCommunityPinnedMessages) {
      // Aguardar um pouco após as mensagens fixadas serem carregadas
      const timer = setTimeout(() => {
        setIsLoadingCommunityPinnedMessages(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedCommunityId, communityPinnedMessages.length, isLoadingCommunityPinnedMessages]);

  const loadCommunities = async () => {
    try {
      setIsLoadingCommunities(true);
      
      // Verificar token antes de fazer a requisição
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      // Decodificar o token JWT para verificar o userId
      let userIdFromToken: string | null = null;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userIdFromToken = payload.sub || payload.userId || payload.id || null;
          console.log('[loadCommunities] Token decodificado:', {
            payload,
            userIdFromToken,
            exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'não encontrado',
            isExpired: payload.exp ? Date.now() > payload.exp * 1000 : 'desconhecido'
          });
        } catch (e) {
          console.error('[loadCommunities] Erro ao decodificar token:', e);
        }
      }
      
      console.log('[loadCommunities] Token no localStorage:', {
        tokenExists: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? `${token.substring(0, 30)}...` : 'null',
        userIdFromToken
      });
      
      const response = await getCommunities();
      
      console.log('[loadCommunities] Resposta recebida:', response);
      
      // Verificar diferentes formatos de resposta
      let communitiesData: any[] = [];
      
      if (response.success) {
        if (Array.isArray(response.data)) {
          // Se data é um array direto
          communitiesData = response.data;
        } else if (response.data && Array.isArray(response.data.communities)) {
          // Se data tem uma propriedade communities
          communitiesData = response.data.communities;
        } else if (response.data && typeof response.data === 'object') {
          // Se data é um objeto, tentar extrair comunidades
          communitiesData = [];
        }
      } else if (Array.isArray(response)) {
        // Se a resposta é um array direto
        communitiesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        // Se data é um array
        communitiesData = response.data;
      }
      
      // Mapear dados da API para o formato esperado
      // IMPORTANTE: isOwner e isMember já vêm corretos da API quando o token JWT é enviado
      // O token é enviado automaticamente pelo httpClient se estiver em localStorage.getItem('auth_token')
      console.log('[loadCommunities] Dados extraídos antes do mapeamento:', communitiesData);
      
      const mappedCommunities: Community[] = communitiesData.map((community: any) => {
        return {
          id: community.id,
          name: community.name,
          description: community.description || '',
          avatarUrl: community.image || community.avatarUrl,
          memberCount: community.memberCount || 0,
          isOwner: community.isOwner ?? false, // Usar o valor da API diretamente
          isMember: community.isMember ?? false, // Usar o valor da API diretamente
          lastMessage: undefined,
          createdAt: community.createdAt,
          focus: community.focus,
          visibility: community.visibility,
          ownerId: community.ownerId,
        };
      });
      
      console.log('[loadCommunities] Comunidades mapeadas:', mappedCommunities);
      
      // Filtrar comunidades privadas que o usuário não pertence
      const filteredCommunities = mappedCommunities.filter((community) => {
        // Se for pública, sempre mostrar
        if (community.visibility === 'PUBLIC') {
          return true;
        }
        // Se for privada, só mostrar se for membro ou dono
        if (community.visibility === 'PRIVATE') {
          return community.isMember || community.isOwner;
        }
        // Se não tiver visibility definida, mostrar apenas se for membro ou dono (comportamento padrão seguro)
        return community.isMember || community.isOwner;
      });
      
      setCommunities(filteredCommunities);
      
      // Selecionar primeira comunidade que o usuário é membro ou dono
       // Só se não houver communityId na URL e não houver última conversa salva
       const currentCommunityIdFromUrl = searchParams.get('community');
       const currentChatUserIdFromUrl = searchParams.get('chat');
       
       // Só selecionar automaticamente se não houver parâmetros na URL
       if (!selectedCommunityId && !currentCommunityIdFromUrl && !currentChatUserIdFromUrl) {
         // Verificar se há última conversa salva
         const lastConversation = loadLastConversation();
         
         if (lastConversation) {
           // Se há uma última conversa salva, não selecionar comunidade automaticamente
           // A restauração será feita pelo useEffect que monitora searchParams
           if (lastConversation.type === 'chat') {
             // Se é um chat, não selecionar comunidade - o chat será restaurado pelo useEffect
             return;
           } else if (lastConversation.type === 'community') {
             const lastCommunity = filteredCommunities.find(c => c.id === lastConversation.id);
             if (lastCommunity && (lastCommunity.isMember || lastCommunity.isOwner)) {
               setSelectedCommunityId(lastCommunity.id);
               const params = new URLSearchParams();
               params.set('community', lastCommunity.id);
               router.push(`/communities?${params.toString()}`);
               return; // Não continuar para seleção automática
             }
           }
           // Se a última conversa não existe mais ou não é válida, continuar para seleção automática
         }
         
         // Se não há última conversa válida, selecionar primeira comunidade
         const userCommunity = filteredCommunities.find(
          (c) => c.isMember || c.isOwner
        );
        
        if (userCommunity) {
          // Se encontrou uma comunidade que o usuário faz parte, abrir ela
          setSelectedCommunityId(userCommunity.id);
           // Salvar como última conversa
           saveLastConversation('community', userCommunity.id);
           // Atualizar URL
           const params = new URLSearchParams();
           params.set('community', userCommunity.id);
           router.push(`/communities?${params.toString()}`);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar comunidades:', error);
      toast.error("Erro ao carregar comunidades");
      // Em caso de erro, usar mocks como fallback
      setCommunities(MOCK_COMMUNITIES);
       const currentCommunityIdFromUrl = searchParams.get('community');
       const currentChatUserIdFromUrl = searchParams.get('chat');
       // Só selecionar comunidade automaticamente se não houver chat na URL e não houver última conversa salva
       if (MOCK_COMMUNITIES.length > 0 && !selectedCommunityId && !currentCommunityIdFromUrl && !currentChatUserIdFromUrl) {
         // Verificar se há uma última conversa salva antes de selecionar automaticamente
         const lastConversation = loadLastConversation();
         if (!lastConversation || lastConversation.type !== 'chat') {
           // Só selecionar comunidade se não houver chat salvo
        setSelectedCommunityId(MOCK_COMMUNITIES[0].id);
           // Atualizar URL
           const params = new URLSearchParams();
           params.set('community', MOCK_COMMUNITIES[0].id);
           router.push(`/communities?${params.toString()}`);
         }
      }
    } finally {
      setIsLoadingCommunities(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedCommunityId) return;

    try {
      const result = await sendCommunityMessage(content);
      if (!result.success) {
        toast.error(result.message || "Erro ao enviar mensagem");
      }
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
    }
  };

  // Função para recarregar comunidades da API
  const refreshCommunities = async () => {
    await loadCommunities();
    toast.success("Comunidade criada com sucesso!");
  };

  // Handler para clique em comunidade
  const handleCommunityClick = (community: Community, event: React.MouseEvent) => {
    // Se for membro ou dono, abrir normalmente
    if (community.isMember || community.isOwner) {
      setSelectedCommunityId(community.id);
      // Salvar como última conversa
      saveLastConversation('community', community.id);
      // Atualizar URL
      const params = new URLSearchParams(searchParams.toString());
      params.set('community', community.id);
      params.delete('chat');
      router.push(`/communities?${params.toString()}`);
      return;
    }

    // Se não for membro, verificar se é pública
    // Se for pública, mostrar tooltip para entrar
    if (community.visibility === 'PUBLIC') {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const tooltipWidth = 320;
    setTooltipPosition({
      x: rect.left + rect.width / 2 - tooltipWidth / 2, // Centralizar tooltip em relação ao item
      y: rect.bottom + 10, // Abaixo do item com espaçamento
    });
    setTooltipCommunity(community);
      return;
    }

    // Se for privada e não for membro, não fazer nada (não deveria aparecer na lista)
    // Mas por segurança, apenas não fazer nada
  };

  // Handler para sucesso ao entrar na comunidade
  const handleJoinSuccess = async () => {
    // Recarregar comunidades para atualizar isMember
    await loadCommunities();
    // Se havia uma comunidade selecionada no tooltip, abrir ela
    if (tooltipCommunity) {
      setSelectedCommunityId(tooltipCommunity.id);
      // Salvar como última conversa
      saveLastConversation('community', tooltipCommunity.id);
      // Atualizar URL
      const params = new URLSearchParams(searchParams.toString());
      params.set('community', tooltipCommunity.id);
      params.delete('chat');
      router.push(`/communities?${params.toString()}`);
    }
  };

  // Buscar comunidade selecionada nas comunidades da API
  const selectedCommunity = communities.find(
    (c) => c.id === selectedCommunityId
  );

  // Call handlers
  const handleStartVideoCall = () => {
    setIsInVideoCall(true);
  };

  const handleStartVoiceCall = () => {
    setIsInVoiceCall(true);
  };

  const handleEndCall = () => {
    setIsInVideoCall(false);
    setIsInVoiceCall(false);
  };

  if (isLoadingCommunities) {
    return (
      <div 
        className="flex items-center justify-center h-screen w-screen"
        style={{
          background: '#040404',
        }}
      >
        <LoadingGrid size="60" color="#C9FE02" />
      </div>
    );
  }

  // Show call screens
  if (isInVideoCall && selectedCommunity) {
    return (
      <VideoCallScreen
        communityName={selectedCommunity.name}
        participants={MOCK_CALL_PARTICIPANTS}
        onEndCall={handleEndCall}
      />
    );
  }

  if (isInVoiceCall && selectedCommunity) {
    return (
      <VoiceCallScreen
        communityName={selectedCommunity.name}
        participants={MOCK_CALL_PARTICIPANTS}
        onEndCall={handleEndCall}
      />
    );
  }

  return (
    <div className="min-h-screen  text-white relative">
      {/* DotGrid Background */}
      <div className="fixed inset-0 z-0">
        <DotGrid
          dotSize={1}
          gap={24}
          baseColor="rgba(255,255,255,0.25)"
          activeColor="#B3E240"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      <div className="relative z-10 flex h-screen w-screen overflow-hidden p-4 pt-6 gap-3">
      {/* Communities List - Ilha Esquerda */}
        <CommunityList
          communities={communities}
          selectedCommunityId={selectedCommunityId}
          onSelectCommunity={(id) => {
            // Buscar a comunidade na lista
            const community = communities.find(c => c.id === id);
            if (!community) return;
            
            // Se for membro ou dono, abrir normalmente
            if (community.isMember || community.isOwner) {
            setSelectedCommunityId(id);
            setSelectedChatUserId(null);
              // Salvar como última conversa
              saveLastConversation('community', id);
              // Atualizar URL com community param
              const params = new URLSearchParams(searchParams.toString());
              params.set('community', id);
              params.delete('chat'); // Remover chat param se existir
              router.push(`/communities?${params.toString()}`);
            } else if (community.visibility === 'PUBLIC') {
              // Se for pública e não for membro, mostrar tooltip centralizado
              setTooltipPosition({
                x: window.innerWidth / 2 - 160,
                y: window.innerHeight / 2 - 200,
              });
              setTooltipCommunity(community);
            }
            // Se for privada e não for membro, não fazer nada (não deveria aparecer na lista)
          }}
          onCreateCommunity={() => setIsCreateModalOpen(true)}
          onCommunityClick={handleCommunityClick}
          conversations={conversations}
          selectedChatUserId={selectedChatUserId}
          onSelectConversation={(userId) => {
            setSelectedChatUserId(userId);
            setSelectedCommunityId(undefined);
            // Salvar como última conversa
            saveLastConversation('chat', userId);
            // Atualizar URL com chat param
            const params = new URLSearchParams(searchParams.toString());
            params.set('chat', userId);
            params.delete('community'); // Remover community param se existir
            router.push(`/communities?${params.toString()}`);
            loadChatUser(userId);
          }}
        />

      {/* Chat Area - Coluna Central + Direita */}
      {selectedChatUserId && userProfile ? (
        <div className="flex-1 flex flex-col gap-3">
          {/* Header Global - Fora da Ilha */}
          {isLoadingChatUser || !chatUser || isLoadingConversation ? (
            <ChatHeaderSkeleton />
          ) : (
          <div className="flex items-center justify-between gap-4">
            {/* Nome do Usuário */}
              <h1 className="text-white font-semibold text-2xl">
                {chatUser.name}
              </h1>
            
            {/* Search Bar + Actions */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative" style={{ width: '280px' }}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full h-12 pl-12 pr-4 rounded-full text-white placeholder:text-gray-500 focus:outline-none transition-colors"
                  style={{
                    background: 'rgb(30, 30, 30)',
                  }}
                />
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-3">
                <button className="w-12 h-12 rounded-full flex items-center justify-center transition-colors hover:bg-[#3a3a3a] cursor-pointer" style={{ background: 'rgb(30, 30, 30)' }}>
                  <Settings className="w-5 h-5 text-gray-400" />
                </button>
                <NotificationsDropdown />
                <div className="w-12 h-12 rounded-full relative">
                  <img 
                    src="https://i.pravatar.cc/150?img=68" 
                    alt="User Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#C9FE02] rounded-full border-2 border-[#040404]" />
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Conteúdo Principal - Chat + Sidebar */}
          <div className="flex-1 flex gap-3 overflow-hidden pt-2">
            {/* Área do Chat Direto - Ilha */}
            <div className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
              {isLoadingChatUser || !chatUser || isLoadingConversation ? (
                <ChatSkeleton />
              ) : (
                <DirectChatView
                  friendId={chatUser.id}
                  friendName={chatUser.name}
                  friendAvatar={chatUser.profileImage}
                  currentUserId={userProfile.id}
                  currentUserName={userProfile.name}
                  currentUserAvatar={userProfile.profileImage}
                  messages={directMessages}
                  isConnected={isConnected}
                  isTyping={isTyping && typingUserId === chatUser.id}
                  onSend={sendMessage}
                  onTyping={sendTypingIndicator}
                  onPinMessage={pinMessage}
                  onUnpinMessage={unpinMessage}
                  pinnedMessages={pinnedMessages}
                  onEditMessage={editMessage}
                  onDeleteMessage={deleteMessage}
                />
              )}
            </div>
            
            {/* Community Info Sidebar - Ilhas Direita */}
            {isLoadingChatUser || !chatUser || isLoadingConversation ? (
              <ChatSidebarSkeleton />
            ) : (
              chatUser && (
            <CommunityInfo 
              community={{
                id: `chat-${chatUser.id}`,
                name: chatUser.name,
                description: '',
                avatarUrl: chatUser.profileImage || undefined,
                memberCount: 2,
                isOwner: false,
                isMember: true,
              }}
              onStartVideoCall={() => {}}
              onStartVoiceCall={() => {}}
              isFromSidebar={false}
                  pinnedMessages={pinnedMessages}
                  currentUserId={userProfile.id}
                  friendName={chatUser.name}
                  friendAvatar={chatUser.profileImage}
                  onUnpinMessage={unpinMessage}
            />
              )
            )}
          </div>
        </div>
      ) : selectedCommunity ? (
        <div className="flex-1 flex flex-col gap-3">
          {/* Header Global - Fora da Ilha */}
          <div className="flex items-center justify-between gap-4">
            {/* Nome da Comunidade */}
            <h1 className="text-white font-semibold text-2xl">{selectedCommunity.name}</h1>
            
            {/* Search Bar + Actions */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative" style={{ width: '280px' }}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full h-12 pl-12 pr-4 rounded-full text-white placeholder:text-gray-500 focus:outline-none transition-colors"
                  style={{
                    background: 'rgb(30, 30, 30)',
                  }}
                />
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-3">
                <button className="w-12 h-12 rounded-full flex items-center justify-center transition-colors hover:bg-[#3a3a3a] cursor-pointer" style={{ background: 'rgb(30, 30, 30)' }}>
                  <Settings className="w-5 h-5 text-gray-400" />
                </button>
                <NotificationsDropdown />
                <div className="w-12 h-12 rounded-full relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage 
                      src={userProfile?.profileImage || undefined} 
                      alt={userProfile?.name || 'User'} 
                    />
                    <AvatarFallback 
                      className="bg-[#C9FE02] text-black text-sm font-semibold"
                    >
                      {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Indicador de status online */}
                  <div 
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#040404] transition-colors"
                    style={{ 
                      background: userProfile?.id && statusMap.get(userProfile.id) === 'online' ? '#C9FE02' : '#666'
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo Principal - Chat + Sidebar */}
          <div className="flex-1 flex gap-3 overflow-hidden pt-2">
            {/* Área do Chat - Ilha */}
            {isLoadingCommunityMessages ? (
              <div className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
                <ChatSkeleton />
              </div>
            ) : (
              <CommunityChat
                community={selectedCommunity}
                messages={communityMessages}
                pinnedMessages={communityPinnedMessages}
                currentUserId={userProfile?.id}
                currentUserName={userProfile?.name}
                currentUserAvatar={userProfile?.profileImage}
                onSendMessage={handleSendMessage}
                onEditMessage={editCommunityMessage}
                onDeleteMessage={deleteCommunityMessage}
                onPinMessage={pinCommunityMessage}
                onUnpinMessage={unpinCommunityMessage}
                onStartVideoCall={handleStartVideoCall}
                onStartVoiceCall={handleStartVoiceCall}
                isConnected={isCommunityConnected}
              />
            )}
            
            {/* Community Info Sidebar - Ilhas Direita */}
            {isLoadingCommunityMessages || isLoadingCommunityPinnedMessages ? (
              <ChatSidebarSkeleton />
            ) : (
              <CommunityInfo 
                community={selectedCommunity}
                onStartVideoCall={handleStartVideoCall}
                onStartVoiceCall={handleStartVoiceCall}
                isFromSidebar={communities.some(c => c.id === selectedCommunityId)}
                pinnedMessages={communityPinnedMessages}
                currentUserId={userProfile?.id}
                onUnpinMessage={unpinCommunityMessage}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center rounded-2xl" style={{ background: '#303030' }}>
          <p className="text-gray-500">Select a community to start chatting</p>
        </div>
      )}

      {/* Community Join Tooltip */}
      {tooltipCommunity && (
        <CommunityJoinTooltip
          community={tooltipCommunity}
          isOpen={!!tooltipCommunity}
          onClose={() => setTooltipCommunity(null)}
          onJoinSuccess={handleJoinSuccess}
          position={tooltipPosition}
        />
      )}

      {/* Create Community Modal */}
      <CreateCommunityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refreshCommunities();
        }}
      />
      </div>
    </div>
  );
}