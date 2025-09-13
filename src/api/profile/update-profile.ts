import { httpClient } from '../http/client';
import { ProfileUpdateDto, UserProfile } from '../../types/auth-api';
import { ApiError } from '../http/client';

export async function updateProfile(data: ProfileUpdateDto): Promise<UserProfile> {
  try {
    const response = await httpClient.put<UserProfile>('/profile', data);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_profile', JSON.stringify(response));
    }
    
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}
