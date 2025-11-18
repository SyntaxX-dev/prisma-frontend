import { httpClient } from '../http/client';
import { ApiError } from '../http/client';
import type { UploadSignatureRequest, UploadSignatureResponse, UploadSignatureError } from '@/types/file-upload';

export async function getUploadSignature(
  request: UploadSignatureRequest
): Promise<UploadSignatureResponse | UploadSignatureError> {
  try {
    const response = await httpClient.post<UploadSignatureResponse>(
      '/messages/upload-signature',
      request
    );
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    return {
      success: false,
      message: apiError.message || 'Erro ao gerar signature para upload',
    };
  }
}

