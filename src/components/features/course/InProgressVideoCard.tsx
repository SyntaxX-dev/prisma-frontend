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
      className="w-full text-left group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#bd18b4]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),0_0_20px_rgba(189,24,180,0.1)] rounded-2xl cursor-pointer"
    >
      <Card className="border-0 bg-transparent shadow-none p-3">
        <div className="flex flex-col">
          {/* Thumbnail */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3">
            {video.thumbnailUrl ? (
              <Image
                src={video.thumbnailUrl}
                alt={video.videoTitle}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
                <Play className="w-8 h-8 text-white/20" />
              </div>
            )}

            {/* Progress overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
              <div
                className="h-full bg-gradient-to-r from-[#bd18b4] to-[#aa22c5] transition-all duration-1000"
                style={{ width: `${video.progressPercentage}%` }}
              />
            </div>

            {/* Play overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <div className="bg-white text-black rounded-full p-2.5 scale-90 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                <Play className="w-4 h-4 fill-current" />
              </div>
            </div>

            {/* Timestamp badge */}
            <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] text-white/90 font-bold border border-white/10">
              {formatTime(video.currentTimestamp)}
            </div>
          </div>

          {/* Video Info */}
          <div className="px-1">
            <h3 className="text-white font-bold text-sm mb-2 line-clamp-1 transition-colors leading-tight">
              {video.videoTitle}
            </h3>

            <div className="flex items-center justify-between text-[10px] font-bold tracking-wider">
              <div className="flex items-center gap-1.5 text-white/40 group-hover:text-white/60 transition-colors uppercase">
                <Clock className="w-3 h-3" />
                <span>Continuar</span>
              </div>
              <span className="text-[#bd18b4] bg-[#bd18b4]/10 px-2 py-0.5 rounded-full border border-[#bd18b4]/20">
                {video.progressPercentage}%
              </span>
            </div>
          </div>
        </div>
      </Card>
    </button>
  );
}
