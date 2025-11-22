'use client';

import { Button } from '@/components/ui/button';
import { Plus, Rocket } from 'lucide-react';
import { ProfileHighlightsProps } from '@/types/ui/features/profile';

export function ProfileHighlights({ onAddHighlight }: ProfileHighlightsProps) {
    return (
        <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#bd18b4]/5 before:to-transparent before:pointer-events-none">
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
                <Button
                    className="bg-[#bd18b4] hover:bg-[#aa22c5] text-black px-6 py-2 rounded-lg font-medium flex items-center space-x-2 mx-auto cursor-pointer"
                    onClick={onAddHighlight}
                >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar destaques</span>
                </Button>
            </div>
        </div>
    );
}
