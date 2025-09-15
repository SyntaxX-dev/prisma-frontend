"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { Navbar } from "../../../../components/Navbar";
import { Sidebar } from "../../../../components/Sidebar";
import { CourseCard } from "../../../../components/CourseCard";
import { ArrowLeft, Search, X } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";
import { usePageLoadComplete } from "@/hooks/usePageLoadComplete";
import { useNotifications } from "@/hooks/useNotifications";

function CourseSearchContent() {
  const [isDark, setIsDark] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setLoading } = useLoading();
  const { showInfo } = useNotifications();
  
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => {
      clearTimeout(timer);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [setLoading]);

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

  usePageLoadComplete();

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const allCourses = useMemo(() => [
    // Node.js
    {
      title: "Node.js",
      instructor: "Diego Fernandes",
      duration: "40h",
      level: "Intermediário" as const,
      year: "2023",
      technology: "Node.js",
      icon: "⚡",
      iconColor: "#10b981",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=200&fit=crop",
      courseId: "nodejs",
      category: "nodejs"
    },
    {
      title: "Node.js Avançado",
      instructor: "Diego Fernandes",
      duration: "40h",
      level: "Intermediário" as const,
      year: "2025",
      technology: "Node.js",
      icon: "⚡",
      iconColor: "#10b981",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=200&fit=crop",
      courseId: "nodejs-avancado",
      category: "nodejs"
    },
    {
      title: "Node.js para Iniciantes",
      instructor: "Carlos Silva",
      duration: "25h",
      level: "Iniciante" as const,
      year: "2024",
      technology: "Node.js",
      icon: "⚡",
      iconColor: "#10b981",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=200&fit=crop",
      courseId: "nodejs-iniciantes",
      category: "nodejs"
    },
    {
      title: "APIs REST com Node.js",
      instructor: "Ana Santos",
      duration: "30h",
      level: "Intermediário" as const,
      year: "2024",
      technology: "Node.js",
      icon: "⚡",
      iconColor: "#10b981",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=200&fit=crop",
      courseId: "nodejs-apis",
      category: "nodejs"
    },
    // React
    {
      title: "React Completo",
      instructor: "Diego Fernandes",
      duration: "45h",
      level: "Intermediário" as const,
      year: "2025",
      technology: "React",
      icon: "⚛️",
      iconColor: "#06b6d4",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1555949963-ff9fe37c3d97?w=400&h=200&fit=crop",
      courseId: "react-completo",
      category: "react"
    },
    {
      title: "React Hooks Avançados",
      instructor: "Maria Oliveira",
      duration: "20h",
      level: "Avançado" as const,
      year: "2024",
      technology: "React",
      icon: "⚛️",
      iconColor: "#06b6d4",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1555949963-ff9fe37c3d97?w=400&h=200&fit=crop",
      courseId: "react-hooks",
      category: "react"
    },
    {
      title: "React Native com Expo",
      instructor: "Rodrigo de Castro",
      duration: "16h",
      level: "Intermediário" as const,
      year: "2024",
      technology: "React Native",
      icon: "⚛️",
      iconColor: "#06b6d4",
      isSubscriber: false,
      isFree: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop",
      courseId: "react-native-expo",
      category: "react"
    },
    // Python
    {
      title: "Python com Django",
      instructor: "Sabrina Silva",
      duration: "20h",
      level: "Intermediário" as const,
      year: "2024",
      technology: "Python",
      icon: "🐍",
      iconColor: "#f59e0b",
      isSubscriber: false,
      isFree: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=200&fit=crop",
      courseId: "python-django",
      category: "python"
    },
    {
      title: "Python com Django Avançado",
      instructor: "Sabrina Silva",
      duration: "35h",
      level: "Intermediário" as const,
      year: "2024",
      technology: "Python",
      icon: "🐍",
      iconColor: "#f59e0b",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=200&fit=crop",
      courseId: "python-django-avancado",
      category: "python"
    },
    {
      title: "Python para Data Science",
      instructor: "João Pedro",
      duration: "50h",
      level: "Avançado" as const,
      year: "2024",
      technology: "Python",
      icon: "🐍",
      iconColor: "#f59e0b",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=200&fit=crop",
      courseId: "python-data-science",
      category: "python"
    },
    // Mobile
    {
      title: "Android com Kotlin",
      instructor: "Bernardo Medeiros",
      duration: "60h",
      level: "Avançado" as const,
      year: "2025",
      technology: "Kotlin",
      icon: "📱",
      iconColor: "#8b5cf6",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop",
      courseId: "android-kotlin",
      category: "mobile"
    },
    {
      title: "iOS com Swift",
      instructor: "Mateus Coelho",
      duration: "45h",
      level: "Intermediário" as const,
      year: "2023",
      technology: "Swift",
      icon: "🍎",
      iconColor: "#3b82f6",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=200&fit=crop",
      courseId: "ios-swift",
      category: "mobile"
    },
    // Soft Skills
    {
      title: "Soft Skills",
      instructor: "Diego Fernandes",
      duration: "30h",
      level: "Iniciante" as const,
      year: "2023",
      technology: "Soft Skills",
      icon: "💡",
      iconColor: "#f59e0b",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop",
      courseId: "soft-skills",
      category: "soft-skills"
    },
    {
      title: "Inglês para Devs",
      instructor: "Oliver Beck",
      duration: "25h",
      level: "Intermediário" as const,
      year: "2025",
      technology: "English",
      icon: "🌎",
      iconColor: "#ef4444",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop",
      courseId: "ingles-para-devs",
      category: "soft-skills"
    },
    // Leadership
    {
      title: "Tech Lead",
      instructor: "Ana Santos",
      duration: "35h",
      level: "Avançado" as const,
      year: "2025",
      technology: "Leadership",
      icon: "👥",
      iconColor: "#f97316",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=200&fit=crop",
      courseId: "tech-lead",
      category: "leadership"
    },
    // Fundamentals
    {
      title: "Lógica de Programação",
      instructor: "Carlos Silva",
      duration: "20h",
      level: "Iniciante" as const,
      year: "2024",
      technology: "Logic",
      icon: "🧩",
      iconColor: "#ec4899",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=200&fit=crop",
      courseId: "logica-programacao",
      category: "fundamentals"
    },
    {
      title: "Dev Global - Starter Pack",
      instructor: "Equipe RichPath",
      duration: "8h",
      level: "Iniciante" as const,
      year: "2024",
      technology: "Starter",
      icon: "🚀",
      iconColor: "#06b6d4",
      isSubscriber: false,
      isFree: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop",
      courseId: "dev-global-starter",
      category: "fundamentals"
    },
    {
      title: "Discover",
      instructor: "Alya Dana",
      duration: "15h",
      level: "Iniciante" as const,
      year: "2022",
      technology: "Discovery",
      icon: "🔍",
      iconColor: "#f59e0b",
      isSubscriber: false,
      isFree: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200&fit=crop",
      courseId: "discover",
      category: "fundamentals"
    },
    // Angular
    {
      title: "Angular - Curso Introdutório",
      instructor: "Vinícius de Oliveira",
      duration: "12h",
      level: "Iniciante" as const,
      year: "2023",
      technology: "Angular",
      icon: "🅰️",
      iconColor: "#dc2626",
      isSubscriber: false,
      isFree: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1555949963-ff9fe37c3d97?w=400&h=200&fit=crop",
      courseId: "angular-intro",
      category: "angular"
    },
    // Go
    {
      title: "Go - Curso Introdutório",
      instructor: "Lea Carvalho de Andrade",
      duration: "18h",
      level: "Iniciante" as const,
      year: "2024",
      technology: "Go",
      icon: "🐹",
      iconColor: "#10b981",
      isSubscriber: false,
      isFree: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop",
      courseId: "go-intro",
      category: "go"
    },
    // C#
    {
      title: "C# e .NET - Curso Introdutório",
      instructor: "Welisson Reily",
      duration: "22h",
      level: "Iniciante" as const,
      year: "2024",
      technology: ".NET",
      icon: "#️⃣",
      iconColor: "#8b5cf6",
      isSubscriber: false,
      isFree: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&h=200&fit=crop",
      courseId: "csharp-dotnet-intro",
      category: "csharp"
    }
  ], []);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return allCourses;
    
    const query = searchQuery.toLowerCase().trim();
    const results = allCourses.filter(course => 
      course.title.toLowerCase().includes(query) ||
      course.instructor.toLowerCase().includes(query) ||
      course.technology.toLowerCase().includes(query) ||
      course.level.toLowerCase().includes(query)
    );
    
    if (searchQuery.trim() && results.length === 0) {
      showInfo(`Nenhum curso encontrado para "${searchQuery}"`);
    }
    
    return results;
  }, [searchQuery, allCourses, showInfo]);

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
        <div className="flex-1 pt-16">
          <Navbar isDark={isDark} toggleTheme={toggleTheme} />
          
          <div className="p-6 ml-10 pt-10">
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
                    {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} encontrado{filteredCourses.length !== 1 ? 's' : ''} para &quot;{searchQuery}&quot;
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
                    className="bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-xl font-medium"
                  >
                    Buscar
                  </Button>
                </div>
              </div>
            </div>

            <div>
              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCourses.map((course, index) => (
                    <CourseCard
                      key={index}
                      title={course.title}
                      instructor={course.instructor}
                      duration={course.duration}
                      level={course.level}
                      year={course.year}
                      technology={course.technology}
                      icon={course.icon}
                      isSubscriber={course.isSubscriber}
                      isFree={'isFree' in course ? (course as { isFree?: boolean }).isFree : false}
                      thumbnailUrl={course.thumbnailUrl}
                      iconColor={course.iconColor}
                      courseId={course.courseId}
                      isInCategoryPage={true}
                      category={course.category}
                    />
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
