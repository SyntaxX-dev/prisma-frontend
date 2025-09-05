'use client'

import { useState } from 'react';
import Image from 'next/image';
import Logo from '../../public/logo-prisma.png';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { User, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './AuthScreen.module.css';
import spotlightStyles from './spotlight.module.css';
import Link from 'next/link';
import { requestPasswordResetSchema, RequestPasswordResetFormData } from '@/lib/validators/auth';
import { requestPasswordReset } from '@/api/auth/request-password-reset';
import { PasswordResetService } from '@/lib/services/password-reset';

export function ForgotPasswordScreen() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

            setIsSubmitted(true);
        } catch (error: unknown) {
            console.error('Erro ao solicitar reset de senha:', error);

        } finally {
            setIsLoading(false);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-2xl"
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

                        <div className="p-8 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-[#B3E240] rounded-full"
                            >
                                <CheckCircle className="w-12 h-12 text-black" />
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl font-bold text-[#B3E240] mb-4"
                                style={{ fontFamily: 'monospace' }}
                            >
                                EMAIL ENVIADO!
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-white text-lg mb-6"
                            >
                                Verifique sua caixa de entrada para instruções sobre como redefinir sua senha.
                            </motion.p>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="text-gray-400 text-sm mb-8"
                            >
                                Se você não receber o email em alguns minutos, verifique sua pasta de spam.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="space-y-4"
                            >
                                <div className='gap-4'>
                                    <Link href="/auth/login">
                                        <Button className="w-full cursor-pointer bg-[#B3E240] hover:bg-[#B3E240]/90 text-black py-3 shadow-[0_0_30px_rgba(179,226,64,0.3)] border border-[#B3E240] transition-all duration-300 hover:shadow-[0_0_40px_rgba(179,226,64,0.4)] rounded-lg">
                                            Voltar para o Login
                                        </Button>
                                    </Link>

                                    <Link href="/auth/reset-password/verify-code">
                                        <Button className="w-full mt-4 cursor-pointer bg-transparent border-2 border-[#B3E240] text-[#B3E240] hover:bg-[#B3E240] hover:text-black transition-all duration-300 rounded-lg">
                                            Verificar Código
                                        </Button>
                                    </Link>
                                </div>

                            </motion.div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        );
    }

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

                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
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
                                ESQUECEU A SENHA?
                            </h2>
                            <h3 className="text-xl text-white mb-6">Não se preocupe!</h3>
                            <p className="text-gray-400 text-sm mb-8">
                                Digite seu email e enviaremos instruções para redefinir sua senha.
                            </p>
                            <Link href="/auth/login" className='cursor-pointer'>
                                <Button className="bg-transparent cursor-pointer border-2 border-[#B3E240] text-[#B3E240] hover:bg-[#B3E240] hover:text-black transition-all duration-300 px-8 py-2 rounded-lg">
                                    Voltar ao Login
                                </Button>
                            </Link>
                        </motion.div>

                        <div className="flex-1 p-8 flex flex-col justify-center relative z-10">
                            <div className="max-w-sm mx-auto w-full">
                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className="flex items-center mb-8">
                                        <Link href="/auth/login">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="p-2 cursor-pointer text-[#B3E240] hover:bg-[#B3E240]/10 rounded-lg mr-4"
                                            >
                                                <ArrowLeft className="w-5 h-5" />
                                            </Button>
                                        </Link>
                                        <h2 className="text-2xl font-bold text-[#B3E240]" style={{ fontFamily: 'monospace' }}>
                                            REDEFINIR SENHA
                                        </h2>
                                    </div>

                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="relative mb-6">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B3E240]" />
                                            <Input
                                                type="email"
                                                placeholder="Digite seu email"
                                                {...form.register('email')}
                                                className={`pl-10 bg-white/10 backdrop-blur-sm border-[#B3E240]/30 text-white placeholder-gray-300 focus:border-[#B3E240] focus:ring-[#B3E240]/20 focus:shadow-[0_0_20px_rgba(179,226,64,0.2)] rounded-lg ${form.formState.errors.email ? 'border-red-500' : ''
                                                    }`}
                                            />
                                            {form.formState.errors.email && (
                                                <p className="text-red-400 text-xs mt-1 ml-1 absolute top-full left-0">
                                                    {form.formState.errors.email.message}
                                                </p>
                                            )}
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
                                                    {isLoading ? 'Enviando...' : 'Enviar Email'}
                                                </motion.span>
                                            </Button>
                                        </motion.div>

                                        <div className="text-center">
                                            <p className="text-gray-400 text-sm">
                                                Lembrou sua senha?{' '}
                                                <Link
                                                    href="/auth/login"
                                                    className="text-[#B3E240] hover:underline font-medium transition-colors"
                                                >
                                                    Faça login aqui
                                                </Link>
                                            </p>
                                        </div>
                                    </form>
                                </motion.div>
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
