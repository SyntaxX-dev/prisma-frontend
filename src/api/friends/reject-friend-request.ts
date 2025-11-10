import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface RejectFriendRequestRequest {
  friendRequestId: string;
}

export interface RejectFriendRequestResponse {
  success: boolean;
  message: string;
}

export async function rejectFriendRequest(
  friendRequestId: string
): Promise<RejectFriendRequestResponse> {
  try {
    const response = await httpClient.post<RejectFriendRequestResponse>(
      '/friends/reject',
      { friendRequestId }
    );
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}

