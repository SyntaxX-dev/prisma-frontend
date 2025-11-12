import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface RemoveFriendshipResponse {
  success: boolean;
  message: string;
}

export async function removeFriendship(
  userId: string
): Promise<RemoveFriendshipResponse> {
  try {
    console.log('[removeFriendship] Tentando remover amizade com userId:', userId);
    console.log('[removeFriendship] Endpoint:', `/friendships/${userId}`);
    
    const response = await httpClient.delete<RemoveFriendshipResponse>(
      `/friendships/${userId}`
    );
    
    console.log('[removeFriendship] ✅ Resposta do backend:', response);
    return response;
  } catch (error: any) {
    console.error('[removeFriendship] ❌ Erro ao remover amizade:', error);
    console.error('[removeFriendship] Detalhes do erro:', {
      message: error.message,
      status: error.status,
      details: error.details
    });
    throw error as ApiError;
  }
}

