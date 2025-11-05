import { httpClient } from '@/api/http/client';
import type { Community } from '@/types/community';
import type { ApiError } from '@/api/http/client';

interface GetCommunitiesResponse {
  success: boolean;
  data: {
    communities: Community[];
  };
}

export async function getCommunities(): Promise<GetCommunitiesResponse> {
  try {
    const response = await httpClient.get<GetCommunitiesResponse>('/communities');
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}

