import { httpClient } from '../http/client';
import { ApiError } from '../http/client';
import type { GetCommunityMessagesResponse, CommunityMessage } from '@/types/community-chat';

export interface GetCommunityMessagesError {
  success: false;
  message: string;
}

export async function getCommunityMessages(
  communityId: string,
  limit: number = 50,
  offset: number = 0
): Promise<GetCommunityMessagesResponse | GetCommunityMessagesError> {
  try {
    console.log('[getCommunityMessages] Buscando mensagens:', { communityId, limit, offset });
    const response = await httpClient.get<GetCommunityMessagesResponse>(
      `/communities/${communityId}/messages?limit=${limit}&offset=${offset}`
    );
    console.log('[getCommunityMessages] ✅ Mensagens recebidas:', response);
    return response;
  } catch (error) {
    console.error('[getCommunityMessages] ❌ Erro ao buscar mensagens:', error);
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao buscar mensagens',
    };
  }
}
