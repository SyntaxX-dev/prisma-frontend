import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getProfile } from '@/api/auth/get-profile';
import { env } from '@/lib/env';
import { CACHE_TAGS } from '@/lib/cache/invalidate-tags';

export function useGoogleAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const hasProcessed = useRef(false);
  const [tokenFromUrl, setTokenFromUrl] = useState<string | null>(null);

  useEffect(() => {
    if (hasProcessed.current) return;
    const token = searchParams.get('token');
    if (token && typeof window !== 'undefined') {
      window.localStorage.setItem('auth_token', token);
      setTokenFromUrl(token);
      hasProcessed.current = true;
    }
  }, [searchParams]);

  const { data: profile, isSuccess, isError } = useQuery({
    queryKey: [CACHE_TAGS.USER_PROFILE, 'google-oauth', tokenFromUrl],
    queryFn: () => getProfile(),
    enabled: !!tokenFromUrl,
    staleTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (isSuccess && profile && tokenFromUrl) {
      login(tokenFromUrl, profile, true);
      window.history.replaceState({}, document.title, '/dashboard');
      router.push('/dashboard');
    }
  }, [isSuccess, profile, tokenFromUrl, login, router]);

  useEffect(() => {
    if (isError) {
      router.push('/auth/login');
    }
  }, [isError, router]);

  const handleGoogleLogin = () => {
    hasProcessed.current = false;
    window.location.href = `${env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return {
    handleGoogleLogin
  };
}
