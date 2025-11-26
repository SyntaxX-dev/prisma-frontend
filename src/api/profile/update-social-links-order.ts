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
  const payload = { socialLinksOrder };
  console.log('📤 API - Enviando payload:', JSON.stringify(payload, null, 2));
  
  const response = await httpClient.put<UpdateSocialLinksOrderResponse>(
    '/user-profile/social-links-order',
    payload
  );
  
  console.log('📥 API - Resposta recebida:', JSON.stringify(response, null, 2));
  
  return response;
}
