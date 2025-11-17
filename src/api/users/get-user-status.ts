import { httpClient } from '../http/client';
import { ApiError } from '../http/client';
import type { UserStatusResponse } from '@/types/user-status';

export interface GetUserStatusError {
  success: false;
  message: string;
}

export async function getUserStatus(
  userId: string
): Promise<UserStatusResponse | GetUserStatusError> {
  try {
    console.log('[getUserStatus] Buscando status do usuário:', { userId });
    const response = await httpClient.get<UserStatusResponse>(
      `/users/${userId}/status`
    );
    console.log('[getUserStatus] ✅ Status recebido:', response);
    return response;
  } catch (error) {
    console.error('[getUserStatus] ❌ Erro ao buscar status:', error);
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao buscar status',
    };
  }
}

