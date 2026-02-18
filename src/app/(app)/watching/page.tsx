'use client';

import { useState, Suspense } from 'react';
import { Navbar } from '@/components/layout';
import { Sidebar } from '@/components/Sidebar';
import { BackgroundGrid } from "@/components/shared/BackgroundGrid";
import { LoadingGrid } from '@/components/ui/loading-grid';
import { InProgressVideoCard } from '@/components/features/course/InProgressVideoCard';
import { Play, AlertCircle } from 'lucide-react';
import { usePageDataLoad } from '@/hooks/shared';
import { useInProgressVideos, useWatchingCache } from '@/hooks/features/watching';

function WatchingContent() {
  const [isDark] = useState(true);

  // Hook com cache para vídeos em progresso
  const { data: videos = [], isLoading, error, refetch } = useInProgressVideos();
  const { invalidate } = useWatchingCache();

  usePageDataLoad({
    waitForData: false,
    customDelay: 0,
  });

  // Função para recarregar com invalidação de cache
  const handleRetry = async () => {
    await invalidate();
    refetch();
  };

  const totalProgress = videos.reduce((sum, v) => sum + v.progressPercentage, 0);
  const avgProgress = videos.length > 0 ? Math.round(totalProgress / videos.length) : 0;
  const totalTimeWatched = videos.reduce((sum, v) => sum + v.currentTimestamp, 0);

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  return (
    <div className="min-h-screen text-white relative">
      <BackgroundGrid />

      <div className="relative z-10 flex">
        <Sidebar isDark={isDark} toggleTheme={() => { }} />
        <div className="flex-1">
          <Navbar isDark={isDark} toggleTheme={() => { }} />
          <div className="pl-4 md:pl-8 pr-4 md:pr-8 pt-32 md:pt-40 w-full mb-8 min-h-[calc(100vh-64px)] flex flex-col">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-white">Vistos Atualmente</h1>
                  <p className="text-white/60 text-lg">Continue de onde você parou</p>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <LoadingGrid size="60" color="#bd18b4" />
                <p className="text-white/60 mt-4">Carregando vídeos...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-300 text-lg">Não foi possível carregar os vídeos. Tente novamente.</p>
                <button
                  onClick={handleRetry}
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && videos.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <div className="bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <Play className="w-12 h-12 text-white/20" />
                </div>
                <h3 className="text-white text-xl md:text-2xl font-semibold mb-2">Nenhum vídeo em progresso</h3>
                <p className="text-white/50 mb-8 max-w-md mx-auto">
                  Comece a assistir vídeos e eles aparecerão aqui para você continuar depois!
                </p>
                <a
                  href="/courses"
                  className="inline-block bg-[#bd18b4] hover:bg-[#aa22c5] text-black font-semibold px-8 py-3 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#bd18b4]/20"
                >
                  Explorar Cursos
                </a>
              </div>
            )}

            {/* Videos List */}
            {!isLoading && !error && videos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {videos.map((video) => (
                  <InProgressVideoCard key={video.videoId} video={video} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WatchingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingGrid size="60" color="#bd18b4" />
        </div>
      }
    >
      <WatchingContent />
    </Suspense>
  );
}
