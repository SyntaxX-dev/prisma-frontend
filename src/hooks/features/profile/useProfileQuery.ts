"use client";

import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/api/auth/get-profile';
import { UserProfile } from '@/types/auth-api';
import { CACHE_TAGS } from '@/lib/cache/invalidate-tags';

export function useProfileQuery() {
  return useQuery({
    queryKey: [CACHE_TAGS.USER_PROFILE],
    queryFn: async (): Promise<UserProfile> => {
      const profile = await getProfile();
      return profile;
    },
    enabled: true,
    staleTime: 0, // Sempre permitir refetch
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Permitir refetch ao montar
  });
}
