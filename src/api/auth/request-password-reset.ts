import { httpClient } from '../http/client';
import { RequestPasswordResetDto, ApiResponse } from '../../types/auth-api';
import { ApiError } from '../http/client';

export async function requestPasswordReset(data: RequestPasswordResetDto): Promise<ApiResponse> {
  try {
    const response = await httpClient.post<ApiResponse>('/auth/request-password-reset', data);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('reset_email', data.email);
    }
    
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}
