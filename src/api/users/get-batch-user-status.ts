import { httpClient } from '../http/client';
import { ApiError } from '../http/client';
import type { BatchUserStatusResponse } from '@/types/user-status';

export interface GetBatchUserStatusError {
  success: false;
  message: string;
}

export async function getBatchUserStatus(
  userIds: string[]
): Promise<BatchUserStatusResponse | GetBatchUserStatusError> {
  try {
    console.log('[getBatchUserStatus] Buscando status de múltiplos usuários:', { userIds });
    const response = await httpClient.get<BatchUserStatusResponse>(
      `/users/status/batch?userIds=${userIds.join(',')}`
    );
    console.log('[getBatchUserStatus] ✅ Status recebidos:', response);
    return response;
  } catch (error) {
    console.error('[getBatchUserStatus] ❌ Erro ao buscar status:', error);
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao buscar status',
    };
  }
}

