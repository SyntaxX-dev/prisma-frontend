import { httpClient } from '../http/client';

export interface UpdateLocationRequest {
  location: string;
  locationVisibility?: 'PUBLIC' | 'STATE_ONLY' | 'PRIVATE';
}

export interface UpdateLocationResponse {
  success: boolean;
  message: string;
  data: {
    location: string;
    locationVisibility: 'PUBLIC' | 'STATE_ONLY' | 'PRIVATE';
  };
}

export async function updateLocation(
  location: string,
  locationVisibility?: 'PUBLIC' | 'STATE_ONLY' | 'PRIVATE'
): Promise<UpdateLocationResponse> {
  const response = await httpClient.put<UpdateLocationResponse>(
    '/user-profile/location',
    { location, locationVisibility }
  );
  
  return response;
}
