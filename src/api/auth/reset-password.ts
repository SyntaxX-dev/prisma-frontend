import { httpClient } from '../http/client';
import { ResetPasswordDto, ResetPasswordResponse } from '@/types/auth';
import { ApiError } from '@/types/api';

export async function resetPassword(data: ResetPasswordDto): Promise<ResetPasswordResponse> {
  try {
    const response = await httpClient.post<ResetPasswordResponse>('/auth/reset-password', data);
    return response;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    throw new Error(apiError.response?.data?.message || 'Erro ao resetar senha');
  }
} 
