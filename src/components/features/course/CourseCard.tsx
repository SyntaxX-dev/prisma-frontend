import { Card, CardContent, CardHeader } from "../../ui/card";
import { useNavigationWithLoading } from "@/hooks/shared";
import { Calendar, Sparkles } from "lucide-react";
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
  courseType?: 'CURSO' | 'FORMAÇÃO' | 'PRODUTOR';
  isSponsored?: boolean;
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
  courseType = 'CURSO',
  isSponsored = false
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
    <button
      onClick={handleClick}
      className="block text-left w-full h-[320px] pointer-events-auto transform transition-all duration-300 hover:-translate-y-1"
    >
      <Card className={`bg-glass backdrop-blur-xl border transition-all duration-300 cursor-pointer h-full flex flex-col group rounded-2xl overflow-hidden w-full relative ${isSponsored
        ? 'border-gold/30 hover:border-gold/60 shadow-[0_0_25px_rgba(255,215,0,0.15)] hover:shadow-[0_0_40px_rgba(255,215,0,0.25)]'
        : 'border-glass-border hover:border-brand/40 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),0_0_20px_rgba(189,24,180,0.15)]'
        }`}>
        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        {/* Badge Patrocinado */}
        {isSponsored && (
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-gradient-to-r from-gold to-gold-secondary text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
            <Sparkles className="w-3 h-3" />
            <span>PATROCINADO</span>
          </div>
        )}
        <CardHeader className="p-0 flex-shrink-0 relative">
          {/* Background com gradiente mais suave */}
          <div className={`relative w-full h-40 bg-gradient-to-br from-glass to-transparent overflow-hidden rounded-t-2xl ${isSponsored ? 'ring-1 ring-gold/10' : ''
            }`}>
            {/* Padrão de pontinhos */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
              style={{ opacity: 0.15 }}
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
                  <circle cx="8" cy="8" r="0.5" fill="white" />
                </pattern>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill={`url(#dot-pattern-${patternId})`}
              />
            </svg>

            {/* Ícone no canto superior esquerdo com sombra */}
            <div className="absolute top-4 left-4 z-10">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-500 group-hover:scale-110 ${isSponsored ? 'ring-1 ring-gold/30' : ''
                  }`}
                style={{
                  backgroundColor: iconColor || 'rgba(255,255,255,0.05)',
                  backgroundImage: `linear-gradient(135deg, ${iconColor}CC, ${iconColor}88)`,
                  boxShadow: `0 8px 16px -4px rgba(0, 0, 0, 0.3), 0 0 20px ${iconColor}40`
                }}
              >
                {icon}
              </div>
            </div>

            {/* Subtle glow behind icon */}
            <div
              className="absolute top-4 left-4 w-14 h-14 rounded-full blur-[30px] opacity-20 group-hover:opacity-40 transition-opacity duration-500"
              style={{ backgroundColor: iconColor }}
            />
          </div>

        </CardHeader>

        <CardContent className="p-5 flex-1 flex flex-col justify-between bg-transparent">
          {/* Título */}
          <div className="mb-4">
            <h3 className={`font-bold text-lg mb-2 line-clamp-2 leading-tight transition-colors ${isSponsored
              ? 'text-white group-hover:text-gold'
              : 'text-white group-hover:text-brand-accent'
              }`}>
              {title}
            </h3>

            {/* Descrição */}
            {description && (
              <p className="text-white/50 text-xs leading-relaxed line-clamp-2 font-medium">
                {description}
              </p>
            )}
          </div>

          {/* Rodapé do Card */}
          <div className="flex items-center justify-between text-[11px] text-white/40 border-t border-white/5 pt-4 mt-auto font-medium tracking-wide">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-glass border border-glass-border group-hover:bg-glass-hover transition-colors">
              <span className="uppercase">{technology}</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-60">
              <Calendar className="w-3.5 h-3.5" />
              <span>{displayYear}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}