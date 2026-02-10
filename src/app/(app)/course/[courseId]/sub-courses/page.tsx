"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout";
import { Sidebar } from "@/components/Sidebar";
import { BackgroundGrid } from "@/components/shared/BackgroundGrid";
import { LoadingGrid } from "@/components/ui/loading-grid";
import { ArrowLeft, ArrowRight, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useNavigationWithLoading } from "@/hooks/shared";
import { useLoading } from "@/contexts/LoadingContext";
import { usePageDataLoad } from "@/hooks/shared";
import { useSubCourses, useSubCoursesCache } from "@/hooks/features/courses";

export default function CoursePage() {
  const [isDark, setIsDark] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const { setLoading } = useLoading();
  const { navigateWithLoading } = useNavigationWithLoading();

  // Hook com cache para subcursos
  const { data: subCourses = [], isLoading: isDataLoading, error, refetch } = useSubCourses(courseId);
  const { invalidate } = useSubCoursesCache();

  usePageDataLoad({
    waitForData: true,
    dataLoading: isDataLoading,
    customDelay: 0
  });

  // Função para recarregar com invalidação de cache
  const handleRetry = async () => {
    await invalidate(courseId);
    refetch();
  };

  const handleGoBack = () => {
    setLoading(true, 'Voltando...');
    router.back();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
  };

  const handleClearSearch = () => {
    setSearchInput('');
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const defaultThumbnail = "/defaultwithoutcourses.png";

  const filteredSubCourses = useMemo(() => {
    if (!searchInput.trim()) return subCourses;


    const query = searchInput.toLowerCase().trim();
    return subCourses.filter(subCourse =>
      subCourse.name.toLowerCase().includes(query) ||
      subCourse.description.toLowerCase().includes(query)
    );
  }, [subCourses, searchInput]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Erro ao carregar subcursos</h1>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRetry} className="bg-[#bd18b4] hover:bg-[#aa22c5] text-black">
              Tentar Novamente
            </Button>
            <Button onClick={() => router.push('/courses')} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Voltar aos Cursos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <BackgroundGrid />

      <div className="relative z-10 flex">
        <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
        <div className="flex-1">
          <Navbar isDark={isDark} toggleTheme={toggleTheme} />

          <div className="p-4 md:p-6 ml-0 md:ml-10 pt-24 md:pt-10">
            <div className="mb-6 md:mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              <h1 className="text-white text-2xl md:text-3xl font-bold mb-2">
                {isDataLoading ? 'Carregando curso...' : 'Subcursos'}
              </h1>
              <p className="text-white/60 text-base md:text-lg mb-4 md:mb-6">
                {isDataLoading ? 'Aguarde enquanto carregamos as informações do curso.' : 'Explore os subcursos disponíveis e comece sua jornada de aprendizado.'}
              </p>

              <div className="mb-4 md:mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Pesquisar subcursos..."
                    value={searchInput}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        // Trigger search on Enter
                      }
                    }}
                    className="w-full bg-white/20 text-white placeholder-white/60 rounded-xl px-4 py-3 text-sm outline-none border border-white/20 focus:border-[#c532e2] transition-colors pr-24"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {searchInput && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearSearch}
                        className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg w-8 h-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => { }}
                      className="bg-[#bd18b4] cursor-pointer hover:bg-[#aa22c5] text-black rounded-lg w-10 h-10 p-0 flex items-center justify-center"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {isDataLoading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <LoadingGrid size="60" color="#bd18b4" />
                </div>
              ) : filteredSubCourses.length > 0 ? (
                filteredSubCourses.map((subCourse) => (
                  <div
                    key={subCourse.id}
                    onClick={() => navigateWithLoading(`/course/${courseId}/sub-courses/${subCourse.id}/videos`, `Carregando ${subCourse.name}...`)}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 cursor-pointer hover:bg-white/10 hover:border-[#bd18b4]/40 transition-all duration-300 group transform hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center bg-white/5 ring-1 ring-white/10 flex-shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                        <img
                          src={subCourse.channelThumbnailUrl?.trim() ? subCourse.channelThumbnailUrl : defaultThumbnail}
                          alt={`Miniatura de ${subCourse.name}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white text-lg font-bold group-hover:text-[#bd18b4] transition-colors line-clamp-1 leading-tight">
                          {subCourse.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-[#bd18b4] font-bold uppercase tracking-widest bg-[#bd18b4]/10 px-2 py-0.5 rounded-md">
                            Subcurso
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-[#bd18b4] group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                    </div>

                    <p className="text-white/40 text-xs font-medium leading-relaxed line-clamp-2 mb-4 h-8">
                      {subCourse.description}
                    </p>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">
                        Disponível agora
                      </span>
                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-white/40 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-white/40 text-4xl md:text-6xl mb-4">🔍</div>
                  <h3 className="text-white text-base md:text-lg font-semibold mb-2">Nenhum subcurso encontrado</h3>
                  <p className="text-white/60 text-sm mb-6 px-4 max-w-md mx-auto line-clamp-3">
                    {searchInput
                      ? `Não encontramos subcursos para "${searchInput}" neste curso.`
                      : 'Este curso ainda não possui subcursos disponíveis.'
                    }
                  </p>
                  {searchInput && (
                    <Button
                      onClick={handleClearSearch}
                      className="bg-[#bd18b4] hover:bg-[#aa22c5] text-black"
                    >
                      Limpar busca
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
