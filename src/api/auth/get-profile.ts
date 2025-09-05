import { httpClient } from '../http/client';
import { UserProfile } from '../../types/auth-api';
import { ApiError } from '../http/client';

export async function getProfile(): Promise<UserProfile> {
  try {
    const response = await httpClient.get<UserProfile>('/auth/profile');
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_profile', JSON.stringify(response));
    }
    
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}
