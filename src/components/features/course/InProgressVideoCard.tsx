'use client';

import { Play, Clock, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InProgressVideo } from '@/api/progress/get-in-progress-videos';
import { useNavigationWithLoading } from '@/hooks/shared';
import Image from 'next/image';

interface InProgressVideoCardProps {
  video: InProgressVideo;
}

export function InProgressVideoCard({ video }: InProgressVideoCardProps) {
  const { navigateWithLoading } = useNavigationWithLoading();

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const handleContinueWatching = () => {
    // Navigate to the course page with the specific sub-course and video
    navigateWithLoading(
      `/course/${video.courseId}/sub-courses/${video.subCourseId}/videos`,
      'Carregando vídeo...'
    );
  };

  return (
    <button
      onClick={handleContinueWatching}
      className="w-full text-left group relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-[#bd18b4]/10 rounded-lg cursor-pointer"
    >
      <Card className="border-0 bg-transparent shadow-none">
        <div className="flex flex-col p-2">
          {/* Thumbnail */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-2">
            {video.thumbnailUrl ? (
              <Image
                src={video.thumbnailUrl}
                alt={video.videoTitle}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <Play className="w-8 h-8 text-white/40" />
              </div>
            )}

            {/* Progress overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
              <div
                className="h-full bg-[#bd18b4] transition-all"
                style={{ width: `${video.progressPercentage}%` }}
              />
            </div>

            {/* Play overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <div className="bg-[#bd18b4] rounded-full p-2">
                <Play className="w-5 h-5 text-black fill-black" />
              </div>
            </div>
          </div>

          {/* Video Info */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover:text-[#c532e2] transition-colors">
              {video.videoTitle.length > 28
                ? `${video.videoTitle.slice(0, 25)}...`
                : video.videoTitle}
            </h3>

            <div className="flex items-center gap-2 text-white/60 text-xs">
              <Clock className="w-3 h-3" />
              <span>
                {formatTime(video.currentTimestamp)} / {video.duration ? formatTime(video.duration) : '?'}
              </span>
            </div>
          </div>
        </div>

        {/* Animated border on hover */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#bd18b4]/20 via-transparent to-[#bd18b4]/20 blur-xl" />
        </div>
      </Card>
    </button>
  );
}
