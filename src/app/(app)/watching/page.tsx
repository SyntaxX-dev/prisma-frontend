'use client';

import { useState, useEffect, Suspense } from 'react';
import { Navbar } from '@/components/layout';
import { Sidebar } from '@/components/Sidebar';
import DotGrid from '@/components/shared/DotGrid';
import { LoadingGrid } from '@/components/ui/loading-grid';
import { InProgressVideoCard } from '@/components/features/course/InProgressVideoCard';
import { getInProgressVideos, InProgressVideo } from '@/api/progress/get-in-progress-videos';
import { Play, Clock, AlertCircle } from 'lucide-react';
import { usePageDataLoad } from '@/hooks/shared';

function WatchingContent() {
  const [videos, setVideos] = useState<InProgressVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDark] = useState(true);

  usePageDataLoad({
    waitForData: false,
    customDelay: 0,
  });

  useEffect(() => {
    loadInProgressVideos();
  }, []);

  const loadInProgressVideos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getInProgressVideos();
      setVideos(response.data.videos);
    } catch (err) {
      console.error('Erro ao carregar vídeos em progresso:', err);
      setError('Não foi possível carregar os vídeos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
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
      {/* DotGrid Background */}
      <div className="fixed inset-0 z-0">
        <DotGrid
          dotSize={1}
          gap={24}
          baseColor="rgba(255,255,255,0.25)"
          activeColor="#B3E240"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      <div className="relative z-10 flex">
        <Sidebar isDark={isDark} toggleTheme={() => {}} />
        <div className="flex-1">
          <Navbar isDark={isDark} toggleTheme={() => {}} />
          <div style={{ marginTop: '80px' }} className="pl-8 pr-8 py-6 w-full">
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
                <LoadingGrid size="60" color="#B3E240" />
                <p className="text-white/60 mt-4">Carregando vídeos...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-300 text-lg">{error}</p>
                <button
                  onClick={loadInProgressVideos}
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && videos.length === 0 && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
                <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-10 h-10 text-white/40" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">Nenhum vídeo em progresso</h3>
                <p className="text-white/60 mb-6">
                  Comece a assistir vídeos e eles aparecerão aqui para você continuar depois!
                </p>
                <a
                  href="/courses"
                  className="inline-block bg-green-500 hover:bg-green-600 text-black font-medium px-6 py-3 rounded-full transition-colors"
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
          <LoadingGrid size="60" color="#B3E240" />
        </div>
      }
    >
      <WatchingContent />
    </Suspense>
  );
}
