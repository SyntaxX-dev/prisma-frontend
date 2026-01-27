import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface ValidateTokenResponse {
  valid: boolean;
  message?: string;
  email?: string;
  expiresAt?: string;
}

export async function validateRegistrationToken(token: string): Promise<ValidateTokenResponse> {
  try {
    const response = await httpClient.get<ValidateTokenResponse>(`/auth/validate-registration-token/${token}`);
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    // Se for 401 ou 404, retornar valid: false
    if (apiError.status === 401 || apiError.status === 404) {
      return {
        valid: false,
        message: apiError.message || 'Token inválido ou expirado',
      };
    }
    throw new Error(apiError.message || 'Erro ao validar token');
  }
}

