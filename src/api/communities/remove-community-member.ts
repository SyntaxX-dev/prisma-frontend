import { fetchJson } from '../http/client';
import type { ApiError } from '../http/client';

export interface RemoveCommunityMemberRequest {
  communityId: string;
  memberId: string;
}

export interface RemoveCommunityMemberResponse {
  success: boolean;
  message: string;
}

export async function removeCommunityMember(
  params: RemoveCommunityMemberRequest
): Promise<RemoveCommunityMemberResponse> {
  try {
    const { communityId, memberId } = params;
    const response = await fetchJson<RemoveCommunityMemberResponse>(
      '/communities/members',
      {
        method: 'DELETE',
        body: JSON.stringify({ communityId, memberId }),
      }
    );
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}

