'use client'

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { requestPasswordResetSchema, RequestPasswordResetFormData } from '@/lib/validators/auth';
import { requestPasswordReset } from '@/api/auth/request-password-reset';
import { PasswordResetService } from '@/lib/services/password-reset';
import { useNotifications } from '@/hooks/shared';

export function ForgotPasswordScreen() {
    const router = useRouter();
    const { showError, showSuccess } = useNotifications();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RequestPasswordResetFormData>({
        resolver: zodResolver(requestPasswordResetSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = async (data: RequestPasswordResetFormData) => {
        try {
            setIsLoading(true);

            const response = await requestPasswordReset(data);

            PasswordResetService.saveEmail(data.email);
            showSuccess('Email enviado com sucesso!');
            
            // Redirecionar para tela de verificar código
            // Usar window.location.href para garantir redirecionamento
            window.location.href = '/auth/reset-password/verify-code';
        } catch (error: any) {
            const errorMessage = error?.message || error?.details?.message || 'Erro ao enviar email. Tente novamente.';
            showError(errorMessage);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1b1e] flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-7xl bg-[#202024] rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
                {/* Painel Esquerdo - Squircle Roxo */}
                <div className="w-full md:w-1/2 p-6 md:p-16 flex items-center justify-center">
                    <div 
                        className="w-full h-[400px] md:h-[600px] bg-gradient-to-br from-[#aa22c5] to-[#a727a0] flex flex-col justify-between p-6 md:p-12 relative overflow-hidden shadow-xl"
                        style={{
                            borderRadius: '40px',
                        }}
                    >
                        {/* Texto Superior */}
                        <div className="text-white z-10">
                            <h1 className="text-2xl md:text-5xl font-bold mb-2 md:mb-4 leading-tight">
                                Esqueceu a<br />
                                senha?<br />
                                <span className="relative inline-block">
                                    Não se preocupe!
                                    <svg className="absolute -bottom-1 md:-bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                                        <path d="M2 6C50 2 150 2 198 6" stroke="orange" strokeWidth="3" strokeLinecap="round"/>
                                    </svg>
                                </span>
                            </h1>
                            <p className="text-white/80 text-xs md:text-base leading-relaxed">
                                Digite seu email e enviaremos<br className="hidden md:block" />
                                instruções para redefinir sua senha.
                            </p>
                        </div>

                        {/* Personagens na parte inferior */}
                        <div className="flex justify-center items-end z-10">
                            <Image
                                src="/humans.png"
                                alt="Personagens"
                                width={500}
                                height={400}
                                className="object-contain w-[250px] h-[200px] md:w-[500px] md:h-[400px]"
                                priority
                            />
                        </div>

                        {/* Gradiente de fundo decorativo */}
                        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#aa22c5]/30 to-transparent"></div>
                    </div>
                </div>

                {/* Painel Direito - Formulário */}
                <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center">
                    <div className="w-full max-w-md mx-auto">
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-6 md:mb-8">
                            <Image
                                src="/logo-prisma.svg"
                                alt="Prisma Logo"
                                width={40}
                                height={40}
                                className="object-contain w-8 h-8 md:w-10 md:h-10"
                                priority
                            />
                            <span className="text-xl md:text-2xl font-bold text-white">Prisma</span>
                        </div>

                        <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
                            Redefinir Senha
                        </h2>
                        <p className="text-gray-400 mb-6 md:mb-8 text-sm md:text-base">
                            Digite seu email e enviaremos instruções para redefinir sua senha
                        </p>

                        <form 
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4 md:space-y-5"
                        >
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="Digite seu email"
                                    {...form.register('email')}
                                    className={`w-full bg-[#29292E] border ${
                                        form.formState.errors.email ? 'border-red-500' : 'border-[#323238]'
                                    } text-white placeholder-gray-400 rounded-xl h-12 md:h-14 pl-12 pr-4 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#bd18b4]/20 focus:border-[#bd18b4]`}
                                />
                                {form.formState.errors.email && (
                                    <p className="text-red-400 text-xs mt-1 ml-1">
                                        {form.formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#bd18b4] hover:bg-[#aa22c5] text-black rounded-xl h-12 md:h-14 font-semibold transition-all shadow-lg shadow-[#a727a0]/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                            >
                                {isLoading ? 'Enviando...' : 'Enviar Email'}
                            </button>

                            <div className="text-center">
                                <p className="text-gray-400 text-xs md:text-sm">
                                    Lembrou sua senha?{' '}
                                    <button
                                        type="button"
                                        onClick={() => router.push('/auth/login')}
                                        className="text-[#bd18b4] hover:underline font-medium transition-colors cursor-pointer"
                                    >
                                        Faça login aqui
                                    </button>
                                </p>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="button"
                                    onClick={() => router.push('/auth/login')}
                                    className="w-full bg-transparent border-2 border-[#323238] text-gray-400 hover:border-[#bd18b4] hover:text-[#bd18b4] rounded-xl h-12 md:h-14 font-semibold transition-all cursor-pointer text-sm md:text-base flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Voltar ao Login
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
} 
