'use client';

import { useState } from 'react';
import { UserProfile, BADGE_MAPPING, USER_FOCUS_LABELS, CONTEST_TYPE_LABELS, COLLEGE_COURSE_LABELS, EDUCATION_LEVEL_LABELS } from '@/types/auth-api';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
    Share2,
    Instagram,
    Twitter,
    Linkedin,
    Github,
    Award,
    BookOpen,
    Star,
    Heart,
    Eye,
    MapPin,
    ArrowLeft,
    Edit3,
    Camera
} from 'lucide-react';

export function ProfilePage() {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFriend, setIsFriend] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [avatarImage, setAvatarImage] = useState<string | null>(null);

    const user: UserProfile = {
        id: 'd99f095c-32e1-496e-b20e-73a554bb9538',
        nome: 'Breno Lima',
        name: 'Breno Lima',
        email: 'brenohslima@gmail.com',
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

    const activities = [
        { action: 'Completou uma lição', course: 'Matemática Básica', time: '2 horas atrás' },
        { action: 'Conquistou uma insígnia', course: 'Estudante Dedicado', time: '1 dia atrás' },
        { action: 'Iniciou um curso', course: 'Física Avançada', time: '3 dias atrás' },
    ];

    const getInitials = (user: UserProfile) => {
        const name = user.nome || user.name || user.email?.split('@')[0] || 'U';
        return name
            .split(' ')
            .map((word: string) => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const getBadgeInfo = () => {
        if (!user.notification?.badge) return null;

        const badgeKey = Object.keys(BADGE_MAPPING).find(key => BADGE_MAPPING[key] === user.notification?.badge);
        let label: string = badgeKey || '';

        if (badgeKey && badgeKey in USER_FOCUS_LABELS) {
            label = USER_FOCUS_LABELS[badgeKey as keyof typeof USER_FOCUS_LABELS];
        } else if (badgeKey && badgeKey in CONTEST_TYPE_LABELS) {
            label = CONTEST_TYPE_LABELS[badgeKey as keyof typeof CONTEST_TYPE_LABELS];
        } else if (badgeKey && badgeKey in COLLEGE_COURSE_LABELS) {
            label = COLLEGE_COURSE_LABELS[badgeKey as keyof typeof COLLEGE_COURSE_LABELS];
        }

        return { key: badgeKey, label };
    };

    const badgeInfo = getBadgeInfo();

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onload = (e) => {
                setBackgroundImage(e.target?.result as string);
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
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
        <div
            className="min-h-screen bg-black w-full"
            style={{
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0'
            }}
        >
            <div className="fixed top-6 left-6 z-50">
                <Button
                    onClick={() => window.history.back()}
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(5px)',
                        WebkitBackdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    className="text-white hover:bg-white/20 transition-all duration-300"
                    size="sm"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                </Button>
            </div>

            <div className="relative h-80 w-full overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        background: backgroundImage
                            ? `linear-gradient(135deg, rgba(147, 51, 234, 0.6), rgba(59, 130, 246, 0.6)), url(${backgroundImage})`
                            : 'linear-gradient(135deg, #9333ea, #3b82f6, #8b5cf6)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/20"
                    style={{
                        backdropFilter: 'blur(2px)',
                        WebkitBackdropFilter: 'blur(2px)'
                    }}>
                    <div className="text-center">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="background-upload"
                        />
                        <label
                            htmlFor="background-upload"
                            className="cursor-pointer inline-flex items-center space-x-2 text-white px-6 py-3 rounded-xl hover:bg-white/10 transition-all duration-300"
                            style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                backdropFilter: 'blur(5px)',
                                WebkitBackdropFilter: 'blur(5px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                        >
                            {isUploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Enviando...</span>
                                </>
                            ) : (
                                <>
                                    <Camera className="w-4 h-4" />
                                    <span>Alterar Fundo</span>
                                </>
                            )}
                        </label>
                    </div>
                </div>
            </div>

            <div className="w-full px-6 -mt-32 relative z-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div
                                className="p-6 mb-6 relative"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '20px',
                                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                            >
                                <div className="flex justify-center mb-6">
                                    <div className="relative group">
                                        <Avatar
                                            className="w-32 h-32 border-4 border-white/20 cursor-pointer hover:border-white/40 transition-all duration-300 shadow-2xl"
                                            style={{ borderRadius: '50%' }}
                                            onClick={() => document.getElementById('avatar-upload')?.click()}
                                            title="Clique para alterar foto de perfil"
                                        >
                                            <AvatarImage src={avatarImage || "/api/placeholder/160/160"} className="object-cover" />
                                            <AvatarFallback className="text-2xl font-bold bg-[#B3E240] text-black rounded-full w-full h-full flex items-center justify-center">
                                                {isUploading ? (
                                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-black border-t-transparent"></div>
                                                ) : (
                                                    getInitials(user)
                                                )}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-full cursor-pointer">
                                            <Camera className="w-5 h-5 text-white" />
                                        </div>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                            id="avatar-upload"
                                        />
                                    </div>
                                </div>

                                <div className="text-center mb-6">
                                    <h1 className="text-2xl font-bold text-white mb-1">
                                        {user.nome || user.name || user.email?.split('@')[0] || 'Usuário'}
                                    </h1>
                                    <p className="text-white/60 text-sm">@{getInitials(user).toLowerCase()}</p>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                                        <span className="text-white/80 text-sm">Título</span>
                                        <span className="text-white/40">+</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                                        <span className="text-white/80 text-sm">Localização</span>
                                        <span className="text-white/40">+</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                                        <span className="text-white/80 text-sm">Destacar tecnologias</span>
                                        <span className="text-white/40">+</span>
                                    </div>
                                </div>

                                <p className="text-white/60 text-sm text-center mb-6">
                                    Embarcou na Rocketseat 30/03/2020
                                </p>

                                <div className="mb-6">
                                    <h3 className="text-white font-semibold mb-3">Links</h3>
                                    <div className="grid grid-cols-5 gap-2">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="aspect-square bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                                                <span className="text-white/40 text-lg">+</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-white font-semibold mb-3">Insígnias • 3</h3>
                                    <div className="flex space-x-2">
                                        <img
                                            src="/badgeEnem.png"
                                            alt="Badge ENEM"
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <img
                                            src="/badgePRF.png"
                                            alt="Badge PRF"
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <img
                                            src="/badgeesa.png"
                                            alt="Badge ESA"
                                            className="w-12 h-12 rounded-full object-contain"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div
                                className="p-6 mb-6"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '20px',
                                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                            >
                                <h2 className="text-xl font-bold text-white mb-2">Complete seu perfil</h2>
                                <p className="text-white/60 text-sm mb-4">Perfis completos atraem mais oportunidades!</p>

                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-white/80 text-sm">25% completo</span>
                                        <span className="text-white/60 text-sm">2 de 8</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2">
                                        <div className="bg-[#B3E240] h-2 rounded-full" style={{ width: '25%' }}></div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { label: 'Informações básicas', completed: false },
                                        { label: 'Foto do perfil', completed: true },
                                        { label: 'Imagem de capa', completed: false },
                                        { label: 'Links', completed: false },
                                        { label: 'Sobre você', completed: true },
                                        { label: 'Destaques', completed: false },
                                        { label: 'Habilidades', completed: false },
                                        { label: 'Momento de carreira', completed: false }
                                    ].map((task, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${task.completed
                                                ? 'bg-[#B3E240] border-[#B3E240]'
                                                : 'border-white/30'
                                                }`}>
                                                {task.completed && (
                                                    <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className={`text-sm ${task.completed ? 'text-white/80' : 'text-white/60'}`}>
                                                {task.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div
                                className="p-6 mb-6"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '20px',
                                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-white">Sobre</h3>
                                    <button className="text-white/60 hover:text-white transition-colors">
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-white/60 text-sm">
                                    <span className="text-white/40">—</span>
                                </div>
                            </div>

                            <div
                                className="p-6 mb-6"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '20px',
                                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-white">Destaques</h3>
                                    <button className="text-white/60 hover:text-white transition-colors">
                                        <span className="text-lg">+</span>
                                    </button>
                                </div>
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <p className="text-white/80 text-sm mb-4">
                                        Compartilhe o link dos seus melhores projetos para se destacar e conquistar oportunidades
                                    </p>
                                    <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center space-x-2 mx-auto">
                                        <span>+</span>
                                        <span>Adicionar destaques</span>
                                    </button>
                                </div>
                            </div>

                            <div
                                className="p-6 mb-6"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '20px',
                                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-white">Formação acadêmica</h3>
                                    <button className="text-white/60 hover:text-white transition-colors">
                                        <span className="text-lg">+</span>
                                    </button>
                                </div>
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                        </svg>
                                    </div>
                                    <div className="text-white/60 text-sm">
                                        <span className="text-white/40">—</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
