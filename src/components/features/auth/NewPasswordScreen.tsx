'use client'

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/validators/auth';
import { resetPassword } from '@/api/auth/reset-password';
import { PasswordResetService } from '@/lib/services/password-reset';
import { useNotifications } from '@/hooks/shared';



export function NewPasswordScreen() {
    const router = useRouter();
    const { showError, showSuccess } = useNotifications();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        try {
            setIsLoading(true);

            const email = PasswordResetService.getEmail();
            const code = PasswordResetService.getCode();

            if (!email || !code) {
                showError('Dados de reset não encontrados. Volte para a tela anterior.');
                router.push('/auth/reset-password/verify-code');
                return;
            }

            await resetPassword({
                email,
                code,
                newPassword: data.newPassword
            });

            PasswordResetService.clearData();
            showSuccess('Senha alterada com sucesso! Redirecionando para o login...');
            
            setTimeout(() => {
                router.push('/auth/login');
            }, 2000);
        } catch (error: any) {
            const errorMessage = error?.message || error?.details?.message || 'Erro ao alterar senha. Tente novamente.';
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
                                Defina sua<br />
                                <span className="relative inline-block">
                                    nova senha
                                    <svg className="absolute -bottom-1 md:-bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                                        <path d="M2 6C50 2 150 2 198 6" stroke="orange" strokeWidth="3" strokeLinecap="round"/>
                                    </svg>
                                </span>
                            </h1>
                            <p className="text-white/80 text-xs md:text-base leading-relaxed">
                                Escolha uma senha segura<br className="hidden md:block" />
                                e fácil de lembrar.
                            </p>
                            <div className="flex items-center gap-2 mt-4 text-white/90">
                                <Shield className="w-4 h-4 md:w-5 md:h-5" />
                                <span className="text-xs md:text-sm">Senha deve ter pelo menos 8 caracteres</span>
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
                            Nova Senha
                        </h2>
                        <p className="text-gray-400 mb-6 md:mb-8 text-sm md:text-base">
                            Defina uma nova senha para sua conta
                        </p>

                        <form 
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4 md:space-y-5"
                        >
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Nova senha"
                                    {...form.register('newPassword')}
                                    className={`w-full bg-[#29292E] border ${
                                        form.formState.errors.newPassword ? 'border-red-500' : 'border-[#323238]'
                                    } text-white placeholder-gray-400 rounded-xl h-12 md:h-14 pl-12 pr-12 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#bd18b4]/20 focus:border-[#bd18b4]`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#bd18b4] transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                                {form.formState.errors.newPassword && (
                                    <p className="text-red-400 text-xs mt-1 ml-1">
                                        {form.formState.errors.newPassword.message}
                                    </p>
                                )}
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirmar nova senha"
                                    {...form.register('confirmPassword')}
                                    className={`w-full bg-[#29292E] border ${
                                        form.formState.errors.confirmPassword ? 'border-red-500' : 'border-[#323238]'
                                    } text-white placeholder-gray-400 rounded-xl h-12 md:h-14 pl-12 pr-12 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#bd18b4]/20 focus:border-[#bd18b4]`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#bd18b4] transition-colors cursor-pointer"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                                {form.formState.errors.confirmPassword && (
                                    <p className="text-red-400 text-xs mt-1 ml-1">
                                        {form.formState.errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#bd18b4] hover:bg-[#aa22c5] text-black rounded-xl h-12 md:h-14 font-semibold transition-all shadow-lg shadow-[#a727a0]/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                            >
                                {isLoading ? 'Alterando senha...' : 'Alterar Senha'}
                            </button>

                            <div className="pt-4">
                                <button
                                    type="button"
                                    onClick={() => router.push('/auth/reset-password/verify-code')}
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
