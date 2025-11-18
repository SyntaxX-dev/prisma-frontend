import { httpClient } from '@/api/http/client';
import type { Community } from '@/types/community';
import type { ApiError } from '@/api/http/client';

interface GetCommunitiesResponse {
  success: boolean;
  data: Community[] | {
    communities?: Community[];
  };
}

export async function getCommunities(): Promise<GetCommunitiesResponse> {
  try {
    // O token JWT é enviado automaticamente pelo httpClient se estiver em localStorage.getItem('auth_token')
    // Isso é ESSENCIAL para obter isOwner e isMember corretos
    
    const response = await httpClient.get<GetCommunitiesResponse>('/communities');
    
    
    // Verificar isOwner e isMember na resposta
    if (response.success && Array.isArray(response.data)) {
      response.data.forEach((community: any, index: number) => {
        // Verificando propriedades da comunidade
      });
    }
    
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}

