import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface ConversationMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}

export interface Conversation {
  otherUser: {
    id: string;
    name: string;
    email: string;
    profileImage?: string | null;
  };
  lastMessage?: ConversationMessage;
  unreadCount: number;
  isFromMe: boolean;
}

export interface GetConversationsResponse {
  success: boolean;
  data: {
    conversations: Conversation[];
    total: number;
  };
}

export async function getConversations(): Promise<GetConversationsResponse> {
  try {
    const response = await httpClient.get<GetConversationsResponse>(
      '/messages/conversations'
    );
    return response;
  } catch (error: any) {
    // Se for erro 400, retornar array vazio para não quebrar a UI
    if (error.status === 400) {
      return {
        success: false,
        data: {
          conversations: [],
          total: 0
        }
      };
    }
    
    throw error as ApiError;
  }
}
