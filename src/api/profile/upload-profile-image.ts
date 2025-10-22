import { httpClient } from '@/api/http/client';

export interface UploadProfileImageResponse {
  message: string;
  data: {
    profileImage: string;
  };
}

export async function uploadProfileImage(file: File): Promise<UploadProfileImageResponse> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await httpClient.postFormData<UploadProfileImageResponse>(
    '/user-profile/profile-image/upload',
    formData
  );
  
  return response;
}
