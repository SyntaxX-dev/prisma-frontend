import { httpClient } from '../http/client';
import { ApiError } from '../http/client';
import { UserProfile } from '../../types/auth-api';
import { CacheInvalidation } from '@/lib/cache/invalidate-tags';

export interface UpdateProfileRequest {
  name?: string;
  age?: number;
  educationLevel?: string;
  userFocus?: string;
  profileImage?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  aboutYou?: string;
  habilities?: string;
  momentCareer?: string;
  location?: string;
  contestType?: string;
  collegeCourse?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  badge?: string;
  hasNotification: boolean;
  missingFields: string[];
  profileCompletionPercentage: number;
  completedFields: string[];
  data?: UserProfile;
}

/**
 * Atualiza o perfil e invalida o cache automaticamente
 * Esta função deve ser usada quando você tem acesso ao queryClient
 */
export async function updateProfileWithCache(
  data: UpdateProfileRequest,
  queryClient: any // QueryClient do TanStack Query
): Promise<UpdateProfileResponse> {
  try {
    // 1. Atualiza dados no backend
    const response = await httpClient.put<UpdateProfileResponse>('/profile', data);
    
    // 2. Invalida cache do perfil automaticamente
    await CacheInvalidation.invalidateProfile(queryClient);
    
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}

/**
 * Atualiza o perfil sem invalidação de cache
 * Use esta função quando a invalidação será feita manualmente
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  try {
    const response = await httpClient.put<UpdateProfileResponse>('/profile', data);
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}
