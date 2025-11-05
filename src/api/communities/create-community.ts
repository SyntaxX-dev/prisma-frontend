import { httpClient } from '@/api/http/client';
import type { Community, CreateCommunityRequest } from '@/types/community';
import type { ApiError } from '@/api/http/client';

interface CreateCommunityResponse {
  success: boolean;
  data: {
    community: Community;
  };
}

export async function createCommunity(
  data: CreateCommunityRequest
): Promise<CreateCommunityResponse> {
  try {
    const response = await httpClient.post<CreateCommunityResponse>(
      '/communities',
      data
    );
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}

