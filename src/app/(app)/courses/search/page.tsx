"use client";

import { Suspense } from "react";
import { Navbar } from "@/components/layout";
import { Sidebar } from "@/components/Sidebar";
import { LoadingGrid } from "@/components/ui/loading-grid";
import { useSearch } from "@/hooks/shared";
import { useCourseSearchWithParams } from "@/hooks/features/courses";
import { CourseCard } from "@/components/features/course";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Search, Filter } from "lucide-react";
import { useState } from "react";

function SearchPageContent() {
  const { searchParams, updateSearchParams, resetSearchParams, isSearching } = useSearch();
  const { data: courses = [], isLoading, error } = useCourseSearchWithParams(searchParams);
  const [showFilters, setShowFilters] = useState(false);

  const getSearchSummary = () => {
    const parts = [];
    
    if (searchParams.q) {
      parts.push(`"${searchParams.q}"`);
    }
    
    if (searchParams.level) {
      parts.push(`nível ${searchParams.level}`);
    }
    
    if (searchParams.technology) {
      parts.push(`tecnologia ${searchParams.technology}`);
    }
    
    if (searchParams.year) {
      parts.push(`ano ${searchParams.year}`);
    }
    
    return parts.join(', ');
  };

  const hasActiveFilters = () => {
    return !!(
      searchParams.category ||
      searchParams.level ||
      searchParams.technology ||
      searchParams.year ||
      searchParams.q
    );
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="flex">
        <Sidebar isDark={true} toggleTheme={() => {}} />
        <div className="flex-1 ml-20">
          <Navbar isDark={true} toggleTheme={() => {}} />
          
          <div className="p-6 pt-24">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-white text-3xl font-bold mb-2">Buscar Cursos</h1>
                <p className="text-white/60">
                  Encontre os cursos perfeitos para sua jornada de aprendizado
                </p>
              </div>

              {/* Filtros rápidos */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-white/60" />
                  <span className="text-white/80 font-medium">Filtros Rápidos:</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {['React', 'Matemática', 'Português', 'Biologia', 'Teologia'].map((tech) => (
                    <Button
                      key={tech}
                      variant="outline"
                      size="sm"
                      onClick={() => updateSearchParams({ technology: tech })}
                      className={`${
                        searchParams.technology === tech
                          ? 'bg-[#bd18b4] text-black border-[#bd18b4]'
                          : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      }`}
                    >
                      {tech}
                    </Button>
                  ))}
                  
                  {['Iniciante', 'Intermediário', 'Avançado'].map((level) => (
                    <Button
                      key={level}
                      variant="outline"
                      size="sm"
                      onClick={() => updateSearchParams({ level: level as any })}
                      className={`${
                        searchParams.level === level
                          ? 'bg-[#bd18b4] text-black border-[#bd18b4]'
                          : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      }`}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Resumo da busca */}
              {hasActiveFilters() && (
                <div className="mb-6 p-4 bg-white/10 rounded-lg border border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="w-5 h-5 text-white/60" />
                      <span className="text-white/80">
                        Buscando por: <Badge variant="secondary" className="bg-white/20 text-white ml-2">
                          {getSearchSummary()}
                        </Badge>
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetSearchParams}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              )}

              {/* Resultados */}
              <div className="space-y-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-white text-lg">Buscando cursos...</div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-red-400 text-lg">Erro na busca: {error.message}</div>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-medium mb-2">
                      {isSearching ? 'Nenhum curso encontrado' : 'Comece sua busca'}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {isSearching 
                        ? 'Tente ajustar os filtros ou usar termos diferentes'
                        : 'Use a barra de busca na navbar ou os filtros acima'
                      }
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-white text-xl font-semibold">
                        {courses.length} curso{courses.length !== 1 ? 's' : ''} encontrado{courses.length !== 1 ? 's' : ''}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {courses.map((course) => (
                        <CourseCard
                          key={course.courseId}
                          title={course.title}
                          description={`${course.instructor} • ${course.duration} • ${course.year}`}
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingGrid size="60" color="#bd18b4" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}