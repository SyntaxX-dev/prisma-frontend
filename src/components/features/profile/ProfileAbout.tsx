'use client';

import { Button } from '@/components/ui/button';
import { Edit3 } from 'lucide-react';
import { ProfileAboutProps } from '@/types/ui/features/profile';

export function ProfileAbout({ aboutText, onEditAbout }: ProfileAboutProps) {
    return (
        <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#B3E240]/5 before:to-transparent before:pointer-events-none">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Sobre</h3>
                <Button
                    className="bg-transparent hover:bg-white/5 text-gray-400 p-1 cursor-pointer"
                    size="sm"
                    onClick={onEditAbout}
                >
                    <Edit3 className="w-4 h-4" />
                </Button>
            </div>
            <div className="text-gray-500 text-sm">
                <span>—</span>
            </div>
        </div>
    );
}
