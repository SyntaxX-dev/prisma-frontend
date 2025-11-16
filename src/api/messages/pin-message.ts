import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface PinMessageRequest {
  friendId: string;
}

export interface PinMessageResponse {
  success: true;
  data: {
    id: string;
    messageId: string;
    pinnedBy: string;
    pinnedAt: string;
    message: {
      id: string;
      content: string;
      senderId: string;
      receiverId: string;
      createdAt: string;
    };
  };
}

export interface PinMessageError {
  success: false;
  message: string;
}

export async function pinMessage(
  messageId: string,
  friendId: string
): Promise<PinMessageResponse | PinMessageError> {
  try {
    console.log('[pinMessage] Fixando mensagem:', { messageId, friendId });
    const response = await httpClient.post<PinMessageResponse>(
      `/messages/${messageId}/pin`,
      {
        friendId,
      }
    );
    console.log('[pinMessage] ✅ Mensagem fixada com sucesso:', response);
    return response;
  } catch (error) {
    console.error('[pinMessage] ❌ Erro ao fixar mensagem:', error);
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao fixar mensagem',
    };
  }
}

