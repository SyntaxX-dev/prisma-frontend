import { httpClient } from '@/api/http/client';

export interface UploadCommunityImageResponse {
  success: boolean;
  message?: string;
  data: {
    image: string;
  };
}

// Se o endpoint específico não existir, podemos usar o endpoint genérico de upload
// ou o endpoint de perfil temporariamente
export async function uploadCommunityImage(file: File): Promise<UploadCommunityImageResponse> {
  const formData = new FormData();
  formData.append('image', file);

  try {
    // Tentar endpoint específico de comunidades primeiro
    const response = await httpClient.postFormData<UploadCommunityImageResponse>(
      '/communities/upload-image',
      formData
    );
    return response;
  } catch (error) {
    // Se não existir, usar endpoint genérico ou de perfil como fallback
    // Por enquanto, vamos usar o endpoint de perfil como fallback
    const fallbackResponse = await httpClient.postFormData<{ data: { profileImage: string } }>(
      '/user-profile/profile-image/upload',
      formData
    );
    
    return {
      success: true,
      data: {
        image: fallbackResponse.data.profileImage,
      },
    };
  }
}

