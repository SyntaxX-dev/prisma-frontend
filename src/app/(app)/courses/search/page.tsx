"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { Navbar } from "../../../../components/Navbar";
import { Sidebar } from "../../../../components/Sidebar";
import { ArrowLeft, ArrowRight, Search, X } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";
import { usePageDataLoad } from "@/hooks/usePageDataLoad";
import { useNotifications } from "@/hooks/useNotifications";
import { useCourseSearch } from "@/hooks/useCourseSearch";
import { useNavigationWithLoading } from "@/hooks/useNavigationWithLoading";

function CourseSearchContent() {
  const [isDark, setIsDark] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setLoading } = useLoading();
  const { showInfo } = useNotifications();
  const { navigateWithLoading } = useNavigationWithLoading();

  const searchQuery = searchParams.get('q') || '';
  
  // Usar TanStack Query para busca
  const { data: courses = [], isLoading, error } = useCourseSearch(searchQuery);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleGoBack = () => {
    setLoading(true, 'Voltando...');
    router.back();
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const params = new URLSearchParams();
      params.set('q', query.trim());
      router.push(`/courses/search?${params.toString()}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!value.trim()) {
      router.push('/courses');
      return;
    }

    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        handleSearch(value);
      }
    }, 500);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    router.push('/courses');
  };

  usePageDataLoad({
    waitForData: true,
    dataLoading: isLoading,
    customDelay: 300
  });

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Mostrar notificação se não houver resultados
  useEffect(() => {
    if (searchQuery.trim() && courses.length === 0 && !isLoading) {
      showInfo(`Nenhum curso encontrado para "${searchQuery}"`);
    }
  }, [searchQuery, courses.length, isLoading, showInfo]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      router.push('/courses');
    }
  }, [searchQuery, router]);

  if (!searchQuery.trim()) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Search className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h1 className="text-white text-2xl font-bold mb-4">Redirecionando...</h1>
          <p className="text-white/60 mb-6">Levando você para a página de cursos</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div
        className={`fixed inset-0 transition-all duration-300 ${isDark
          ? 'bg-gray-950'
          : 'bg-gray-500'
          }`}
        style={{
          backgroundImage: isDark
            ? `
        radial-gradient(circle at 25% 25%, rgba(179, 226, 64, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(179, 226, 64, 0.04) 0%, transparent 50%)
      `
            : `
        radial-gradient(circle at 25% 25%, rgba(179, 226, 64, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(179, 226, 64, 0.05) 0%, transparent 50%)
      `
        }}
      />

      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 10%, rgba(201, 254, 2, 0.06), transparent 20%),
            radial-gradient(circle at 85% 90%, rgba(201, 254, 2, 0.04), transparent 20%)
          `
        }}
      />

      <div
        className={`fixed inset-0 backdrop-blur-sm transition-all duration-300 ${isDark ? 'bg-black/30' : 'bg-black/10'
          }`}
      />

      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0'
        }}
      />

      <div className="relative z-10 flex">
        <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
        <div className="flex-1">
          <Navbar isDark={isDark} toggleTheme={toggleTheme} />

          <div className="p-6 ml-10 pt-6" style={{ marginTop: '80px' }}>
            <div className="mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center text-3xl">
                  <Search className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h1 className="text-white text-3xl font-bold">Resultados da Busca</h1>
                  <p className="text-white/60 text-lg">
                    {courses.length} curso{courses.length !== 1 ? 's' : ''} encontrado{courses.length !== 1 ? 's' : ''} para &quot;{searchQuery}&quot;
                  </p>
                </div>
              </div>

              <div className="">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Pesquisar cursos..."
                      value={searchInput}
                      onChange={handleInputChange}
                      className="w-full bg-white/20 text-white placeholder-white/60 rounded-xl px-4 py-3 text-sm outline-none border border-white/20 focus:border-green-400 transition-colors pr-10"
                    />
                    {searchInput && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearSearch}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg w-8 h-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Button
                    onClick={() => handleSearch(searchInput)}
                    className="bg-green-500 hover:bg-green-600 text-black px-6 py-[1.4rem] rounded-[1rem] font-medium"
                  >
                    Buscar
                  </Button>
                </div>
              </div>
            </div>

            <div>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="text-white/40 text-6xl mb-4">🔍</div>
                  <h3 className="text-white text-lg font-semibold mb-2">Buscando cursos...</h3>
                  <p className="text-white/60 text-sm">Aguarde enquanto procuramos pelos melhores cursos para você</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-white/40 text-6xl mb-4">⚠️</div>
                  <h3 className="text-white text-lg font-semibold mb-2">Erro na busca</h3>
                  <p className="text-white/60 text-sm mb-6">
                    Ocorreu um erro ao buscar os cursos. Tente novamente.
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-green-500 hover:bg-green-600 text-black"
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {courses.map((course, index) => (
                    <div
                      key={index}
                      onClick={() => navigateWithLoading(`/courses/${course.category}/${course.courseId}`, `Carregando ${course.title}...`)}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ backgroundColor: course.iconColor }}
                        >
                          {course.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white text-lg font-semibold group-hover:text-green-400 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-white/60 text-sm">
                            {course.duration} • {course.level}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-white/70 text-sm">
                          <span className="text-white/50">Instrutor:</span> {course.instructor}
                        </p>
                        <p className="text-white/70 text-sm">
                          <span className="text-white/50">Tecnologia:</span> {course.technology}
                        </p>
                        <p className="text-white/70 text-sm">
                          <span className="text-white/50">Ano:</span> {course.year}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          {course.isSubscriber ? (
                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                              Assinante
                            </span>
                          ) : course.isFree ? (
                            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                              Gratuito
                            </span>
                          ) : (
                            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                              Premium
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-white/40 text-6xl mb-4">🔍</div>
                  <h3 className="text-white text-lg font-semibold mb-2">Nenhum curso encontrado</h3>
                  <p className="text-white/60 text-sm mb-6">
                    Não encontramos cursos para &quot;{searchQuery}&quot;. Tente pesquisar por outros termos.
                  </p>
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="bg-green-500 hover:bg-green-600 text-black"
                  >
                    Voltar ao Dashboard
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CourseSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    }>
      <CourseSearchContent />
    </Suspense>
  );
}
