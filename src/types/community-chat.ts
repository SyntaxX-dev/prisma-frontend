// Tipos para Chat de Comunidades

export interface CommunityMessage {
  id: string;
  communityId: string;
  senderId: string;
  content: string;
  createdAt: string;
  edited: boolean;
  updatedAt?: string | null;
}

export interface PinnedCommunityMessage {
  id: string;
  messageId: string;
  pinnedBy: string;
  pinnedByUserName: string;
  pinnedAt: string;
  timeSincePinned: string;
  message: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  };
}

export interface NewCommunityMessageEvent {
  id: string;
  communityId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface CommunityMessageDeletedEvent {
  messageId: string;
  communityId: string;
  message: {
    id: string;
    content: string;
    communityId: string;
    senderId: string;
    createdAt: string;
  };
}

export interface CommunityMessageEditedEvent {
  id: string;
  communityId: string;
  senderId: string;
  content: string;
  updatedAt: string | null;
}

export interface SendCommunityMessageRequest {
  content: string;
}

export interface EditCommunityMessageRequest {
  content: string;
}

export interface GetCommunityMessagesResponse {
  success: boolean;
  data: CommunityMessage[];
  total: number;
  hasMore: boolean;
}

export interface GetPinnedMessagesResponse {
  success: boolean;
  data: PinnedCommunityMessage[];
}

