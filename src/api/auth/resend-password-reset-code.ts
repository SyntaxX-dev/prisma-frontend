import { httpClient } from '../http/client';
import { RequestPasswordResetDto, ApiResponse } from '../../types/auth-api';
import { ApiError } from '../http/client';

export interface ResendPasswordResetCodeResponse {
  message: string;
  email: string;
}

export async function resendPasswordResetCode(
  data: RequestPasswordResetDto
): Promise<ResendPasswordResetCodeResponse> {
  try {
    const response = await httpClient.post<ResendPasswordResetCodeResponse>(
      '/auth/resend-password-reset-code',
      data
    );
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}
