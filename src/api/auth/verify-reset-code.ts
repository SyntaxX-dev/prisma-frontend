import { httpClient } from '../http/client';
import { VerifyResetCodeDto } from '../../types/auth-api';
import { ApiError } from '../http/client';

export interface VerifyResetCodeResponse {
  message: string;
  valid: boolean;
}

export async function verifyResetCode(data: VerifyResetCodeDto): Promise<VerifyResetCodeResponse> {
  try {

    if (!data.email && typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('reset_email');
      if (!storedEmail) {
        throw new Error('Email não encontrado. Por favor, solicite o reset novamente.');
      }
      data.email = storedEmail;
    }
    
    const response = await httpClient.post<VerifyResetCodeResponse>('/auth/verify-reset-code', data);
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}
