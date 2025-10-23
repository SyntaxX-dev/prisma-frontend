import { httpClient } from '../http/client';

export interface UpdateNameRequest {
  name: string;
}

export interface UpdateNameResponse {
  success: boolean;
  message: string;
  data: {
    name: string;
  };
}

export async function updateName(name: string): Promise<UpdateNameResponse> {
  const response = await httpClient.put<UpdateNameResponse>(
    '/user-profile/name',
    { name }
  );
  
  return response;
}