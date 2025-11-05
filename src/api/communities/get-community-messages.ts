import { httpClient } from '@/api/http/client';
import type { CommunityMessage } from '@/types/community';
import type { ApiError } from '@/api/http/client';

interface GetCommunityMessagesResponse {
  success: boolean;
  data: {
    messages: CommunityMessage[];
  };
}

export async function getCommunityMessages(
  communityId: string
): Promise<GetCommunityMessagesResponse> {
  try {
    const response = await httpClient.get<GetCommunityMessagesResponse>(
      `/communities/${communityId}/messages`
    );
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}

