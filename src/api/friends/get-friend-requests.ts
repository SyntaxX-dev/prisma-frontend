import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface FriendRequest {
  id: string;
  requesterId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  requester?: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
  receiver?: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
}

export interface FriendRequestItem {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterProfileImage?: string | null;
  receiverId: string;
  receiverName: string;
  receiverProfileImage?: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface GetFriendRequestsResponse {
  success: boolean;
  data: {
    requests: FriendRequestItem[];
  };
}

export interface GetFriendRequestsLegacyResponse {
  success: boolean;
  data: {
    sent: FriendRequest[];
    received: FriendRequest[];
  };
}

export async function getFriendRequests(type?: 'sent' | 'received'): Promise<GetFriendRequestsResponse> {
  try {
    const url = type ? `/friendships/requests?type=${type}` : '/friendships/requests';
    const response = await httpClient.get<any>(url);
    
    // Se data é um array direto (estrutura atual da API)
    if (Array.isArray(response.data)) {
      // Converter para FriendRequestItem[]
      const requests: FriendRequestItem[] = response.data.map((req: any) => ({
        id: req.id,
        requesterId: req.requesterId,
        requesterName: req.requesterName || 'Usuário',
        requesterProfileImage: req.requesterProfileImage || null,
        receiverId: req.receiverId,
        receiverName: req.receiverName || 'Usuário',
        receiverProfileImage: req.receiverProfileImage || null,
        status: req.status,
        createdAt: req.createdAt,
      }));
      
      return {
        success: true,
        data: {
          requests,
        },
      };
    }
    
    // Se a resposta tem a estrutura com requests
    if (response.data && response.data.requests && Array.isArray(response.data.requests)) {
      return {
        success: true,
        data: {
          requests: response.data.requests,
        },
      };
    }
    
    // Se a resposta tem a estrutura antiga com sent/received
    if (response.data && (response.data.sent || response.data.received)) {
      const allRequests: FriendRequestItem[] = [];
      
      // Converter sent para o formato novo
      if (Array.isArray(response.data.sent)) {
        response.data.sent.forEach((req: FriendRequest) => {
          allRequests.push({
            id: req.id,
            requesterId: req.requesterId,
            requesterName: req.requester?.name || 'Usuário',
            requesterProfileImage: req.requester?.profileImage || null,
            receiverId: req.receiverId,
            receiverName: req.receiver?.name || 'Usuário',
            receiverProfileImage: req.receiver?.profileImage || null,
            status: req.status,
            createdAt: req.createdAt,
          });
        });
      }
      
      // Converter received para o formato novo
      if (Array.isArray(response.data.received)) {
        response.data.received.forEach((req: FriendRequest) => {
          allRequests.push({
            id: req.id,
            requesterId: req.requesterId,
            requesterName: req.requester?.name || 'Usuário',
            requesterProfileImage: req.requester?.profileImage || null,
            receiverId: req.receiverId,
            receiverName: req.receiver?.name || 'Usuário',
            receiverProfileImage: req.receiver?.profileImage || null,
            status: req.status,
            createdAt: req.createdAt,
          });
        });
      }
      
      return {
        success: true,
        data: {
          requests: allRequests,
        },
      };
    }
    
    // Fallback: retornar estrutura vazia
    return {
      success: true,
      data: {
        requests: [],
      },
    };
  } catch (error) {
    throw error as ApiError;
  }
}

