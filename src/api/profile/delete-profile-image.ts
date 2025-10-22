import { httpClient } from '@/api/http/client';

export interface DeleteProfileImageResponse {
  message: string;
}

export async function deleteProfileImage(): Promise<DeleteProfileImageResponse> {
  const response = await httpClient.delete<DeleteProfileImageResponse>(
    '/user-profile/profile-image'
  );
  
  return response;
}
