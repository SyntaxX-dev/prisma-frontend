import { CourseCard } from "../course/CourseCard";
import { LoadingGrid } from "../../ui/loading-grid";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearch } from "@/hooks/shared";
import { useCourseSearchWithParams, useProducerCourses } from "@/hooks/features/courses";
import { HorizontalCarousel } from "../course/HorizontalCarousel";

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
    <div className="pl-2 pr-4 md:pr-6 pt-6 md:pt-10 overflow-x-hidden ml-0 md:ml-[6rem]">

      <div className="mb-6 md:mb-8">
        <h1 className="text-white text-xl md:text-2xl font-bold mb-2">{greeting}, {userName || "Usuário"}!</h1>
        <p className="text-white/60 text-xs md:text-sm">Continue aprendendo e desenvolvendo suas habilidades em tecnologia.</p>
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
                <div className="flex items-center gap-2">
                  <h2 className="text-white text-base md:text-lg font-semibold">Cursos Patrocinados</h2>
                  <span className="text-[10px] text-[#FFD700] bg-[#FFD700]/10 px-2 py-1 rounded-full font-medium">
                    DESTAQUE
                  </span>
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
            <h2 className="text-white text-base md:text-lg font-semibold">
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
