import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface UpdateAboutRequest {
  aboutYou?: string;
  habilities?: string;
  momentCareer?: string;
  location?: string;
}

export interface UpdateAboutResponse {
  success: boolean;
  message: string;
  data: {
    aboutYou?: string;
    habilities?: string;
    momentCareer?: string;
    location?: string;
  };
}

export async function updateAbout(data: UpdateAboutRequest): Promise<UpdateAboutResponse> {
  try {
    const response = await httpClient.put<UpdateAboutResponse>('/user-profile/about', data);
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}
