import { httpClient } from '../http/client';
import { ApiError } from '../http/client';
import type { GetAttachmentsResponse, Attachment } from '@/types/attachments';

export interface GetCommunityAttachmentsError {
  success: false;
  message: string;
}

export async function getCommunityAttachments(
  communityId: string
): Promise<{ success: true; data: Attachment[] } | GetCommunityAttachmentsError> {
  try {
    const response = await httpClient.get<GetAttachmentsResponse>(
      `/communities/${communityId}/messages/attachments`
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
      message: apiError.message || 'Erro ao buscar anexos da comunidade',
    };
  }
}

