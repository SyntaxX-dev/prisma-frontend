"use client";

import { useState, useEffect } from "react";
import { Navbar } from "../../../../../components/Navbar";
import { Sidebar } from "../../../../../components/Sidebar";
import { CourseDetail } from "../../../../../components/CourseDetail";
import { useAuth } from "../../../../../hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { useNavigationWithLoading } from "@/hooks/useNavigationWithLoading";
import { useLoading } from "@/contexts/LoadingContext";
import { usePageLoadComplete } from "@/hooks/usePageLoadComplete";

export default function CourseDetailPage() {
  const [isDark, setIsDark] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const courseId = params.courseId as string;
  const { setLoading } = useLoading();
  const { navigateWithLoading } = useNavigationWithLoading();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [setLoading]);

  usePageLoadComplete();

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const courseData: Record<string, any> = {
    "nodejs-avancado": {
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
    },
    "react-completo": {
      title: "React Completo",
      description: "Aprenda React do zero ao avançado com projetos práticos e modernos.",
      instructor: {
        name: "Diego Fernandes",
        role: "CTO @ Rocketseat",
        avatar: "https://github.com/diego3g.png"
      },
      rating: 4.8,
      totalRatings: 1923,
      students: 12847,
      duration: "45h",
      level: "Intermediário",
      lastUpdated: "Janeiro 2025",
      tags: ["Frontend", "React", "JavaScript", "Hooks"],
      progress: 0
    },
    "python-django": {
      title: "Python com Django",
      description: "Desenvolva aplicações web robustas com Python e Django.",
      instructor: {
        name: "Sabrina Silva",
        role: "Senior Developer",
        avatar: "https://github.com/sabrina.png"
      },
      rating: 4.7,
      totalRatings: 1456,
      students: 8934,
      duration: "35h",
      level: "Intermediário",
      lastUpdated: "Dezembro 2024",
      tags: ["Backend", "Python", "Django", "Web"],
      progress: 0
    },
    "android-kotlin": {
      title: "Android com Kotlin",
      description: "Desenvolva aplicativos Android modernos com Kotlin e as melhores práticas.",
      instructor: {
        name: "Bernardo Medeiros",
        role: "Mobile Developer",
        avatar: "https://github.com/bernardo.png"
      },
      rating: 4.9,
      totalRatings: 2134,
      students: 11234,
      duration: "60h",
      level: "Avançado",
      lastUpdated: "Janeiro 2025",
      tags: ["Mobile", "Android", "Kotlin", "Jetpack"],
      progress: 0
    }
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
        <div className="flex-1 pt-16">
          <Navbar isDark={isDark} toggleTheme={toggleTheme} />
          <CourseDetail />
        </div>
      </div>
    </div>
  );
}
