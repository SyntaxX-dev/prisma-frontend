import { httpClient } from '../http/client';
import { ApiError } from '../http/client';
import type { CommunityMessage, EditCommunityMessageRequest } from '@/types/community-chat';

export interface EditCommunityMessageResponse {
  success: true;
  data: CommunityMessage & { updatedAt: string };
}

export interface EditCommunityMessageError {
  success: false;
  message: string;
}

export async function editCommunityMessage(
  communityId: string,
  messageId: string,
  content: string
): Promise<EditCommunityMessageResponse | EditCommunityMessageError> {
  try {
    console.log('[editCommunityMessage] Editando mensagem:', { communityId, messageId, content });
    const response = await httpClient.put<EditCommunityMessageResponse>(
      `/communities/${communityId}/messages/${messageId}`,
      { content }
    );
    console.log('[editCommunityMessage] ✅ Mensagem editada com sucesso:', response);
    return response;
  } catch (error) {
    console.error('[editCommunityMessage] ❌ Erro ao editar mensagem:', error);
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao editar mensagem',
    };
  }
}

