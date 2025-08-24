import { httpClient } from '../http/client';
import { ApiError } from '@/types/api';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  try {
    const response = await httpClient.post<ForgotPasswordResponse>('/auth/forgot-password', data);
    return response;
  } catch (error: unknown) {
    const apiError = error as ApiError;
    throw new Error(apiError.response?.data?.message || 'Erro ao solicitar reset de senha');
  }
} 
