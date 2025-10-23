import { httpClient } from '../http/client';

export interface UpdateMomentCareerRequest {
  momentCareer: string | null;
}

export interface UpdateMomentCareerResponse {
  success: boolean;
  message: string;
  data: {
    momentCareer: string | null;
  };
}

export async function updateMomentCareer(momentCareer: string | null): Promise<UpdateMomentCareerResponse> {
  const response = await httpClient.put<UpdateMomentCareerResponse>(
    '/user-profile/moment-career',
    { momentCareer }
  );
  
  return response;
}


