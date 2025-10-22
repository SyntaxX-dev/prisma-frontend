import { httpClient } from '@/api/http/client';

export interface UpdateInstagramRequest {
  instagram: string;
}

export interface UpdateInstagramResponse {
  message: string;
  data: {
    instagram: string;
  };
}

export async function updateInstagram(instagram: string): Promise<UpdateInstagramResponse> {
  const response = await httpClient.put<UpdateInstagramResponse>(
    '/user-profile/instagram',
    { instagram }
  );
  
  return response.data;
}
