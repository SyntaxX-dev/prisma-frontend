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
            <Card key={course.id} className="bg-white/10 backdrop-blur-md border-white/20 p-6 text-white hover:bg-white/15 transition-colors cursor-pointer">
              <div className="mb-4">
                <img
                  src={course.imageUrl}
                  alt={course.name}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop';
                  }}
                />
                <h3 className="text-lg font-semibold mb-2">{course.name}</h3>
                <p className="text-white/70 text-sm mb-4">{course.description}</p>
                <div className="flex justify-between items-center text-xs text-white/60">
                  <span>Criado em: {new Date(course.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <Button className="w-full bg-white/20 text-white border-white/30 hover:bg-white/30">
                Acessar Curso
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
