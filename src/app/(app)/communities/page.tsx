"use client";

import { useState, useEffect } from "react";
import { Search, Settings, Bell } from "lucide-react";
import { CommunityList } from "@/components/features/communities/CommunityList";
import { CommunityChat } from "@/components/features/communities/CommunityChat";
import { CommunityInfo } from "@/components/features/communities/CommunityInfo";
import { CreateCommunityModal } from "@/components/features/communities/CreateCommunityModal";
import { VoiceCallScreen } from "@/components/features/communities/VoiceCallScreen";
import type { Community, CommunityMessage } from "@/types/community";
import { LoadingGrid } from "@/components/ui/loading-grid";
import { useNotifications } from "@/hooks/shared/useNotifications";
import { VideoCallScreen } from "@/components/features/communities/VideoCallScreens";
import DotGrid from "@/components/shared/DotGrid";
import { getCommunities } from "@/api/communities/get-communities";

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

export default function CommunitiesPage() {
  const { showSuccess, showError } = useNotifications();
  
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Combinar comunidades da API com mocks para busca
  const allCommunities = [...communities, ...MOCK_COMMUNITIES];
  
  // Call states
  const [isInVideoCall, setIsInVideoCall] = useState(false);
  const [isInVoiceCall, setIsInVoiceCall] = useState(false);

  // Load communities
  useEffect(() => {
    loadCommunities();
  }, []);

  // Load messages when community is selected
  useEffect(() => {
    if (selectedCommunityId) {
      loadMessages(selectedCommunityId);
    } else {
      setMessages([]);
    }
  }, [selectedCommunityId]);

  const loadCommunities = async () => {
    try {
      setIsLoadingCommunities(true);
      const response = await getCommunities();
      
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
      const mappedCommunities: Community[] = communitiesData.map((community: any) => ({
        id: community.id,
        name: community.name,
        description: community.description || '',
        avatarUrl: community.image || community.avatarUrl,
        memberCount: community.memberCount || 0,
        isOwner: community.ownerId ? true : false,
        isMember: community.isMember ?? true,
        lastMessage: undefined,
        createdAt: community.createdAt,
      }));
      
      setCommunities(mappedCommunities);
      
      if (mappedCommunities.length > 0 && !selectedCommunityId) {
        setSelectedCommunityId(mappedCommunities[0].id);
      }
    } catch (error: any) {
      console.error('Erro ao carregar comunidades:', error);
      showError("Erro ao carregar comunidades");
      // Em caso de erro, usar mocks como fallback
      setCommunities(MOCK_COMMUNITIES);
      if (MOCK_COMMUNITIES.length > 0 && !selectedCommunityId) {
        setSelectedCommunityId(MOCK_COMMUNITIES[0].id);
      }
    } finally {
      setIsLoadingCommunities(false);
    }
  };

  const loadMessages = async (communityId: string) => {
    try {
      setIsLoadingMessages(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Usar mocks das conversas - se não houver mock específico, usar o mock padrão
      let communityMessages = MOCK_MESSAGES[communityId];
      
      // Se não houver mensagens mockadas para esta comunidade, usar as mensagens padrão
      if (!communityMessages || communityMessages.length === 0) {
        communityMessages = MOCK_MESSAGES["1"] || [];
        // Atualizar o communityId das mensagens para corresponder à comunidade selecionada
        communityMessages = communityMessages.map(msg => ({
          ...msg,
          communityId: communityId,
        }));
      }
      
      setMessages(communityMessages);
    } catch (error) {
      showError("Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedCommunityId) return;

    try {
      setIsSendingMessage(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newMessage: CommunityMessage = {
        id: `msg-${Date.now()}`,
        communityId: selectedCommunityId,
        senderId: "current",
        senderName: "You",
        senderAvatar: "https://i.pravatar.cc/150?img=68",
        content,
        timestamp: new Date().toISOString(),
        isOwn: true,
      };
      
      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      showError("Failed to send message");
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Função para recarregar comunidades da API
  const refreshCommunities = async () => {
    await loadCommunities();
    showSuccess("Comunidade criada com sucesso!");
  };

  // Buscar comunidade selecionada tanto nas comunidades da API quanto nos mocks
  const selectedCommunity = allCommunities.find(
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
    <div className="min-h-screen bg-[#09090A] text-white relative">
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
          mockCommunities={MOCK_COMMUNITIES}
          selectedCommunityId={selectedCommunityId}
          onSelectCommunity={setSelectedCommunityId}
          onCreateCommunity={() => setIsCreateModalOpen(true)}
        />

      {/* Chat Area - Coluna Central + Direita */}
      {selectedCommunity ? (
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
                <button className="w-12 h-12 rounded-full flex items-center justify-center transition-colors hover:bg-[#3a3a3a] cursor-pointer" style={{ background: 'rgb(30, 30, 30)' }}>
                  <Bell className="w-5 h-5 text-gray-400" />
                </button>
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

          {/* Conteúdo Principal - Chat + Sidebar */}
          <div className="flex-1 flex gap-3 overflow-hidden pt-2">
            {/* Área do Chat - Ilha */}
            <CommunityChat
              community={selectedCommunity}
              messages={messages}
              onSendMessage={handleSendMessage}
              onStartVideoCall={handleStartVideoCall}
              onStartVoiceCall={handleStartVoiceCall}
              isLoading={isSendingMessage}
              isLoadingMessages={isLoadingMessages}
            />
            
            {/* Community Info Sidebar - Ilhas Direita */}
            <CommunityInfo 
              community={selectedCommunity}
              onStartVideoCall={handleStartVideoCall}
              onStartVoiceCall={handleStartVoiceCall}
              isFromSidebar={communities.some(c => c.id === selectedCommunityId)}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center rounded-2xl" style={{ background: '#303030' }}>
          <p className="text-gray-500">Select a community to start chatting</p>
        </div>
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