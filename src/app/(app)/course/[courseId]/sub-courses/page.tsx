"use client";

import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useNavigationWithLoading } from "@/hooks/useNavigationWithLoading";
import { useLoading } from "@/contexts/LoadingContext";
import { usePageDataLoad } from "@/hooks/usePageDataLoad";
import { useAuth } from "@/hooks/useAuth";

interface SubCourse {
  id: string;
  courseId: string;
  name: string;
  description: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export default function CoursePage() {
  const [isDark, setIsDark] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [subCourses, setSubCourses] = useState<SubCourse[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const { setLoading } = useLoading();
  const { navigateWithLoading } = useNavigationWithLoading();
  const { user } = useAuth();

  usePageDataLoad({
    waitForData: true,
    dataLoading: isDataLoading,
    customDelay: 0
  });

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!user || !courseId) return;

      try {
        setIsDataLoading(true);

        // Show loading after 2 seconds
        const loadingTimeout = setTimeout(() => {
          setShowLoading(true);
        }, 2000);

        const token = localStorage.getItem('auth_token');

        // Fetch all courses first to find the specific course
        const allCoursesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Fetch sub-courses
        const subCoursesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/sub-courses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const allCoursesData = await allCoursesResponse.json();
        const subCoursesData = await subCoursesResponse.json();

        // Find the specific course by ID
        if (allCoursesData.success && allCoursesData.data) {
          const foundCourse = allCoursesData.data.find((c: Course) => c.id === courseId);
          if (foundCourse) {
            setCourse(foundCourse);
          }
        }

        if (subCoursesData.success) {
          setSubCourses(subCoursesData.data);
        } else {
          setError('Erro ao carregar subcursos');
        }

        // Clear loading timeout if data loads before 2 seconds
        clearTimeout(loadingTimeout);
      } catch (err) {
        console.error('Erro ao carregar dados do curso:', err);
        setError('Erro ao conectar com o servidor');
      } finally {
        setIsDataLoading(false);
        setShowLoading(false);
      }
    };

    fetchCourseData();
  }, [user, courseId]);

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
          <h1 className="text-white text-2xl font-bold mb-4">{error}</h1>
          <Button onClick={() => router.push('/courses')} className="bg-green-500 hover:bg-green-600 text-black">
            Voltar aos Cursos
          </Button>
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

              <h1 className="text-white text-3xl font-bold mb-2">
                {isDataLoading ? 'Carregando curso...' : course?.name || 'Curso de Programação'}
              </h1>
              <p className="text-white/60 text-lg mb-6">
                {isDataLoading ? 'Aguarde enquanto carregamos as informações do curso.' : course?.description || 'Aprenda programação do zero com nossos cursos práticos e interativos. Desenvolva suas habilidades técnicas e construa projetos reais.'}
              </p>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={`Pesquisar em ${course?.name || 'curso'}...`}
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
                  onClick={() => {}}
                  className="bg-green-500 hover:bg-green-600 text-black px-6 py-[1.4rem] rounded-[1rem] font-medium"
                >
                  Buscar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isDataLoading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  {showLoading ? (
                    <div className="text-white text-lg">Carregando subcursos...</div>
                  ) : (
                    <div className="text-white/60 text-sm">Preparando conteúdo...</div>
                  )}
                </div>
              ) : filteredSubCourses.length > 0 ? (
                filteredSubCourses.map((subCourse) => (
                  <div
                    key={subCourse.id}
                    onClick={() => navigateWithLoading(`/course/${courseId}/sub-courses/${subCourse.id}/videos`, `Carregando ${subCourse.name}...`)}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-blue-500/20"
                      >
                        📚
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white text-lg font-semibold group-hover:text-green-400 transition-colors">
                          {subCourse.name}
                        </h3>
                        <p className="text-white/60 text-sm">
                          Ordem: {subCourse.order}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-white/70 text-sm leading-relaxed">
                        {subCourse.description}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                          Disponível
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-white/40 text-6xl mb-4">🔍</div>
                  <h3 className="text-white text-lg font-semibold mb-2">Nenhum subcurso encontrado</h3>
                  <p className="text-white/60 text-sm mb-6">
                    {searchInput
                      ? `Não encontramos subcursos para "${searchInput}" neste curso.`
                      : 'Este curso ainda não possui subcursos disponíveis.'
                    }
                  </p>
                  {searchInput && (
                    <Button
                      onClick={handleClearSearch}
                      className="bg-green-500 hover:bg-green-600 text-black"
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
