import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface DeleteMessageResponse {
  success: true;
  message: string;
}

export interface DeleteMessageError {
  success: false;
  message: string;
}

export async function deleteMessage(
  messageId: string
): Promise<DeleteMessageResponse | DeleteMessageError> {
  try {
    console.log('[deleteMessage] Excluindo mensagem:', { messageId });
    const response = await httpClient.delete<DeleteMessageResponse>(
      `/messages/${messageId}`
    );
    console.log('[deleteMessage] ✅ Mensagem excluída com sucesso:', response);
    return response;
  } catch (error) {
    console.error('[deleteMessage] ❌ Erro ao excluir mensagem:', error);
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao excluir mensagem',
    };
  }
}

