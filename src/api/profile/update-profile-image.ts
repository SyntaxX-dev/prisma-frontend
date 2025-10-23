import { httpClient } from '../http/client';

export interface UpdateProfileImageRequest {
  profileImage: string;
}

export interface UpdateProfileImageResponse {
  success: boolean;
  message: string;
  data: {
    profileImage: string;
  };
}

export async function updateProfileImage(profileImage: string): Promise<UpdateProfileImageResponse> {
  const response = await httpClient.put<UpdateProfileImageResponse>(
    '/user-profile/profile-image',
    { profileImage }
  );
  
  return response;
}