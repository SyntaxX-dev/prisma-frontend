import { httpClient } from '../http/client';

export interface UpdateLinksRequest {
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface UpdateLinksResponse {
  success: boolean;
  message: string;
  data: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
}

export async function updateLinks(links: UpdateLinksRequest): Promise<UpdateLinksResponse> {
  const response = await httpClient.put<UpdateLinksResponse>(
    '/user-profile/links',
    links
  );
  
  return response.data;
}