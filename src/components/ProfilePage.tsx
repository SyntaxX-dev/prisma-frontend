'use client';

import { useState } from 'react';
import { UserProfile, BADGE_MAPPING, USER_FOCUS_LABELS, CONTEST_TYPE_LABELS, COLLEGE_COURSE_LABELS, EDUCATION_LEVEL_LABELS } from '@/types/auth-api';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from './ui/popover';
import {
    Edit3,
    Camera,
    Plus,
    Rocket,
    CheckCircle2,
    Circle,
    ArrowUp,
    Menu,
    Search,
    Bell,
    X,
    Flame,
    AlertCircle
} from 'lucide-react';

export function ProfilePage() {
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [avatarImage, setAvatarImage] = useState<string | null>(null);
    const [notificationOpen, setNotificationOpen] = useState(false);

    const user: UserProfile = {
        id: 'd99f095c-32e1-496e-b20e-73a554bb9538',
        nome: 'Aran Leite de Gusmão',
        name: 'Aran Leite de Gusmão',
        email: 'aran@gmail.com',
        age: 25,
        educationLevel: 'GRADUACAO' as const,
        userFocus: 'ENEM' as const,
        contestType: undefined,
        collegeCourse: undefined,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        perfil: 'ALUNO',
        notification: {
            hasNotification: true,
            missingFields: ['foco de estudo'],
            message: 'Complete seu perfil adicionando sua foco de estudo.',
            badge: null
        }
    };

    const profileTasks = [
        { label: 'Informações básicas', completed: false },
        { label: 'Foto do perfil', completed: true },
        { label: 'Imagem de capa', completed: false },
        { label: 'Links', completed: false },
        { label: 'Sobre você', completed: true },
        { label: 'Destaques', completed: false },
        { label: 'Habilidades', completed: false },
        { label: 'Momento de carreira', completed: false }
    ];

    const completedTasks = profileTasks.filter(task => task.completed).length;
    const totalTasks = profileTasks.length;
    const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

    const getInitials = (user: UserProfile) => {
        const name = user.nome || user.name || user.email?.split('@')[0] || 'U';
        return name
            .split(' ')
            .map((word: string) => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarImage(e.target?.result as string);
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090A] text-white">
            <div
                className="fixed inset-0 transition-all duration-300 bg-gray-950"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 25% 25%, rgba(179, 226, 64, 0.08) 0%, transparent 50%),
                        radial-gradient(circle at 75% 75%, rgba(179, 226, 64, 0.04) 0%, transparent 50%)
                    `
                }}
            />

            <div
                className="fixed inset-0 pointer-events-none"
                aria-hidden="true"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 15% 10%, rgba(201, 254, 2, 0.06), transparent 20%),
                        radial-gradient(circle at 85% 90%, rgba(201, 254, 2, 0.04), transparent 20%)
                    `
                }}
            />

            <div
                className="fixed inset-0 backdrop-blur-sm transition-all duration-300 bg-black/30"
            />

            <div
                className="fixed inset-0 pointer-events-none"
                aria-hidden="true"
                style={{
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0'
                }}
            />

            <header className="bg-[#202024] border-b border-[#323238] px-6 py-3 sticky top-0 z-50">
                <div className="flex items-center justify-between max-w-full">

                    <div className="flex items-center space-x-6">
                        <Button
                            className="bg-transparent hover:bg-white/5 text-white p-2 h-auto cursor-pointer"
                            size="sm"
                        >
                            <Menu className="w-5 h-5" />
                        </Button>

                        <div className="flex items-center space-x-3">

                            <div className="flex items-center space-x-3">
                                <img
                                    src="/logo-prisma.png"
                                    alt="Prisma Logo"
                                    className="w-10 h-10"
                                />
                                <span className="text-white font-bold text-lg tracking-wider">Prisma</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 max-w-md mx-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Busque por assuntos e aulas"
                                className="w-full bg-[#29292E] border border-[#323238] rounded-md pl-11 pr-12 py-2.5 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#B3E240] focus:border-transparent transition-all cursor-text"
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                <kbd className="bg-[#202024] text-gray-400 text-xs px-2 py-1 rounded border border-[#323238] font-mono">
                                    /
                                </kbd>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">

                        <div className="flex items-center gap-2 cursor-pointer">
                            <div className="relative">
                                <Flame
                                    className="w-5 h-5 text-orange-500 drop-shadow-md"
                                    style={{
                                        filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.6))'
                                    }}
                                />
                                <div className="absolute inset-0 animate-pulse">
                                    <Flame className="w-5 h-5 text-orange-400 opacity-40" />
                                </div>
                            </div>
                            <span className="text-sm font-semibold text-orange-500">
                                0
                            </span>
                        </div>

                        <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white/80 hover:text-[#B3E240] hover:bg-white/10 rounded-full w-8 h-8 p-0 relative cursor-pointer transition-all duration-300"
                                >
                                    <Bell className="w-6 h-6 transition-all duration-300" />
                                    {user.notification?.hasNotification && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#B3E240] rounded-full animate-ping"></span>
                                    )}
                                    {user.notification?.hasNotification && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#B3E240] rounded-full"></span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-80 p-0 border-0 bg-transparent"
                                side="bottom"
                                align="end"
                                sideOffset={8}
                            >
                                <div className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-1 mt-4">
                                    {user.notification?.hasNotification ? (
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <AlertCircle className="w-5 h-5 text-yellow-400" />
                                                <h3 className="font-semibold text-white">Notificação</h3>
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-white/80 text-sm">
                                                    {user.notification?.message}
                                                </p>
                                                {user.notification?.missingFields && user.notification.missingFields.length > 0 && (
                                                    <div>
                                                        <p className="text-white/60 text-xs mb-2">Campos pendentes:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {user.notification.missingFields.map((field: string, index: number) => (
                                                                <span
                                                                    key={index}
                                                                    className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs border border-yellow-500/30"
                                                                >
                                                                    {field}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="pt-2 border-t border-white/20">
                                                    <Button
                                                        className="w-full bg-[#B3E240] hover:bg-[#A3D030] text-black font-medium"
                                                        onClick={() => setNotificationOpen(false)}
                                                    >
                                                        Entendi
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center">
                                            <Bell className="w-8 h-8 text-white/40 mx-auto mb-2" />
                                            <p className="text-white/60 text-sm">Nenhuma notificação</p>
                                        </div>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <div className="w-12 h-12 rounded-lg overflow-hidden cursor-pointer">
                            <div className="w-full h-full rounded-lg overflow-hidden bg-[#B3E240] flex items-center justify-center">
                                {avatarImage ? (
                                    <img
                                        src={avatarImage}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-black text-lg font-bold">
                                        {getInitials(user)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="relative z-10 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#B3E240]/5 before:to-transparent before:pointer-events-none">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                className="bg-transparent hover:bg-white/5 text-white p-2 rounded-lg border border-[#323238] cursor-pointer"
                                                size="sm"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                className="bg-[#B3E240] hover:bg-[#A3D030] text-black p-2 rounded-lg cursor-pointer"
                                                size="sm"
                                            >
                                                <Camera className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="text-center mb-6">
                                        <div className="relative inline-block group mb-4">
                                            <Avatar
                                                className="w-24 h-24 cursor-pointer"
                                                onClick={() => document.getElementById('avatar-upload')?.click()}
                                            >
                                                <AvatarImage src={avatarImage || "/api/placeholder/96/96"} className="object-cover" />
                                                <AvatarFallback className="text-xl font-bold bg-[#B3E240] text-black">
                                                    {getInitials(user)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                                className="hidden"
                                                id="avatar-upload"
                                            />
                                        </div>
                                        <h1 className="text-xl font-bold text-white mb-1">
                                            {user.nome || user.name}
                                        </h1>
                                        <p className="text-gray-400 text-sm">
                                            @aran-leite
                                        </p>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <Button className="w-full bg-transparent hover:bg-white/5 text-gray-400 border border-[#323238] rounded-lg justify-start text-sm py-2 cursor-pointer">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Título
                                        </Button>
                                        <Button className="w-full bg-transparent hover:bg-white/5 text-gray-400 border border-[#323238] rounded-lg justify-start text-sm py-2 cursor-pointer">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Localização
                                        </Button>
                                    </div>

                                    <Button className="w-full bg-transparent hover:bg-white/5 text-[#B3E240] border border-[#323238] rounded-lg justify-start text-sm py-2 mb-6 cursor-pointer">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Destacar tecnologias
                                    </Button>

                                    <p className="text-gray-500 text-sm text-center">
                                        Embarcou na Rocketseat 30/03/2020
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#B3E240]/5 before:to-transparent before:pointer-events-none">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-white font-semibold">Links</h3>
                                        <Button
                                            className="bg-transparent hover:bg-white/5 text-white p-1 cursor-pointer"
                                            size="sm"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-5 gap-3">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="aspect-square bg-transparent border-2 border-dashed border-[#323238] rounded-lg flex items-center justify-center hover:border-gray-600 transition-colors cursor-pointer"
                                            >
                                                <Plus className="w-5 h-5 text-gray-600" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#B3E240]/5 before:to-transparent before:pointer-events-none">
                                    <h3 className="text-white font-semibold mb-4">Insígnias • 3</h3>
                                    <div className="flex space-x-3">
                                        <div className="w-12 h-12 bg-[#B3E240] rounded-full flex items-center justify-center cursor-pointer">
                                            <span className="text-black text-xs font-bold">R</span>
                                        </div>
                                        <div className="w-12 h-12 bg-[#F59E0B] rounded-full flex items-center justify-center cursor-pointer">
                                            <span className="text-white text-xs font-bold">G</span>
                                        </div>
                                        <div className="w-12 h-12 bg-[#B3E240] rounded-full flex items-center justify-center cursor-pointer">
                                            <span className="text-black text-xs font-bold">N</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#B3E240]/5 before:to-transparent before:pointer-events-none">
                                <h2 className="text-xl font-bold text-white mb-2">Complete seu perfil</h2>
                                <p className="text-gray-400 text-sm mb-6">Perfis completos atraem mais oportunidades!</p>

                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-white/80 text-sm">{completionPercentage}% completo</span>
                                        <span className="text-gray-400 text-sm">{completedTasks} de {totalTasks}</span>
                                    </div>
                                    <div className="w-full bg-[#323238] rounded-full h-2">
                                        <div
                                            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${completionPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {profileTasks.map((task, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            {task.completed ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-gray-600" />
                                            )}
                                            <span className={`text-sm ${task.completed ? 'text-white' : 'text-gray-400'}`}>
                                                {task.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#B3E240]/5 before:to-transparent before:pointer-events-none">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-white">Sobre</h3>
                                    <Button
                                        className="bg-transparent hover:bg-white/5 text-gray-400 p-1 cursor-pointer"
                                        size="sm"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="text-gray-500 text-sm">
                                    <span>—</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#B3E240]/5 before:to-transparent before:pointer-events-none">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold text-white">Destaques</h3>
                                    <Button
                                        className="bg-transparent hover:bg-white/5 text-gray-400 p-1 cursor-pointer"
                                        size="sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-[#323238] rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Rocket className="w-8 h-8 text-gray-500" />
                                    </div>
                                    <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                                        Compartilhe o link dos seus melhores projetos para se destacar e conquistar oportunidades
                                    </p>
                                    <Button className="bg-[#B3E240] hover:bg-[#A3D030] text-black px-6 py-2 rounded-lg font-medium flex items-center space-x-2 mx-auto cursor-pointer">
                                        <Plus className="w-4 h-4" />
                                        <span>Adicionar destaques</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
