import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { getProfile } from '@/api/auth/get-profile';

// Estado global para controlar se o callback do Google já foi processado
let globalGoogleCallbackProcessed = false;

export function useGoogleAuth() {
  const router = useRouter();
  const { login } = useAuth();

  const handleGoogleCallback = useCallback(async () => {
    if (globalGoogleCallbackProcessed) return;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const name = urlParams.get('name');
    const email = urlParams.get('email');

    if (token && name && email) {
      globalGoogleCallbackProcessed = true;
      
      try {
        localStorage.setItem('auth_token', token);
        console.log('🔍 Google OAuth: Chamando auth/profile...');
        const userProfile = await getProfile();
        console.log('✅ Google OAuth: Profile recebido:', userProfile);
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
  }, [login, router]);

  useEffect(() => {
    handleGoogleCallback();
  }, [handleGoogleCallback]);

  const handleGoogleLogin = () => {
    globalGoogleCallbackProcessed = false; // Reset para permitir novo login
    window.location.href = 'https://prisma-backend-production-4c22.up.railway.app/auth/google';
  };

  return {
    handleGoogleLogin
  };
}
