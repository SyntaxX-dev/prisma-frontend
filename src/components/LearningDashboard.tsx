import { ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { CourseCard } from "./CourseCard";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "./ui/carousel";

export function LearningDashboard() {
  const recommendedCourses = [
    {
      title: "Soft Skills",
      instructor: "Diego Fernandes",
      duration: "30h",
      level: "Iniciante" as const,
      year: "2023",
      technology: "Soft Skills",
      icon: "💡",
      iconColor: "#f59e0b",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop"
    },
    {
      title: "Node.js",
      instructor: "Diego Fernandes",
      duration: "40h",
      level: "Intermediário" as const,
      year: "2023",
      technology: "Node.js",
      icon: "⚡",
      iconColor: "#10b981",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=200&fit=crop"
    },
    {
      title: "Android com Kotlin",
      instructor: "Bernardo Medeiros",
      duration: "60h",
      level: "Avançado" as const,
      year: "2025",
      technology: "Kotlin",
      icon: "📱",
      iconColor: "#8b5cf6",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop"
    },
    {
      title: "Inglês para Devs",
      instructor: "Oliver Beck",
      duration: "25h",
      level: "Intermediário" as const,
      year: "2025",
      technology: "English",
      icon: "🌎",
      iconColor: "#ef4444",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop"
    },
    {
      title: "iOS com Swift",
      instructor: "Mateus Coelho",
      duration: "45h",
      level: "Intermediário" as const,
      year: "2023",
      technology: "Swift",
      icon: "🍎",
      iconColor: "#3b82f6",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=200&fit=crop"
    },
    {
      title: "Tech Lead",
      instructor: "Ana Santos",
      duration: "35h",
      level: "Avançado" as const,
      year: "2025",
      technology: "Leadership",
      icon: "👥",
      iconColor: "#f97316",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=200&fit=crop"
    },
    {
      title: "Lógica de Programação",
      instructor: "Carlos Silva",
      duration: "20h",
      level: "Iniciante" as const,
      year: "2024",
      technology: "Logic",
      icon: "🧩",
      iconColor: "#ec4899",
      isSubscriber: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=200&fit=crop"
    }
  ];

  const freeCourses = [
    {
      title: "Dev Global - Starter Pack",
      instructor: "Equipe RichPath",
      duration: "8h",
      level: "Iniciante" as const,
      year: "2024",
      technology: "Starter",
      icon: "🚀",
      iconColor: "#06b6d4",
      isSubscriber: false,
      isFree: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop"
    },
    {
      title: "Angular - Curso Introdutório",
      instructor: "Vinícius de Oliveira",
      duration: "12h",
      level: "Iniciante" as const,
      year: "2023",
      technology: "Angular",
      icon: "🅰️",
      iconColor: "#dc2626",
      isSubscriber: false,
      isFree: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1555949963-ff9fe37c3d97?w=400&h=200&fit=crop"
    },
    {
      title: "Discover",
      instructor: "Alya Dana",
      duration: "15h",
      level: "Iniciante" as const,
      year: "2022",
      technology: "Discovery",
      icon: "🔍",
      iconColor: "#f59e0b",
      isSubscriber: false,
      isFree: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200&fit=crop"
    },
    {
      title: "Go - Curso Introdutório",
      instructor: "Lea Carvalho de Andrade",
      duration: "18h",
      level: "Iniciante" as const,
      year: "2024",
      technology: "Go",
      icon: "🐹",
      iconColor: "#10b981",
      isSubscriber: false,
      isFree: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop"
    },
    {
      title: "C# e .NET - Curso Introdutório",
      instructor: "Welisson Reily",
      duration: "22h",
      level: "Iniciante" as const,
      year: "2024",
      technology: ".NET",
      icon: "#️⃣",
      iconColor: "#8b5cf6",
      isSubscriber: false,
      isFree: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&h=200&fit=crop"
    },
    {
      title: "React Native com Expo - Curso Introdutório",
      instructor: "Rodrigo de Castro",
      duration: "16h",
      level: "Intermediário" as const,
      year: "2024",
      technology: "React Native",
      icon: "⚛️",
      iconColor: "#06b6d4",
      isSubscriber: false,
      isFree: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop"
    },
    {
      title: "Python com Django - Introdutório",
      instructor: "Sabrina Silva",
      duration: "20h",
      level: "Intermediário" as const,
      year: "2024",
      technology: "Python",
      icon: "🐍",
      iconColor: "#f59e0b",
      isSubscriber: false,
      isFree: true,
      thumbnailUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=200&fit=crop"
    }
  ];

  return (
    <div className="flex-1 p-8 ml-20 pt-28"> {/* Added pt-28 for fixed navbar */}
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-black dark:text-white text-3xl font-bold mb-2">Bom dia, Sajibur!</h1>
        <p className="text-black/70 dark:text-white/60">Continue aprendendo e desenvolvendo suas habilidades em tecnologia.</p>
      </div>

      {/* Recommended Courses Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-black dark:text-white text-xl font-semibold">Recomendações</h2>
          <Button variant="ghost" className="text-black/70 dark:text-white/60 hover:text-black dark:hover:text-white">
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
          <CarouselContent className="-ml-4">
            {recommendedCourses.map((course, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <CourseCard course={course} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Free Courses Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-black dark:text-white text-xl font-semibold">Acesse gratuitamente</h2>
          <Button variant="ghost" className="text-black/70 dark:text-white/60 hover:text-black dark:hover:text-white">
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
          <CarouselContent className="-ml-4">
            {freeCourses.map((course, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <CourseCard course={course} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
}