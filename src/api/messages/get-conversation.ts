import { httpClient } from '../http/client';
import { ApiError } from '../http/client';
import { Message } from './send-message';

export interface GetConversationResponse {
  success: boolean;
  data: {
    messages: Message[];
    total: number;
    hasMore: boolean;
  };
}

export async function getConversation(
  friendId: string,
  limit: number = 50,
  offset: number = 0
): Promise<GetConversationResponse> {
  try {
    const response = await httpClient.get<GetConversationResponse>(
      `/messages/conversation/${friendId}?limit=${limit}&offset=${offset}`
    );
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}

