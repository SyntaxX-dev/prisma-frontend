'use client';

import { Play, Lock, CheckCircle } from 'lucide-react';
import { VideoItemProps } from '@/types/ui/features/course';

export function VideoItem({ video, isSelected, onSelect, onMarkComplete }: VideoItemProps) {
    return (
        <button
            onClick={onSelect}
            disabled={video.locked}
            className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-white/5 transition-all ${video.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${isSelected
                    ? 'bg-[#bd18b4]/10 border-l-2 border-[#bd18b4] hover:bg-[#bd18b4]/15'
                    : ''
                }`}
        >
            <div className="flex-shrink-0">
                {video.locked ? (
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5 text-white/40" />
                    </div>
                ) : video.isCompleted ? (
                    <div className="w-7 h-7 rounded-full bg-[#bd18b4]/20 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-[#c532e2]" />
                    </div>
                ) : (
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                        <Play className="w-3.5 h-3.5 text-white/60" fill="currentColor" />
                    </div>
                )}
            </div>
            <div className="flex-1 text-left">
                <p className={`text-sm ${isSelected
                    ? 'text-[#c532e2] font-medium'
                    : 'text-white/80'
                    } line-clamp-1`}>
                    {video.title}
                </p>
                <p className="text-xs text-white/40">{video.duration}</p>
            </div>
        </button>
    );
}
