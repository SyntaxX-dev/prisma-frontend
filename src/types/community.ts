export interface Community {
  id: string;
  name: string;
  description: string;
  avatarUrl?: string;
  memberCount: number;
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
  };
  isOwner: boolean;
  isMember: boolean;
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
  description: string;
  avatarUrl?: string;
}

