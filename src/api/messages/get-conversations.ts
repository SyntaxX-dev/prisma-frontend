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
    console.log('[getConversations] Buscando lista de conversas...');
    const response = await httpClient.get<GetConversationsResponse>(
      '/messages/conversations'
    );
    console.log('[getConversations] ✅ Conversas carregadas:', response);
    return response;
  } catch (error: any) {
    console.error('[getConversations] ❌ Erro ao buscar conversas:', error);
    console.error('[getConversations] Detalhes do erro:', {
      message: error.message,
      status: error.status,
      details: error.details,
      response: error.response
    });
    
    // Se for erro 400, retornar array vazio para não quebrar a UI
    if (error.status === 400) {
      console.warn('[getConversations] ⚠️ Erro 400 do backend - retornando array vazio');
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
