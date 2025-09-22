'use client';

import { ChevronDown } from 'lucide-react';
import { VideoItem } from './VideoItem';
import { ModuleItemProps } from '@/types/ui/features/course';

export function ModuleItem({
    module,
    isExpanded,
    selectedVideo,
    onToggle,
    onVideoSelect,
    onMarkComplete
}: ModuleItemProps) {
    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 hover:bg-white/[0.07] transition-colors">
            <button
                onClick={onToggle}
                className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg w-8 h-8 flex items-center justify-center text-sm font-semibold text-green-400 border border-green-500/20">
                        {module.id}
                    </div>
                    <div className="text-left">
                        <h3 className="text-white text-sm font-medium line-clamp-1">{module.title}</h3>
                        <p className="text-white/40 text-xs">
                            {module.completedVideos}/{module.videosCount} aulas • {module.totalDuration}
                        </p>
                    </div>
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-white/60 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
            </button>

            {isExpanded && (
                <div className="border-t border-white/5">
                    {module.videos.map((video) => (
                        <VideoItem
                            key={video.id}
                            video={video}
                            isSelected={selectedVideo?.id === video.id}
                            onSelect={() => onVideoSelect(video)}
                            onMarkComplete={() => onMarkComplete(video)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
