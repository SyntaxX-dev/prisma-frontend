import { httpClient } from '../http/client';
import { LoginDto, AuthResponse } from '../../types/auth-api';
import { ApiError } from '../http/client';

export async function loginUser(data: LoginDto): Promise<AuthResponse> {
  try {
    const response = await httpClient.post<AuthResponse>('/auth/login', data);
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}



