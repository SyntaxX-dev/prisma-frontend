"use client";

import { useState, useEffect } from "react";
import { Navbar } from "../../../../components/Navbar";
import { Sidebar } from "../../../../components/Sidebar";
import { CourseCard } from "../../../../components/CourseCard";
import { useAuth } from "../../../../hooks/useAuth";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useNavigationWithLoading } from "@/hooks/useNavigationWithLoading";
import { useLoading } from "@/contexts/LoadingContext";
import { usePageLoadComplete } from "@/hooks/usePageLoadComplete";

export default function CourseCategoryPage() {
  const [isDark, setIsDark] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const category = params.category as string;
  const { setLoading } = useLoading();
  const { navigateWithLoading } = useNavigationWithLoading();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [setLoading]);

  const handleGoBack = () => {
    setLoading(true, 'Voltando...');
    router.back();
  };

  // Desliga o loading quando a página carrega
  usePageLoadComplete();

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const coursesByCategory: Record<string, any[]> = {
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
  const courses = coursesByCategory[category] || [];
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
              
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: currentCategory.color }}
                >
                  {currentCategory.icon}
                </div>
                <div>
                  <h1 className="text-white text-3xl font-bold">{currentCategory.title}</h1>
                  <p className="text-white/60 text-lg">{currentCategory.description}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-white text-xl font-semibold mb-6">
                Cursos disponíveis ({courses.length})
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course, index) => (
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
                    thumbnailUrl={course.thumbnailUrl}
                    iconColor={course.iconColor}
                    courseId={course.courseId}
                    isInCategoryPage={true}
                    category={category}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
