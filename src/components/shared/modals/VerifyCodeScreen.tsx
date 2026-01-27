'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyResetCodeSchema, VerifyResetCodeFormData } from '@/lib/validators/auth';
import { verifyResetCode } from '@/api/auth/verify-reset-code';
import { PasswordResetService } from '@/lib/services/password-reset';
import { useNotifications } from '@/hooks/shared';
import { useResendPasswordResetCode } from '@/hooks/features/auth/useResendPasswordResetCode';



export function VerifyCodeScreen() {
    const router = useRouter();
    const { showError, showSuccess } = useNotifications();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState<string | null>(null);

    const {
        resendCode,
        isLoading: isResending,
        error: resendError,
        rateLimitActive,
        retryAfter,
        countdown,
    } = useResendPasswordResetCode();

    const form = useForm<VerifyResetCodeFormData>({
        resolver: zodResolver(verifyResetCodeSchema),
        defaultValues: {
            code: '',
        },
    });

    // Obter email do localStorage ao montar o componente
    useEffect(() => {
        const savedEmail = PasswordResetService.getEmail();
        if (savedEmail) {
            setEmail(savedEmail);
        }
    }, []);

    // Mostrar erro de reenvio se houver
    useEffect(() => {
        if (resendError) {
            showError(resendError);
        }
    }, [resendError, showError]);

    const onSubmit = async (data: VerifyResetCodeFormData) => {
        try {
            setIsLoading(true);

            const email = PasswordResetService.getEmail();
            if (!email) {
                showError('Email não encontrado. Volte para a tela anterior.');
                router.push('/auth/forgot-password');
                return;
            }

            const response = await verifyResetCode({
                email,
                code: data.code
            });

            // A API retorna { message: string, valid: boolean }
            if (response.valid === true) {
                PasswordResetService.saveCode(data.code);
                showSuccess('Código verificado com sucesso! Redirecionando...');
                setTimeout(() => {
                    router.push('/auth/reset-password/new-password');
                }, 1000);
            } else {
                throw new Error('Código inválido');
            }
        } catch (error: any) {
            const errorMessage = error?.message || error?.details?.message || 'Código inválido. Verifique e tente novamente.';
            showError(errorMessage);
        } finally {
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
                                Verificação de<br />
                                código de<br />
                                <span className="relative inline-block">
                                    segurança
                                    <svg className="absolute -bottom-1 md:-bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                                        <path d="M2 6C50 2 150 2 198 6" stroke="orange" strokeWidth="3" strokeLinecap="round"/>
                                    </svg>
                                </span>
                            </h1>
                            <p className="text-white/80 text-xs md:text-base leading-relaxed">
                                Digite o código de 6 dígitos<br className="hidden md:block" />
                                enviado para seu email.
                            </p>
                            <div className="flex items-center gap-2 mt-4 text-white/90">
                                <Clock className="w-4 h-4 md:w-5 md:h-5" />
                                <span className="text-xs md:text-sm">Código válido por 15 minutos</span>
                            </div>
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
                            Verificar Código
                        </h2>
                        <p className="text-gray-400 mb-6 md:mb-8 text-sm md:text-base">
                            Digite o código de 6 dígitos enviado para seu email
                        </p>

                        <form 
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4 md:space-y-5"
                        >
                            <div className="relative">
                                <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="000000"
                                    maxLength={6}
                                    {...form.register('code')}
                                    className={`w-full bg-[#29292E] border ${
                                        form.formState.errors.code ? 'border-red-500' : 'border-[#323238]'
                                    } text-white placeholder-gray-400 rounded-xl h-12 md:h-14 pl-12 pr-4 text-center text-2xl md:text-3xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#bd18b4]/20 focus:border-[#bd18b4]`}
                                />
                                {form.formState.errors.code && (
                                    <p className="text-red-400 text-xs mt-1 ml-1">
                                        {form.formState.errors.code.message}
                                    </p>
                                )}
                            </div>

                            <div className="text-center">
                                <p className="text-gray-400 text-xs md:text-sm mb-2">
                                    Não recebeu o código?
                                </p>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!email) {
                                            showError('Email não encontrado. Volte para a tela anterior.');
                                            router.push('/auth/forgot-password');
                                            return;
                                        }

                                        try {
                                            await resendCode(email);
                                            showSuccess('Código reenviado com sucesso! Verifique seu email.');
                                        } catch (error: any) {
                                            // Erro já é tratado pelo hook e mostrado via useEffect
                                        }
                                    }}
                                    disabled={isResending || countdown > 0 || rateLimitActive}
                                    className={`text-[#bd18b4] hover:underline font-medium transition-colors text-sm ${
                                        isResending || countdown > 0 || rateLimitActive
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'cursor-pointer'
                                    }`}
                                >
                                    {isResending && 'Enviando...'}
                                    {!isResending && countdown > 0 && (
                                        `Aguarde ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`
                                    )}
                                    {!isResending && countdown === 0 && rateLimitActive && retryAfter && (
                                        `Aguarde ${Math.ceil(retryAfter / 60)}min`
                                    )}
                                    {!isResending && countdown === 0 && !rateLimitActive && 'Reenviar código'}
                                </button>
                                {rateLimitActive && retryAfter && (
                                    <p className="text-yellow-400 text-xs mt-2">
                                        ⚠️ Muitas tentativas. Aguarde {Math.ceil(retryAfter / 60)} minutos antes de tentar novamente.
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#bd18b4] hover:bg-[#aa22c5] text-black rounded-xl h-12 md:h-14 font-semibold transition-all shadow-lg shadow-[#a727a0]/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                            >
                                {isLoading ? 'Verificando...' : 'Verificar Código'}
                            </button>

                            <div className="pt-4">
                                <button
                                    type="button"
                                    onClick={() => router.push('/auth/forgot-password')}
                                    className="w-full bg-transparent border-2 border-[#323238] text-gray-400 hover:border-[#bd18b4] hover:text-[#bd18b4] rounded-xl h-12 md:h-14 font-semibold transition-all cursor-pointer text-sm md:text-base flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Voltar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
} 
