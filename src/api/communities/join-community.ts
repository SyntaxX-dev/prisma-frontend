import { httpClient } from '../http/client';
import type { ApiError } from '../http/client';

export interface JoinCommunityRequest {
  communityId: string;
}

export interface JoinCommunityResponse {
  success: boolean;
  message: string;
}

export async function joinCommunity(communityId: string): Promise<JoinCommunityResponse> {
  try {
    const response = await httpClient.post<JoinCommunityResponse>('/communities/join', {
      communityId,
    });
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}

