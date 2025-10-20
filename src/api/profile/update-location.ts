import { httpClient } from '../http/client';

export interface UpdateLocationRequest {
  location: string;
}

export interface UpdateLocationResponse {
  success: boolean;
  message: string;
  data: {
    location: string;
  };
}

export async function updateLocation(location: string): Promise<UpdateLocationResponse> {
  const response = await httpClient.put<UpdateLocationResponse>(
    '/user-profile/location',
    { location }
  );
  
  return response.data;
}
