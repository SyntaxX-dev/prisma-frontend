import { httpClient } from '../http/client';
import type { ApiError } from '../http/client';

export interface CommunityMember {
  id: string;
  name: string;
  profileImage: string | null;
  joinedAt: string;
  isOwner: boolean;
}

export interface GetCommunityMembersResponse {
  success: boolean;
  data: {
    members: CommunityMember[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    isCurrentUserOwner?: boolean;
  };
}

export interface GetCommunityMembersParams {
  communityId: string;
  limit?: number;
  offset?: number;
}

export async function getCommunityMembers(
  params: GetCommunityMembersParams
): Promise<GetCommunityMembersResponse> {
  try {
    const { communityId, limit = 20, offset = 0 } = params;
    const response = await httpClient.get<GetCommunityMembersResponse>(
      `/communities/${communityId}/members?limit=${limit}&offset=${offset}`
    );
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}

