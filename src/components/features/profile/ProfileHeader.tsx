'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProfileHeaderProps } from '@/types/ui/features/profile';

export function ProfileHeader({
    user,
    avatarImage,
    onAvatarUpload,
    getInitials
}: ProfileHeaderProps) {
    return (
        <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#bd18b4]/5 before:to-transparent before:pointer-events-none">
            <div className="text-center mb-6">
                <div className="relative inline-block group mb-4">
                    <Avatar
                        className="w-24 h-24 cursor-pointer"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                        <AvatarImage src={avatarImage || "/api/placeholder/96/96"} className="object-cover" />
                        <AvatarFallback className="text-xl font-bold bg-[#bd18b4] text-black">
                            {getInitials(user)}
                        </AvatarFallback>
                    </Avatar>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onAvatarUpload}
                        className="hidden"
                        id="avatar-upload"
                    />
                </div>
                <h1 className="text-xl font-black text-white mb-1">
                    {user.nome || user.name}
                </h1>
                <p className="text-gray-400 text-sm">
                    @aran-leite
                </p>
            </div>

            <div className="space-y-3 mb-6">
                <Button
                    className="w-full bg-transparent hover:bg-white/5 text-gray-400 border border-[#323238] rounded-lg justify-start text-sm py-2 cursor-pointer"
                    onClick={() => { }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Título
                </Button>
                <Button
                    className="w-full bg-transparent hover:bg-white/5 text-gray-400 border border-[#323238] rounded-lg justify-start text-sm py-2 cursor-pointer"
                    onClick={() => { }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Localização
                </Button>
                <Button
                    className="w-full bg-transparent hover:bg-white/5 text-[#bd18b4] border border-[#323238] rounded-lg justify-start text-sm py-2 cursor-pointer"
                    onClick={() => { }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Escolha seu foco
                </Button>
            </div>

            <p className="text-gray-500 text-sm text-center">
                No Prisma desde 30/03/2020
            </p>
        </div>
    );
}
