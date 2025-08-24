import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AuthIndexPage() {
    return (
        <div className="relative min-h-dvh overflow-hidden">
            <AnimatedBackground />
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-2xl"
                >
                    <Card className="bg-white/10 backdrop-blur-sm border-[#B3E240]/30 p-8">
                        <h1 className="text-3xl font-bold text-[#B3E240] mb-8 text-center" style={{ fontFamily: 'monospace' }}>
                            PRISMA ACADEMY
                        </h1>
                        <p className="text-white text-center mb-8">
                            Escolha uma das opções abaixo:
                        </p>

                        <div className="space-y-4">
                            <Link href="/login" className="block">
                                <Button className="w-full bg-[#B3E240] hover:bg-[#B3E240]/90 text-black py-3">
                                    Login
                                </Button>
                            </Link>

                            <Link href="/register" className="block">
                                <Button className="w-full bg-transparent border-2 border-[#B3E240] text-[#B3E240] hover:bg-[#B3E240] hover:text-black py-3">
                                    Registro
                                </Button>
                            </Link>

                            <Link href="/forgot-password" className="block">
                                <Button className="w-full bg-transparent border-2 border-[#B3E240] text-[#B3E240] hover:bg-[#B3E240] hover:text-black py-3">
                                    Esqueci a Senha
                                </Button>
                            </Link>

                            <Link href="/reset-password/verify-code" className="block">
                                <Button className="w-full bg-transparent border-2 border-[#B3E240] text-[#B3E240] hover:bg-[#B3E240] hover:text-black py-3">
                                    Verificar Código
                                </Button>
                            </Link>

                            <Link href="/reset-password/new-password" className="block">
                                <Button className="w-full bg-transparent border-2 border-[#B3E240] text-[#B3E240] hover:bg-[#B3E240] hover:text-black py-3">
                                    Nova Senha
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
} 
