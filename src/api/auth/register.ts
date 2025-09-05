import { httpClient } from '../http/client';
import { RegisterUserDto, AuthResponse } from '../../types/auth-api';
import { ApiError } from '../http/client';

export async function registerUser(data: RegisterUserDto): Promise<AuthResponse> {
  try {
    const response = await httpClient.post<AuthResponse>('/auth/register', data);
    
    if (typeof window !== 'undefined' && response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_profile', JSON.stringify(response.user));
    }
    
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}



