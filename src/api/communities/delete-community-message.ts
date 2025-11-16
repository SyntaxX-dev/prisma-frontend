import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface DeleteCommunityMessageResponse {
  success: true;
  message: string;
}

export interface DeleteCommunityMessageError {
  success: false;
  message: string;
}

export async function deleteCommunityMessage(
  communityId: string,
  messageId: string
): Promise<DeleteCommunityMessageResponse | DeleteCommunityMessageError> {
  try {
    console.log('[deleteCommunityMessage] Excluindo mensagem:', { communityId, messageId });
    const response = await httpClient.delete<DeleteCommunityMessageResponse>(
      `/communities/${communityId}/messages/${messageId}`
    );
    console.log('[deleteCommunityMessage] ✅ Mensagem excluída com sucesso:', response);
    return response;
  } catch (error) {
    console.error('[deleteCommunityMessage] ❌ Erro ao excluir mensagem:', error);
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao excluir mensagem',
    };
  }
}

