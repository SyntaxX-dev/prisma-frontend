"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Brain, Download, Network, FileText, Loader2 } from "lucide-react";
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
  const [downloading, setDownloading] = useState(false);

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

  const handleDownload = async () => {
    if (!mindMap) return;

    setDownloading(true);

    try {
      // Importar jsPDF diretamente (evita html2canvas e o erro oklch)
      const { jsPDF } = await import('jspdf');

      const fileName = generatedType === 'mindmap'
        ? `mapa-mental-${videoTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
        : `resumo-${videoTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;

      // Função para normalizar texto (remover emojis e caracteres especiais problemáticos)
      const normalizeText = (text: string): string => {
        return text
          // Remover emojis e símbolos especiais
          .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
          .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Símbolos diversos
          .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transporte e mapas
          .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Bandeiras
          .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Símbolos diversos
          .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
          .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation selectors
          .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Símbolos suplementares
          .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Símbolos de xadrez
          .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Símbolos estendidos
          .replace(/[\u{231A}-\u{231B}]/gu, '')   // Watch, hourglass
          .replace(/[\u{23E9}-\u{23F3}]/gu, '')   // Outros símbolos de mídia
          .replace(/[\u{23F8}-\u{23FA}]/gu, '')   // Controles de mídia
          .replace(/[\u{25AA}-\u{25AB}]/gu, '')   // Quadrados
          .replace(/[\u{25B6}]/gu, '')            // Play
          .replace(/[\u{25C0}]/gu, '')            // Reverse
          .replace(/[\u{25FB}-\u{25FE}]/gu, '')   // Quadrados médios
          .replace(/[\u{2614}-\u{2615}]/gu, '')   // Guarda-chuva e café
          .replace(/[\u{2648}-\u{2653}]/gu, '')   // Signos do zodíaco
          .replace(/[\u{267F}]/gu, '')            // Cadeira de rodas
          .replace(/[\u{2693}]/gu, '')            // Âncora
          .replace(/[\u{26A1}]/gu, '')            // Raio
          .replace(/[\u{26AA}-\u{26AB}]/gu, '')   // Círculos
          .replace(/[\u{26BD}-\u{26BE}]/gu, '')   // Bolas de esporte
          .replace(/[\u{26C4}-\u{26C5}]/gu, '')   // Boneco de neve e sol
          .replace(/[\u{26CE}]/gu, '')            // Ofiúco
          .replace(/[\u{26D4}]/gu, '')            // Proibido
          .replace(/[\u{26EA}]/gu, '')            // Igreja
          .replace(/[\u{26F2}-\u{26F3}]/gu, '')   // Fonte e golfe
          .replace(/[\u{26F5}]/gu, '')            // Veleiro
          .replace(/[\u{26FA}]/gu, '')            // Barraca
          .replace(/[\u{26FD}]/gu, '')            // Posto de gasolina
          .replace(/[\u{2702}]/gu, '')            // Tesoura
          .replace(/[\u{2705}]/gu, '')            // Check verde
          .replace(/[\u{2708}-\u{270D}]/gu, '')   // Avião e outros
          .replace(/[\u{270F}]/gu, '')            // Lápis
          .replace(/[\u{2712}]/gu, '')            // Caneta preta
          .replace(/[\u{2714}]/gu, '')            // Check pesado
          .replace(/[\u{2716}]/gu, '')            // X pesado
          .replace(/[\u{271D}]/gu, '')            // Cruz latina
          .replace(/[\u{2721}]/gu, '')            // Estrela de Davi
          .replace(/[\u{2728}]/gu, '')            // Brilhos
          .replace(/[\u{2733}-\u{2734}]/gu, '')   // Asteriscos
          .replace(/[\u{2744}]/gu, '')            // Floco de neve
          .replace(/[\u{2747}]/gu, '')            // Sparkle
          .replace(/[\u{274C}]/gu, '')            // X vermelho
          .replace(/[\u{274E}]/gu, '')            // X verde
          .replace(/[\u{2753}-\u{2755}]/gu, '')   // Interrogações
          .replace(/[\u{2757}]/gu, '')            // Exclamação
          .replace(/[\u{2763}-\u{2764}]/gu, '')   // Corações
          .replace(/[\u{2795}-\u{2797}]/gu, '')   // Matemática
          .replace(/[\u{27A1}]/gu, '')            // Seta direita
          .replace(/[\u{27B0}]/gu, '')            // Loop
          .replace(/[\u{27BF}]/gu, '')            // Loop duplo
          .replace(/[\u{2934}-\u{2935}]/gu, '')   // Setas curvas
          .replace(/[\u{2B05}-\u{2B07}]/gu, '')   // Setas
          .replace(/[\u{2B1B}-\u{2B1C}]/gu, '')   // Quadrados grandes
          .replace(/[\u{2B50}]/gu, '')            // Estrela
          .replace(/[\u{2B55}]/gu, '')            // Círculo vermelho
          .replace(/[\u{3030}]/gu, '')            // Linha ondulada
          .replace(/[\u{303D}]/gu, '')            // Part alternation mark
          .replace(/[\u{3297}]/gu, '')            // Circled Ideograph Congratulation
          .replace(/[\u{3299}]/gu, '')            // Circled Ideograph Secret
          .replace(/[^\x00-\x7F\u00C0-\u00FF\u0100-\u017F]/g, '') // Manter apenas ASCII e Latin Extended
          .trim();
      };

      // Criar documento PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Função para adicionar nova página se necessário
      const checkNewPage = (height: number) => {
        if (yPosition + height > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
      };

      // Título do documento
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(197, 50, 226); // #c532e2
      const titleLines = doc.splitTextToSize(normalizeText(videoTitle), maxWidth);
      checkNewPage(titleLines.length * 8);
      doc.text(titleLines, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += titleLines.length * 8 + 5;

      // Linha decorativa
      doc.setDrawColor(197, 50, 226);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Processar o markdown linha por linha
      const lines = mindMap.split('\n');

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          yPosition += 3;
          continue;
        }

        // Headers
        if (trimmedLine.startsWith('# ')) {
          checkNewPage(12);
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(197, 50, 226);
          const text = normalizeText(trimmedLine.replace('# ', ''));
          const splitText = doc.splitTextToSize(text, maxWidth);
          doc.text(splitText, margin, yPosition);
          yPosition += splitText.length * 7 + 5;
        } else if (trimmedLine.startsWith('## ')) {
          checkNewPage(10);
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(80, 80, 80);
          const text = normalizeText(trimmedLine.replace('## ', ''));
          const splitText = doc.splitTextToSize(text, maxWidth);
          doc.text(splitText, margin, yPosition);
          yPosition += splitText.length * 6 + 4;
        } else if (trimmedLine.startsWith('### ')) {
          checkNewPage(8);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(100, 100, 100);
          const text = normalizeText(trimmedLine.replace('### ', ''));
          const splitText = doc.splitTextToSize(text, maxWidth);
          doc.text(splitText, margin, yPosition);
          yPosition += splitText.length * 5 + 3;
        }
        // Lista com bullet
        else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          checkNewPage(6);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          const text = trimmedLine.replace(/^[-*] /, '');
          const cleanText = normalizeText(text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1'));
          const splitText = doc.splitTextToSize(`- ${cleanText}`, maxWidth - 5);
          doc.text(splitText, margin + 5, yPosition);
          yPosition += splitText.length * 5 + 2;
        }
        // Lista numerada
        else if (/^\d+\.\s/.test(trimmedLine)) {
          checkNewPage(6);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          const cleanText = normalizeText(trimmedLine.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1'));
          const splitText = doc.splitTextToSize(cleanText, maxWidth - 5);
          doc.text(splitText, margin + 5, yPosition);
          yPosition += splitText.length * 5 + 2;
        }
        // Texto normal
        else {
          checkNewPage(6);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          const cleanText = normalizeText(trimmedLine.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1'));
          const splitText = doc.splitTextToSize(cleanText, maxWidth);
          doc.text(splitText, margin, yPosition);
          yPosition += splitText.length * 5 + 2;
        }
      }

      // Rodapé
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text('Gerado por Prisma Study Platform', pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(`Pagina ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      }

      // Salvar PDF
      doc.save(fileName);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setDownloading(false);
    }
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
                    disabled={downloading}
                    variant="ghost"
                    className="text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-50"
                  >
                    {downloading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {downloading ? 'Gerando PDF...' : 'Baixar PDF'}
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
