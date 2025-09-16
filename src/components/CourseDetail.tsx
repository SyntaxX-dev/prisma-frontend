import { Play, Clock, Download, Share2, Lock, CheckCircle, FileText, MessageSquare, Star, ChevronDown, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useRouter } from "next/navigation";
import { useNavigationWithLoading } from "@/hooks/useNavigationWithLoading";

interface Video {
  id: string;
  title: string;
  duration: string;
  watched: boolean;
  locked: boolean;
  description?: string;
  youtubeId?: string;
}

interface Module {
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
}

export function CourseDetail({ onVideoPlayingChange, isVideoPlaying = false }: CourseDetailProps) {
  const { navigateWithLoading } = useNavigationWithLoading();
  const router = useRouter();
  const [selectedVideo, setSelectedVideo] = useState<Video>({
    id: "1",
    title: "Introdução ao Node.js e seu ecossistema",
    duration: "15:30",
    watched: false,
    locked: false,
    description: "Nesta aula, exploramos a história do Node.js, desde sua fundação em 2009 até o presente. Discutimos o impacto dos IDEs, como IntelliJ e Android Studio, e como Kotlin surgiu como uma alternativa moderna ao Java.",
    youtubeId: "hHM-hr9q4mo"
  });

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(["1"]));
  const [localVideoPlaying, setLocalVideoPlaying] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

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

  const course = {
    title: "Node.js Avançado",
    description: "Domine Node.js e construa aplicações escaláveis com as melhores práticas do mercado.",
    instructor: {
      name: "Diego Fernandes",
      role: "CTO @ Rocketseat",
      avatar: "https://github.com/diego3g.png"
    },
    rating: 4.9,
    totalRatings: 2847,
    students: 15234,
    duration: "40h",
    level: "Intermediário",
    lastUpdated: "Janeiro 2025",
    tags: ["Backend", "API REST", "TypeScript", "Docker"],
    progress: 15
  };

  const modules: Module[] = [
    {
      id: "1",
      title: "Os primeiros passos com Node.js",
      totalDuration: "01:07:32",
      videosCount: 10,
      completedVideos: 2,
      videos: [
        {
          id: "1",
          title: "Introdução ao Node.js e seu ecossistema",
          duration: "15:30",
          watched: true,
          locked: false,
          youtubeId: "hHM-hr9q4mo",
          description: "Nesta aula, exploramos a história do Node.js e seu impacto no desenvolvimento backend moderno."
        },
        {
          id: "2",
          title: "História do Node.js e JavaScript",
          duration: "10:05:30",
          watched: true,
          locked: false,
          youtubeId: "PkZNo7MFNFg",
          description: "Conheça a evolução do JavaScript desde o browser até o servidor com Node.js."
        },
        {
          id: "3",
          title: "Instalação IDE: VSCode",
          duration: "05:21:45",
          watched: false,
          locked: false,
          youtubeId: "SqcY0GlETPk",
          description: "Configure o VSCode com as melhores extensões para desenvolvimento Node.js."
        },
        {
          id: "4",
          title: "Hello World em Node.js",
          duration: "08:15:01",
          watched: false,
          locked: false,
          youtubeId: "rfscVS0vtbw",
          description: "Crie seu primeiro programa em Node.js e entenda os conceitos básicos."
        },
        {
          id: "5",
          title: "Mutabilidade e Imutabilidade",
          duration: "12:04:26",
          watched: false,
          locked: false,
          youtubeId: "8jLOx1hD3_o",
          description: "Aprenda sobre conceitos fundamentais de programação funcional em JavaScript."
        },
        {
          id: "6",
          title: "Tipos de Dados Básicos",
          duration: "09:07:52",
          watched: false,
          locked: false,
          youtubeId: "RBSGKlAvoiM",
          description: "Explore os tipos de dados primitivos e objetos em JavaScript."
        },
        {
          id: "7",
          title: "Classes de Tipos de Dados Básicos",
          duration: "08:09:10",
          watched: false,
          locked: false,
          youtubeId: "lkIFF4maKMU",
          description: "Aprofunde-se em classes e protótipos no JavaScript moderno."
        },
        {
          id: "8",
          title: "Operadores Lógicos",
          duration: "07:12:47",
          watched: false,
          locked: false,
          youtubeId: "cuHDQhDhvPE",
          description: "Domine os operadores lógicos e sua aplicação prática."
        },
        {
          id: "9",
          title: "Operadores Matemáticos",
          duration: "06:12:42",
          watched: false,
          locked: false,
          youtubeId: "hHM-hr9q4mo",
          description: "Trabalhe com operações matemáticas e precisão numérica em JavaScript."
        },
        {
          id: "10",
          title: "Complementando Hello World",
          duration: "10:54:46",
          watched: false,
          locked: false,
          youtubeId: "PkZNo7MFNFg",
          description: "Evolua seu primeiro programa adicionando funcionalidades avançadas."
        }
      ]
    },
    {
      id: "2",
      title: "A base para a construção de lógicas",
      totalDuration: "01:24:35",
      videosCount: 8,
      completedVideos: 0,
      videos: [
        {
          id: "11",
          title: "Estruturas de Controle: if/else",
          duration: "12:00",
          watched: false,
          locked: false,
          youtubeId: "SqcY0GlETPk",
          description: "Aprenda a controlar o fluxo do seu programa com condicionais."
        },
        {
          id: "12",
          title: "Estruturas de Repetição: for",
          duration: "15:20",
          watched: false,
          locked: false,
          youtubeId: "rfscVS0vtbw",
          description: "Domine loops for e suas variações em JavaScript."
        },
        {
          id: "13",
          title: "Estruturas de Repetição: while",
          duration: "13:45",
          watched: false,
          locked: false,
          youtubeId: "8jLOx1hD3_o",
          description: "Entenda quando e como usar loops while e do-while."
        }
      ]
    },
    {
      id: "3",
      title: "Conhecendo as funções e tipos",
      totalDuration: "03:21:11",
      videosCount: 23,
      completedVideos: 0,
      videos: [
        {
          id: "14",
          title: "Introdução às Funções",
          duration: "18:30",
          watched: false,
          locked: true,
          youtubeId: "RBSGKlAvoiM",
          description: "Fundamentos de funções em JavaScript e Node.js."
        },
        {
          id: "15",
          title: "Arrow Functions",
          duration: "22:15",
          watched: false,
          locked: true,
          youtubeId: "lkIFF4maKMU",
          description: "Sintaxe moderna e casos de uso de arrow functions."
        },
        {
          id: "16",
          title: "Callbacks e Promises",
          duration: "25:45",
          watched: false,
          locked: true,
          youtubeId: "cuHDQhDhvPE",
          description: "Programação assíncrona com callbacks e promises."
        }
      ]
    },
    {
      id: "4",
      title: "Outras funcionalidades interessantes",
      totalDuration: "02:08",
      videosCount: 5,
      completedVideos: 0,
      videos: [
        {
          id: "17",
          title: "Async/Await e Promises",
          duration: "25:00",
          watched: false,
          locked: true,
          youtubeId: "hHM-hr9q4mo",
          description: "Sintaxe moderna para programação assíncrona."
        },
        {
          id: "18",
          title: "Event Emitters",
          duration: "20:30",
          watched: false,
          locked: true,
          youtubeId: "PkZNo7MFNFg",
          description: "Padrão de eventos em Node.js."
        }
      ]
    }
  ];

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

  return (
    <div className={`relative flex flex-1 h-[calc(100vh-4rem)] bg-transparent overflow-hidden transition-all duration-300 ease-in-out ${isVideoPlaying ? 'ml-0 right-16' : 'ml-4 right-0'}`}>
      <div className="relative z-10 flex-1 flex flex-col overflow-y-auto overflow-x-hidden bg-transparent">
        <div className={`pb-0 transition-all duration-300 ease-in-out ${isVideoPlaying ? 'p-1' : 'p-4'}`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigateWithLoading('', 'Voltando...');
              router.back();
            }}
            className="text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        <div className="relative bg-black aspect-video shadow-2xl rounded-4xl">
          {selectedVideo.youtubeId ? (
            <>
              <iframe
                key={iframeKey}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=${localVideoPlaying ? 1 : 0}&mute=${false}&rel=0&modestbranding=1&controls=1&enablejsapi=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full rounded-3xl"
                id={`youtube-player-${selectedVideo.id}`}
              />

              {!localVideoPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-3xl cursor-pointer z-10 hover:bg-black/30 transition-all duration-300"
                  onClick={() => {
                    setLocalVideoPlaying(true);
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
                    onClick={() => setLocalVideoPlaying(false)}
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
            <h1 className="text-2xl font-bold text-white mb-4">{selectedVideo.title}</h1>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-white/60" />
                  <span className="text-white/70">{selectedVideo.duration}</span>
                </div>
                <Badge
                  className={`${selectedVideo.watched
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-white/10 text-white/60 border-white/20'
                    } backdrop-blur-sm`}
                >
                  {selectedVideo.watched ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Assistida
                    </>
                  ) : (
                    'Não assistida'
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
                  className="bg-green-500 hover:bg-green-600 text-black font-semibold shadow-lg hover:shadow-green-500/25 transition-all cursor-pointer"
                >
                  Finalizar Aula <CheckCircle className="w-4 h-4 ml-2" />
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
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-3">Sobre esta aula</h2>
                  <p className="text-white/70 leading-relaxed">
                    {selectedVideo.description || "Descrição não disponível para esta aula."}
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/[0.07] transition-colors">
                  <h3 className="text-white font-semibold mb-4">Instrutor</h3>
                  <div className="flex items-center gap-4">
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="w-14 h-14 rounded-full ring-2 ring-white/20"
                    />
                    <div>
                      <p className="text-white font-medium">{course.instructor.name}</p>
                      <p className="text-white/60 text-sm">{course.instructor.role}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/[0.07] transition-colors">
                  <h3 className="text-white font-semibold mb-4">Informações do Curso</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-sm mb-1">Duração Total</p>
                      <p className="text-white font-medium">{course.duration}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-1">Nível</p>
                      <p className="text-white font-medium">{course.level}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-1">Alunos</p>
                      <p className="text-white font-medium">{course.students.toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-1">Avaliação</p>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-white font-medium">{course.rating}</span>
                        <span className="text-white/60 text-sm">({course.totalRatings})</span>
                      </div>
                    </div>
                  </div>
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
          </Tabs>
        </div>
      </div>

      <div className={`relative z-10 bg-transparent backdrop-blur-md border-l border-white/10 flex flex-col transition-all duration-300 ease-in-out ${isVideoPlaying ? 'w-96' : 'w-96'}`}>
        <div className="p-4 border-b border-white/10">
          <h2 className="text-white font-semibold mb-2">Conteúdo</h2>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Progresso do curso</span>
            <span className="text-green-400 font-medium">{course.progress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500 shadow-lg shadow-green-500/30"
              style={{ width: `${course.progress}%` }}
            />
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
                          ) : video.watched ? (
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
