import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

export function useGoogleAuth() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    // Extrair dados da URL de callback do Google OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const name = urlParams.get('name');
    const email = urlParams.get('email');

    if (token && name && email) {
      // Criar objeto do usuário com os dados do Google
      const user = {
        id: email, // Usar email como ID temporário
        name,
        email,
        age: 25, // Idade padrão para usuários Google
        educationLevel: 'GRADUACAO' as const, // Nível padrão
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Fazer login com os dados do Google
      login(token, user);

      // Limpar parâmetros da URL - manter apenas a rota limpa
      window.history.replaceState({}, document.title, '/dashboard');

      // Redirecionar para o dashboard
      router.push('/dashboard');

      console.log('Usuário logado via Google:', { name, email });
    }
  }, [login, router]);

  const handleGoogleLogin = () => {
    // Redirecionar para o endpoint de autenticação Google
    // O backend deve configurar o callback para: https://prisma-frontend-rose.vercel.app/auth/google/callback
    window.location.href = 'https://prisma-backend-production-4c22.up.railway.app/auth/google';
  };

  return {
    handleGoogleLogin
  };
}
