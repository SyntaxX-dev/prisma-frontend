export interface Community {
  id: string;
  name: string;
  focus?: string;
  description: string | null;
  image?: string | null;
  avatarUrl?: string; // Para compatibilidade com código existente
  visibility?: 'PUBLIC' | 'PRIVATE';
  ownerId?: string;
  memberCount: number;
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
  };
  isOwner: boolean;
  isMember?: boolean;
  createdAt: string;
}

export interface CommunityMessage {
  id: string;
  communityId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export interface CreateCommunityRequest {
  name: string;
  focus: string;
  description?: string;
  image?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
}

