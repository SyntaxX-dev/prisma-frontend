'use client';

import { Clock, Download, Share2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VideoInfoProps } from '@/types/ui/features/course';

export function VideoInfo({ selectedVideo, onMarkComplete }: VideoInfoProps) {
    return (
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-4">{selectedVideo?.title || "Carregando..."}</h1>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-white/60" />
                        <span className="text-white/70">{selectedVideo?.duration || "0:00"}</span>
                    </div>
                    <Badge
                        className={`${selectedVideo?.isCompleted
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-white/10 text-white/60 border-white/20'
                            } backdrop-blur-sm`}
                    >
                        {selectedVideo?.isCompleted ? (
                            <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Concluída
                            </>
                        ) : (
                            'Não concluída'
                        )}
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    >
                        <Download className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    >
                        <Share2 className="w-5 h-5" />
                    </Button>
                    <Button
                        onClick={() => selectedVideo && onMarkComplete(selectedVideo)}
                        disabled={!selectedVideo?.videoId}
                        className={`font-semibold shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${selectedVideo?.isCompleted
                            ? 'bg-green-500 hover:bg-green-600 text-black hover:shadow-green-500/25'
                            : 'bg-white/20 hover:bg-white/30 text-white/70 hover:text-white'
                            }`}
                    >
                        {selectedVideo?.isCompleted ? 'Concluída' : 'Concluir'}
                        <CheckCircle className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
