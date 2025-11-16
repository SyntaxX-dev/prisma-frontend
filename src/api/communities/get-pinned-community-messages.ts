import { httpClient } from '../http/client';
import { ApiError } from '../http/client';
import type { GetPinnedMessagesResponse } from '@/types/community-chat';

export interface GetPinnedCommunityMessagesError {
  success: false;
  message: string;
}

export async function getPinnedCommunityMessages(
  communityId: string
): Promise<GetPinnedMessagesResponse | GetPinnedCommunityMessagesError> {
  try {
    console.log('[getPinnedCommunityMessages] Buscando mensagens fixadas:', { communityId });
    const response = await httpClient.get<GetPinnedMessagesResponse>(
      `/communities/${communityId}/messages/pinned`
    );
    console.log('[getPinnedCommunityMessages] ✅ Mensagens fixadas recebidas:', response);
    return response;
  } catch (error) {
    console.error('[getPinnedCommunityMessages] ❌ Erro ao buscar mensagens fixadas:', error);
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao buscar mensagens fixadas',
    };
  }
}

