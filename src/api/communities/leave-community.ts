import { httpClient } from '../http/client';
import type { ApiError } from '../http/client';

export interface LeaveCommunityRequest {
  communityId: string;
}

export interface LeaveCommunityResponse {
  success: boolean;
  message: string;
}

export async function leaveCommunity(communityId: string): Promise<LeaveCommunityResponse> {
  try {
    const response = await httpClient.post<LeaveCommunityResponse>('/communities/leave', {
      communityId,
    });
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}

