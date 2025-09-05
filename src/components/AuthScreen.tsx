'use client'

import { useState } from 'react';
import Image from 'next/image';
import Logo from '../../public/logo-prisma.png';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Eye, EyeOff, User, Mail, Lock, ArrowLeftRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './AuthScreen.module.css';
import spotlightStyles from './spotlight.module.css';
import Link from 'next/link';
import {
  loginSchema,
  registerSchema,
  LoginFormData,
  RegisterFormData
} from '@/lib/validators/auth-forms';
import { EducationLevel, educationLevelEnToPt } from '@/types/education';
import { EDUCATION_OPTIONS } from '@/lib/constants';
import { EducationLevel as ApiEducationLevel } from '@/types/auth-api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { loginUser } from '@/api/auth/login';
import { registerUser } from '@/api/auth/register';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';



export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: 18,
      educationLevel: EducationLevel.UNDERGRADUATE,
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const response = await loginUser(data);

      login(response.token, response.user);

      toast.success('Login realizado com sucesso!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);

      const apiData = {
        ...data,
        educationLevel: educationLevelEnToPt[data.educationLevel] as ApiEducationLevel
      };

      const response = await registerUser(apiData);

      login(response.token, response.user);

      toast.success('Conta criada com sucesso!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Erro no registro:', error);
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleForm = () => {
    setIsLogin(!isLogin);
    if (isLogin) {
      registerForm.reset();
    } else {
      loginForm.reset();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-4xl"
      >
        <Card
          className={`${styles['glass-card']} ${spotlightStyles['spotlight-card']}`}
          onMouseMove={handleMouseMove}
          style={{
            transform: `perspective(1000px) rotateX(${(mousePosition.y - 250) * 0.01}deg) rotateY(${(mousePosition.x - 400) * 0.01}deg)`,
          }}
        >
          <div
            className={spotlightStyles.spotlight}
            style={{
              '--mouse-x': `${mousePosition.x}px`,
              '--mouse-y': `${mousePosition.y}px`,
            } as React.CSSProperties}
          />

          <div className="flex min-h-[500px] relative">
            <div className="absolute left-[45%] top-0 bottom-0 w-px bg-[#B3E240]/30 z-10" />

            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="flex-1 p-8 flex flex-col justify-center items-center text-center relative z-10"
                >
                  <div className="inline-flex items-center justify-center w-40 h-40 mb-6">
                    <Image
                      src={Logo}
                      alt="Logo"
                      width={200}
                      height={200}
                      className="w-56 h-56 object-contain rounded-full"
                      priority
                    />
                  </div>
                  <h2 className="text-3xl font-bold text-[#B3E240] mb-4" style={{ fontFamily: 'monospace' }}>
                    BEM VINDO
                  </h2>
                  <h3 className="text-xl text-white mb-6">Novo Login</h3>
                  <p className="text-gray-400 text-sm mb-8">
                    Plataforma de estudos
                  </p>
                  <Button
                    onClick={handleToggleForm}
                    className="bg-transparent cursor-pointer border-2 border-[#B3E240] text-[#B3E240] hover:bg-[#B3E240] hover:text-black transition-all duration-300 px-8 py-2 rounded-lg"
                  >
                    Criar Conta
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="register-welcome"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="flex-1 p-8 flex flex-col justify-center items-center text-center relative z-10"
                >
                  <div className="inline-flex items-center justify-center w-40 h-40 mb-6">
                    <Image
                      src={Logo}
                      alt="Logo"
                      width={100}
                      height={100}
                      className="w-56 h-56 object-contain rounded-full"
                      priority
                    />
                  </div>
                  <h2 className="text-3xl font-bold text-[#B3E240] mb-4" style={{ fontFamily: 'monospace' }}>
                    Prisma Academy
                  </h2>
                  <h3 className="text-xl text-white mb-6">Sistema Neural</h3>
                  <p className="text-gray-400 text-sm mb-8">
                    Já possui uma conta?
                  </p>
                  <Button
                    onClick={handleToggleForm}
                    className="bg-transparent cursor-pointer border-2 border-[#B3E240] text-[#B3E240] hover:bg-[#B3E240] hover:text-black transition-all duration-300 px-8 py-2 rounded-lg"
                  >
                    Fazer Login
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-center absolute left-[45%] top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <motion.button
                onClick={handleToggleForm}
                className="bg-[#B3E240] text-black p-4 rounded-full shadow-[0_0_30px_rgba(179,226,64,0.4)] border-4 border-white/20 flex items-center justify-center w-16 h-16 cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  boxShadow: ['0 0 20px rgba(179,226,64,0.4)', '0 0 40px rgba(179,226,64,0.6)', '0 0 20px rgba(179,226,64,0.4)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="">
                    <ArrowLeftRight className="w-6 h-6" />
                  </div>
                </div>
              </motion.button>
            </div>

            <div className="flex-1 p-8 flex flex-col justify-center relative z-10">
              <div className="max-w-sm mx-auto w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isLogin ? 'login-form' : 'register-form'}
                    initial={{ opacity: 0, x: isLogin ? 50 : -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isLogin ? -50 : 50 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-2xl font-bold text-[#B3E240] mb-8 text-center" style={{ fontFamily: 'monospace' }}>
                      {isLogin ? 'FAÇA LOGIN' : 'CRIAR CONTA'}
                    </h2>

                    {isLogin ? (
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B3E240]" />
                          <Input
                            type="email"
                            placeholder="USUÁRIO"
                            {...loginForm.register('email')}
                            className={`pl-10 bg-white/10 backdrop-blur-sm border-[#B3E240]/30 text-white placeholder-gray-300 focus:border-[#B3E240] focus:ring-[#B3E240]/20 focus:shadow-[0_0_20px_rgba(179,226,64,0.2)] rounded-lg ${loginForm.formState.errors.email ? 'border-red-500' : ''
                              }`}
                          />
                          {loginForm.formState.errors.email && (
                            <p className="text-red-400 text-xs mt-1 ml-1">
                              {loginForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B3E240]" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...loginForm.register('password')}
                            className={`pl-10 pr-10 bg-white/10 backdrop-blur-sm border-[#B3E240]/30 text-white placeholder-gray-300 focus:border-[#B3E240] focus:ring-[#B3E240]/20 focus:shadow-[0_0_20px_rgba(179,226,64,0.2)] rounded-lg ${loginForm.formState.errors.password ? 'border-red-500' : ''
                              }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#B3E240] transition-colors cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                          {loginForm.formState.errors.password && (
                            <p className="text-red-400 text-xs mt-1 ml-1">
                              {loginForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <label className="flex items-center text-gray-400 hover:text-[#B3E240] transition-colors cursor-pointer group">
                            <div className="relative">
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                              />
                              <div className={`w-5 h-5 border-2 rounded-md transition-all duration-200 group-hover:border-[#B3E240]/60 flex items-center justify-center ${rememberMe
                                ? 'bg-[#B3E240] border-[#B3E240]'
                                : 'border-[#B3E240]/30'
                                }`}>
                                {rememberMe && (
                                  <svg
                                    className="w-3 h-3 text-black transition-opacity duration-200"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <span className="ml-3 font-medium">Lembrar</span>
                          </label>
                          <Link
                            href="/forgot-password"
                            className="text-gray-400 hover:text-[#B3E240] transition-colors cursor-pointer font-medium hover:underline"
                          >
                            <motion.span whileHover={{ scale: 1.05 }}>
                              Esqueceu senha?
                            </motion.span>
                          </Link>
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#B3E240] hover:bg-[#B3E240]/90 text-black py-3 shadow-[0_0_30px_rgba(179,226,64,0.3)] border border-[#B3E240] transition-all duration-300 hover:shadow-[0_0_40px_rgba(179,226,64,0.4)] rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <motion.span
                              initial={false}
                              animate={{
                                textShadow: ['0 0 0px rgba(0,0,0,0)', '0 0 10px rgba(0,0,0,0.3)', '0 0 0px rgba(0,0,0,0)'],
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {isLoading ? 'Entrando...' : 'Entrar'}
                            </motion.span>
                          </Button>
                        </motion.div>
                      </form>
                    ) : (
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="relative"
                        >
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B3E240]" />
                          <Input
                            type="text"
                            placeholder="Nome completo"
                            {...registerForm.register('name')}
                            className={`pl-10 bg-white/10 backdrop-blur-sm border-[#B3E240]/30 text-white placeholder-gray-400 focus:border-[#B3E240] focus:ring-[#B3E240]/20 focus:shadow-[0_0_20px_rgba(179,226,64,0.2)] rounded-lg ${registerForm.formState.errors.name ? 'border-red-500' : ''
                              }`}
                          />
                          {registerForm.formState.errors.name && (
                            <p className="text-red-400 text-xs mt-1 ml-1">
                              {registerForm.formState.errors.name.message}
                            </p>
                          )}
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="relative"
                        >
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B3E240]" />
                          <Input
                            type="number"
                            placeholder="Idade"
                            min="0"
                            max="120"
                            {...registerForm.register('age', { valueAsNumber: true })}
                            className={`pl-10 bg-white/10 backdrop-blur-sm border-[#B3E240]/30 text-white placeholder-gray-400 focus:border-[#B3E240] focus:ring-[#B3E240]/20 focus:shadow-[0_0_20px_rgba(179,226,64,0.2)] rounded-lg ${registerForm.formState.errors.age ? 'border-red-500' : ''
                              }`}
                          />
                          {registerForm.formState.errors.age && (
                            <p className="text-red-400 text-xs mt-1 ml-1">
                              {registerForm.formState.errors.age.message}
                            </p>
                          )}
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="relative"
                        >
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B3E240]" />
                          <Select
                            value={registerForm.watch('educationLevel')}
                            onValueChange={(value) => registerForm.setValue('educationLevel', value as EducationLevel)}
                          >
                            <SelectTrigger className="pl-10 bg-white/10 backdrop-blur-sm border-[#B3E240]/30 text-white placeholder-gray-300 focus:border-[#B3E240] focus:ring-[#B3E240]/20 focus:shadow-[0_0_20px_rgba(179,226,64,0.2)] rounded-lg">
                              <SelectValue placeholder="Nível de educação" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-[#B3E240]/30 text-white">
                              {EDUCATION_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="text-white hover:bg-[#B3E240]/20">
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {registerForm.formState.errors.educationLevel && (
                            <p className="text-red-400 text-xs mt-1 ml-1">
                              {registerForm.formState.errors.educationLevel.message}
                            </p>
                          )}
                        </motion.div>

                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B3E240]" />
                          <Input
                            type="email"
                            placeholder="USUÁRIO"
                            {...registerForm.register('email')}
                            className={`pl-10 bg-white/10 backdrop-blur-sm border-[#B3E240]/30 text-white placeholder-gray-300 focus:border-[#B3E240] focus:ring-[#B3E240]/20 focus:shadow-[0_0_20px_rgba(179,226,64,0.2)] rounded-lg ${registerForm.formState.errors.email ? 'border-red-500' : ''
                              }`}
                          />
                          {registerForm.formState.errors.email && (
                            <p className="text-red-400 text-xs mt-1 ml-1">
                              {registerForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B3E240]" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...registerForm.register('password')}
                            className={`pl-10 pr-10 bg-white/10 backdrop-blur-sm border-[#B3E240]/30 text-white placeholder-gray-300 focus:border-[#B3E240] focus:ring-[#B3E240]/20 focus:shadow-[0_0_20px_rgba(179,226,64,0.2)] rounded-lg ${registerForm.formState.errors.password ? 'border-red-500' : ''
                              }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#B3E240] transition-colors cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                          {registerForm.formState.errors.password && (
                            <p className="text-red-400 text-xs mt-1 ml-1">
                              {registerForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>

                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="relative"
                        >
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B3E240]" />
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirmar senha"
                            {...registerForm.register('confirmPassword')}
                            className={`pl-10 pr-10 bg-white/10 backdrop-blur-sm border-[#B3E240]/30 text-white placeholder-gray-400 focus:border-[#B3E240] focus:ring-[#B3E240]/20 focus:shadow-[0_0_20px_rgba(179,226,64,0.2)] rounded-lg ${registerForm.formState.errors.confirmPassword ? 'border-red-500' : ''
                              }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#B3E240] transition-colors cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                          {registerForm.formState.errors.confirmPassword && (
                            <p className="text-red-400 text-xs mt-1 ml-1">
                              {registerForm.formState.errors.confirmPassword.message}
                            </p>
                          )}
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#B3E240] hover:bg-[#B3E240]/90 text-black py-3 shadow-[0_0_30px_rgba(179,226,64,0.3)] border border-[#B3E240] transition-all duration-300 hover:shadow-[0_0_40px_rgba(179,226,64,0.4)] rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <motion.span
                              initial={false}
                              animate={{
                                textShadow: ['0 0 0px rgba(0,0,0,0)', '0 0 10px rgba(0,0,0,0.3)', '0 0 0px rgba(0,0,0,0)'],
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {isLoading ? 'Criando conta...' : 'CRIAR CONTA'}
                            </motion.span>
                          </Button>
                        </motion.div>
                      </form>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Card>

        <motion.div
          className="absolute -top-10 -right-10 w-20 h-20 border border-[#B3E240]/20 rounded-full"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute -bottom-10 -left-10 w-16 h-16 border border-[#B3E240]/20"
          animate={{
            rotate: [0, -360],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
          }}
          style={{
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          }}
        />
      </motion.div>
    </div>
  );
}
