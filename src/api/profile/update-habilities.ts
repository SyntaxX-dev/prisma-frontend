import { httpClient } from '../http/client';

export interface UpdateHabilitiesRequest {
  habilities: string[] | null;
}

export interface UpdateHabilitiesResponse {
  success: boolean;
  message: string;
  data: {
    habilities: string[] | null;
  };
}

export async function updateHabilities(
  habilities: string[] | null
): Promise<UpdateHabilitiesResponse> {
  const response = await httpClient.put<UpdateHabilitiesResponse>(
    '/user-profile/habilities',
    { habilities }
  );
  
  return response.data;
}


