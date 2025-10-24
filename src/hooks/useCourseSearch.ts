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
  description: string;
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
    console.log('🔄 Usando cache de cursos:', allCoursesCache.length, 'cursos');
    return allCoursesCache;
  }
  
  try {
    console.log('🌐 Fazendo requisição para API de cursos...');
    
    // Obter token de autenticação
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    console.log('🔑 Token encontrado:', token ? 'Sim' : 'Não');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch('https://prisma-backend-production-4c22.up.railway.app/courses', {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ApiCoursesResponse = await response.json();
    
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }
    
    console.log('✅ Cursos recebidos da API:', data.data.length, 'cursos');
    
    // Atualiza o cache
    allCoursesCache = data.data;
    cacheTimestamp = now;
    
    return data.data;
  } catch (error) {
    console.error('❌ Erro ao buscar cursos da API:', error);
    throw error;
  }
};

// Função para transformar ApiCourse em Course
export const transformApiCourseToCourse = (apiCourse: ApiCourse): Course => {
  // Mapear tecnologias para ícones e cores
  const getTechnologyInfo = (name: string) => {
    const tech = name.toLowerCase();
    if (tech.includes('react')) {
      return { icon: '⚛️', color: '#61dafb', category: 'react' };
    } else if (tech.includes('node')) {
      return { icon: '⚡', color: '#10b981', category: 'nodejs' };
    } else if (tech.includes('javascript')) {
      return { icon: '🟨', color: '#f7df1e', category: 'javascript' };
    } else if (tech.includes('typescript')) {
      return { icon: '🔷', color: '#3178c6', category: 'typescript' };
    } else if (tech.includes('python')) {
      return { icon: '🐍', color: '#3776ab', category: 'python' };
    } else if (tech.includes('java')) {
      return { icon: '☕', color: '#f89820', category: 'java' };
    } else if (tech.includes('c#')) {
      return { icon: '🔷', color: '#239120', category: 'csharp' };
    } else if (tech.includes('matemática') || tech.includes('matematica')) {
      return { icon: '📐', color: '#8b5cf6', category: 'matematica' };
    } else if (tech.includes('português') || tech.includes('portugues')) {
      return { icon: '📚', color: '#f59e0b', category: 'portugues' };
    } else if (tech.includes('biologia')) {
      return { icon: '🧬', color: '#10b981', category: 'biologia' };
    } else if (tech.includes('teologia')) {
      return { icon: '⛪', color: '#6366f1', category: 'teologia' };
    } else {
      return { icon: '💻', color: '#6b7280', category: 'outros' };
    }
  };

  const techInfo = getTechnologyInfo(apiCourse.name);
  
  // Determinar nível baseado no nome
  const getLevel = (name: string): 'Iniciante' | 'Intermediário' | 'Avançado' => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('iniciante') || lowerName.includes('básico') || lowerName.includes('basico')) {
      return 'Iniciante';
    } else if (lowerName.includes('avançado') || lowerName.includes('avancado') || lowerName.includes('expert')) {
      return 'Avançado';
    } else {
      return 'Intermediário';
    }
  };

  // Extrair ano da data de criação
  const getYear = (createdAt: string): string => {
    return new Date(createdAt).getFullYear().toString();
  };

  return {
    title: apiCourse.name,
    description: apiCourse.description, // Usa a descrição real da API
    instructor: 'Instrutor', // Placeholder - pode ser melhorado com dados reais
    duration: 'N/A', // Placeholder - pode ser melhorado com dados reais
    level: getLevel(apiCourse.name),
    year: getYear(apiCourse.createdAt),
    technology: apiCourse.name,
    icon: techInfo.icon,
    iconColor: techInfo.color,
    isSubscriber: apiCourse.isPaid,
    isFree: !apiCourse.isPaid,
    thumbnailUrl: apiCourse.imageUrl,
    courseId: apiCourse.id,
    category: techInfo.category
  };
};

