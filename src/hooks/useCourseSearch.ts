import { useQuery } from '@tanstack/react-query';

// Tipos baseados na API real
export interface ApiCourse {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCoursesResponse {
  success: boolean;
  data: ApiCourse[];
}

// Interface para compatibilidade com componentes existentes
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

// Cache global para todos os cursos (evita múltiplas requisições)
let allCoursesCache: ApiCourse[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Função para buscar cursos da API real com cache
const fetchCoursesFromAPI = async (): Promise<ApiCourse[]> => {
  const now = Date.now();
  
  // Se temos cache válido, retorna ele
  if (allCoursesCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return allCoursesCache;
  }
  
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Erro ao buscar cursos');
  }
  
  const data: ApiCoursesResponse = await response.json();
  
  if (!data.success) {
    throw new Error('Erro na resposta da API');
  }
  
  // Atualiza cache
  allCoursesCache = data.data;
  cacheTimestamp = now;
  
  return data.data;
};

// Função para transformar dados da API no formato esperado pelos componentes
export const transformApiCourseToCourse = (apiCourse: ApiCourse): Course => {
  // Mapear nome para tecnologia baseado no nome do curso
  const getTechnologyFromName = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('react')) return 'React';
    if (nameLower.includes('node')) return 'Node.js';
    if (nameLower.includes('python')) return 'Python';
    if (nameLower.includes('javascript')) return 'JavaScript';
    if (nameLower.includes('typescript')) return 'TypeScript';
    if (nameLower.includes('angular')) return 'Angular';
    if (nameLower.includes('vue')) return 'Vue.js';
    if (nameLower.includes('java')) return 'Java';
    if (nameLower.includes('c#')) return 'C#';
    if (nameLower.includes('go')) return 'Go';
    if (nameLower.includes('kotlin')) return 'Kotlin';
    if (nameLower.includes('swift')) return 'Swift';
    if (nameLower.includes('matemática') || nameLower.includes('matematica')) return 'Matemática';
    if (nameLower.includes('português') || nameLower.includes('portugues')) return 'Português';
    if (nameLower.includes('biologia')) return 'Biologia';
    if (nameLower.includes('teologia')) return 'Teologia';
    return name; // Fallback para o nome original
  };

  // Mapear tecnologia para ícone e cor
  const getIconAndColor = (technology: string): { icon: string; iconColor: string } => {
    const techLower = technology.toLowerCase();
    if (techLower.includes('react')) return { icon: '⚛️', iconColor: '#06b6d4' };
    if (techLower.includes('node')) return { icon: '⚡', iconColor: '#10b981' };
    if (techLower.includes('python')) return { icon: '🐍', iconColor: '#f59e0b' };
    if (techLower.includes('javascript')) return { icon: '🟨', iconColor: '#f7df1e' };
    if (techLower.includes('typescript')) return { icon: '🔷', iconColor: '#3178c6' };
    if (techLower.includes('angular')) return { icon: '🅰️', iconColor: '#dc2626' };
    if (techLower.includes('vue')) return { icon: '💚', iconColor: '#4fc08d' };
    if (techLower.includes('java')) return { icon: '☕', iconColor: '#f89820' };
    if (techLower.includes('c#')) return { icon: '#️⃣', iconColor: '#8b5cf6' };
    if (techLower.includes('go')) return { icon: '🐹', iconColor: '#00add8' };
    if (techLower.includes('kotlin')) return { icon: '📱', iconColor: '#8b5cf6' };
    if (techLower.includes('swift')) return { icon: '🍎', iconColor: '#3b82f6' };
    if (techLower.includes('matemática') || techLower.includes('matematica')) return { icon: '🔢', iconColor: '#ef4444' };
    if (techLower.includes('português') || techLower.includes('portugues')) return { icon: '📚', iconColor: '#8b5cf6' };
    if (techLower.includes('biologia')) return { icon: '🧬', iconColor: '#10b981' };
    if (techLower.includes('teologia')) return { icon: '⛪', iconColor: '#f59e0b' };
    return { icon: '📚', iconColor: '#06b6d4' }; // Fallback
  };

  const technology = getTechnologyFromName(apiCourse.name);
  const { icon, iconColor } = getIconAndColor(technology);
  
  // Determinar nível baseado no nome (pode ser melhorado com dados reais)
  const getLevelFromName = (name: string): 'Iniciante' | 'Intermediário' | 'Avançado' => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('básico') || nameLower.includes('iniciante') || nameLower.includes('introdutório')) {
      return 'Iniciante';
    }
    if (nameLower.includes('avançado') || nameLower.includes('expert') || nameLower.includes('master')) {
      return 'Avançado';
    }
    return 'Intermediário'; // Padrão
  };

  // Determinar categoria baseada na tecnologia
  const getCategoryFromTechnology = (technology: string): string => {
    const techLower = technology.toLowerCase();
    if (['react', 'vue', 'angular', 'javascript', 'typescript'].includes(techLower)) {
      return 'frontend';
    }
    if (['node.js', 'python', 'java', 'c#', 'go'].includes(techLower)) {
      return 'backend';
    }
    if (['kotlin', 'swift'].includes(techLower)) {
      return 'mobile';
    }
    if (['matemática', 'português', 'biologia', 'teologia'].includes(techLower)) {
      return 'academic';
    }
    return 'general';
  };

  return {
    title: apiCourse.name,
    description: apiCourse.description, // Usa a descrição real da API
    instructor: 'Instrutor', // Placeholder - pode ser melhorado com dados reais
    duration: 'N/A', // Placeholder - pode ser melhorado com dados reais
    level: getLevelFromName(apiCourse.name),
    year: new Date(apiCourse.createdAt).getFullYear().toString(),
    technology,
    icon,
    iconColor,
    isSubscriber: apiCourse.isPaid, // Se é pago, é para assinantes
    isFree: !apiCourse.isPaid, // Se não é pago, é gratuito
    thumbnailUrl: apiCourse.imageUrl,
    courseId: apiCourse.id,
    category: getCategoryFromTechnology(technology)
  };
};

