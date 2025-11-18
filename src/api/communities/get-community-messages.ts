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
    const response = await httpClient.get<GetCommunityMessagesResponse>(
      `/communities/${communityId}/messages?limit=${limit}&offset=${offset}`
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao buscar mensagens',
    };
  }
}
