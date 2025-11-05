import { httpClient } from '@/api/http/client';
import type { CommunityMessage } from '@/types/community';
import type { ApiError } from '@/api/http/client';

interface SendMessageRequest {
  content: string;
}

interface SendMessageResponse {
  success: boolean;
  data: {
    message: CommunityMessage;
  };
}

export async function sendCommunityMessage(
  communityId: string,
  data: SendMessageRequest
): Promise<SendMessageResponse> {
  try {
    const response = await httpClient.post<SendMessageResponse>(
      `/communities/${communityId}/messages`,
      data
    );
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}

