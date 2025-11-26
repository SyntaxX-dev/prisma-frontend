import { CourseCard } from "../course/CourseCard";
import { LoadingGrid } from "../../ui/loading-grid";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearch } from "@/hooks/shared";
import { useCourseSearchWithParams } from "@/hooks/features/courses";
import { HorizontalCarousel } from "../course/HorizontalCarousel";

// Dados mockados para cursos patrocinados
const mockSponsoredCourses = [
  {
    courseId: "sponsored-1",
    title: "TypeScript Avançado",
    description: "Domine TypeScript do zero ao avançado com projetos reais",
    technology: "TypeScript",
    icon: "📘",
    iconColor: "#3178C6",
    isSubscriber: false,
    isFree: false,
    thumbnailUrl: "",
    category: "typescript",
    instructor: "João Silva",
    duration: "40h",
    year: "2025",
    level: "Avançado" as const,
    courseType: "CURSO" as const,
  },
  {
    courseId: "sponsored-2",
    title: "Next.js 15 Completo",
    description: "Aprenda Next.js 15 com App Router, Server Components e muito mais",
    technology: "Next.js",
    icon: "▲",
    iconColor: "#000000",
    isSubscriber: false,
    isFree: false,
    thumbnailUrl: "",
    category: "nextjs",
    instructor: "Maria Santos",
    duration: "60h",
    year: "2025",
    level: "Intermediário" as const,
    courseType: "FORMAÇÃO" as const,
  },
  {
    courseId: "sponsored-3",
    title: "AWS Cloud Practitioner",
    description: "Certificação AWS com foco em práticas reais de mercado",
    technology: "AWS",
    icon: "☁️",
    iconColor: "#FF9900",
    isSubscriber: false,
    isFree: false,
    thumbnailUrl: "",
    category: "cloud",
    instructor: "Carlos Oliveira",
    duration: "50h",
    year: "2025",
    level: "Iniciante" as const,
    courseType: "CURSO" as const,
  },
  {
    courseId: "sponsored-4",
    title: "Docker & Kubernetes",
    description: "Containerização e orquestração de aplicações em produção",
    technology: "Docker",
    icon: "🐳",
    iconColor: "#2496ED",
    isSubscriber: false,
    isFree: false,
    thumbnailUrl: "",
    category: "devops",
    instructor: "Ana Costa",
    duration: "45h",
    year: "2025",
    level: "Intermediário" as const,
    courseType: "CURSO" as const,
  },
  {
    courseId: "sponsored-5",
    title: "GraphQL Masterclass",
    description: "Aprenda GraphQL do básico ao avançado com Apollo e Relay",
    technology: "GraphQL",
    icon: "🔷",
    iconColor: "#E10098",
    isSubscriber: false,
    isFree: false,
    thumbnailUrl: "",
    category: "graphql",
    instructor: "Pedro Alves",
    duration: "35h",
    year: "2025",
    level: "Avançado" as const,
    courseType: "CURSO" as const,
  },
  {
    courseId: "sponsored-6",
    title: "Vue.js 3 Completo",
    description: "Framework progressivo para construir interfaces modernas",
    technology: "Vue.js",
    icon: "💚",
    iconColor: "#4FC08D",
    isSubscriber: false,
    isFree: false,
    thumbnailUrl: "",
    category: "vue",
    instructor: "Lucas Mendes",
    duration: "55h",
    year: "2025",
    level: "Intermediário" as const,
    courseType: "FORMAÇÃO" as const,
  },
  {
    courseId: "sponsored-7",
    title: "MongoDB & NoSQL",
    description: "Banco de dados NoSQL para aplicações escaláveis",
    technology: "MongoDB",
    icon: "🍃",
    iconColor: "#47A248",
    isSubscriber: false,
    isFree: false,
    thumbnailUrl: "",
    category: "database",
    instructor: "Fernanda Lima",
    duration: "30h",
    year: "2025",
    level: "Iniciante" as const,
    courseType: "CURSO" as const,
  },
  {
    courseId: "sponsored-8",
    title: "Elixir & Phoenix",
    description: "Desenvolvimento web funcional e concorrente",
    technology: "Elixir",
    icon: "💜",
    iconColor: "#4B275F",
    isSubscriber: false,
    isFree: false,
    thumbnailUrl: "",
    category: "elixir",
    instructor: "Rafael Souza",
    duration: "70h",
    year: "2025",
    level: "Avançado" as const,
    courseType: "FORMAÇÃO" as const,
  },
  {
    courseId: "sponsored-9",
    title: "Flutter Mobile",
    description: "Desenvolvimento mobile multiplataforma com Flutter",
    technology: "Flutter",
    icon: "📱",
    iconColor: "#02569B",
    isSubscriber: false,
    isFree: false,
    thumbnailUrl: "",
    category: "mobile",
    instructor: "Juliana Rocha",
    duration: "80h",
    year: "2025",
    level: "Intermediário" as const,
    courseType: "FORMAÇÃO" as const,
  },
  {
    courseId: "sponsored-10",
    title: "Python Data Science",
    description: "Análise de dados e machine learning com Python",
    technology: "Python",
    icon: "🐍",
    iconColor: "#3776AB",
    isSubscriber: false,
    isFree: false,
    thumbnailUrl: "",
    category: "python",
    instructor: "Roberto Silva",
    duration: "90h",
    year: "2025",
    level: "Avançado" as const,
    courseType: "FORMAÇÃO" as const,
  },
  {
    courseId: "sponsored-11",
    title: "Rust Systems Programming",
    description: "Programação de sistemas com segurança e performance",
    technology: "Rust",
    icon: "🦀",
    iconColor: "#000000",
    isSubscriber: false,
    isFree: false,
    thumbnailUrl: "",
    category: "rust",
    instructor: "Marcos Ferreira",
    duration: "65h",
    year: "2025",
    level: "Avançado" as const,
    courseType: "FORMAÇÃO" as const,
  },
  {
    courseId: "sponsored-12",
    title: "Svelte & SvelteKit",
    description: "Framework moderno e performático para web",
    technology: "Svelte",
    icon: "🧡",
    iconColor: "#FF3E00",
    isSubscriber: false,
    isFree: false,
    thumbnailUrl: "",
    category: "svelte",
    instructor: "Patricia Gomes",
    duration: "40h",
    year: "2025",
    level: "Intermediário" as const,
    courseType: "CURSO" as const,
  },
];

