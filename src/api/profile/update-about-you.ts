import { httpClient } from '../http/client';

export interface UpdateAboutYouRequest {
  aboutYou: string;
}

export interface UpdateAboutYouResponse {
  success: boolean;
  message: string;
  data: {
    aboutYou: string;
  };
}

export async function updateAboutYou(aboutYou: string): Promise<UpdateAboutYouResponse> {
  const response = await httpClient.put<UpdateAboutYouResponse>(
    '/user-profile/about-you',
    { aboutYou }
  );
  
  return response;
}


