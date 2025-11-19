import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface RemoveFriendshipResponse {
  success: boolean;
  message: string;
}

export async function removeFriendship(
  userId: string
): Promise<RemoveFriendshipResponse> {
  try {
    
    const response = await httpClient.delete<RemoveFriendshipResponse>(
      `/friendships/${userId}`
    );
    
    return response;
  } catch (error: any) {
    throw error as ApiError;
  }
}

