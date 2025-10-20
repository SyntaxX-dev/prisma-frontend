import { httpClient } from '../http/client';

export interface UpdateAgeRequest {
  age: number;
}

export interface UpdateAgeResponse {
  success: boolean;
  message: string;
  data: {
    age: number;
  };
}

export async function updateAge(age: number): Promise<UpdateAgeResponse> {
  const response = await httpClient.put<UpdateAgeResponse>(
    '/user-profile/age',
    { age }
  );
  
  return response.data;
}