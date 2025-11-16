import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface UnpinMessageResponse {
  success: true;
  message: string;
}

export interface UnpinMessageError {
  success: false;
  message: string;
}

export async function unpinMessage(
  messageId: string
): Promise<UnpinMessageResponse | UnpinMessageError> {
  try {
    console.log('[unpinMessage] Desfixando mensagem:', { messageId });
    const response = await httpClient.delete<UnpinMessageResponse>(
      `/messages/${messageId}/unpin`
    );
    console.log('[unpinMessage] ✅ Mensagem desfixada com sucesso:', response);
    return response;
  } catch (error) {
    console.error('[unpinMessage] ❌ Erro ao desfixar mensagem:', error);
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao desfixar mensagem',
    };
  }
}

