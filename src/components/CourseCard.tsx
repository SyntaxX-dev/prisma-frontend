import { Card, CardContent, CardHeader } from "./ui/card";
import { Clock, BarChart, User } from "lucide-react";
import { useNavigationWithLoading } from "@/hooks/useNavigationWithLoading";

interface CourseCardProps {
  title: string;
  instructor: string;
  duration: string;
  level: "Iniciante" | "Intermediário" | "Avançado";
  year: string;
  technology: string;
  icon: string;
  isSubscriber: boolean;
  isFree?: boolean;
  thumbnailUrl: string;
  iconColor: string;
  courseId?: string;
  isInCategoryPage?: boolean;
  category?: string;
}

export function CourseCard({
  title,
  instructor,
  duration,
  level,
  icon,
  isSubscriber,
  isFree = false,
  iconColor,
  courseId: propCourseId,
  isInCategoryPage = false,
  category: propCategory
}: CourseCardProps) {
  const { navigateWithLoading } = useNavigationWithLoading();
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
    : `/courses/${category}`;

  const handleClick = () => {
    const message = isInCategoryPage 
      ? `Carregando ${title}...`
      : `Carregando cursos de ${category}...`;
    
    navigateWithLoading(href, message);
  };

  return (
    <button onClick={handleClick} className="block w-full">
      <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer">
        <CardHeader className="p-0">
          <div className="relative aspect-video overflow-hidden rounded-t-lg">
            <div
              className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: iconColor }}
              >
                {icon}
              </div>
            </div>

            <div className="absolute top-3 right-3">
              {isSubscriber && (
                <div className="bg-purple-500/20 backdrop-blur-md border border-purple-400/30 rounded-full px-3 py-1 text-center flex w-24 justify-center">
                  <span className="text-purple-300 text-xs font-medium">ASSINANTE</span>
                </div>
              )}
              {isFree && (
                <div className="bg-green-500/20 backdrop-blur-md border border-green-400/30 rounded-full px-3 py-1 text-center flex w-24 justify-center">
                  <span className="text-green-300 text-xs font-medium">GRÁTIS</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <h3 className="text-white text-left font-medium text-sm mb-2 line-clamp-2 leading-tight group-hover:text-green-400 transition-colors">
            {title}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <User className="w-3 h-3 text-white/60" />
            <span className="text-white/70 text-xs">{instructor}</span>
          </div>

          <div className="flex items-center justify-between text-white/60 text-xs">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart className="w-3 h-3" />
              <span>{level}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}