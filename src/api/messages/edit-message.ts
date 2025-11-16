import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface EditMessageRequest {
  content: string;
}

export interface EditMessageResponse {
  success: true;
  data: {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string | null;
  };
}

export interface EditMessageError {
  success: false;
  message: string;
}

export async function editMessage(
  messageId: string,
  content: string
): Promise<EditMessageResponse | EditMessageError> {
  try {
    console.log('[editMessage] Editando mensagem:', { messageId, content });
    const response = await httpClient.put<EditMessageResponse>(
      `/messages/${messageId}`,
      {
        content,
      }
    );
    console.log('[editMessage] ✅ Mensagem editada com sucesso:', response);
    return response;
  } catch (error) {
    console.error('[editMessage] ❌ Erro ao editar mensagem:', error);
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao editar mensagem',
    };
  }
}

