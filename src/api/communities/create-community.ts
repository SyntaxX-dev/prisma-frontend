import { httpClient } from '@/api/http/client';
import type { CreateCommunityRequest } from '@/types/community';
import type { ApiError } from '@/api/http/client';

export interface CreateCommunityResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    focus: string;
    description: string | null;
    image: string | null;
    visibility: 'PUBLIC' | 'PRIVATE';
    ownerId: string;
    createdAt: string;
  };
}

// Criar comunidade com FormData (inclui imagem)
export async function createCommunityWithImage(
  formData: FormData
): Promise<CreateCommunityResponse> {
  try {
    const response = await httpClient.postFormData<CreateCommunityResponse>(
      '/communities',
      formData
    );
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}

// Criar comunidade sem imagem (JSON)
export async function createCommunity(
  data: CreateCommunityRequest
): Promise<CreateCommunityResponse> {
  try {
    const response = await httpClient.post<CreateCommunityResponse>(
      '/communities',
      data
    );
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}

