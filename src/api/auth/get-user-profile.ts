import { httpClient } from '../http/client';
import { UserProfile } from '../../types/auth-api';
import { ApiError } from '../http/client';

export async function getUserProfile(userId: string): Promise<{ success: boolean; data: UserProfile }> {
  try {
    const response = await httpClient.get<{ success: boolean; data: UserProfile }>(`/users/${userId}/profile`);
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}

