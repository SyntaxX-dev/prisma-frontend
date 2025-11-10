import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface FriendRequest {
  id: string;
  requesterId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  requester?: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
  receiver?: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
}

export interface GetFriendRequestsResponse {
  success: boolean;
  data: {
    sent: FriendRequest[];
    received: FriendRequest[];
  };
}

export async function getFriendRequests(): Promise<GetFriendRequestsResponse> {
  try {
    const response = await httpClient.get<GetFriendRequestsResponse>('/friends/requests');
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}

