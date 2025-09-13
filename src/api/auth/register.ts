import { httpClient } from '../http/client';
import { RegisterUserDto, AuthResponse } from '../../types/auth-api';
import { ApiError } from '../http/client';

export async function registerUser(data: RegisterUserDto): Promise<AuthResponse> {
  try {
    const response = await httpClient.post<AuthResponse>('/auth/register', data);
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}



