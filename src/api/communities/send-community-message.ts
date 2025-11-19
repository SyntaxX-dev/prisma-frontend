import { httpClient } from '../http/client';
import { ApiError } from '../http/client';
import type { CommunityMessage, SendCommunityMessageRequest } from '@/types/community-chat';
import type { MessageAttachment } from '@/types/file-upload';

export interface SendCommunityMessageResponse {
  success: true;
  data: CommunityMessage;
}

export interface SendCommunityMessageError {
  success: false;
  message: string;
}

export async function sendCommunityMessage(
  communityId: string,
  content?: string,
  attachments?: MessageAttachment[]
): Promise<SendCommunityMessageResponse | SendCommunityMessageError> {
  try {
    const response = await httpClient.post<SendCommunityMessageResponse>(
      `/communities/${communityId}/messages`,
      { content: content || '', attachments }
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao enviar mensagem',
    };
  }
}

