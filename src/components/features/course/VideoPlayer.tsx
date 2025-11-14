'use client';

import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoPlayerProps } from '@/types/ui/features/course';
import { useYouTubePlayer } from '@/hooks/features/courses/useYouTubePlayer';
import { useEffect } from 'react';

export function VideoPlayer({ selectedVideo, isVideoPlaying, onPlayToggle, onPause }: VideoPlayerProps) {
    const containerId = `youtube-player-${selectedVideo?.id || 'default'}`;

    // Initialize YouTube player with progress tracking
    const {
        isPlaying,
        isReady,
        play,
        pause,
        togglePlay,
        currentTime,
        duration,
    } = useYouTubePlayer({
        youtubeId: selectedVideo?.youtubeId || '',
        videoId: selectedVideo?.videoId || selectedVideo?.id || '',
        containerId,
        onPlay: onPlayToggle,
        onPause,
        onVideoEnd: () => {
            // Video ended - will be marked as completed by parent component
            console.log('[VideoPlayer] Vídeo finalizado');
        },
    });

    // Sync external isVideoPlaying state with player
    useEffect(() => {
        if (isVideoPlaying && !isPlaying) {
            play();
        } else if (!isVideoPlaying && isPlaying) {
            pause();
        }
    }, [isVideoPlaying, isPlaying, play, pause]);

    // Format time helper
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative bg-black aspect-video shadow-2xl rounded-4xl">
            {selectedVideo?.youtubeId ? (
                <>
                    {/* YouTube Player Container */}
                    <div
                        id={containerId}
                        className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden"
                    />

                    {/* Play/Pause Overlay (only when not playing) */}
                    {!isPlaying && isReady && (
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-3xl cursor-pointer z-10 hover:bg-black/30 transition-all duration-300"
                            onClick={togglePlay}
                        >
                            <div className="bg-green-500 hover:bg-green-600 rounded-full w-24 h-24 flex items-center justify-center shadow-2xl hover:shadow-green-500/25 transition-all">
                                <Play className="w-10 h-10 text-black ml-1" fill="black" />
                            </div>
                        </div>
                    )}

                    {/* Pause Button (when playing) */}
                    {isPlaying && (
                        <div className="absolute top-4 right-4 z-20">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/20"
                                onClick={() => {
                                    pause();
                                    onPause();
                                }}
                            >
                                <Pause className="w-4 h-4 mr-2" />
                                Pausar
                            </Button>
                        </div>
                    )}

                    {/* Progress Indicator (optional) */}
                    {duration > 0 && currentTime > 0 && (
                        <div className="absolute bottom-4 left-4 z-20 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    )}

                    {/* Loading indicator */}
                    {!isReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl z-5">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                        </div>
                    )}

                    <div
                        className="absolute -inset-1 opacity-0 group-hover:opacity-30 blur-xl pointer-events-none transition-opacity duration-500"
                        style={{
                            background: `inherit`,
                        }}
                    />
                </>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black rounded-3xl">
                    <Button
                        size="lg"
                        className="bg-green-500 hover:bg-green-600 rounded-full w-20 h-20 p-0 shadow-2xl hover:shadow-green-500/25 transition-all"
                        onClick={() => {}}
                    >
                        <Play className="w-10 h-10 text-black ml-1" fill="black" />
                    </Button>
                </div>
            )}
        </div>
    );
}
