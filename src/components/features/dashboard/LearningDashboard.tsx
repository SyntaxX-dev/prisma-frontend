import { ChevronRight } from "lucide-react";
import { Button } from "../../ui/button";
import { CourseCard } from "../course/CourseCard";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "../../ui/carousel";
import { LoadingGrid } from "../../ui/loading-grid";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearch } from "@/hooks/shared";
import { useCourseSearchWithParams, Course } from "@/hooks/features/courses";

export function LearningDashboard({ userName }: { userName?: string }) {
  const [greeting, setGreeting] = useState("");
  
  // Hook para search params
  const { searchParams, isSearching } = useSearch();
  
  // Hook unificado que gerencia tanto busca quanto carregamento inicial
  const { data: courses = [], isLoading: coursesLoading, error } = useCourseSearchWithParams(searchParams);

  // Calcula quantos cursos cabem por linha baseado no tamanho da tela
  const COURSES_PER_ROW = 5; // xl:basis-1/5 = 5 cursos por linha

  // Divide os cursos em grupos (linhas de carrossel)
  const courseRows = [];
  for (let i = 0; i < courses.length; i += COURSES_PER_ROW) {
    courseRows.push(courses.slice(i, i + COURSES_PER_ROW));
  }

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
    <div className="flex-1 p-6 ml-10 pt-10">

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 justify-items-center">
                  {courses.map((course) => (
                    <div key={course.courseId} className="w-[280px] h-[320px]">
                      <CourseCard
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Mostra múltiplos carrosséis quando não há busca */
            <div className="space-y-8">
              {courseRows.map((rowCourses, rowIndex) => (
                <div key={`row-${rowIndex}`}>
                  {rowIndex > 0 && (
                    <div className="flex items-center justify-between mb-4 mt-8">
                      <h2 className="text-white text-lg font-semibold">
                        Mais Cursos
                      </h2>
                    </div>
                  )}
                  <Carousel
                    opts={{
                      align: "start",
                    }}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-3">
                      {rowCourses.map((course) => (
                        <CarouselItem key={course.courseId} className="pl-3 basis-auto flex-shrink-0">
                          <div className="w-[280px] h-[320px]">
                            <CourseCard
                              title={course.title}
                              description={course.description}
                              technology={course.technology}
                              icon={course.icon}
                              isSubscriber={course.isSubscriber}
                              isFree={course.isFree}
                              thumbnailUrl={course.thumbnailUrl}
                              iconColor={course.iconColor}
                              courseId={course.courseId}
                              category={course.category}
                              instructor={course.instructor}
                              duration={course.duration}
                              year={course.year}
                              level={course.level}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="bg-white/10 border-white/20 text-white hover:bg-white/20" />
                    <CarouselNext className="bg-white/10 border-white/20 text-white hover:bg-white/20" />
                  </Carousel>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
