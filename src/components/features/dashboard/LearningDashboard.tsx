import { CourseCard } from "../course/CourseCard";
import { LoadingGrid } from "../../ui/loading-grid";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearch } from "@/hooks/shared";
import { useCourseSearchWithParams, useProducerCourses } from "@/hooks/features/courses";
import { HorizontalCarousel } from "../course/HorizontalCarousel";
import { Sparkles } from "lucide-react";

export function LearningDashboard({ userName }: { userName?: string }) {
  const [greeting, setGreeting] = useState("");

  // Hook para search params
  const { searchParams, isSearching } = useSearch();

  // Hook unificado que gerencia tanto busca quanto carregamento inicial
  const { data: courses = [], isLoading: coursesLoading, error } = useCourseSearchWithParams(searchParams);
  const { data: producerCourses = [], isLoading: producerLoading, isError: producerError } = useProducerCourses();


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
    <div className="pl-2 pr-4 md:pr-6 pt-24 md:pt-28 overflow-x-hidden ml-0 md:ml-[6rem]">

      <div className="mb-10 relative">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-1 bg-gradient-to-r from-[#bd18b4] to-[#aa22c5] rounded-full" />
          <h1 className="text-white text-3xl md:text-4xl font-black tracking-tight uppercase">
            {greeting}, {userName?.split(' ')[0] || "Explorador"}!
          </h1>
        </div>
        <p className="text-white/40 text-sm md:text-base font-medium max-w-2xl leading-relaxed">
          Sua jornada de conhecimento continua aqui. Explore novos horizontes e domine as tecnologias que moldam o futuro.
        </p>

        {/* Subtle decorative element */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#bd18b4]/5 blur-[80px] -z-10 pointer-events-none" />
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
        <div className="flex flex-col items-center justify-center px-4">
          <Image
            src="/defaultwithoutcourses.png"
            alt="Nenhum curso disponível"
            width={1000}
            height={1000}
            className="mb-6 opacity-80 max-w-full h-auto"
          />
        </div>
      ) : (
        <div>
          {/* Seção de Cursos Patrocinados - apenas quando não há busca */}
          {!isSearching && (
            <div className="mb-6 md:mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-white text-lg md:text-xl font-black tracking-tight uppercase">Cursos Patrocinados</h2>
                  <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">
                      Destaque
                    </span>
                  </div>
                </div>
              </div>

              {/* Carrossel de cursos patrocinados */}
              <div className="w-full -mx-2 md:mx-0">
                {producerLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingGrid size="60" color="#FFD700" />
                  </div>
                ) : producerError ? (
                  <div className="text-red-400 text-sm px-2">Erro ao carregar cursos patrocinados</div>
                ) : producerCourses.length === 0 ? (
                  <div className="text-white/60 text-sm px-2">Nenhum curso de produtor disponível no momento.</div>
                ) : (
                  <HorizontalCarousel
                    courses={producerCourses}
                    itemWidth={280}
                    limitVisibleCards={true}
                  />
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg md:text-xl font-black tracking-tight uppercase">
              {isSearching ? 'Resultados da Busca' : 'Cursos Disponíveis'}
            </h2>
          </div>

          {/* Mostra resultados da busca se houver busca ativa, senão mostra carousel */}
          {isSearching ? (
            <div className="space-y-4">
              {courses.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center px-4">
                    <div className="text-white/60 text-base md:text-lg mb-2">Nenhum curso encontrado</div>
                    <div className="text-white/40 text-xs md:text-sm">
                      Tente ajustar os filtros de busca na barra superior
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
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
            <div className="grid gap-4 md:gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
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
