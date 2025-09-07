import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

export function useGoogleAuth() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const name = urlParams.get('name');
    const email = urlParams.get('email');

    if (token && name && email) {

      const user = {
        id: email,
        name,
        nome: name, // Adicionado para corresponder à interface UserProfile
        email,
        age: 25,
        educationLevel: 'GRADUACAO' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      login(token, user, true);

      window.history.replaceState({}, document.title, '/dashboard');

      router.push('/dashboard');

      console.log('Usuário logado via Google:', { name, email });
    }
  }, [login, router]);

  const handleGoogleLogin = () => {
  
    window.location.href = 'https://prisma-backend-production-4c22.up.railway.app/auth/google';
  };

  return {
    handleGoogleLogin
  };
}
