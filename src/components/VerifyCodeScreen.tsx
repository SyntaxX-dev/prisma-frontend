'use client'

import { useState } from 'react';
import Image from 'next/image';
import Logo from '../../public/logo-prisma.png';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Mail, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './AuthScreen.module.css';
import spotlightStyles from './spotlight.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { verifyResetCodeSchema, VerifyResetCodeFormData } from '@/lib/validators/auth';
import { verifyResetCode } from '@/api/auth/verify-reset-code';
import { PasswordResetService } from '@/lib/services/password-reset';



export function VerifyCodeScreen() {
    const [isLoading, setIsLoading] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const router = useRouter();

    const form = useForm<VerifyResetCodeFormData>({
        resolver: zodResolver(verifyResetCodeSchema),
        defaultValues: {
            code: '',
        },
    });

    const onSubmit = async (data: VerifyResetCodeFormData) => {
        try {
            setIsLoading(true);

            const email = PasswordResetService.getEmail();
            if (!email) {
                throw new Error('Email não encontrado. Volte para a tela anterior.');
            }

            const response = await verifyResetCode({
                email,
                code: data.code
            });

            if (response.status === 'success') {
                PasswordResetService.saveCode(data.code);
                router.push('/reset-password/new-password');
            } else {
                throw new Error('Código inválido');
            }
        } catch (error: unknown) {

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
                                VERIFICAÇÃO
                            </h2>
                            <h3 className="text-xl text-white mb-6">Código de Segurança</h3>
                            <p className="text-gray-400 text-sm mb-8">
                                Digite o código de 6 dígitos enviado para seu email
                            </p>
                            <div className="flex items-center justify-center space-x-2 text-[#B3E240] mb-4">
                                <Clock className="w-5 h-5" />
                                <span className="text-sm">Código válido por 15 minutos</span>
                            </div>
                            <Link href="/auth/forgot-password">
                                <Button className="bg-transparent cursor-pointer border-2 border-[#B3E240] text-[#B3E240] hover:bg-[#B3E240] hover:text-black transition-all duration-300 px-8 py-2 rounded-lg">
                                    Voltar
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
                                        <Link href="/auth/forgot-password">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="p-2 cursor-pointer text-[#B3E240] hover:bg-[#B3E240]/10 rounded-lg mr-4"
                                            >
                                                <ArrowLeft className="w-5 h-5" />
                                            </Button>
                                        </Link>
                                        <h2 className="text-2xl font-bold text-[#B3E240]" style={{ fontFamily: 'monospace' }}>
                                            VERIFICAR CÓDIGO
                                        </h2>
                                    </div>

                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="relative mb-6">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B3E240]" />
                                            <Input
                                                type="text"
                                                placeholder="000000"
                                                maxLength={6}
                                                {...form.register('code')}
                                                className={`pl-10 text-center text-2xl font-mono tracking-widest bg-white/10 backdrop-blur-sm border-[#B3E240]/30 text-white placeholder-gray-300 focus:border-[#B3E240] focus:ring-[#B3E240]/20 focus:shadow-[0_0_20px_rgba(179,226,64,0.2)] rounded-lg ${form.formState.errors.code ? 'border-red-500' : ''
                                                    }`}
                                            />
                                            {form.formState.errors.code && (
                                                <p className="text-red-400 text-xs mt-1 ml-1 absolute top-full left-0">
                                                    {form.formState.errors.code.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-center">
                                            <p className="text-gray-400 text-sm mb-4">
                                                Não recebeu o código?
                                            </p>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="cursor-pointer text-[#B3E240] hover:bg-[#B3E240]/10 transition-colors"
                                            >
                                                Reenviar código
                                            </Button>
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
                                                    {isLoading ? 'Verificando...' : 'Verificar Código'}
                                                </motion.span>
                                            </Button>
                                        </motion.div>
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
