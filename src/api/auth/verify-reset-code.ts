import { httpClient } from '../http/client';
import { VerifyResetCodeDto, VerifyResetCodeResponse } from '@/types/auth';
import { ApiError } from '@/types/api';

export async function verifyResetCode(data: VerifyResetCodeDto): Promise<VerifyResetCodeResponse> {
  try {
    const response = await httpClient.post<VerifyResetCodeResponse>('/auth/verify-reset-code', data);
    return response;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    throw new Error(apiError.response?.data?.message || 'Erro ao verificar código');
  }
} 
