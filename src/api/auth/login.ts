import { httpClient } from '../http/client';
import { LoginDto, AuthResponse } from '../../types/auth-api';
import { ApiError } from '../http/client';

export async function loginUser(data: LoginDto): Promise<AuthResponse> {
  try {
    const response = await httpClient.post<AuthResponse>('/auth/login', data);
    
    if (typeof window !== 'undefined' && response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_profile', JSON.stringify(response.user));
    }
    
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}



