import { httpClient } from '../http/client';
import { RequestPasswordResetDto, RequestPasswordResetResponse } from '@/types/auth';
import { ApiError } from '@/types/api';

export async function requestPasswordReset(data: RequestPasswordResetDto): Promise<RequestPasswordResetResponse> {
  try {
    const response = await httpClient.post<RequestPasswordResetResponse>('/auth/request-password-reset', data);
    return response;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    throw new Error(apiError.response?.data?.message || 'Erro ao solicitar reset de senha');
  }
} 
