'use client';

import { useEffect, useState, Suspense } from 'react';
import { Calendar, FileText, Loader2 } from 'lucide-react';
import { listUserMindMaps, MindMapData } from '@/api/mind-map/generate-mind-map';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Navbar } from '@/components/layout';
import { Sidebar } from '@/components/Sidebar';
import { BackgroundGrid } from "@/components/shared/BackgroundGrid";
import { LoadingGrid } from '@/components/ui/loading-grid';
import { usePageDataLoad } from '@/hooks/shared';

function MySummariesContent() {
  const [isDark, setIsDark] = useState(true);
  const [summaries, setSummaries] = useState<MindMapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<MindMapData | null>(null);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  usePageDataLoad({
    waitForData: false,
    customDelay: 0
  });

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const response = await listUserMindMaps();
        if (response.success && response.data && Array.isArray(response.data.mindMaps)) {
          // Filter only text summaries
          const textSummaries = response.data.mindMaps.filter(
            (map) => map.generationType === 'text'
          );
          setSummaries(textSummaries);
        } else {
          setSummaries([]);
        }
      } catch (err) {
        setError('Erro ao carregar resumos');
        console.error('Error fetching summaries:', err);
        setSummaries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
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
        <BackgroundGrid />

        <div className="relative z-10 flex">
          <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
          <div className="flex-1">
            <Navbar isDark={isDark} toggleTheme={toggleTheme} />
            <div className="flex items-center justify-center min-h-screen p-4 pt-28">
              <div className="text-center">
                <Loader2 className="w-8 h-8 md:w-12 md:h-12 text-[#bd18b4] animate-spin mx-auto mb-4" />
                <p className="text-sm md:text-base text-white/70">Carregando resumos...</p>
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
                <p className="text-sm md:text-base text-red-400">{error}</p>
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
            <div className="flex-1 p-4 md:p-6 ml-0 lg:ml-[280px] pt-28 md:pt-32">
              {/* Header */}
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2 md:gap-3">
                  <FileText className="w-6 h-6 md:w-10 md:h-10 text-[#bd18b4]" />
                  Meus Resumos
                </h1>
                <p className="text-sm md:text-base text-white/70">
                  {summaries.length === 0
                    ? 'Você ainda não gerou nenhum resumo'
                    : `${summaries.length} ${summaries.length === 1 ? 'resumo gerado' : 'resumos gerados'}`}
                </p>
              </div>

              {/* Summaries Grid */}
              {summaries.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 md:p-12 text-center border border-white/10">
                  <FileText className="w-12 h-12 md:w-20 md:h-20 text-white/30 mx-auto mb-4" />
                  <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">Nenhum resumo encontrado</h2>
                  <p className="text-sm md:text-base text-white/60">
                    Vá para uma aula e gere seu primeiro resumo para estudo do ENEM!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl">
                  {summaries.map((summary) => (
                    <div
                      key={summary.id}
                      className="bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/10 hover:border-[#bd18b4]/50 transition-all cursor-pointer group flex flex-col h-full min-h-[180px] md:min-h-[200px]"
                      onClick={() => setSelectedSummary(summary)}
                    >
                      <div className="flex items-start gap-2 md:gap-3 mb-3 md:mb-4">
                        <FileText className="w-5 h-5 md:w-6 md:h-6 text-[#bd18b4] flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base md:text-lg font-semibold text-white mb-1 line-clamp-2 group-hover:text-[#c532e2] transition-colors">
                            {summary.videoTitle}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-white/50 text-xs md:text-sm">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{formatDate(summary.createdAt)}</span>
                      </div>

                      <div className="flex-1" />

                      <Button
                        className="w-full mt-3 md:mt-4 bg-[#bd18b4] hover:bg-[#aa22c5] text-black font-semibold cursor-pointer text-sm md:text-base h-9 md:h-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSummary(summary);
                        }}
                      >
                        <FileText className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                        Visualizar Resumo
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Modal */}
              {selectedSummary && (
                <div
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4"
                  onClick={() => setSelectedSummary(null)}
                >
                  <div
                    className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal Header */}
                    <div className="p-4 md:p-6 border-b border-white/10">
                      <div className="flex items-start justify-between gap-3 md:gap-4">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg md:text-2xl font-bold text-white mb-2 line-clamp-2">{selectedSummary.videoTitle}</h2>
                          <div className="flex items-center gap-2 text-white/50 text-xs md:text-sm">
                            <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{formatDate(selectedSummary.createdAt)}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => setSelectedSummary(null)}
                          variant="ghost"
                          className="text-white/70 hover:text-[#bd18b4] hover:bg-[#bd18b4]/20 cursor-pointer shrink-0 w-8 h-8 md:w-10 md:h-10 p-0"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>

                    {/* Modal Content */}
                    <div className="p-3 md:p-6 overflow-auto" style={{ height: 'calc(95vh - 120px)', maxHeight: 'calc(90vh - 150px)' }}>
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 md:p-6 h-full overflow-auto">
                        <div className="prose prose-invert max-w-none text-white prose-sm md:prose-base">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ ...props }) => <h1 className="text-white text-2xl md:text-3xl font-bold mb-3 md:mb-4" {...props} />,
                              h2: ({ ...props }) => <h2 className="text-white text-xl md:text-2xl font-semibold mb-2 md:mb-3 mt-4 md:mt-6" {...props} />,
                              h3: ({ ...props }) => <h3 className="text-white text-lg md:text-xl font-semibold mb-2 mt-3 md:mt-4" {...props} />,
                              p: ({ ...props }) => <p className="text-white/80 mb-2 md:mb-3 text-sm md:text-base" {...props} />,
                              li: ({ ...props }) => <li className="text-white/80 text-sm md:text-base" {...props} />,
                              ul: ({ ...props }) => <ul className="text-white/80 list-disc pl-4 md:pl-6 mb-2 md:mb-3 text-sm md:text-base" {...props} />,
                              ol: ({ ...props }) => <ol className="text-white/80 list-decimal pl-4 md:pl-6 mb-2 md:mb-3 text-sm md:text-base" {...props} />,
                              strong: ({ ...props }) => <strong className="text-white font-bold" {...props} />,
                            }}
                          >
                            {selectedSummary.content}
                          </ReactMarkdown>
                        </div>
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

export default function MySummariesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoadingGrid size="60" color="#bd18b4" />
      </div>
    }>
      <MySummariesContent />
    </Suspense>
  );
}
