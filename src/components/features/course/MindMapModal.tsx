"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Brain, Download, Network, FileText } from "lucide-react";
import { generateMindMap, getGenerationLimits, AllLimitsInfo, GenerationType } from "@/api/mind-map/generate-mind-map";
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
  const [limitsInfo, setLimitsInfo] = useState<AllLimitsInfo | null>(null);
  const [generatedType, setGeneratedType] = useState<GenerationType | null>(null);

  // Buscar informações dos limites quando o modal abre
  useEffect(() => {
    if (open) {
      getGenerationLimits()
        .then((response) => {
          setLimitsInfo(response.data);
        })
        .catch(() => {
          // Silently fail - user can still try to generate
        });
    }
  }, [open]);


  const handleGenerate = async (type: GenerationType) => {
    setLoading(true);
    setError(null);

    try {
      const url = videoUrl || `https://youtube.com/watch?v=${youtubeId}`;
      const response = await generateMindMap({
        videoId: youtubeId || '',
        videoTitle,
        videoDescription: videoDescription || "Sem descrição disponível",
        videoUrl: url,
        generationType: type,
      });

      setMindMap(response.data.content);
      setGeneratedType(type);

      // Atualizar limites após geração bem-sucedida
      if (response.data.remainingGenerations !== undefined) {
        setLimitsInfo(prev => prev ? {
          ...prev,
          [type]: {
            ...prev[type],
            remainingGenerations: response.data.remainingGenerations!,
            generationsToday: prev[type].generationsToday + 1,
            canGenerate: response.data.remainingGenerations! > 0
          }
        } : null);
      }
    } catch (err: unknown) {
      const typeLabel = type === 'mindmap' ? 'mapa mental' : 'texto';
      let errorMessage = `Erro ao gerar ${typeLabel}`;

      const errorObj = err as { response?: { data?: { code?: string; message?: string } }; message?: string };

      // Verificar se é erro de limite excedido
      if (errorObj?.response?.data?.code === 'MIND_MAP_LIMIT_EXCEEDED' ||
          errorObj?.response?.data?.code === 'TEXT_LIMIT_EXCEEDED' ||
          errorObj?.message?.includes('Limite diário')) {
        errorMessage = errorObj?.response?.data?.message || errorObj?.message || `Você atingiu o limite diário de gerações de ${typeLabel}.`;
      } else if (errorObj?.message?.includes('503') || errorObj?.message?.includes('Service Unavailable')) {
        errorMessage = 'O serviço de AI está temporariamente indisponível. Tente novamente em alguns instantes.';
      } else if (errorObj?.message?.includes('500') || errorObj?.message?.includes('Internal Server Error')) {
        errorMessage = 'Erro interno do servidor. Por favor, tente novamente.';
      } else if (errorObj?.message?.includes('401')) {
        errorMessage = 'Erro de autenticação.';
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
          {/* Mostrar informações dos limites */}
          {limitsInfo && !mindMap && (
            <div className="mb-4 flex gap-4">
              {/* Limite Mapa Mental */}
              <div className={`flex-1 px-4 py-2 rounded-lg text-sm ${
                !limitsInfo.mindmap.canGenerate
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                  : 'bg-white/5 border border-white/10 text-white/60'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Network className="w-4 h-4" />
                  <span className="font-medium">Mapa Mental</span>
                </div>
                <span>
                  {!limitsInfo.mindmap.canGenerate
                    ? `Limite atingido (${limitsInfo.mindmap.generationsToday}/${limitsInfo.mindmap.dailyLimit})`
                    : `Restantes: ${limitsInfo.mindmap.remainingGenerations}/${limitsInfo.mindmap.dailyLimit}`
                  }
                </span>
              </div>
              {/* Limite Texto */}
              <div className={`flex-1 px-4 py-2 rounded-lg text-sm ${
                !limitsInfo.text.canGenerate
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                  : 'bg-white/5 border border-white/10 text-white/60'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Texto</span>
                </div>
                <span>
                  {!limitsInfo.text.canGenerate
                    ? `Limite atingido (${limitsInfo.text.generationsToday}/${limitsInfo.text.dailyLimit})`
                    : `Restantes: ${limitsInfo.text.remainingGenerations}/${limitsInfo.text.dailyLimit}`
                  }
                </span>
              </div>
            </div>
          )}

          {!mindMap && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-12">
              <Brain className="w-16 h-16 text-white/30 mb-4" />
              <p className="text-white/60 mb-6 text-center max-w-lg">
                Escolha o tipo de conteúdo que deseja gerar para este vídeo usando IA
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => handleGenerate('mindmap')}
                  disabled={limitsInfo ? !limitsInfo.mindmap.canGenerate : false}
                  className="bg-[#bd18b4] hover:bg-[#aa22c5] text-black font-semibold shadow-lg hover:shadow-[#bd18b4]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Network className="w-5 h-5 mr-2" />
                  Gerar Mapa Mental
                </Button>
                <Button
                  onClick={() => handleGenerate('text')}
                  disabled={limitsInfo ? !limitsInfo.text.canGenerate : false}
                  className="bg-[#1e88e5] hover:bg-[#1976d2] text-white font-semibold shadow-lg hover:shadow-[#1e88e5]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Gerar Texto
                </Button>
              </div>
              {limitsInfo && !limitsInfo.mindmap.canGenerate && !limitsInfo.text.canGenerate && (
                <p className="text-red-400 mt-4 text-sm">
                  Você atingiu o limite diário de ambos os tipos. Tente novamente amanhã.
                </p>
              )}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingGrid size="80" color="#bd18b4" />
              <div className="text-center mt-6 space-y-2">
                <p className="text-white/80 text-lg font-semibold">Gerando conteúdo com nossa IA...</p>
                <p className="text-white/50 text-sm">Isso pode levar alguns segundos. Por favor, aguarde.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-3xl">⚠️</div>
                <div className="flex-1">
                  <p className="font-semibold text-lg mb-2">Erro ao gerar conteúdo</p>
                  <p className="text-sm text-red-300 leading-relaxed mb-4">{error}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setError(null)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Voltar
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
                <div className="flex gap-2 items-center">
                  {generatedType === 'mindmap' && (
                    <span className="text-white/60 flex items-center gap-2">
                      <Network className="w-4 h-4" />
                      Mapa Mental Interativo
                    </span>
                  )}
                  {generatedType === 'text' && (
                    <span className="text-white/60 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Resumo em Texto
                    </span>
                  )}
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
                    onClick={() => {
                      setMindMap(null);
                      setGeneratedType(null);
                    }}
                    variant="ghost"
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Gerar outro
                  </Button>
                </div>
              </div>

              {generatedType === 'mindmap' ? (
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
