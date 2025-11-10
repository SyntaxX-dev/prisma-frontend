import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface SendFriendRequestRequest {
  receiverId: string;
}

export interface SendFriendRequestResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    requesterId: string;
    receiverId: string;
    status: 'PENDING';
    createdAt: string;
  };
}

export async function sendFriendRequest(
  receiverId: string
): Promise<SendFriendRequestResponse> {
  try {
    const response = await httpClient.post<SendFriendRequestResponse>(
      '/friendships/requests',
      { receiverId }
    );
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}

