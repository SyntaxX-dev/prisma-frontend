'use client';

import { CourseProgressProps } from '@/types/ui/features/course';

export function CourseProgress({ courseProgress }: CourseProgressProps) {
    return (
        <div className="p-4 border-b border-white/10">
            <h2 className="text-white font-semibold mb-2">Conteúdo</h2>
            <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Progresso do curso</span>
                <span className="text-green-400 font-medium">
                    {courseProgress ? `${courseProgress.progressPercentage}%` : '0%'}
                </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500 shadow-lg shadow-green-500/30"
                    style={{ width: `${courseProgress?.progressPercentage || 0}%` }}
                />
            </div>
            <div className="text-xs text-white/50 mt-2">
                {courseProgress ? (
                    `${courseProgress.completedVideos} de ${courseProgress.totalVideos} vídeos concluídos`
                ) : (
                    '0 de 0 vídeos concluídos'
                )}
            </div>
        </div>
    );
}
