import { Card, CardContent, CardHeader } from "./ui/card";
import { useNavigationWithLoading } from "@/hooks/useNavigationWithLoading";

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
}

export function CourseCard({
  title,
  description,
  icon,
  isSubscriber,
  isFree = false,
  thumbnailUrl,
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
    : `/course/${propCourseId}/sub-courses`;

  const handleClick = () => {
    const message = isInCategoryPage 
      ? `Carregando ${title}...`
      : `Carregando ${title}...`;
    
    navigateWithLoading(href, message);
  };

  return (
    <button onClick={handleClick} className="block w-full">
      <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer">
        <CardHeader className="p-0">
          <div className="relative aspect-video overflow-hidden rounded-t-lg">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div
              className={`w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center ${thumbnailUrl ? 'hidden' : ''}`}
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

          {description && (
            <p className="text-white/70 text-xs leading-relaxed line-clamp-3 text-left">
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    </button>
  );
}