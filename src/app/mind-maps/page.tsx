'use client';

import { useState, Suspense } from 'react';
import { Brain, Calendar, Loader2 } from 'lucide-react';
import { MindMapData } from '@/api/mind-map/generate-mind-map';
import { Button } from '@/components/ui/button';
import InteractiveMindMap from '@/components/features/course/InteractiveMindMap';
import { Navbar } from '@/components/layout';
import { Sidebar } from '@/components/Sidebar';
import { BackgroundGrid } from "@/components/shared/BackgroundGrid";
import { LoadingGrid } from '@/components/ui/loading-grid';
import { usePageDataLoad } from '@/hooks/shared';
import { useMyMindMaps, useAIContentCache } from '@/hooks/features/ai-content';

function MindMapsContent() {
  const [isDark, setIsDark] = useState(true);
  const [selectedMindMap, setSelectedMindMap] = useState<MindMapData | null>(null);

  // Hook com cache para mapas mentais
  const { data: mindMaps = [], isLoading: loading, error, refetch } = useMyMindMaps();
  const { invalidateMindMaps } = useAIContentCache();

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  usePageDataLoad({
    waitForData: false,
    customDelay: 0
  });

  // Função para recarregar com invalidação de cache
  const handleRetry = async () => {
    await invalidateMindMaps();
    refetch();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white relative">
        <BackgroundGrid />

        <div className="relative z-10 flex">
          <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
          <div className="flex-1">
            <Navbar isDark={isDark} toggleTheme={toggleTheme} />
            <div className="flex items-center justify-center min-h-screen p-4 pt-28">
              <div className="text-center">
                <Loader2 className="w-8 h-8 md:w-12 md:h-12 text-[#bd18b4] animate-spin mx-auto mb-4" />
                <p className="text-sm md:text-base text-white/70">Carregando mapas mentais...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-white relative">
        <BackgroundGrid />

        <div className="relative z-10 flex">
          <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
          <div className="flex-1">
            <Navbar isDark={isDark} toggleTheme={toggleTheme} />
            <div className="flex items-center justify-center min-h-screen p-4 pt-28">
              <div className="text-center">
                <p className="text-sm md:text-base text-red-400 mb-4">Erro ao carregar mapas mentais</p>
                <Button
                  onClick={handleRetry}
                  className="bg-[#bd18b4] hover:bg-[#aa22c5] text-black font-semibold"
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative">
      <BackgroundGrid />

      <div className="relative z-10 flex">
        <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
        <div className="flex-1">
          <Navbar isDark={isDark} toggleTheme={toggleTheme} />
          <div>
            <div className="flex-1 p-4 md:p-6 ml-0 lg:ml-[280px] pt-32 md:pt-40 min-h-[calc(100vh-64px)] flex flex-col">
              {/* Header */}
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2 md:gap-3">
                  <Brain className="w-6 h-6 md:w-10 md:h-10 text-[#bd18b4]" />
                  Meus Mapas Mentais
                </h1>
                <p className="text-sm md:text-base text-white/70">
                  {mindMaps.length === 0
                    ? 'Você ainda não gerou nenhum mapa mental'
                    : `${mindMaps.length} ${mindMaps.length === 1 ? 'mapa mental gerado' : 'mapas mentais gerados'}`}
                </p>
              </div>

              {/* Mind Maps Grid */}
              {mindMaps.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <Brain className="w-16 h-16 md:w-24 md:h-24 text-white/20 mx-auto mb-6" />
                  <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">Nenhum mapa mental encontrado</h2>
                  <p className="text-sm md:text-base text-white/50 max-w-md mx-auto">
                    Vá para uma aula e gere seu primeiro mapa mental para estudo do ENEM!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl">
                  {mindMaps.map((mindMap) => (
                    <div
                      key={mindMap.id}
                      className="bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/10 hover:border-[#bd18b4]/50 transition-all cursor-pointer group flex flex-col h-full min-h-[180px] md:min-h-[200px]"
                      onClick={() => setSelectedMindMap(mindMap)}
                    >
                      <div className="flex items-start gap-2 md:gap-3 mb-3 md:mb-4">
                        <Brain className="w-5 h-5 md:w-6 md:h-6 text-[#bd18b4] flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base md:text-lg font-semibold text-white mb-1 line-clamp-2 group-hover:text-[#c532e2] transition-colors">
                            {mindMap.videoTitle}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-white/50 text-xs md:text-sm">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{formatDate(mindMap.createdAt)}</span>
                      </div>

                      <div className="flex-1" />

                      <Button
                        className="w-full mt-3 md:mt-4 bg-[#bd18b4] hover:bg-[#aa22c5] text-black font-semibold cursor-pointer text-sm md:text-base h-9 md:h-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMindMap(mindMap);
                        }}
                      >
                        <Brain className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                        Visualizar Mapa
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Modal */}
              {selectedMindMap && (
                <div
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4"
                  onClick={() => setSelectedMindMap(null)}
                >
                  <div
                    className="bg-gray-900 rounded-xl max-w-7xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal Header */}
                    <div className="p-4 md:p-6 border-b border-white/10">
                      <div className="flex items-start justify-between gap-3 md:gap-4 mb-3 md:mb-4">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg md:text-2xl font-bold text-white mb-2 line-clamp-2">{selectedMindMap.videoTitle}</h2>
                          <div className="flex items-center gap-2 text-white/50 text-xs md:text-sm">
                            <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{formatDate(selectedMindMap.createdAt)}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => setSelectedMindMap(null)}
                          variant="ghost"
                          className="text-white/70 hover:text-[#bd18b4] hover:bg-[#bd18b4]/20 cursor-pointer shrink-0 w-8 h-8 md:w-10 md:h-10 p-0"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>

                    {/* Modal Content - Apenas Mapa Mental */}
                    <div className="p-3 md:p-6 overflow-auto" style={{ height: 'calc(95vh - 120px)', maxHeight: 'calc(90vh - 150px)' }}>
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden h-full">
                        <InteractiveMindMap markdown={selectedMindMap.content} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MindMapsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoadingGrid size="60" color="#bd18b4" />
      </div>
    }>
      <MindMapsContent />
    </Suspense>
  );
}
