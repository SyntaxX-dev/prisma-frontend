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
    console.log('[getCommunities] Iniciando busca de comunidades...');
    
    const response = await httpClient.get<GetCommunitiesResponse>('/communities');
    
    console.log('[getCommunities] Resposta completa da API:', JSON.stringify(response, null, 2));
    
    // Verificar isOwner e isMember na resposta
    if (response.success && Array.isArray(response.data)) {
      console.log('[getCommunities] Análise das comunidades:');
      response.data.forEach((community: any, index: number) => {
        console.log(`[getCommunities] Comunidade ${index + 1}:`, {
          id: community.id,
          name: community.name,
          ownerId: community.ownerId,
          isOwner: community.isOwner,
          isMember: community.isMember,
          memberCount: community.memberCount
        });
      });
    }
    
    return response;
  } catch (error) {
    console.error('[getCommunities] Erro ao buscar comunidades:', error);
    throw error as ApiError;
  }
}

