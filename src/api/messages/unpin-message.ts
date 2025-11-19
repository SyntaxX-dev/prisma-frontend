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
    const response = await httpClient.delete<UnpinMessageResponse>(
      `/messages/${messageId}/unpin`
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao desfixar mensagem',
    };
  }
}

