import { httpClient } from '../http/client';
import { ApiError } from '../http/client';
import type { MessageAttachment } from '@/types/file-upload';

export interface SendMessageRequest {
  receiverId: string;
  content?: string;
  attachments?: MessageAttachment[];
}

import type { MessageAttachmentResponse } from '@/types/file-upload';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  edited?: boolean;
  updatedAt?: string | null;
  attachments?: MessageAttachmentResponse[];
  clientId?: string;
}

export interface SendMessageResponse {
  success: boolean;
  data: Message; // Backend retorna a mensagem diretamente em data, não em data.message
}

export async function sendMessage(
  receiverId: string,
  content?: string,
  attachments?: MessageAttachment[]
): Promise<SendMessageResponse> {
  try {
    const response = await httpClient.post<SendMessageResponse>(
      '/messages',
      {
        receiverId,
        content: content || '',
            attachments,
          }
        );
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}

