"use client";

import { useState, useEffect, Suspense } from "react";
import { Navbar } from "../../../components/Navbar";
import { Sidebar } from "../../../components/Sidebar";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigationWithLoading } from "@/hooks/useNavigationWithLoading";
import { useLoading } from "@/contexts/LoadingContext";
import { usePageDataLoad } from "@/hooks/usePageDataLoad";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { ArrowRight } from "lucide-react";

function CoursesContent() {
  const [isDark, setIsDark] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { setLoading } = useLoading();
  const { navigateWithLoading } = useNavigationWithLoading();
  const router = useRouter();
  

  usePageDataLoad({
    waitForData: true,
    dataLoading: isLoading,
    customDelay: 300
  });

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const categories = [
    {
      id: "nodejs",
      title: "Node.js",
      description: "Desenvolva aplicações backend escaláveis com Node.js",
      icon: "⚡",
      color: "#10b981",
      courseCount: 4
    },
    {
      id: "react",
      title: "React",
      description: "Crie interfaces modernas e interativas com React",
      icon: "⚛️",
      color: "#06b6d4",
      courseCount: 3
    },
    {
      id: "python",
      title: "Python",
      description: "Aprenda Python para web, data science e automação",
      icon: "🐍",
      color: "#f59e0b",
      courseCount: 3
    },
    {
      id: "mobile",
      title: "Desenvolvimento Mobile",
      description: "Desenvolva aplicativos para Android e iOS",
      icon: "📱",
      color: "#8b5cf6",
      courseCount: 2
    },
    {
      id: "soft-skills",
      title: "Soft Skills",
      description: "Desenvolva habilidades interpessoais e comunicação",
      icon: "💡",
      color: "#f59e0b",
      courseCount: 2
    },
    {
      id: "leadership",
      title: "Liderança",
      description: "Aprenda a liderar equipes e projetos de tecnologia",
      icon: "👥",
      color: "#f97316",
      courseCount: 1
    },
    {
      id: "fundamentals",
      title: "Fundamentos",
      description: "Aprenda os conceitos básicos da programação",
      icon: "🧩",
      color: "#ec4899",
      courseCount: 3
    },
    {
      id: "angular",
      title: "Angular",
      description: "Desenvolva aplicações web robustas com Angular",
      icon: "🅰️",
      color: "#dc2626",
      courseCount: 1
    },
    {
      id: "go",
      title: "Go",
      description: "Aprenda Go para desenvolvimento backend moderno",
      icon: "🐹",
      color: "#10b981",
      courseCount: 1
    },
    {
      id: "csharp",
      title: "C# e .NET",
      description: "Desenvolva aplicações com C# e .NET",
      icon: "#️⃣",
      color: "#8b5cf6",
      courseCount: 1
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    navigateWithLoading(`/courses/${categoryId}`, `Carregando cursos de ${categoryId}...`);
  };

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
              <h1 className="text-white text-3xl font-bold mb-2">Cursos</h1>
              <p className="text-white/60 text-lg">Explore nossa biblioteca completa de cursos de tecnologia</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white text-lg font-semibold group-hover:text-green-400 transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-white/60 text-sm">
                        {category.courseCount} curso{category.courseCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {category.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    }>
      <CoursesContent />
    </Suspense>
  );
}
