import { Play, Clock, Download, Share2, Lock, CheckCircle, FileText, MessageSquare, ChevronDown, ArrowLeft, Brain } from "lucide-react";
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
import { generateMindMap, getMindMapByVideo } from "@/api/mind-map/generate-mind-map";
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
  const [mindMapViewMode, setMindMapViewMode] = useState<'interactive' | 'text'>('interactive');
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

    try {
      const response = await getMindMapByVideo(selectedVideo.id);

      if (response.success && response.data) {
        setMindMap(response.data.content);
      }
    } catch {
      // Silenciosamente falha - não há mapa mental existente
      console.log('Nenhum mapa mental existente encontrado');
    }
  }, [selectedVideo?.id]);

  const handleGenerateMindMap = async () => {
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
      });

      setMindMap(response.data.content);
    } catch (err: unknown) {
      let errorMessage = 'Erro ao gerar mapa mental';

      const message = err instanceof Error ? err.message : String(err);

      if (message.includes('503') || message.includes('Service Unavailable')) {
        errorMessage = '⚠️ O serviço Gemini AI está temporariamente indisponível. Tente novamente em alguns instantes.';
      } else if (message.includes('500') || message.includes('Internal Server Error')) {
        errorMessage = '⚠️ Erro interno do servidor. Por favor, tente novamente.';
      } else if (message.includes('401') || message.includes('API Key')) {
        errorMessage = '🔑 Erro de autenticação com a API Gemini.';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoadingGrid size="80" color="#B3E240" />
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
        <div className="relative bg-black aspect-video shadow-2xl rounded-4xl">
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
                  <div className="bg-green-500 hover:bg-green-600 rounded-full w-24 h-24 flex items-center justify-center shadow-2xl hover:shadow-green-500/25 transition-all">
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
                className="bg-green-500 hover:bg-green-600 rounded-full w-20 h-20 p-0 shadow-2xl hover:shadow-green-500/25 transition-all"
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
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
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
                  variant="ghost"
                  size="icon"
                  className="text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => selectedVideo && handleMarkVideoComplete(selectedVideo)}
                  disabled={!selectedVideo?.videoId}
                  className={`font-semibold shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${selectedVideo?.isCompleted
                    ? 'bg-green-500 hover:bg-green-600 text-black hover:shadow-green-500/25'
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
            <TabsList className="bg-white/5 backdrop-blur-sm border-b border-white/10 w-full justify-start h-12 px-1 py-1 rounded-3xl">
              <TabsTrigger
                value="overview"
                className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-transparent rounded-3xl cursor-pointer"
              >
                Visão Geral
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-transparent rounded-3xl cursor-pointer"
              >
                <FileText className="w-4 h-4 mr-2" />
                Anotações
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-transparent rounded-3xl cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Comentários
              </TabsTrigger>
              <TabsTrigger
                value="mindmap"
                className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-transparent rounded-3xl cursor-pointer"
              >
                <Brain className="w-4 h-4 mr-2" />
                Mapa Mental
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

                  <p className="text-white/70 leading-relaxed">
                    {selectedVideo?.description || "Descrição não disponível para esta aula."}
                  </p>
                </div>

              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center border border-white/10">
                <FileText className="w-12 h-12 text-white/30 mx-auto mb-3" />
                <p className="text-white/60 mb-4">Suas anotações aparecerão aqui</p>
                <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold shadow-lg hover:shadow-green-500/25 transition-all cursor-pointer">
                  Criar primeira anotação
                </Button>
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
                    <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold shadow-lg hover:shadow-green-500/25 transition-all cursor-pointer">
                      Comentar
                    </Button>
                  </div>
                </div>
                <p className="text-white/40 text-center">Nenhum comentário ainda</p>
              </div>
            </TabsContent>

            <TabsContent value="mindmap" className="mt-6">
              <div className="space-y-4">
                {!mindMap && !mindMapLoading && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 text-center border border-white/10">
                    <Brain className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60 mb-6">
                      Clique no botão abaixo para gerar um mapa mental inteligente deste vídeo usando IA Gemini
                    </p>
                    <Button
                      onClick={handleGenerateMindMap}
                      className="bg-green-500 hover:bg-green-600 text-black font-semibold shadow-lg hover:shadow-green-500/25 transition-all"
                    >
                      <Brain className="w-5 h-5 mr-2" />
                      Gerar Mapa Mental
                    </Button>
                  </div>
                )}

                {mindMapLoading && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 text-center border border-white/10">
                    <LoadingGrid size="60" color="#B3E240" />
                    <p className="text-white/80 text-lg font-semibold mt-6">Gerando mapa mental com IA Gemini...</p>
                    <p className="text-white/50 text-sm mt-2">Isso pode levar alguns segundos. Por favor, aguarde.</p>
                  </div>
                )}

                {mindMapError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 text-3xl">⚠️</div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg mb-2">Erro ao gerar mapa mental</p>
                        <p className="text-sm text-red-300 leading-relaxed mb-4">{mindMapError}</p>
                        <Button
                          onClick={handleGenerateMindMap}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30"
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          Tentar novamente
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {mindMap && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex gap-1 bg-white/5 backdrop-blur-sm rounded-lg p-1 border border-white/10">
                        <Button
                          onClick={() => setMindMapViewMode('interactive')}
                          variant="ghost"
                          size="sm"
                          className={`${
                            mindMapViewMode === 'interactive'
                              ? 'bg-green-500 text-black hover:bg-green-600'
                              : 'text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          Interativo
                        </Button>
                        <Button
                          onClick={() => setMindMapViewMode('text')}
                          variant="ghost"
                          size="sm"
                          className={`${
                            mindMapViewMode === 'text'
                              ? 'bg-green-500 text-black hover:bg-green-600'
                              : 'text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Texto
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            const blob = new Blob([mindMap], { type: 'text/markdown' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `mapa-mental-${selectedVideo?.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar
                        </Button>
                        <Button
                          onClick={handleGenerateMindMap}
                          variant="ghost"
                          size="sm"
                          className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          Regerar
                        </Button>
                      </div>
                    </div>

                    {mindMapViewMode === 'interactive' ? (
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
                              code: ({...props}) => <code className="text-green-400 bg-white/10 px-1 py-0.5 rounded" {...props} />,
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
            <span className="text-green-400 font-medium">
              {courseProgress ? `${courseProgress.progressPercentage}%` : '0%'}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500 shadow-lg shadow-green-500/30"
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
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg w-8 h-8 flex items-center justify-center text-sm font-semibold text-green-400 border border-green-500/20">
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
                            ? 'bg-green-500/10 border-l-2 border-green-500 hover:bg-green-500/15'
                            : ''
                          }`}
                      >
                        <div className="flex-shrink-0">
                          {video.locked ? (
                            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                              <Lock className="w-3.5 h-3.5 text-white/40" />
                            </div>
                          ) : video.isCompleted ? (
                            <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                              <Play className="w-3.5 h-3.5 text-white/60" fill="currentColor" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className={`text-sm ${selectedVideo?.id === video.id
                            ? 'text-green-400 font-medium'
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
