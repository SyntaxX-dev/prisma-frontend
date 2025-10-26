"use client";

import { useState, useMemo, useEffect } from "react";
import { Navbar } from "../../../../components/Navbar";
import { Sidebar } from "../../../../components/Sidebar";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useNavigationWithLoading } from "@/hooks/shared";
import { useLoading } from "@/contexts/LoadingContext";
import { usePageDataLoad } from "@/hooks/shared";

export default function CourseCategoryPage() {
  const [isDark, setIsDark] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [isDataLoading, setIsDataLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const category = params.category as string;
  const { setLoading } = useLoading();
  const { navigateWithLoading } = useNavigationWithLoading();

  useEffect(() => {
    setIsDataLoading(false);
  }, []);

  usePageDataLoad({
    waitForData: true,
    dataLoading: isDataLoading,
    customDelay: 0
  });

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


  const categoryInfo: Record<string, { title: string; description: string; icon: string; color: string }> = {
    "nodejs": {
      title: "Node.js",
      description: "Desenvolva aplicações backend escaláveis com Node.js",
      icon: "⚡",
      color: "#10b981"
    },
    "react": {
      title: "React",
      description: "Crie interfaces modernas e interativas com React",
      icon: "⚛️",
      color: "#06b6d4"
    },
    "python": {
      title: "Python",
      description: "Aprenda Python para web, data science e automação",
      icon: "🐍",
      color: "#f59e0b"
    },
    "mobile": {
      title: "Desenvolvimento Mobile",
      description: "Desenvolva aplicativos para Android e iOS",
      icon: "📱",
      color: "#8b5cf6"
    },
    "soft-skills": {
      title: "Soft Skills",
      description: "Desenvolva habilidades interpessoais e comunicação",
      icon: "💡",
      color: "#f59e0b"
    },
    "leadership": {
      title: "Liderança",
      description: "Aprenda a liderar equipes e projetos de tecnologia",
      icon: "👥",
      color: "#f97316"
    },
    "fundamentals": {
      title: "Fundamentos",
      description: "Aprenda os conceitos básicos da programação",
      icon: "🧩",
      color: "#ec4899"
    },
    "angular": {
      title: "Angular",
      description: "Desenvolva aplicações web robustas com Angular",
      icon: "🅰️",
      color: "#dc2626"
    },
    "go": {
      title: "Go",
      description: "Aprenda Go para desenvolvimento backend moderno",
      icon: "🐹",
      color: "#10b981"
    },
    "csharp": {
      title: "C# e .NET",
      description: "Desenvolva aplicações com C# e .NET",
      icon: "#️⃣",
      color: "#8b5cf6"
    }
  };

  const currentCategory = categoryInfo[category];

  const filteredCourses = useMemo(() => {
    const coursesByCategory: Record<string, Array<{
      title: string;
      instructor: string;
      duration: string;
      level: 'Iniciante' | 'Intermediário' | 'Avançado';
      year: string;
      technology: string;
      icon: string;
      iconColor: string;
      isSubscriber: boolean;
      isFree?: boolean;
      thumbnailUrl: string;
      courseId: string;
    }>> = {
    "nodejs": [
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
        courseId: "nodejs"
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
        courseId: "nodejs-avancado"
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
        courseId: "nodejs-iniciantes"
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
        courseId: "nodejs-apis"
      }
    ],
    "react": [
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
        courseId: "react-completo"
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
        courseId: "react-hooks"
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
        courseId: "react-native-expo"
      }
    ],
    "python": [
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
        courseId: "python-django"
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
        courseId: "python-django-avancado"
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
        courseId: "python-data-science"
      }
    ],
    "mobile": [
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
        courseId: "android-kotlin"
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
        courseId: "ios-swift"
      }
    ],
    "soft-skills": [
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
        courseId: "soft-skills"
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
        courseId: "ingles-para-devs"
      }
    ],
    "leadership": [
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
        courseId: "tech-lead"
      }
    ],
    "fundamentals": [
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
        courseId: "logica-programacao"
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
        courseId: "dev-global-starter"
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
        courseId: "discover"
      }
    ],
    "angular": [
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
        courseId: "angular-intro"
      }
    ],
    "go": [
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
        courseId: "go-intro"
      }
    ],
    "csharp": [
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
        courseId: "csharp-dotnet-intro"
      }
    ]
  };

  const allCourses = coursesByCategory[category] || [];

    if (!searchInput.trim()) return allCourses;

    const query = searchInput.toLowerCase().trim();
    return allCourses.filter(course =>
      course.title.toLowerCase().includes(query) ||
      course.instructor.toLowerCase().includes(query) ||
      course.technology.toLowerCase().includes(query) ||
      course.level.toLowerCase().includes(query)
    );
  }, [category, searchInput]);
  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Categoria não encontrada</h1>
          <Button onClick={() => router.push('/dashboard')} className="bg-green-500 hover:bg-green-600 text-black">
            Voltar ao Dashboard
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

              <h1 className="text-white text-3xl font-bold mb-2">{currentCategory.title}</h1>
              <p className="text-white/60 text-lg mb-6">{currentCategory.description}</p>

              <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder={`Pesquisar em ${currentCategory.title}...`}
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
                    onClick={() => {
                    }}
                    className="bg-green-500 hover:bg-green-600 text-black px-6 py-[1.4rem] rounded-[1rem] font-medium"
                  >
                    Buscar
                  </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course, index) => (
                  <div
                      key={index}
                    onClick={() => navigateWithLoading(`/courses/${category}/${course.courseId}`, `Carregando ${course.title}...`)}
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
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-white/40 text-6xl mb-4">🔍</div>
                  <h3 className="text-white text-lg font-semibold mb-2">Nenhum curso encontrado</h3>
                  <p className="text-white/60 text-sm mb-6">
                    Não encontramos cursos para &quot;{searchInput}&quot; nesta categoria.
                  </p>
                  <Button
                    onClick={handleClearSearch}
                    className="bg-green-500 hover:bg-green-600 text-black"
                  >
                    Limpar busca
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
