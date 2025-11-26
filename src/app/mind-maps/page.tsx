'use client';

import { useEffect, useState, Suspense } from 'react';
import { Brain, Calendar, Loader2 } from 'lucide-react';
import { listUserMindMaps, MindMapData } from '@/api/mind-map/generate-mind-map';
import { Button } from '@/components/ui/button';
import InteractiveMindMap from '@/components/features/course/InteractiveMindMap';
import { Navbar } from '@/components/layout';
import { Sidebar } from '@/components/Sidebar';
import DotGrid from '@/components/shared/DotGrid';
import { LoadingGrid } from '@/components/ui/loading-grid';
import { usePageDataLoad } from '@/hooks/shared';

function MindMapsContent() {
  const [isDark, setIsDark] = useState(true);
  const [mindMaps, setMindMaps] = useState<MindMapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMindMap, setSelectedMindMap] = useState<MindMapData | null>(null);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  usePageDataLoad({
    waitForData: false,
    customDelay: 0
  });

  useEffect(() => {
    const fetchMindMaps = async () => {
      try {
        const response = await listUserMindMaps();
        if (response.success && response.data && Array.isArray(response.data.mindMaps)) {
          // Filter only mind maps (not text summaries)
          const onlyMindMaps = response.data.mindMaps.filter(
            (map) => (map.generationType || 'mindmap') === 'mindmap'
          );
          setMindMaps(onlyMindMaps);
        } else {
          setMindMaps([]);
        }
      } catch (err) {
        setError('Erro ao carregar mapas mentais');
        console.error('Error fetching mind maps:', err);
        setMindMaps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMindMaps();
  }, []);

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
        <div className="fixed inset-0 z-0">
          <DotGrid
            dotSize={1}
            gap={24}
            baseColor="rgba(255,255,255,0.25)"
            activeColor="#bd18b4"
            proximity={120}
            shockRadius={250}
            shockStrength={5}
            resistance={750}
            returnDuration={1.5}
          />
        </div>

        <div className="relative z-10 flex">
          <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
          <div className="flex-1">
            <Navbar isDark={isDark} toggleTheme={toggleTheme} />
            <div style={{ marginTop: '80px' }} className="flex items-center justify-center min-h-[calc(100vh-80px)]">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-[#bd18b4] animate-spin mx-auto mb-4" />
                <p className="text-white/70">Carregando mapas mentais...</p>
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
        <div className="fixed inset-0 z-0">
          <DotGrid
            dotSize={1}
            gap={24}
            baseColor="rgba(255,255,255,0.25)"
            activeColor="#bd18b4"
            proximity={120}
            shockRadius={250}
            shockStrength={5}
            resistance={750}
            returnDuration={1.5}
          />
        </div>

        <div className="relative z-10 flex">
          <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
          <div className="flex-1">
            <Navbar isDark={isDark} toggleTheme={toggleTheme} />
            <div style={{ marginTop: '80px' }} className="flex items-center justify-center min-h-[calc(100vh-80px)]">
              <div className="text-center">
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative">
      <div className="fixed inset-0 z-0">
        <DotGrid
          dotSize={1}
          gap={24}
          baseColor="rgba(255,255,255,0.25)"
          activeColor="#bd18b4"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      <div className="relative z-10 flex">
        <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
        <div className="flex-1">
          <Navbar isDark={isDark} toggleTheme={toggleTheme} />
          <div style={{ marginTop: '80px' }}>
            <div className="flex-1 p-6 ml-[280px] pt-10">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <Brain className="w-10 h-10 text-[#bd18b4]" />
                  Meus Mapas Mentais
                </h1>
                <p className="text-white/70">
                  {mindMaps.length === 0
                    ? 'Você ainda não gerou nenhum mapa mental'
                    : `${mindMaps.length} ${mindMaps.length === 1 ? 'mapa mental gerado' : 'mapas mentais gerados'}`}
                </p>
              </div>

              {/* Mind Maps Grid */}
              {mindMaps.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 text-center border border-white/10">
                  <Brain className="w-20 h-20 text-white/30 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-white mb-2">Nenhum mapa mental encontrado</h2>
                  <p className="text-white/60">
                    Vá para uma aula e gere seu primeiro mapa mental para estudo do ENEM!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
                  {mindMaps.map((mindMap) => (
                    <div
                      key={mindMap.id}
                      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[#bd18b4]/50 transition-all cursor-pointer group flex flex-col h-full min-h-[200px]"
                      onClick={() => setSelectedMindMap(mindMap)}
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <Brain className="w-6 h-6 text-[#bd18b4] flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2 group-hover:text-[#c532e2] transition-colors">
                            {mindMap.videoTitle}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-white/50 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(mindMap.createdAt)}</span>
                      </div>

                      <div className="flex-1" />

                      <Button
                        className="w-full mt-4 bg-[#bd18b4] hover:bg-[#aa22c5] text-black font-semibold cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMindMap(mindMap);
                        }}
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Visualizar Mapa
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Modal */}
              {selectedMindMap && (
                <div
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => setSelectedMindMap(null)}
                >
                  <div
                    className="bg-gray-900 rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal Header */}
                    <div className="p-6 border-b border-white/10">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-white mb-2">{selectedMindMap.videoTitle}</h2>
                          <div className="flex items-center gap-2 text-white/50 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(selectedMindMap.createdAt)}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => setSelectedMindMap(null)}
                          variant="ghost"
                          className="text-white/70 hover:text-[#bd18b4] hover:bg-[#bd18b4]/20 cursor-pointer"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>

                    {/* Modal Content - Apenas Mapa Mental */}
                    <div className="p-6 overflow-auto" style={{ height: 'calc(90vh - 150px)' }}>
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
