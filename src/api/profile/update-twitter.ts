import { httpClient } from '@/api/http/client';

export interface UpdateTwitterRequest {
  twitter: string;
}

export interface UpdateTwitterResponse {
  message: string;
  data: {
    twitter: string;
  };
}

export async function updateTwitter(twitter: string): Promise<UpdateTwitterResponse> {
  const response = await httpClient.put<UpdateTwitterResponse>(
    '/user-profile/twitter',
    { twitter }
  );
  
  return response.data;
}
