'use client';

import { useEffect, useState, Suspense } from 'react';
import { Brain, Calendar, FileText, Loader2 } from 'lucide-react';
import { listUserMindMaps, MindMapData } from '@/api/mind-map/generate-mind-map';
import { Button } from '@/components/ui/button';
import InteractiveMindMap from '@/components/features/course/InteractiveMindMap';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  const [viewMode, setViewMode] = useState<'interactive' | 'text'>('interactive');

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
        console.log('Mind maps response:', response);
        if (response.success && response.data && Array.isArray(response.data.mindMaps)) {
          setMindMaps(response.data.mindMaps);
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
          <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
          <div className="flex-1">
            <Navbar isDark={isDark} toggleTheme={toggleTheme} />
            <div style={{ marginTop: '80px' }} className="flex items-center justify-center min-h-[calc(100vh-80px)]">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
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
        <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
        <div className="flex-1">
          <Navbar isDark={isDark} toggleTheme={toggleTheme} />
          <div style={{ marginTop: '80px' }}>
            <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Brain className="w-10 h-10 text-green-500" />
            Meus Mapas Mentais
          </h1>
          <p className="text-white/70">
            {!Array.isArray(mindMaps) || mindMaps.length === 0
              ? 'Você ainda não gerou nenhum mapa mental'
              : `${mindMaps.length} ${mindMaps.length === 1 ? 'mapa mental gerado' : 'mapas mentais gerados'}`}
          </p>
        </div>

        {/* Mind Maps Grid */}
        {!Array.isArray(mindMaps) || mindMaps.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 text-center border border-white/10">
            <Brain className="w-20 h-20 text-white/30 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">Nenhum mapa mental encontrado</h2>
            <p className="text-white/60">
              Vá para uma aula e gere seu primeiro mapa mental para estudo do ENEM!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mindMaps.map((mindMap) => (
              <div
                key={mindMap.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-green-500/50 transition-all cursor-pointer group"
                onClick={() => setSelectedMindMap(mindMap)}
              >
                <div className="flex items-start gap-3 mb-4">
                  <Brain className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2 group-hover:text-green-400 transition-colors">
                      {mindMap.videoTitle}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(mindMap.createdAt)}</span>
                </div>

                <Button
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-black font-semibold"
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
                    className="text-white/70 hover:text-white"
                  >
                    ✕
                  </Button>
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-1 bg-white/5 backdrop-blur-sm rounded-lg p-1 w-fit">
                  <Button
                    onClick={() => setViewMode('interactive')}
                    size="sm"
                    className={
                      viewMode === 'interactive'
                        ? 'bg-green-500 text-black hover:bg-green-600'
                        : 'bg-transparent text-white/70 hover:text-white hover:bg-white/10'
                    }
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Mapa Mental
                  </Button>
                  <Button
                    onClick={() => setViewMode('text')}
                    size="sm"
                    className={
                      viewMode === 'text'
                        ? 'bg-green-500 text-black hover:bg-green-600'
                        : 'bg-transparent text-white/70 hover:text-white hover:bg-white/10'
                    }
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Texto
                  </Button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-auto" style={{ height: 'calc(90vh - 200px)' }}>
                {viewMode === 'interactive' ? (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden h-full">
                    <InteractiveMindMap markdown={selectedMindMap.content} />
                  </div>
                ) : (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 h-full overflow-auto">
                    <div className="prose prose-invert max-w-none text-white">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ ...props }) => <h1 className="text-white text-3xl font-bold mb-4" {...props} />,
                          h2: ({ ...props }) => <h2 className="text-white text-2xl font-semibold mb-3 mt-6" {...props} />,
                          h3: ({ ...props }) => <h3 className="text-white text-xl font-semibold mb-2 mt-4" {...props} />,
                          p: ({ ...props }) => <p className="text-white/80 mb-3" {...props} />,
                          li: ({ ...props }) => <li className="text-white/80" {...props} />,
                          ul: ({ ...props }) => <ul className="text-white/80 list-disc pl-6 mb-3" {...props} />,
                          ol: ({ ...props }) => <ol className="text-white/80 list-decimal pl-6 mb-3" {...props} />,
                          strong: ({ ...props }) => <strong className="text-white font-bold" {...props} />,
                        }}
                      >
                        {selectedMindMap.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
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
        <LoadingGrid size="60" color="#B3E240" />
      </div>
    }>
      <MindMapsContent />
    </Suspense>
  );
}
