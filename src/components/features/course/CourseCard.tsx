import { Card, CardContent, CardHeader } from "../../ui/card";
import { useNavigationWithLoading } from "@/hooks/shared";
import { Calendar } from "lucide-react";
import { useId } from "react";

interface CourseCardProps {
  title: string;
  description?: string;
  technology: string;
  icon: string;
  isSubscriber: boolean;
  isFree?: boolean;
  thumbnailUrl: string;
  iconColor: string;
  courseId?: string;
  isInCategoryPage?: boolean;
  category?: string;
  instructor?: string;
  duration?: string;
  year?: string;
  level?: 'Iniciante' | 'Intermediário' | 'Avançado';
  courseType?: 'CURSO' | 'FORMAÇÃO';
}

export function CourseCard({
  title,
  description,
  technology,
  icon,
  isSubscriber,
  isFree = false,
  thumbnailUrl,
  iconColor,
  courseId: propCourseId,
  isInCategoryPage = false,
  category: propCategory,
  instructor = 'Diego Fernandes',
  duration = 'N/A',
  year,
  level,
  courseType = 'CURSO'
}: CourseCardProps) {
  const { navigateWithLoading } = useNavigationWithLoading();
  const patternId = useId();
  const displayCourseId = propCourseId || title.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

  const getCategoryFromCourseId = (courseId: string) => {
    const categoryMap: Record<string, string> = {
      'nodejs': 'nodejs',
      'nodejs-avancado': 'nodejs',
      'nodejs-iniciantes': 'nodejs',
      'nodejs-apis': 'nodejs',
      
      'react-completo': 'react',
      'react-hooks': 'react',
      'react-native-expo': 'react',
      
      'python-django': 'python',
      'python-data-science': 'python',
      
      'android-kotlin': 'mobile',
      'ios-swift': 'mobile',
      
      'soft-skills': 'soft-skills',
      'ingles-para-devs': 'soft-skills',
      
      'tech-lead': 'leadership',
      
      'logica-programacao': 'fundamentals',
      'dev-global-starter': 'fundamentals',
      'discover': 'fundamentals',
      
      'angular-intro': 'angular',
      
      'go-intro': 'go',
      
      'csharp-dotnet-intro': 'csharp'
    };
    
    return categoryMap[courseId] || 'fundamentals';
  };

  const category = propCategory || getCategoryFromCourseId(displayCourseId);
  
  const href = isInCategoryPage 
    ? `/courses/${category}/${displayCourseId}`
    : `/course/${propCourseId}/sub-courses`;

  const handleClick = () => {
    const message = isInCategoryPage 
      ? `Carregando ${title}...`
      : `Carregando ${title}...`;
    
    navigateWithLoading(href, message);
  };

  // Obter ano atual se não fornecido
  const displayYear = year || new Date().getFullYear().toString();

  return (
    <button onClick={handleClick} className="block text-left w-[280px] h-[320px]">
      <Card className="bg-[#202024] border border-[#323238] hover:border-[#bd18b4]/30 transition-all duration-300 cursor-pointer h-full flex flex-col group rounded-xl overflow-hidden w-full">
        <CardHeader className="p-0 flex-shrink-0 relative">
          {/* Background com gradiente */}
          <div className="relative w-full h-40 bg-gradient-to-br from-[#29292E] via-[#1e1f23] to-[#1a1b1e] overflow-hidden rounded-t-xl">
            {/* Padrão de pontinhos com gradiente que desaparece da esquerda para direita e de cima para baixo */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ opacity: 1 }}
            >
              <defs>
                <pattern
                  id={`dot-pattern-${patternId}`}
                  x="0"
                  y="0"
                  width="16"
                  height="16"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="8" cy="8" r="1" fill="rgba(255,255,255,0.25)" />
                </pattern>
                <linearGradient id={`dot-gradient-${patternId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop offset="40%" stopColor="white" stopOpacity="0.6" />
                  <stop offset="70%" stopColor="white" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
                <mask id={`dot-mask-${patternId}`}>
                  <rect width="100%" height="100%" fill={`url(#dot-gradient-${patternId})`} />
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill={`url(#dot-pattern-${patternId})`}
                mask={`url(#dot-mask-${patternId})`}
              />
            </svg>
            
            {/* Ícone no canto superior esquerdo com sombra */}
            <div className="absolute top-3 left-3 z-10">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl relative"
                style={{ 
                  backgroundColor: iconColor || '#29292E',
                  backgroundImage: `linear-gradient(135deg, ${iconColor || '#29292E'}, ${iconColor || '#1a1b1e'})`,
                  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 60px ${iconColor ? `${iconColor}40` : 'rgba(189, 24, 180, 0.2)'}`
                }}
              >
                {/* Sombra atrás do background do ícone */}
                <div 
                  className="absolute inset-0 rounded-xl -z-10"
                  style={{
                    backgroundColor: iconColor || '#29292E',
                    filter: 'blur(12px)',
                    opacity: 0.5,
                    transform: 'scale(1.2)'
                  }}
                ></div>
                {icon}
              </div>
            </div>
          </div>

        </CardHeader>

        <CardContent className="p-4 flex-1 flex flex-col justify-between bg-[#202024] rounded-b-xl">
          {/* Título */}
          <div className="mb-4">
            <h3 className="text-white font-bold text-base mb-3 line-clamp-2 leading-tight group-hover:text-[#c532e2] transition-colors">
              {title}
            </h3>

            {/* Descrição */}
            {description && (
              <p className="text-white/70 text-xs leading-relaxed line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Ano do curso */}
          <div className="flex items-center justify-end text-xs text-white/60 border-t border-[#323238] pt-3 mt-auto">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              <span>{displayYear}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}