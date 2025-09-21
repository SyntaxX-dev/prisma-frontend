import { ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { CourseCard } from "./CourseCard";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "./ui/carousel";
import { useState, useEffect } from "react";
import Image from "next/image";

interface Course {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export function LearningDashboard({ userName }: { userName?: string }) {
  const [greeting, setGreeting] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();

        if (data.success) {
          setCourses(data.data);
        } else {
          setError('Erro ao carregar cursos');
        }
      } catch (err) {
        setError('Erro ao conectar com o servidor');
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
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
          <div className="text-red-400 text-lg">{error}</div>
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
            <h2 className="text-white text-lg font-semibold">Cursos Disponíveis</h2>
            <Button variant="ghost" className="text-white/60 hover:text-white text-sm">
              Ver todos
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-3">
              {courses.map((course) => (
                <CarouselItem key={course.id} className="pl-3 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                  <CourseCard
                    title={course.name}
                    description={course.description}
                    technology={course.name}
                    icon="📚"
                    isSubscriber={true}
                    thumbnailUrl={course.imageUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop"}
                    iconColor="#06b6d4"
                    courseId={course.id}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="bg-white/10 border-white/20 text-white hover:bg-white/20" />
            <CarouselNext className="bg-white/10 border-white/20 text-white hover:bg-white/20" />
          </Carousel>
        </div>
      )}
    </div>
  );
}
