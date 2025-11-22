"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Brain, Download, Network, FileText } from "lucide-react";
import { generateMindMap } from "@/api/mind-map/generate-mind-map";
import { LoadingGrid } from "../../ui/loading-grid";
import InteractiveMindMap from "./InteractiveMindMap";
import ReactMarkdown from 'react-markdown';

interface MindMapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoTitle: string;
  videoDescription?: string;
  videoUrl?: string;
  youtubeId?: string;
}

export function MindMapModal({
  open,
  onOpenChange,
  videoTitle,
  videoDescription,
  videoUrl,
  youtubeId
}: MindMapModalProps) {
  const [mindMap, setMindMap] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'interactive' | 'markdown'>('interactive');

  const handleGenerateMindMap = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = videoUrl || `https://youtube.com/watch?v=${youtubeId}`;
      const response = await generateMindMap({
        videoId: youtubeId || '',
        videoTitle,
        videoDescription: videoDescription || "Sem descrição disponível",
        videoUrl: url,
      });

      setMindMap(response.data.content);
    } catch (err: any) {
      // Melhorar mensagem de erro
      let errorMessage = 'Erro ao gerar mapa mental';

      if (err?.message?.includes('503') || err?.message?.includes('Service Unavailable')) {
        errorMessage = '⚠️ O serviço de AI está temporariamente indisponível. Tente novamente em alguns instantes.';
      } else if (err?.message?.includes('500') || err?.message?.includes('Internal Server Error')) {
        errorMessage = '⚠️ Erro interno do servidor. Por favor, tente novamente.';
      } else if (err?.message?.includes('401')) {
        errorMessage = '🔑 Erro de autenticação.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!mindMap) return;

    const blob = new Blob([mindMap], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mapa-mental-${videoTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setMindMap(null);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!max-w-[96vw] !w-[96vw] !h-[96vh] !max-h-[96vh] !p-6 overflow-hidden bg-gradient-to-br from-gray-900 to-black border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#c532e2]" />
            Mapa Mental Interativo
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {videoTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {!mindMap && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-12">
              <Brain className="w-16 h-16 text-white/30 mb-4" />
              <p className="text-white/60 mb-6 text-center">
                Clique no botão abaixo para gerar um mapa mental inteligente deste vídeo usando IA
              </p>
              <Button
                onClick={handleGenerateMindMap}
                className="bg-[#bd18b4] hover:bg-[#aa22c5] text-black font-semibold shadow-lg hover:shadow-[#bd18b4]/25 transition-all"
              >
                <Brain className="w-5 h-5 mr-2" />
                Gerar Mapa Mental
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingGrid size="80" color="#bd18b4" />
              <div className="text-center mt-6 space-y-2">
                <p className="text-white/80 text-lg font-semibold">Gerando mapa mental com nossa IA...</p>
                <p className="text-white/50 text-sm">Isso pode levar alguns segundos. Por favor, aguarde.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-3xl">⚠️</div>
                <div className="flex-1">
                  <p className="font-semibold text-lg mb-2">Erro ao gerar mapa mental</p>
                  <p className="text-sm text-red-300 leading-relaxed mb-4">{error}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleGenerateMindMap}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Tentar novamente
                    </Button>
                    <Button
                      onClick={handleClose}
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {mindMap && (
            <div className="space-y-4 h-[calc(96vh-160px)]">
              <div className="flex justify-between items-center gap-2">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setViewMode('interactive')}
                    variant={viewMode === 'interactive' ? 'default' : 'ghost'}
                    className={viewMode === 'interactive'
                      ? 'bg-[#bd18b4] hover:bg-[#aa22c5] text-black'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                    }
                  >
                    <Network className="w-4 h-4 mr-2" />
                    Mapa Mental
                  </Button>
                  <Button
                    onClick={() => setViewMode('markdown')}
                    variant={viewMode === 'markdown' ? 'default' : 'ghost'}
                    className={viewMode === 'markdown'
                      ? 'bg-[#bd18b4] hover:bg-[#aa22c5] text-black'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                    }
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Texto
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleDownload}
                    variant="ghost"
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                  <Button
                    onClick={handleGenerateMindMap}
                    variant="ghost"
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Gerar novamente
                  </Button>
                </div>
              </div>

              {viewMode === 'interactive' ? (
                <div className="h-full border border-white/10 rounded-lg overflow-hidden">
                  <InteractiveMindMap markdown={mindMap} />
                </div>
              ) : (
                <div className="h-full overflow-y-auto prose prose-invert max-w-none bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-3xl font-bold text-[#c532e2] mb-4 text-center">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-2xl font-semibold text-white mt-6 mb-3">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-xl font-medium text-white/90 mt-4 mb-2">{children}</h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside text-white/70 space-y-2 ml-4">{children}</ul>
                      ),
                      li: ({ children }) => (
                        <li className="text-white/80">{children}</li>
                      ),
                      p: ({ children }) => (
                        <p className="text-white/70 leading-relaxed mb-3">{children}</p>
                      ),
                    }}
                  >
                    {mindMap}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
