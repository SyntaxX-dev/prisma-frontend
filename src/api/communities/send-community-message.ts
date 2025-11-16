import { httpClient } from '../http/client';
import { ApiError } from '../http/client';
import type { CommunityMessage, SendCommunityMessageRequest } from '@/types/community-chat';

export interface SendCommunityMessageResponse {
  success: true;
  data: CommunityMessage;
}

export interface SendCommunityMessageError {
  success: false;
  message: string;
}

export async function sendCommunityMessage(
  communityId: string,
  content: string
): Promise<SendCommunityMessageResponse | SendCommunityMessageError> {
  try {
    console.log('[sendCommunityMessage] Enviando mensagem:', { communityId, content });
    const response = await httpClient.post<SendCommunityMessageResponse>(
      `/communities/${communityId}/messages`,
      { content }
    );
    console.log('[sendCommunityMessage] ✅ Mensagem enviada com sucesso:', response);
    return response;
  } catch (error) {
    console.error('[sendCommunityMessage] ❌ Erro ao enviar mensagem:', error);
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao enviar mensagem',
    };
  }
}

