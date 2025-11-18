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
    const response = await httpClient.get<GetPinnedMessagesResponse>(
      `/communities/${communityId}/messages/pinned`
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao buscar mensagens fixadas',
    };
  }
}

