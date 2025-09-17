import { useQuery } from '@tanstack/react-query';

export interface Course {
  title: string;
  instructor: string;
  duration: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  year: string;
  technology: string;
  icon: string;
  iconColor: string;
  isSubscriber: boolean;
  isFree?: boolean;
  thumbnailUrl: string;
  courseId: string;
  category: string;
}

// Mock data - em produção isso viria de uma API
const mockCourses: Course[] = [
  {
    title: "Node.js",
    instructor: "Diego Fernandes",
    duration: "40h",
    level: "Intermediário",
    year: "2023",
    technology: "Node.js",
    icon: "⚡",
    iconColor: "#10b981",
    isSubscriber: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=200&fit=crop",
    courseId: "nodejs",
    category: "nodejs"
  },
  {
    title: "Node.js Avançado",
    instructor: "Diego Fernandes",
    duration: "40h",
    level: "Intermediário",
    year: "2025",
    technology: "Node.js",
    icon: "⚡",
    iconColor: "#10b981",
    isSubscriber: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=200&fit=crop",
    courseId: "nodejs-avancado",
    category: "nodejs"
  },
  {
    title: "Node.js para Iniciantes",
    instructor: "Carlos Silva",
    duration: "25h",
    level: "Iniciante",
    year: "2024",
    technology: "Node.js",
    icon: "⚡",
    iconColor: "#10b981",
    isSubscriber: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=200&fit=crop",
    courseId: "nodejs-iniciantes",
    category: "nodejs"
  },
  {
    title: "APIs REST com Node.js",
    instructor: "Ana Santos",
    duration: "30h",
    level: "Intermediário",
    year: "2024",
    technology: "Node.js",
    icon: "⚡",
    iconColor: "#10b981",
    isSubscriber: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=200&fit=crop",
    courseId: "nodejs-apis",
    category: "nodejs"
  },
  {
    title: "React Completo",
    instructor: "Diego Fernandes",
    duration: "45h",
    level: "Intermediário",
    year: "2025",
    technology: "React",
    icon: "⚛️",
    iconColor: "#06b6d4",
    isSubscriber: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1555949963-ff9fe37c3d97?w=400&h=200&fit=crop",
    courseId: "react-completo",
    category: "react"
  },
  {
    title: "React Hooks Avançados",
    instructor: "Maria Oliveira",
    duration: "20h",
    level: "Avançado",
    year: "2024",
    technology: "React",
    icon: "⚛️",
    iconColor: "#06b6d4",
    isSubscriber: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1555949963-ff9fe37c3d97?w=400&h=200&fit=crop",
    courseId: "react-hooks",
    category: "react"
  },
  {
    title: "React Native com Expo",
    instructor: "Rodrigo de Castro",
    duration: "16h",
    level: "Intermediário",
    year: "2024",
    technology: "React Native",
    icon: "⚛️",
    iconColor: "#06b6d4",
    isSubscriber: false,
    isFree: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop",
    courseId: "react-native-expo",
    category: "react"
  },
  {
    title: "Python com Django",
    instructor: "Sabrina Silva",
    duration: "20h",
    level: "Intermediário",
    year: "2024",
    technology: "Python",
    icon: "🐍",
    iconColor: "#f59e0b",
    isSubscriber: false,
    isFree: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=200&fit=crop",
    courseId: "python-django",
    category: "python"
  },
  {
    title: "Python com Django Avançado",
    instructor: "Sabrina Silva",
    duration: "35h",
    level: "Intermediário",
    year: "2024",
    technology: "Python",
    icon: "🐍",
    iconColor: "#f59e0b",
    isSubscriber: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=200&fit=crop",
    courseId: "python-django-avancado",
    category: "python"
  },
  {
    title: "Python para Data Science",
    instructor: "João Pedro",
    duration: "50h",
    level: "Avançado",
    year: "2024",
    technology: "Python",
    icon: "🐍",
    iconColor: "#f59e0b",
    isSubscriber: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=200&fit=crop",
    courseId: "python-data-science",
    category: "python"
  },
  {
    title: "Android com Kotlin",
    instructor: "Bernardo Medeiros",
    duration: "60h",
    level: "Avançado",
    year: "2025",
    technology: "Kotlin",
    icon: "📱",
    iconColor: "#8b5cf6",
    isSubscriber: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop",
    courseId: "android-kotlin",
    category: "mobile"
  },
  {
    title: "iOS com Swift",
    instructor: "Mateus Coelho",
    duration: "45h",
    level: "Intermediário",
    year: "2023",
    technology: "Swift",
    icon: "🍎",
    iconColor: "#3b82f6",
    isSubscriber: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=200&fit=crop",
    courseId: "ios-swift",
    category: "mobile"
  },
  {
    title: "Soft Skills",
    instructor: "Diego Fernandes",
    duration: "30h",
    level: "Iniciante",
    year: "2023",
    technology: "Soft Skills",
    icon: "💡",
    iconColor: "#f59e0b",
    isSubscriber: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop",
    courseId: "soft-skills",
    category: "soft-skills"
  },
  {
    title: "Inglês para Devs",
    instructor: "Oliver Beck",
    duration: "25h",
    level: "Intermediário",
    year: "2025",
    technology: "English",
    icon: "🌎",
    iconColor: "#ef4444",
    isSubscriber: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop",
    courseId: "ingles-para-devs",
    category: "soft-skills"
  },
  {
    title: "Tech Lead",
    instructor: "Ana Santos",
    duration: "35h",
    level: "Avançado",
    year: "2025",
    technology: "Leadership",
    icon: "👥",
    iconColor: "#f97316",
    isSubscriber: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=200&fit=crop",
    courseId: "tech-lead",
    category: "leadership"
  },
  {
    title: "Lógica de Programação",
    instructor: "Carlos Silva",
    duration: "20h",
    level: "Iniciante",
    year: "2024",
    technology: "Logic",
    icon: "🧩",
    iconColor: "#ec4899",
    isSubscriber: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=200&fit=crop",
    courseId: "logica-programacao",
    category: "fundamentals"
  },
  {
    title: "Dev Global - Starter Pack",
    instructor: "Equipe RichPath",
    duration: "8h",
    level: "Iniciante",
    year: "2024",
    technology: "Starter",
    icon: "🚀",
    iconColor: "#06b6d4",
    isSubscriber: false,
    isFree: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop",
    courseId: "dev-global-starter",
    category: "fundamentals"
  },
  {
    title: "Discover",
    instructor: "Alya Dana",
    duration: "15h",
    level: "Iniciante",
    year: "2022",
    technology: "Discovery",
    icon: "🔍",
    iconColor: "#f59e0b",
    isSubscriber: false,
    isFree: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200&fit=crop",
    courseId: "discover",
    category: "fundamentals"
  },
  {
    title: "Angular - Curso Introdutório",
    instructor: "Vinícius de Oliveira",
    duration: "12h",
    level: "Iniciante",
    year: "2023",
    technology: "Angular",
    icon: "🅰️",
    iconColor: "#dc2626",
    isSubscriber: false,
    isFree: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1555949963-ff9fe37c3d97?w=400&h=200&fit=crop",
    courseId: "angular-intro",
    category: "angular"
  },
  {
    title: "Go - Curso Introdutório",
    instructor: "Lea Carvalho de Andrade",
    duration: "18h",
    level: "Iniciante",
    year: "2024",
    technology: "Go",
    icon: "🐹",
    iconColor: "#10b981",
    isSubscriber: false,
    isFree: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop",
    courseId: "go-intro",
    category: "go"
  },
  {
    title: "C# e .NET - Curso Introdutório",
    instructor: "Welisson Reily",
    duration: "22h",
    level: "Iniciante",
    year: "2024",
    technology: ".NET",
    icon: "#️⃣",
    iconColor: "#8b5cf6",
    isSubscriber: false,
    isFree: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&h=200&fit=crop",
    courseId: "csharp-dotnet-intro",
    category: "csharp"
  }
];

// Função para simular busca na API
const searchCourses = async (query: string): Promise<Course[]> => {
  // Simula delay da API
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!query.trim()) {
    return mockCourses;
  }

  const searchTerm = query.toLowerCase().trim();
  return mockCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm) ||
    course.instructor.toLowerCase().includes(searchTerm) ||
    course.technology.toLowerCase().includes(searchTerm) ||
    course.level.toLowerCase().includes(searchTerm) ||
    course.category.toLowerCase().includes(searchTerm)
  );
};

export function useCourseSearch(query: string) {
  return useQuery({
    queryKey: ['courses', 'search', query],
    queryFn: () => searchCourses(query),
    enabled: true, // Sempre habilitado, mas retorna todos os cursos se query estiver vazia
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}
