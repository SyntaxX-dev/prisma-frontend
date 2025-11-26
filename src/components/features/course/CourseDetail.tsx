import { Play, Clock, Download, Share2, Lock, CheckCircle, FileText, MessageSquare, ChevronDown, ArrowLeft, Brain, Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { useState, useEffect, useRef, useCallback } from "react";
import { ScrollArea } from "../../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { useRouter } from "next/navigation";
import { useNavigationWithLoading } from "@/hooks/shared";
import { LoadingGrid } from "../../ui/loading-grid";
import { markVideoCompleted } from "@/api/progress/mark-video-completed";
import { getModulesWithVideos } from "@/api/modules/get-modules-by-subcourse";
import type { CourseProgress } from "@/types/progress";
import type { Video as ModuleVideo, ModuleProgress, ModuleWithVideos } from "@/api/modules/get-modules-by-subcourse";
import Image from "next/image";
import { useCacheInvalidation } from "@/hooks/shared";
import { saveVideoTimestamp } from "@/api/progress/save-video-timestamp";
import { getInProgressVideos } from "@/api/progress/get-in-progress-videos";
import InteractiveMindMap from "./InteractiveMindMap";
import { generateMindMap, getMindMapByVideo, getGenerationLimits, AllLimitsInfo, GenerationType } from "@/api/mind-map/generate-mind-map";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const modulesWithVideosCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000;

const getModulesWithVideosCached = async (subCourseId: string) => {
  const now = Date.now();
  const cached = modulesWithVideosCache.get(subCourseId);
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await getModulesWithVideos(subCourseId);
  modulesWithVideosCache.set(subCourseId, { data, timestamp: now });
  return data;
};

export const clearModulesCache = (subCourseId?: string) => {
  if (subCourseId) {
    modulesWithVideosCache.delete(subCourseId);
  } else {
    modulesWithVideosCache.clear();
  }
};

interface Video {
  id: string;
  title: string;
  duration: string;
  watched: boolean;
  locked: boolean;
  description?: string;
  youtubeId?: string;
  thumbnailUrl?: string;
  url?: string;
  order?: number;
  channelTitle?: string;
  channelThumbnailUrl?: string;
  viewCount?: number;
  isCompleted?: boolean;
  completedAt?: string | null;
  moduleId?: string;
  videoId?: string;
}

interface ModuleDisplay {
  id: string;
  title: string;
  totalDuration: string;
  videosCount: number;
  completedVideos: number;
  videos: Video[];
}

interface CourseDetailProps {
  onVideoPlayingChange?: (isPlaying: boolean) => void;
  isVideoPlaying?: boolean;
  subCourseId?: string;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

export function CourseDetail({ onVideoPlayingChange, isVideoPlaying = false, subCourseId }: CourseDetailProps) {

  const { navigateWithLoading } = useNavigationWithLoading();
  const { invalidateTags } = useCacheInvalidation();
  const router = useRouter();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(["1"]));
  const [localVideoPlaying, setLocalVideoPlaying] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetchedSubCourseId, setLastFetchedSubCourseId] = useState<string | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [mindMap, setMindMap] = useState<string | null>(null);
  const [mindMapLoading, setMindMapLoading] = useState(false);
  const [mindMapError, setMindMapError] = useState<string | null>(null);
  const [limitsInfo, setLimitsInfo] = useState<AllLimitsInfo | null>(null);
  const [generatedType, setGeneratedType] = useState<GenerationType | null>(null);
  const [downloading, setDownloading] = useState(false);
  const fetchingRef = useRef(false);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const savedTimestampRef = useRef<number>(0);

  const fetchModules = async () => {
    if (!subCourseId) {
      return;
    }

    if (fetchingRef.current) {
      return;
    }

    if (lastFetchedSubCourseId === subCourseId) {
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);

      // Uma única requisição para buscar todos os módulos com vídeos (com cache)
      const modulesData = await getModulesWithVideosCached(subCourseId);

      if (modulesData.success && modulesData.data && modulesData.data.modules) {
        
        const allVideos: Video[] = [];
        let totalVideos = 0;
        let completedVideos = 0;
        const moduleProgressMap = new Map<string, ModuleProgress>();

        // Processar cada módulo que já vem com vídeos
        for (const moduleData of modulesData.data.modules) {
          if (!moduleData.videos || !Array.isArray(moduleData.videos)) {
            continue;
          }

          if (moduleData.videos.length === 0) {
            continue;
          }

          const moduleVideos = moduleData.videos.map((video: ModuleVideo): Video => ({
            id: video.id,
            title: video.title,
            duration: formatDuration(video.duration || 0),
            watched: video.progress?.isCompleted || false,
            locked: false,
            description: video.description || "Descrição não disponível para esta aula.",
            youtubeId: video.videoId,
            thumbnailUrl: video.thumbnailUrl,
            url: video.url,
            order: video.order || 0,
            channelTitle: video.channelTitle,
            channelThumbnailUrl: video.channelThumbnailUrl,
            viewCount: video.viewCount,
            isCompleted: video.progress?.isCompleted || false,
            completedAt: video.progress?.completedAt || null,
            moduleId: video.moduleId,
            videoId: video.videoId
          }));

          allVideos.push(...moduleVideos);

          // Usar dados de progresso do módulo que já vêm na resposta
          if (moduleData.moduleProgress) {
            totalVideos += moduleData.moduleProgress.totalVideos;
            completedVideos += moduleData.moduleProgress.completedVideos;
            moduleProgressMap.set(moduleData.id, moduleData.moduleProgress);
          } else {
            totalVideos += moduleVideos.length;
            completedVideos += moduleVideos.filter((v: Video) => v.isCompleted).length;
          }
        }

        setVideos(allVideos);
        setLastFetchedSubCourseId(subCourseId);

        if (allVideos.length > 0) {
          setSelectedVideo(allVideos[0]);
        } else {
          setSelectedVideo(null);
        }

        const progressPercentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

        setCourseProgress({
          subCourseId: subCourseId,
          subCourseName: "Curso",
          totalVideos,
          completedVideos,
          progressPercentage,
          isCompleted: completedVideos === totalVideos
        });
      }
    } catch (err) {
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  // Execute fetchModules only when subCourseId changes
  useEffect(() => {
    if (subCourseId && subCourseId !== lastFetchedSubCourseId) {
      fetchModules();
    }
  }, [subCourseId]);

  useEffect(() => {
    if (onVideoPlayingChange) {
      onVideoPlayingChange(localVideoPlaying);
    }
  }, [localVideoPlaying, onVideoPlayingChange]);

  useEffect(() => {
    if (localVideoPlaying) {
      setIframeKey(prev => prev + 1);
    }
  }, [localVideoPlaying]);

  // Inicializar YouTube Player API para rastreamento de progresso
  useEffect(() => {
    if (!selectedVideo?.youtubeId) return;


    // Carregar YouTube IFrame API se necessário
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Buscar progresso salvo antes de criar o player
    const fetchSavedProgress = async () => {
      try {
        const response = await getInProgressVideos();
        const savedVideo = response.data.videos.find(v => v.videoId === selectedVideo.youtubeId);

        if (savedVideo && savedVideo.currentTimestamp) {
          savedTimestampRef.current = savedVideo.currentTimestamp;
        } else {
          savedTimestampRef.current = 0;
        }
      } catch (error) {
        savedTimestampRef.current = 0;
      }
    };

    // Aguardar e inicializar player
    const initPlayer = async () => {
      // Buscar progresso salvo primeiro
      await fetchSavedProgress();

      if (window.YT && window.YT.Player) {
        const containerId = `youtube-player-${selectedVideo.id}`;
        const container = document.getElementById(containerId);

        if (container) {
          try {
            // Destruir player existente se houver
            if (playerRef.current) {
              playerRef.current.destroy();
              playerRef.current = null;
            }

            // Criar novo player - a API criará o iframe automaticamente
            playerRef.current = new window.YT.Player(containerId, {
              videoId: selectedVideo.youtubeId,
              playerVars: {
                autoplay: localVideoPlaying ? 1 : 0,
                controls: 1,
                enablejsapi: 1,
                modestbranding: 1,
                rel: 0,
                start: Math.floor(savedTimestampRef.current), // Iniciar do progresso salvo
              },
              events: {
                onReady: (event: any) => {
                  // Se deve estar tocando, iniciar
                  if (localVideoPlaying) {
                    event.target.playVideo();
                  }
                },
                onStateChange: async (event: any) => {
                  if (event.data === 1) { // PLAYING
                    setLocalVideoPlaying(true);
                    startProgressTracking();
                  } else if (event.data === 2) { // PAUSED
                    setLocalVideoPlaying(false);
                    stopProgressTracking();
                    saveProgress();
                  } else if (event.data === 0) { // ENDED
                    setLocalVideoPlaying(false);
                    stopProgressTracking();

                    // Marcar vídeo como completado (sempre true quando terminar)
                    if (selectedVideo?.videoId) {
                      try {
                        // Se já estiver completado, não fazer nada
                        if (selectedVideo.isCompleted) {
                          return;
                        }

                        // Marcar como completado no backend
                        await markVideoCompleted({
                          videoId: selectedVideo.videoId,
                          isCompleted: true
                        });

                        // Atualizar estado local
                        setVideos(prevVideos =>
                          prevVideos.map(v =>
                            v.id === selectedVideo.id
                              ? { ...v, isCompleted: true, watched: true, completedAt: new Date().toISOString() }
                              : v
                          )
                        );

                        setSelectedVideo(prev => prev ? {
                          ...prev,
                          isCompleted: true,
                          watched: true,
                          completedAt: new Date().toISOString()
                        } : null);

                        // Atualizar progresso do curso
                        setCourseProgress(prev => {
                          if (!prev) return null;
                          const newCompleted = prev.completedVideos + 1;
                          return {
                            ...prev,
                            completedVideos: newCompleted,
                            progressPercentage: Math.round((newCompleted / prev.totalVideos) * 100),
                            isCompleted: newCompleted === prev.totalVideos
                          };
                        });

                        // Invalidar cache
                        await invalidateTags(['offensives', 'streak']);

                      } catch (error) {
                      }
                    }
                  }
                }
              }
            });
          } catch (error) {
          }
        }
      }
    };

    // Aguardar API estar pronta
    const waitForYT = () => {
      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        const timer = setTimeout(waitForYT, 100);
        return () => clearTimeout(timer);
      }
    };

    const timer = setTimeout(waitForYT, 500);

    return () => {
      clearTimeout(timer);
      stopProgressTracking();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
        }
        playerRef.current = null;
      }
    };
  }, [selectedVideo?.id, selectedVideo?.youtubeId]);

  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Salvar progresso a cada 1 segundo
    progressIntervalRef.current = setInterval(() => {
      saveProgress();
    }, 1000);

  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const saveProgress = async () => {
    if (!playerRef.current || !selectedVideo?.youtubeId) return;

    try {
      const currentTime = Math.floor(playerRef.current.getCurrentTime?.() || 0);
      const duration = Math.floor(playerRef.current.getDuration?.() || 0);

      // Salvar até 1 segundo antes do final (para não conflitar com o evento ENDED)
      if (currentTime > 0 && currentTime < duration - 1) {
        const response = await saveVideoTimestamp({
          videoId: selectedVideo.youtubeId,
          timestamp: currentTime,
        });
      } else if (currentTime >= duration - 1) {
      }
    } catch (error) {
      // Erro ao salvar progresso
    }
  };

  const modules: ModuleDisplay[] = (() => {
    if (videos.length === 0) return [];

    const hasModuleIds = videos.some(v => v.moduleId && v.moduleId !== 'default-module');

    if (hasModuleIds) {
      const moduleMap = new Map<string, Video[]>();
      videos.forEach(video => {
        const moduleId = video.moduleId || 'default-module';
        if (!moduleMap.has(moduleId)) {
          moduleMap.set(moduleId, []);
        }
        moduleMap.get(moduleId)!.push(video);
      });

      return Array.from(moduleMap.entries()).map(([moduleId, moduleVideos], index) => {
        const videosCount = moduleVideos.length;
        const completedVideos = moduleVideos.filter(v => v.isCompleted).length;

        return {
          id: moduleId,
          title: `Módulo ${index + 1}`,
          totalDuration: `${videosCount} vídeo${videosCount !== 1 ? 's' : ''}`,
          videosCount,
          completedVideos,
          videos: moduleVideos.sort((a, b) => (a.order || 0) - (b.order || 0))
        };
      });
    } else {
      const totalVideos = videos.length;
      const completedVideos = videos.filter(v => v.isCompleted).length;

      return [{
        id: "1",
        title: "Vídeos do Curso",
        totalDuration: `${totalVideos} vídeo${totalVideos !== 1 ? 's' : ''}`,
        videosCount: totalVideos,
        completedVideos,
        videos: videos.sort((a, b) => (a.order || 0) - (b.order || 0))
      }];
    }
  })();

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleVideoSelect = (video: Video) => {
    if (!video.locked) {
      setSelectedVideo(video);
      setLocalVideoPlaying(false);
    }
  };

  const handleMarkVideoComplete = async (video: Video) => {
    if (!video.videoId) return;

    const isCompleted = !video.isCompleted;

    setVideos(prevVideos =>
      prevVideos.map(v =>
        v.id === video.id
          ? {
            ...v,
            isCompleted: isCompleted,
            watched: isCompleted,
            completedAt: isCompleted ? new Date().toISOString() : null
          }
          : v
      )
    );

    if (selectedVideo?.id === video.id) {
      setSelectedVideo((prev: Video | null) => prev ? {
        ...prev,
        isCompleted: isCompleted,
        watched: isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : null
      } : null);
    }

    setCourseProgress((prev: CourseProgress | null) => {
      if (!prev) return null;

      const newCompletedVideos = isCompleted
        ? prev.completedVideos + 1
        : prev.completedVideos - 1;

      const newProgressPercentage = Math.round((newCompletedVideos / prev.totalVideos) * 100);

      return {
        ...prev,
        completedVideos: newCompletedVideos,
        progressPercentage: newProgressPercentage,
        isCompleted: newCompletedVideos === prev.totalVideos
      };
    });

    try {
      const response = await markVideoCompleted({
        videoId: video.videoId,
        isCompleted: isCompleted
      });
      
      // Invalidar cache de offensives para atualizar o calendário
      try {
        await invalidateTags(['offensives', 'streak']);
        
        // Forçar refetch dos dados de offensives
        if (typeof window !== 'undefined' && (window as any).refetchOffensives) {
          await (window as any).refetchOffensives();
        }
      } catch (error) {
      }
      
      if (response.success && response.data.courseProgress) {
        setCourseProgress((prev: CourseProgress | null) => prev ? {
          ...prev,
          totalVideos: response.data.courseProgress.totalVideos,
          completedVideos: response.data.courseProgress.completedVideos,
          progressPercentage: response.data.courseProgress.progressPercentage,
          isCompleted: response.data.courseProgress.completedVideos === response.data.courseProgress.totalVideos
        } : null);
      }
    } catch (error) {
      setVideos(prevVideos =>
        prevVideos.map(v =>
          v.id === video.id
            ? {
              ...v,
              isCompleted: !isCompleted,
              watched: !isCompleted,
              completedAt: !isCompleted ? new Date().toISOString() : null
            }
            : v
        )
      );

      if (selectedVideo?.id === video.id) {
        setSelectedVideo((prev: Video | null) => prev ? {
          ...prev,
          isCompleted: !isCompleted,
          watched: !isCompleted,
          completedAt: !isCompleted ? new Date().toISOString() : null
        } : null);
      }

      setCourseProgress((prev: CourseProgress | null) => {
        if (!prev) return null;

        const revertedCompletedVideos = !isCompleted
          ? prev.completedVideos + 1
          : prev.completedVideos - 1;

        const revertedProgressPercentage = Math.round((revertedCompletedVideos / prev.totalVideos) * 100);

        return {
          ...prev,
          completedVideos: revertedCompletedVideos,
          progressPercentage: revertedProgressPercentage,
          isCompleted: revertedCompletedVideos === prev.totalVideos
        };
      });
    }
  };

  const fetchExistingMindMap = useCallback(async () => {
    if (!selectedVideo?.id) return;

    // Resetar estado do mapa mental quando muda de vídeo
    setMindMap(null);
    setMindMapError(null);
    setGeneratedType(null);

    try {
      const response = await getMindMapByVideo(selectedVideo.id);

      if (response.success && response.data) {
        setMindMap(response.data.content);
        // Usar o tipo de geração salvo ou padrão para 'mindmap' para compatibilidade
        setGeneratedType(response.data.generationType || 'mindmap');
      }
    } catch {
      // Silenciosamente falha - não há mapa mental existente
      console.log('Nenhum mapa mental existente encontrado');
    }
  }, [selectedVideo?.id]);

  // Buscar limite de mapas mentais
  const fetchLimitsInfo = useCallback(async () => {
    try {
      const response = await getGenerationLimits();
      setLimitsInfo(response.data);
    } catch {
      // Silently fail
    }
  }, []);

  // Buscar limite quando componente monta
  useEffect(() => {
    fetchLimitsInfo();
  }, [fetchLimitsInfo]);

  const handleGenerate = async (type: GenerationType) => {
    if (!selectedVideo) return;

    setMindMapLoading(true);
    setMindMapError(null);

    try {
      const url = selectedVideo.url || `https://youtube.com/watch?v=${selectedVideo.youtubeId}`;
      const response = await generateMindMap({
        videoId: selectedVideo.id,
        videoTitle: selectedVideo.title,
        videoDescription: selectedVideo.description || "Sem descrição disponível",
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

      const message = err instanceof Error ? err.message : String(err);

      // Verificar se é erro de limite excedido
      if (message.includes('Limite diário') || message.includes('LIMIT_EXCEEDED')) {
        errorMessage = message || `Você atingiu o limite diário de gerações de ${typeLabel}.`;
      } else if (message.includes('503') || message.includes('Service Unavailable')) {
        errorMessage = 'O serviço de AI está temporariamente indisponível. Tente novamente em alguns instantes.';
      } else if (message.includes('500') || message.includes('Internal Server Error')) {
        errorMessage = 'Erro interno do servidor. Por favor, tente novamente.';
      } else if (message.includes('401') || message.includes('API Key')) {
        errorMessage = 'Erro de autenticação com a API.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setMindMapError(errorMessage);
    } finally {
      setMindMapLoading(false);
    }
  };

  // Buscar mapa mental existente quando o vídeo mudar
  useEffect(() => {
    fetchExistingMindMap();
  }, [fetchExistingMindMap]);

  const handleDownloadPdf = async () => {
    if (!mindMap || !selectedVideo) return;

    setDownloading(true);

    try {
      // Importar jsPDF diretamente (evita html2canvas e o erro oklch)
      const { jsPDF } = await import('jspdf');

      const fileName = generatedType === 'mindmap'
        ? `mapa-mental-${selectedVideo.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
        : `resumo-${selectedVideo.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;

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
      const titleLines = doc.splitTextToSize(normalizeText(selectedVideo.title), maxWidth);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoadingGrid size="80" color="#bd18b4" />
      </div>
    );
  }

  if (!loading && videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center text-white">
          <h2 className="text-xl font-semibold mb-2">Nenhum vídeo encontrado</h2>
          <p className="text-white/60">Este subcurso não possui vídeos disponíveis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-1 h-[calc(100vh-4rem)] bg-transparent overflow-hidden transition-all duration-300 ease-in-out ${isVideoPlaying ? 'ml-0 right-16' : 'ml-4 right-0'}`}>
      <div className="relative z-10 flex-1 flex flex-col overflow-y-auto overflow-x-hidden bg-transparent">
        <div className={`pb-0 transition-all duration-300 ease-in-out ${isVideoPlaying ? 'p-1' : 'p-4'}`}>
          <div className="flex items-start">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                router.back();
              }}
              className="text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </div>
        </div>
        <div className="relative bg-black aspect-video shadow-2xl rounded-4xl w-full max-h-[800px]">
          {selectedVideo?.youtubeId ? (
            <>
              {/* Container onde o YouTube Player API criará o iframe */}
              <div
                id={`youtube-player-${selectedVideo?.id}`}
                className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden"
              />

              {!localVideoPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-3xl cursor-pointer z-10 hover:bg-black/30 transition-all duration-300"
                  onClick={() => {
                    if (playerRef.current) {
                      playerRef.current.playVideo();
                      setLocalVideoPlaying(true);
                    }
                  }}
                >
                  <div className="bg-[#bd18b4] hover:bg-[#aa22c5] rounded-full w-24 h-24 flex items-center justify-center shadow-2xl hover:shadow-[#bd18b4]/25 transition-all">
                    <Play className="w-10 h-10 text-black ml-1" fill="black" />
                  </div>
                </div>
              )}

              {localVideoPlaying && (
                <div
                  className="absolute top-4 right-4 z-20"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/20"
                    onClick={() => {
                      if (playerRef.current) {
                        playerRef.current.pauseVideo();
                        setLocalVideoPlaying(false);
                      }
                    }}
                  >
                    Pausar
                  </Button>
                </div>
              )}

              <div
                className="absolute -inset-1 opacity-0 group-hover:opacity-30 blur-xl pointer-events-none transition-opacity duration-500"
                style={{
                  background: `inherit`,
                }}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
              <Button
                size="lg"
                className="bg-[#bd18b4] hover:bg-[#aa22c5] rounded-full w-20 h-20 p-0 shadow-2xl hover:shadow-[#bd18b4]/25 transition-all"
                onClick={() => {}}
              >
                <Play className="w-10 h-10 text-black ml-1" fill="black" />
              </Button>
            </div>
          )}

        </div>

        <div className={`transition-all duration-300 ease-in-out ${isVideoPlaying ? 'p-2 lg:p-4' : 'p-6 lg:p-8'}`}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-4">{selectedVideo?.title || "Carregando..."}</h1>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-white/60" />
                  <span className="text-white/70">{selectedVideo?.duration || "0:00"}</span>
                </div>
                <Badge
                  className={`${selectedVideo?.isCompleted
                    ? 'bg-[#bd18b4]/20 text-[#c532e2] border-[#bd18b4]/30'
                    : 'bg-white/10 text-white/60 border-white/20'
                    } backdrop-blur-sm`}
                >
                  {selectedVideo?.isCompleted ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Concluída
                    </>
                  ) : (
                    'Não concluída'
                  )}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => selectedVideo && handleMarkVideoComplete(selectedVideo)}
                  disabled={!selectedVideo?.videoId}
                  className={`font-semibold shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${selectedVideo?.isCompleted
                    ? 'bg-[#bd18b4] hover:bg-[#aa22c5] text-black hover:shadow-[#bd18b4]/25'
                    : 'bg-white/20 hover:bg-white/30 text-white/70 hover:text-white'
                    }`}
                >
                  {selectedVideo?.isCompleted ? 'Concluída' : 'Concluir'}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-white/5 backdrop-blur-sm border border-white/20 w-full justify-start h-16 px-2 py-2 gap-2 rounded-2xl">
              <TabsTrigger
                value="overview"
                className="text-white/40 hover:text-white/60 bg-transparent data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#bd18b4] data-[state=active]:to-[#9c14a3] data-[state=active]:shadow-[0_0_20px_rgba(189,24,180,0.5)] rounded-xl cursor-pointer transition-all duration-300 px-6 py-2.5 font-semibold border border-transparent data-[state=active]:border-[#bd18b4] active:scale-95"
              >
                Visao Geral
              </TabsTrigger>
              <TabsTrigger
                value="mindmap"
                className="text-white/40 hover:text-white/60 bg-transparent data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#bd18b4] data-[state=active]:to-[#9c14a3] data-[state=active]:shadow-[0_0_20px_rgba(189,24,180,0.5)] rounded-xl cursor-pointer transition-all duration-300 px-6 py-2.5 font-semibold border border-transparent data-[state=active]:border-[#bd18b4] flex items-center active:scale-95"
              >
                <Brain className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Mapa Mental</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-3">Sobre esta aula</h2>

                  {selectedVideo?.channelTitle && (
                    <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                      {selectedVideo?.channelThumbnailUrl && (
                        <Image
                          src={selectedVideo.channelThumbnailUrl}
                          alt={selectedVideo.channelTitle || "Canal"}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="text-white/80 font-medium text-sm">{selectedVideo.channelTitle}</span>
                        {selectedVideo?.viewCount && (
                          <span className="text-white/50 text-xs">{selectedVideo.viewCount.toLocaleString()} visualizações</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-white/70 leading-relaxed whitespace-pre-wrap break-words">
                    {selectedVideo?.description ? (
                      selectedVideo.description.split(/(\s+)/).map((part, index) => {
                        // Detecta URLs e transforma em links clicáveis
                        const urlRegex = /(https?:\/\/[^\s]+)/g;
                        if (urlRegex.test(part)) {
                          return (
                            <a
                              key={index}
                              href={part}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#c532e2] hover:text-[#bd18b4] hover:underline transition-colors"
                            >
                              {part}
                            </a>
                          );
                        }
                        return part;
                      })
                    ) : (
                      "Descrição não disponível para esta aula."
                    )}
                  </div>
                </div>

              </div>
            </TabsContent>

            <TabsContent value="comments" className="mt-6">
              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <textarea
                    placeholder="Deixe um comentário..."
                    className="w-full bg-transparent text-white placeholder-white/40 outline-none resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <Button className="bg-[#bd18b4] hover:bg-[#aa22c5] text-black font-semibold shadow-lg hover:shadow-[#bd18b4]/25 transition-all cursor-pointer">
                      Comentar
                    </Button>
                  </div>
                </div>
                <p className="text-white/40 text-center">Nenhum comentário ainda</p>
              </div>
            </TabsContent>

            <TabsContent value="mindmap" className="mt-6">
              <div className="space-y-4">
                {/* Mostrar informações dos limites */}
                {limitsInfo && !mindMap && (
                  <div className="flex gap-4">
                    {/* Limite Mapa Mental */}
                    <div className={`flex-1 px-4 py-2 rounded-lg text-sm ${
                      !limitsInfo.mindmap.canGenerate
                        ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                        : 'bg-white/5 border border-white/10 text-white/60'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="w-4 h-4" />
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

                {!mindMap && !mindMapLoading && !mindMapError && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 text-center border border-white/10">
                    <Brain className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60 mb-6">
                      Escolha o tipo de conteúdo que deseja gerar para este vídeo usando IA
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={() => handleGenerate('mindmap')}
                        disabled={limitsInfo ? !limitsInfo.mindmap.canGenerate : false}
                        className="bg-[#bd18b4] cursor-pointer hover:bg-[#aa22c5] text-black font-semibold shadow-lg hover:shadow-[#bd18b4]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Brain className="w-5 h-5 mr-2" />
                        Gerar Mapa Mental
                      </Button>
                      <Button
                        onClick={() => handleGenerate('text')}
                        disabled={limitsInfo ? !limitsInfo.text.canGenerate : false}
                        className="bg-[#1e88e5] cursor-pointer hover:bg-[#1976d2] text-white font-semibold shadow-lg hover:shadow-[#1e88e5]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

                {mindMapLoading && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 text-center border border-white/10">
                    <LoadingGrid size="60" color="#bd18b4" />
                    <p className="text-white/80 text-lg font-semibold mt-6">Gerando conteúdo com IA...</p>
                    <p className="text-white/50 text-sm mt-2">Isso pode levar alguns segundos. Por favor, aguarde.</p>
                  </div>
                )}

                {mindMapError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 text-3xl">⚠️</div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg mb-2">Erro ao gerar conteúdo</p>
                        <p className="text-sm text-red-300 leading-relaxed mb-4">{mindMapError}</p>
                        <Button
                          onClick={() => setMindMapError(null)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30"
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          Voltar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {mindMap && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex gap-2 items-center">
                        {generatedType === 'mindmap' && (
                          <span className="text-white/60 flex items-center gap-2">
                            <Brain className="w-4 h-4" />
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
                          onClick={handleDownloadPdf}
                          disabled={downloading}
                          variant="ghost"
                          size="sm"
                          className="text-white/60 cursor-pointer hover:text-white hover:bg-white/10 disabled:opacity-50"
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
                          size="sm"
                          className="text-white/60 cursor-pointer hover:text-white hover:bg-white/10"
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          Gerar outro
                        </Button>
                      </div>
                    </div>

                    {generatedType === 'mindmap' ? (
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden" style={{ height: '600px' }}>
                        <InteractiveMindMap markdown={mindMap} />
                      </div>
                    ) : (
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 overflow-auto" style={{ height: '600px' }}>
                        <div className="prose prose-invert max-w-none text-white">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({...props}) => <h1 className="text-white text-2xl font-bold mb-4" {...props} />,
                              h2: ({...props}) => <h2 className="text-white text-xl font-semibold mb-3 mt-6" {...props} />,
                              h3: ({...props}) => <h3 className="text-white text-lg font-medium mb-2 mt-4" {...props} />,
                              p: ({...props}) => <p className="text-white/80 mb-3" {...props} />,
                              ul: ({...props}) => <ul className="text-white/80 list-disc list-inside mb-3 space-y-1" {...props} />,
                              ol: ({...props}) => <ol className="text-white/80 list-decimal list-inside mb-3 space-y-1" {...props} />,
                              li: ({...props}) => <li className="text-white/80" {...props} />,
                              strong: ({...props}) => <strong className="text-white font-semibold" {...props} />,
                              em: ({...props}) => <em className="text-white/90 italic" {...props} />,
                              code: ({...props}) => <code className="text-[#c532e2] bg-white/10 px-1 py-0.5 rounded" {...props} />,
                            }}
                          >
                            {mindMap}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className={`relative z-10 bg-transparent backdrop-blur-md border-l border-white/10 flex flex-col transition-all duration-300 ease-in-out ${isVideoPlaying ? 'w-96' : 'w-96'}`}>
        <div className="p-4 border-b border-white/10">
          <h2 className="text-white font-semibold mb-2">Conteúdo</h2>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Progresso do curso</span>
            <span className="text-[#c532e2] font-medium">
              {courseProgress ? `${courseProgress.progressPercentage}%` : '0%'}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#bd18b4] to-[#c532e2] h-2 rounded-full transition-all duration-500 shadow-lg shadow-[#bd18b4]/30"
              style={{ width: `${courseProgress?.progressPercentage || 0}%` }}
            />
          </div>
          <div className="text-xs text-white/50 mt-2">
            {courseProgress ? (
              `${courseProgress.completedVideos} de ${courseProgress.totalVideos} vídeos concluídos`
            ) : (
              '0 de 0 vídeos concluídos'
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 bg-transparent overflow-y-auto">
          <div className="p-4 space-y-2">
            {modules.map((module, moduleIndex) => (
              <div key={module.id} className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 hover:bg-white/[0.07] transition-colors">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-[#bd18b4]/20 to-[#aa22c5]/20 rounded-lg w-8 h-8 flex items-center justify-center text-sm font-semibold text-[#c532e2] border border-[#bd18b4]/20">
                      {moduleIndex + 1}
                    </div>
                    <div className="text-left">
                      <h3 className="text-white text-sm font-medium line-clamp-1">{module.title}</h3>
                      <p className="text-white/40 text-xs">
                        {module.completedVideos}/{module.videosCount} aulas • {module.totalDuration}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-white/60 transition-transform ${expandedModules.has(module.id) ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {expandedModules.has(module.id) && (
                  <div className="border-t border-white/5">
                    {module.videos.map((video) => (
                      <button
                        key={video.id}
                        onClick={() => handleVideoSelect(video)}
                        disabled={video.locked}
                        className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-white/5 transition-all ${video.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          } ${selectedVideo?.id === video.id
                            ? 'bg-[#bd18b4]/10 border-l-2 border-[#bd18b4] hover:bg-[#bd18b4]/15'
                            : ''
                          }`}
                      >
                        <div className="flex-shrink-0">
                          {video.locked ? (
                            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                              <Lock className="w-3.5 h-3.5 text-white/40" />
                            </div>
                          ) : video.isCompleted ? (
                            <div className="w-7 h-7 rounded-full bg-[#bd18b4]/20 flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-[#c532e2]" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                              <Play className="w-3.5 h-3.5 text-white/60" fill="currentColor" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className={`text-sm ${selectedVideo?.id === video.id
                            ? 'text-[#c532e2] font-medium'
                            : 'text-white/80'
                            } line-clamp-1`}>
                            {video.title}
                          </p>
                          <p className="text-xs text-white/40">{video.duration}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
