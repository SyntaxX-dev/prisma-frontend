import { httpClient } from '../http/client';
import { ApiError } from '../http/client';
import type { PinnedCommunityMessage } from '@/types/community-chat';

export interface PinCommunityMessageResponse {
  success: true;
  data: {
    id: string;
    messageId: string;
    communityId: string;
    pinnedBy: string;
    pinnedAt: string;
    message: {
      id: string;
      content: string;
      senderId: string;
      createdAt: string;
    };
  };
}

export interface PinCommunityMessageError {
  success: false;
  message: string;
}

export async function pinCommunityMessage(
  communityId: string,
  messageId: string
): Promise<PinCommunityMessageResponse | PinCommunityMessageError> {
  try {
    console.log('[pinCommunityMessage] Fixando mensagem:', { communityId, messageId });
    const response = await httpClient.post<PinCommunityMessageResponse>(
      `/communities/${communityId}/messages/${messageId}/pin`
    );
    console.log('[pinCommunityMessage] ✅ Mensagem fixada com sucesso:', response);
    return response;
  } catch (error) {
    console.error('[pinCommunityMessage] ❌ Erro ao fixar mensagem:', error);
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao fixar mensagem',
    };
  }
}

