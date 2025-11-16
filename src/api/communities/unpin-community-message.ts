import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface UnpinCommunityMessageResponse {
  success: true;
  message: string;
}

export interface UnpinCommunityMessageError {
  success: false;
  message: string;
}

export async function unpinCommunityMessage(
  communityId: string,
  messageId: string
): Promise<UnpinCommunityMessageResponse | UnpinCommunityMessageError> {
  try {
    console.log('[unpinCommunityMessage] Desfixando mensagem:', { communityId, messageId });
    const response = await httpClient.delete<UnpinCommunityMessageResponse>(
      `/communities/${communityId}/messages/${messageId}/unpin`
    );
    console.log('[unpinCommunityMessage] ✅ Mensagem desfixada com sucesso:', response);
    return response;
  } catch (error) {
    console.error('[unpinCommunityMessage] ❌ Erro ao desfixar mensagem:', error);
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao desfixar mensagem',
    };
  }
}

