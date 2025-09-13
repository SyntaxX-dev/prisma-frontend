import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { getProfile } from '@/api/auth/get-profile';

export function useGoogleAuth() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const name = urlParams.get('name');
      const email = urlParams.get('email');

      if (token && name && email) {
        try {
          // Primeiro salvar o token no localStorage
          localStorage.setItem('auth_token', token);
          
          // Depois chamar o endpoint auth/profile
          const userProfile = await getProfile();

          // Por último, atualizar o estado do useAuth
          login(token, userProfile, true);

          window.history.replaceState({}, document.title, '/dashboard');

          router.push('/dashboard');

          console.log('Usuário logado via Google:', { name, email });
        } catch (error) {
          console.error('Erro ao obter perfil do usuário:', error);
          // Fallback para dados básicos se o profile falhar
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
  
    window.location.href = 'https://prisma-backend-production-4c22.up.railway.app/auth/google';
  };

  return {
    handleGoogleLogin
  };
}