// Função para buscar cursos da API real
const searchCourses = async (query: string): Promise<Course[]> => {
  try {
    // Busca cursos da API real
    const apiCourses = await fetchCoursesFromAPI();
    
    // Transforma para o formato esperado pelos componentes
    const courses = apiCourses.map(transformApiCourseToCourse);
    
    // Se não há query, retorna todos os cursos
    if (!query.trim()) {
      return courses;
    }
    
    // Filtra cursos baseado na query
    const searchTerm = query.toLowerCase().trim();
    return courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm) ||
      course.instructor.toLowerCase().includes(searchTerm) ||
      course.technology.toLowerCase().includes(searchTerm) ||
      course.level.toLowerCase().includes(searchTerm) ||
      course.category.toLowerCase().includes(searchTerm) ||
      course.description.toLowerCase().includes(searchTerm)
    );
  } catch (error) {
    console.error('Erro ao buscar cursos da API:', error);
    // Retorna array vazio em caso de erro
    return [];
  }
};

export function useCourseSearch(query: string) {
  return useQuery({
    queryKey: ['courses', 'search', query],
    queryFn: () => searchCourses(query),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// Função para buscar cursos com parâmetros de busca
const searchCoursesWithParams = async (params: {
  q?: string;
  category?: string;
  level?: string;
  technology?: string;
  year?: string;
  sort?: 'title' | 'level' | 'year' | 'createdAt';
  page?: number;
  limit?: number;
}): Promise<Course[]> => {
  try {
    console.log('🔍 Buscando cursos com parâmetros:', params);
    
    // Busca cursos da API real
    const apiCourses = await fetchCoursesFromAPI();
    
    // Transforma para o formato esperado pelos componentes
    let filteredCourses = apiCourses.map(transformApiCourseToCourse);
    
    console.log('📚 Cursos transformados:', filteredCourses.length, 'cursos');

    // Aplica filtros
    if (params.q?.trim()) {
      const searchTerm = params.q.toLowerCase().trim();
      filteredCourses = filteredCourses.filter(course =>
        course.title.toLowerCase().includes(searchTerm) ||
        course.instructor.toLowerCase().includes(searchTerm) ||
        course.technology.toLowerCase().includes(searchTerm) ||
        course.level.toLowerCase().includes(searchTerm) ||
        course.category.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm)
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

    // Aplicar ordenação
    if (params.sort) {
      filteredCourses.sort((a, b) => {
        switch (params.sort) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'level':
            const levelOrder = { 'Iniciante': 1, 'Intermediário': 2, 'Avançado': 3 };
            return levelOrder[a.level] - levelOrder[b.level];
          case 'year':
            return b.year.localeCompare(a.year);
          case 'createdAt':
            return b.courseId.localeCompare(a.courseId);
          default:
            return 0;
        }
      });
    }

    // Aplicar paginação
    const page = params.page || 1;
    const limit = params.limit || 50; // Aumentado para 50 para mostrar mais cursos
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const result = filteredCourses.slice(startIndex, endIndex);
    console.log('📋 Cursos finais retornados:', result.length, 'cursos');
    
    return result;
    
  } catch (error) {
    console.error('Erro ao buscar cursos da API:', error);
    // Retorna array vazio em caso de erro
    return [];
  }
};

export function useCourseSearchWithParams(searchParams: {
  q?: string;
  category?: string;
  level?: string;
  technology?: string;
  year?: string;
  sort?: 'title' | 'level' | 'year' | 'createdAt';
  page?: number;
  limit?: number;
}) {
  // Criar uma chave de query baseada nos filtros ativos
  const activeFilters = Object.entries(searchParams)
    .filter(([_, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}:${value}`)
    .sort(([a], [b]) => a.localeCompare(b)); // Ordena para consistência
  
  // Se não há filtros ativos, usa a mesma queryKey que useAllCourses
  const queryKey = activeFilters.length === 0 
    ? ['courses', 'all'] 
    : ['courses', 'search', activeFilters];
  
  return useQuery({
    queryKey,
    queryFn: () => searchCoursesWithParams(searchParams),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// Hook para buscar todos os cursos (otimizado para cache)
export function useAllCourses() {
  return useQuery({
    queryKey: ['courses', 'all'],
    queryFn: async (): Promise<Course[]> => {
      const apiCourses = await fetchCoursesFromAPI();
      return apiCourses.map(transformApiCourseToCourse);
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
