import { httpClient } from '../http/client';
import { VerifyResetCodeDto, ApiResponse } from '../../types/auth-api';
import { ApiError } from '../http/client';

export async function verifyResetCode(data: VerifyResetCodeDto): Promise<ApiResponse> {
  try {

    if (!data.email && typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('reset_email');
      if (!storedEmail) {
        throw new Error('Email não encontrado. Por favor, solicite o reset novamente.');
      }
      data.email = storedEmail;
    }
    
    const response = await httpClient.post<ApiResponse>('/auth/verify-reset-code', data);
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}
