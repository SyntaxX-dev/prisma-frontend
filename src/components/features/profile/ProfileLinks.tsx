'use client';

import { Button } from '@/components/ui/button';
import { Edit3, Plus } from 'lucide-react';
import { ProfileLinksProps } from '@/types/ui/features/profile';

export function ProfileLinks({ onEditLinks }: ProfileLinksProps) {
    return (
        <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#B3E240]/5 before:to-transparent before:pointer-events-none">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Links</h3>
                <Button
                    className="bg-transparent hover:bg-white/5 text-white p-1 cursor-pointer"
                    size="sm"
                    onClick={onEditLinks}
                >
                    <Edit3 className="w-4 h-4" />
                </Button>
            </div>
            <div className="grid grid-cols-5 gap-3">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="aspect-square bg-transparent border-2 border-dashed border-[#323238] rounded-lg flex items-center justify-center hover:border-gray-600 transition-colors cursor-pointer"
                        onClick={onEditLinks}
                    >
                        <Plus className="w-5 h-5 text-gray-600" />
                    </div>
                ))}
            </div>
        </div>
    );
}
