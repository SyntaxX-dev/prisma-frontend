import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { getProfile } from '@/api/auth/get-profile';

export function useGoogleAuth() {
  const router = useRouter();
  const { login } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;

    const handleGoogleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const name = urlParams.get('name');
      const email = urlParams.get('email');

      if (token && name && email) {
        hasProcessed.current = true;
        
        try {
          localStorage.setItem('auth_token', token);
          const userProfile = await getProfile();
          login(token, userProfile, true);

          window.history.replaceState({}, document.title, '/dashboard');
          router.push('/dashboard');
        } catch {
          const user = {
            id: email,
            name,
            nome: name,
            email,
            age: 25,
            educationLevel: 'GRADUACAO' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          login(token, user, true);
          window.history.replaceState({}, document.title, '/dashboard');
          router.push('/dashboard');
        }
      }
    };

    handleGoogleCallback();
  }, [login, router]);

  const handleGoogleLogin = () => {
    hasProcessed.current = false;
    window.location.href = 'https://prisma-backend-production-4c22.up.railway.app/auth/google';
  };

  return {
    handleGoogleLogin
  };
}
