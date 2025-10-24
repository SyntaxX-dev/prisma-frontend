import { ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { CourseCard } from "./CourseCard";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "./ui/carousel";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearch } from "../hooks/useSearch";
import { useCourseSearchWithParams, Course } from "../hooks/useCourseSearch";

export function LearningDashboard({ userName }: { userName?: string }) {
  const [greeting, setGreeting] = useState("");
  
  // Hook para search params
  const { searchParams, isSearching } = useSearch();
  
  // Hook unificado que gerencia tanto busca quanto carregamento inicial
  const { data: courses = [], isLoading: coursesLoading, error } = useCourseSearchWithParams(searchParams);

  // Debug logs
  console.log('🔍 LearningDashboard - searchParams:', searchParams);
  console.log('🔍 LearningDashboard - isSearching:', isSearching);
  console.log('🔍 LearningDashboard - courses:', courses.length, 'cursos');
  console.log('🔍 LearningDashboard - coursesLoading:', coursesLoading);
  console.log('🔍 LearningDashboard - error:', error);

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
        <div className="flex items-center justify-center py-12">
          <div className="text-white text-lg">Carregando cursos...</div>
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
            <Button variant="ghost" className="text-white/60 hover:text-white text-sm">
              Ver todos
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Mostra carousel normal quando não há busca */
            <Carousel
              opts={{
                align: "start",
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-3">
                {courses.map((course) => (
                  <CarouselItem key={course.courseId} className="pl-3 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
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
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="bg-white/10 border-white/20 text-white hover:bg-white/20" />
              <CarouselNext className="bg-white/10 border-white/20 text-white hover:bg-white/20" />
            </Carousel>
          )}
        </div>
      )}
    </div>
  );
}
