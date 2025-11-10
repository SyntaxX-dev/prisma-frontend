import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface AcceptFriendRequestRequest {
  friendRequestId: string;
}

export interface AcceptFriendRequestResponse {
  success: boolean;
  message: string;
  data: {
    friendship: {
      id: string;
      userId1: string;
      userId2: string;
      createdAt: string;
    };
    friendRequest: {
      id: string;
      requesterId: string;
      receiverId: string;
      status: 'ACCEPTED';
      createdAt: string;
    };
  };
}

export async function acceptFriendRequest(
  friendRequestId: string
): Promise<AcceptFriendRequestResponse> {
  try {
    const response = await httpClient.post<AcceptFriendRequestResponse>(
      '/friends/accept',
      { friendRequestId }
    );
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}

