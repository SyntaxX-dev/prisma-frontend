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
    const response = await httpClient.delete<DeleteMessageResponse>(
      `/messages/${messageId}`
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao excluir mensagem',
    };
  }
}

