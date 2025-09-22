'use client';

import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoPlayerProps } from '@/types/ui/features/course';

export function VideoPlayer({ selectedVideo, isVideoPlaying, onPlayToggle, onPause }: VideoPlayerProps) {
    return (
        <div className="relative bg-black aspect-video shadow-2xl rounded-4xl">
            {selectedVideo?.youtubeId ? (
                <>
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${selectedVideo?.youtubeId}?autoplay=${isVideoPlaying ? 1 : 0}&mute=${false}&rel=0&modestbranding=1&controls=1&enablejsapi=1`}
                        title={selectedVideo?.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full rounded-3xl"
                        id={`youtube-player-${selectedVideo?.id}`}
                    />

                    {!isVideoPlaying && (
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-3xl cursor-pointer z-10 hover:bg-black/30 transition-all duration-300"
                            onClick={onPlayToggle}
                        >
                            <div className="bg-green-500 hover:bg-green-600 rounded-full w-24 h-24 flex items-center justify-center shadow-2xl hover:shadow-green-500/25 transition-all">
                                <Play className="w-10 h-10 text-black ml-1" fill="black" />
                            </div>
                        </div>
                    )}

                    {isVideoPlaying && (
                        <div className="absolute top-4 right-4 z-20">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/20"
                                onClick={onPause}
                            >
                                Pausar
                            </Button>
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
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
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
