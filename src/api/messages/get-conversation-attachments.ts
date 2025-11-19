import { httpClient } from '../http/client';
import { ApiError } from '../http/client';
import type { GetAttachmentsResponse, Attachment } from '@/types/attachments';

export interface GetConversationAttachmentsError {
  success: false;
  message: string;
}

export async function getConversationAttachments(
  friendId: string
): Promise<{ success: true; data: Attachment[] } | GetConversationAttachmentsError> {
  try {
    const response = await httpClient.get<GetAttachmentsResponse>(
      `/messages/conversation/${friendId}/attachments`
    );
    
    if (!response.success) {
      return {
        success: false,
        message: 'Falha ao buscar anexos',
      };
    }
    
    return {
      success: true,
      data: response.data.attachments,
    };
  } catch (error) {
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao buscar anexos da conversa',
    };
  }
}

