import { httpClient } from '@/api/http/client';

export interface UpdateSocialLinksOrderRequest {
  socialLinksOrder: string[];
}

export interface UpdateSocialLinksOrderResponse {
  message: string;
  data: {
    socialLinksOrder: string[];
  };
}

export async function updateSocialLinksOrder(socialLinksOrder: string[]): Promise<UpdateSocialLinksOrderResponse> {
  const response = await httpClient.put<UpdateSocialLinksOrderResponse>(
    '/user-profile/social-links-order',
    { socialLinksOrder }
  );
  
  return response.data;
}