export function LearningDashboard({ userName }: { userName?: string }) {
  const [greeting, setGreeting] = useState("");
  
  // Hook para search params
  const { searchParams, isSearching } = useSearch();
  
  // Hook unificado que gerencia tanto busca quanto carregamento inicial
  const { data: courses = [], isLoading: coursesLoading, error } = useCourseSearchWithParams(searchParams);


  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Bom dia";
      if (hour < 18) return "Boa tarde";
      return "Boa noite";
    };
    setGreeting(getGreeting());

    const intervalId = setInterval(() => {
      setGreeting(getGreeting());
    }, 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);



  return (
    <div className="pl-2 pr-6 pt-10 overflow-x-hidden" style={{ marginLeft: '6rem' }}> {/* Compensa sidebar: left-4 (16px) + w-64 (256px) = 272px */}

      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold mb-2">{greeting}, {userName || "Usuário"}!</h1>
        <p className="text-white/60 text-sm">Continue aprendendo e desenvolvendo suas habilidades em tecnologia.</p>
      </div>

      {coursesLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingGrid size="60" color="#bd18b4" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-red-400 text-lg">Erro ao carregar cursos</div>
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center ">
          <Image
            src="/defaultwithoutcourses.png"
            alt="Nenhum curso disponível"
            width={1000}
            height={1000}
            className="mb-6 opacity-80"
          />
        </div>
      ) : (
        <div>
          {/* Seção de Cursos Patrocinados - apenas quando não há busca */}
          {!isSearching && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-white text-lg font-semibold">Cursos Patrocinados</h2>
                  <span className="text-[10px] text-[#FFD700] bg-[#FFD700]/10 px-2 py-1 rounded-full font-medium">
                    DESTAQUE
                  </span>
                </div>
              </div>
              
              {/* Carrossel de cursos patrocinados */}
              <div className="w-full">
                <HorizontalCarousel 
                  courses={mockSponsoredCourses.map(course => ({
                    title: course.title,
                    description: course.description,
                    technology: course.technology,
                    icon: course.icon,
                    iconColor: course.iconColor,
                    isSubscriber: course.isSubscriber,
                    isFree: course.isFree,
                    thumbnailUrl: course.thumbnailUrl,
                    instructor: course.instructor,
                    duration: course.duration,
                    year: course.year,
                    level: course.level,
                    courseId: course.courseId,
                    category: course.category,
                    courseType: course.courseType,
                    isSponsored: true,
                  }))}
                  itemWidth={280}
                  limitVisibleCards={true}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg font-semibold">
              {isSearching ? 'Resultados da Busca' : 'Cursos Disponíveis'}
            </h2>
          </div>

          {/* Mostra resultados da busca se houver busca ativa, senão mostra carousel */}
          {isSearching ? (
            <div className="space-y-4">
              {courses.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="text-white/60 text-lg mb-2">Nenhum curso encontrado</div>
                    <div className="text-white/40 text-sm">
                      Tente ajustar os filtros de busca na barra superior
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                  {courses.map((course) => (
                    <CourseCard
                      key={course.courseId}
                      title={course.title}
                      description={course.description}
                      technology={course.technology}
                      icon={course.icon}
                      iconColor={course.iconColor}
                      isSubscriber={course.isSubscriber}
                      isFree={course.isFree}
                      thumbnailUrl={course.thumbnailUrl}
                      courseId={course.courseId}
                      category={course.category}
                      instructor={course.instructor}
                      duration={course.duration}
                      year={course.year}
                      level={course.level}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Mostra grid quando não há busca */
            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {courses.map((course) => (
                <CourseCard
                  key={course.courseId}
                  title={course.title}
                  description={course.description}
                  technology={course.technology}
                  icon={course.icon}
                  iconColor={course.iconColor}
                  isSubscriber={course.isSubscriber}
                  isFree={course.isFree}
                  thumbnailUrl={course.thumbnailUrl}
                  courseId={course.courseId}
                  category={course.category}
                  instructor={course.instructor}
                  duration={course.duration}
                  year={course.year}
                  level={course.level}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
