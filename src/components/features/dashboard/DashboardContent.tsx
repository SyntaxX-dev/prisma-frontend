import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { LoadingGrid } from "../../ui/loading-grid";
import { useState, useEffect } from "react";

interface Course {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface CoursesResponse {
  success: boolean;
  data: Course[];
}

export function DashboardContent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/courses');
        const data: CoursesResponse = await response.json();
        if (data.success) {
          setCourses(data.data);
        }
      } catch (err) {
        setError('Erro ao carregar cursos');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="flex-1 p-8 ml-20">
      {loading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingGrid size="60" color="#bd18b4" />
        </div>
      )}

      {error && (
        <div className="text-red-400 text-center py-8">
          {error}
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <>
          <div className="mb-8">
            <h1 className="text-white text-3xl font-bold mb-2">Cursos Disponíveis</h1>
            <p className="text-white/60">Explore nossos cursos e comece sua jornada de aprendizado.</p>
          </div>
        </>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer rounded-2xl group">
              <div className="mb-4">
                <div className="overflow-hidden rounded-xl mb-4 relative aspect-video">
                  <img
                    src={course.imageUrl}
                    alt={course.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#bd18b4] transition-colors">{course.name}</h3>
                <p className="text-white/50 text-xs font-medium mb-4 line-clamp-2 leading-relaxed">{course.description}</p>
                <div className="flex justify-between items-center text-[10px] text-white/40 uppercase font-bold tracking-wider pt-4 border-t border-white/5">
                  <span>Criado em: {new Date(course.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <Button className="w-full bg-white/10 text-white border border-white/10 hover:bg-[#bd18b4] hover:border-[#bd18b4] transition-all duration-300 rounded-xl font-bold uppercase text-[11px] tracking-widest py-6">
                Acessar Curso
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
