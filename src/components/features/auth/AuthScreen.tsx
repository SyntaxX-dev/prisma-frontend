'use client'

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { loginUser } from '@/api/auth/login';
import { registerUser } from '@/api/auth/register';
import { getProfile } from '@/api/auth/get-profile';
import { useAuth } from '@/hooks/features/auth';
import { useNotifications } from '@/hooks/shared';

function AuthScreenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { showError, showSuccess } = useNotifications();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    educationLevel: 'GRADUACAO',
  });

  const handleLoginSubmit = async () => {
    if (!loginForm.email || !loginForm.password) {
      showError('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginUser({
        email: loginForm.email,
        password: loginForm.password,
      });

      // A API retorna accessToken, não token
      const token = (response as any).accessToken || response.token;
      
      if (!token) {
        throw new Error('Token não recebido da API');
      }

      // Salvar o token no localStorage ANTES de chamar getProfile
      // porque o httpClient precisa do token para fazer a requisição
      localStorage.setItem('auth_token', token);

      // Obter o perfil do usuário (agora com o token salvo)
      const userProfile = await getProfile();

      // Fazer login usando o hook useAuth
      login(token, userProfile, false);

      // Redirecionar para a página original ou dashboard
      const redirectTo = searchParams.get('redirect_to') || '/dashboard';
      router.push(redirectTo);
    } catch (error: any) {
      let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.details?.message) {
        errorMessage = error.details.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async () => {
    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.confirmPassword || !registerForm.age) {
      showError('Por favor, preencha todos os campos');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      showError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerUser({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        confirmPassword: registerForm.confirmPassword,
        age: parseInt(registerForm.age),
        educationLevel: registerForm.educationLevel as 'GRADUACAO' | 'MESTRADO' | 'DOUTORADO' | 'FUNDAMENTAL' | 'ENSINO_MEDIO' | 'POS_GRADUACAO',
      });

      // A API retorna accessToken, não token
      const token = (response as any).accessToken || response.token;
      
      if (!token) {
        throw new Error('Token não recebido da API');
      }

      // Salvar o token no localStorage ANTES de chamar getProfile
      // porque o httpClient precisa do token para fazer a requisição
      localStorage.setItem('auth_token', token);

      // Obter o perfil do usuário (agora com o token salvo)
      const userProfile = await getProfile();

      // Fazer login usando o hook useAuth
      login(token, userProfile, false);

      showSuccess('Conta criada com sucesso!');
      
      // Redirecionar para o dashboard
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.details?.message) {
        errorMessage = error.details.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1b1e] flex items-center justify-center p-8">
      <div className="w-full max-w-7xl bg-[#202024] rounded-3xl shadow-2xl overflow-hidden flex relative">
        {/* Painel Esquerdo - Squircle Verde */}
        <div className="w-1/2 p-16 flex items-center justify-center">
          <div 
            className="w-full h-[600px] bg-gradient-to-br from-[#aa22c5] to-[#a727a0] flex flex-col justify-between p-12 relative overflow-hidden shadow-xl"
            style={{
              borderRadius: '60px',
            }}
          >
            {/* Texto Superior */}
            <div className="text-white z-10">
              <h1 className="text-5xl font-bold mb-4 leading-tight">
                Transforme seu<br />
                aprendizado com nossa<br />
                <span className="relative inline-block">
                  plataforma.
                  <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                    <path d="M2 6C50 2 150 2 198 6" stroke="orange" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              <p className="text-white/80 text-base leading-relaxed">
                Videoaulas organizadas e curadas para acelerar<br />
                seus estudos e alcançar seus objetivos de forma eficiente.
              </p>
            </div>

            {/* Personagens na parte inferior */}
            <div className="flex justify-center items-end z-10">
              <Image
                src="/humans.png"
                alt="Personagens"
                width={500}
                height={400}
                className="object-contain"
                priority
              />
            </div>

            {/* Gradiente de fundo decorativo */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#aa22c5]/30 to-transparent"></div>
          </div>
        </div>

        {/* Painel Direito - Formulário */}
        <div className="w-1/2 p-16 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <Image
                src="/logo-prisma.svg"
                alt="Prisma Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
              <span className="text-2xl font-bold text-white">Prisma</span>
            </div>

            <h2 className="text-4xl font-bold text-white mb-2">Bem-vindo de volta</h2>
            <p className="text-gray-400 mb-8">Por favor, faça login na sua conta</p>

            {isLogin ? (
              <form 
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLoginSubmit();
                }}
              >
                <div>
                  <input
                    type="email"
                    placeholder="Endereço de email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full bg-[#29292E] border border-[#323238] text-white placeholder-gray-400 rounded-xl h-14 px-5 focus:outline-none focus:ring-2 focus:ring-[#bd18b4]/20 focus:border-[#bd18b4]"
                    required
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Senha"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full bg-[#29292E] border border-[#323238] text-white placeholder-gray-400 rounded-xl h-14 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-[#bd18b4]/20 focus:border-[#bd18b4]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-gray-400 hover:text-[#bd18b4] transition-colors cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#bd18b4] hover:bg-[#aa22c5] text-black rounded-xl h-14 font-semibold transition-all shadow-lg shadow-[#a727a0]/25 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Entrando...' : 'Login'}
                </button>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#202024] text-gray-400">Ou faça login com</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="border border-[#323238] text-gray-300 hover:bg-[#29292E] rounded-xl h-14 font-medium flex items-center justify-center gap-3 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>

                  <button
                    type="button"
                    className="border border-[#323238] text-gray-300 hover:bg-[#29292E] rounded-xl h-14 font-medium flex items-center justify-center gap-3 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </button>
                </div>

                <div className="text-center text-sm text-gray-500 mt-6">
                  Não tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-[#c532e2] font-semibold hover:underline cursor-pointer"
                  >
                    Cadastre-se
                  </button>
                </div>
              </form>
            ) : (
              <form 
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRegisterSubmit();
                }}
              >
                <div>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="w-full bg-[#29292E] border border-[#323238] text-white placeholder-gray-400 rounded-xl h-14 px-5 focus:outline-none focus:ring-2 focus:ring-[#bd18b4]/20 focus:border-[#bd18b4]"
                  />
                </div>

                <div>
                  <input
                    type="number"
                    placeholder="Idade"
                    value={registerForm.age}
                    onChange={(e) => setRegisterForm({ ...registerForm, age: e.target.value })}
                    className="w-full bg-[#29292E] border border-[#323238] text-white placeholder-gray-400 rounded-xl h-14 px-5 focus:outline-none focus:ring-2 focus:ring-[#bd18b4]/20 focus:border-[#bd18b4]"
                  />
                </div>

                <div>
                  <select
                    value={registerForm.educationLevel}
                    onChange={(e) => setRegisterForm({ ...registerForm, educationLevel: e.target.value })}
                    className="w-full bg-[#29292E] border border-[#323238] text-white rounded-xl h-14 px-5 focus:outline-none focus:ring-2 focus:ring-[#bd18b4]/20 focus:border-[#bd18b4] cursor-pointer"
                  >
                    <option value="GRADUACAO">Graduação</option>
                    <option value="MESTRADO">Mestrado</option>
                    <option value="DOUTORADO">Doutorado</option>
                  </select>
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Endereço de email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full bg-[#29292E] border border-[#323238] text-white placeholder-gray-400 rounded-xl h-14 px-5 focus:outline-none focus:ring-2 focus:ring-[#bd18b4]/20 focus:border-[#bd18b4]"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Senha"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full bg-[#29292E] border border-[#323238] text-white placeholder-gray-400 rounded-xl h-14 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-[#bd18b4]/20 focus:border-[#bd18b4]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirmar senha"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    className="w-full bg-[#29292E] border border-[#323238] text-white placeholder-gray-400 rounded-xl h-14 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-[#bd18b4]/20 focus:border-[#bd18b4]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#b822c5] hover:bg-[#b822c5dc] text-black rounded-xl h-14 font-semibold transition-all shadow-lg shadow-[#b822c5]/25 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Criando conta...' : 'Criar Conta'}
                </button>

                <div className="text-center text-sm text-gray-500 mt-6">
                  Já tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-[#b822c5] font-semibold hover:underline cursor-pointer"
                  >
                    Faça login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthScreen() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1a1b1e] flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    }>
      <AuthScreenContent />
    </Suspense>
  );
}
