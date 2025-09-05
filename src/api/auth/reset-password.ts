import { httpClient } from '../http/client';
import { ResetPasswordDto, ApiResponse } from '../../types/auth-api';
import { ApiError } from '../http/client';

export async function resetPassword(data: ResetPasswordDto): Promise<ApiResponse> {
  try {

    if (!data.email && typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('reset_email');
      if (!storedEmail) {
        throw new Error('Email não encontrado. Por favor, solicite o reset novamente.');
      }
      data.email = storedEmail;
    }
    
    const response = await httpClient.post<ApiResponse>('/auth/reset-password', data);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('reset_email');
    }
    
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}
