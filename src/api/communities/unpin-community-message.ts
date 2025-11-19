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
    const response = await httpClient.delete<UnpinCommunityMessageResponse>(
      `/communities/${communityId}/messages/${messageId}/unpin`
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao desfixar mensagem',
    };
  }
}

