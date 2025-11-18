import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface PinnedMessage {
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
    receiverId: string;
    createdAt: string;
  };
}

export interface GetPinnedMessagesResponse {
  success: true;
  data: PinnedMessage[];
}

export interface GetPinnedMessagesError {
  success: false;
  message: string;
}

export async function getPinnedMessages(
  friendId: string
): Promise<GetPinnedMessagesResponse | GetPinnedMessagesError> {
  try {
    const response = await httpClient.get<GetPinnedMessagesResponse>(
      `/messages/conversation/${friendId}/pinned`
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao buscar mensagens fixadas',
    };
  }
}