// Mock data - mantido para fallback
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

// Função para buscar cursos da API real
const searchCourses = async (query: string): Promise<Course[]> => {
  try {
    // Busca cursos da API real
    const apiCourses = await fetchCoursesFromAPI();
    
    // Transforma para o formato esperado
    let courses = apiCourses.map(transformApiCourseToCourse);
    
    // Aplica filtro de busca se houver query
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      courses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm) ||
        course.instructor.toLowerCase().includes(searchTerm) ||
        course.technology.toLowerCase().includes(searchTerm) ||
        course.level.toLowerCase().includes(searchTerm) ||
        course.category.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm)
      );
    }
    
    return courses;
  } catch (error) {
    console.error('Erro ao buscar cursos da API:', error);
    // Fallback para mocks em caso de erro
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
  }
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

// Hook específico para buscar todos os cursos (sem filtros)
export function useAllCourses() {
  return useQuery({
    queryKey: ['courses', 'all'],
    queryFn: async () => {
      const apiCourses = await fetchCoursesFromAPI();
      return apiCourses.map(transformApiCourseToCourse);
    },
    enabled: true,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// Hook melhorado que aceita search params completos
export function useCourseSearchWithParams(searchParams: {
  q?: string;
  category?: string;
  level?: string;
  technology?: string;
  year?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
}) {
  // Cria uma queryKey mais estável baseada apenas nos filtros ativos
  const activeFilters = Object.entries(searchParams)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b)); // Ordena para consistência
  
  // Se não há filtros ativos, usa a mesma queryKey que useAllCourses
  const queryKey = activeFilters.length === 0 
    ? ['courses', 'all'] 
    : ['courses', 'search', activeFilters];
  
  return useQuery({
    queryKey,
    queryFn: () => searchCoursesWithParams(searchParams),
    enabled: true,
    staleTime: 10 * 60 * 1000, // 10 minutos - dados ficam "frescos" por mais tempo
    gcTime: 30 * 60 * 1000, // 30 minutos - cache mantido por mais tempo
    refetchOnWindowFocus: false, // Não refetch quando volta para a aba
    refetchOnMount: false, // Não refetch quando componente monta se já tem cache
  });
}

// Função melhorada para busca com parâmetros
const searchCoursesWithParams = async (params: {
  q?: string;
  category?: string;
  level?: string;
  technology?: string;
  year?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
}): Promise<Course[]> => {
  try {
    // Busca cursos da API real (com cache interno)
    const apiCourses = await fetchCoursesFromAPI();
    
    // Transforma para o formato esperado
    let filteredCourses = apiCourses.map(transformApiCourseToCourse);

  // Filtro por query de busca
  if (params.q?.trim()) {
    const searchTerm = params.q.toLowerCase().trim();
    filteredCourses = filteredCourses.filter(course =>
      course.title.toLowerCase().includes(searchTerm) ||
      course.instructor.toLowerCase().includes(searchTerm) ||
      course.technology.toLowerCase().includes(searchTerm) ||
      course.level.toLowerCase().includes(searchTerm) ||
      course.category.toLowerCase().includes(searchTerm)
    );
  }

  // Filtro por categoria
  if (params.category) {
    filteredCourses = filteredCourses.filter(course => 
      course.category === params.category
    );
  }

  // Filtro por nível
  if (params.level) {
    filteredCourses = filteredCourses.filter(course => 
      course.level === params.level
    );
  }

  // Filtro por tecnologia
  if (params.technology) {
    filteredCourses = filteredCourses.filter(course => 
      course.technology === params.technology
    );
  }

  // Filtro por ano
  if (params.year) {
    filteredCourses = filteredCourses.filter(course => 
      course.year === params.year
    );
  }

  // Ordenação
  const sort = params.sort || 'title';
  const order = params.order || 'asc';
  
  filteredCourses.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sort) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'year':
        aValue = parseInt(a.year);
        bValue = parseInt(b.year);
        break;
      case 'level':
        const levelOrder = { 'Iniciante': 1, 'Intermediário': 2, 'Avançado': 3 };
        aValue = levelOrder[a.level as keyof typeof levelOrder] || 0;
        bValue = levelOrder[b.level as keyof typeof levelOrder] || 0;
        break;
      case 'createdAt':
        aValue = new Date(a.title).getTime(); // Usando título como proxy para data
        bValue = new Date(b.title).getTime();
        break;
      default:
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
    }

    if (order === 'desc') {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    } else {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    }
  });

  // Paginação
  const page = params.page || 1;
  const limit = params.limit || 12;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return filteredCourses.slice(startIndex, endIndex);
  
  } catch (error) {
    console.error('Erro ao buscar cursos da API:', error);
    // Fallback para mocks em caso de erro
    let filteredCourses = [...mockCourses];

    // Aplica os mesmos filtros nos mocks
    if (params.q?.trim()) {
      const searchTerm = params.q.toLowerCase().trim();
      filteredCourses = filteredCourses.filter(course =>
        course.title.toLowerCase().includes(searchTerm) ||
        course.instructor.toLowerCase().includes(searchTerm) ||
        course.technology.toLowerCase().includes(searchTerm) ||
        course.level.toLowerCase().includes(searchTerm) ||
        course.category.toLowerCase().includes(searchTerm)
      );
    }

    if (params.category) {
      filteredCourses = filteredCourses.filter(course => 
        course.category === params.category
      );
    }

    if (params.level) {
      filteredCourses = filteredCourses.filter(course => 
        course.level === params.level
      );
    }

    if (params.technology) {
      filteredCourses = filteredCourses.filter(course => 
        course.technology === params.technology
      );
    }

    if (params.year) {
      filteredCourses = filteredCourses.filter(course => 
        course.year === params.year
      );
    }

    // Ordenação
    const sort = params.sort || 'title';
    const order = params.order || 'asc';
    
    filteredCourses.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sort) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'year':
          aValue = parseInt(a.year);
          bValue = parseInt(b.year);
          break;
        case 'level':
          const levelOrder = { 'Iniciante': 1, 'Intermediário': 2, 'Avançado': 3 };
          aValue = levelOrder[a.level as keyof typeof levelOrder] || 0;
          bValue = levelOrder[b.level as keyof typeof levelOrder] || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.title).getTime();
          bValue = new Date(b.title).getTime();
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (order === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    // Paginação
    const page = params.page || 1;
    const limit = params.limit || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return filteredCourses.slice(startIndex, endIndex);
  }
};