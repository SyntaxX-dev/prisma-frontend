import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface SendMessageRequest {
  receiverId: string;
  content: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  edited?: boolean;
  updatedAt?: string | null;
}

export interface SendMessageResponse {
  success: boolean;
  data: Message; // Backend retorna a mensagem diretamente em data, não em data.message
}

export async function sendMessage(
  receiverId: string,
  content: string
): Promise<SendMessageResponse> {
  try {
    console.log('[sendMessage] Enviando mensagem:', { receiverId, content });
    const response = await httpClient.post<SendMessageResponse>(
      '/messages',
      {
        receiverId,
        content,
      }
    );
    console.log('[sendMessage] ✅ Resposta completa da API:', JSON.stringify(response, null, 2));
    console.log('[sendMessage] Estrutura da resposta:', {
      success: response.success,
      hasData: !!response.data,
      messageId: response.data?.id,
      content: response.data?.content
    });
    return response;
  } catch (error) {
    console.error('[sendMessage] ❌ Erro ao enviar mensagem:', error);
    throw error as ApiError;
  }
}

