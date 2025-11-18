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
    const response = await httpClient.delete<DeleteCommunityMessageResponse>(
      `/communities/${communityId}/messages/${messageId}`
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao excluir mensagem',
    };
  }
}

