import { useNavigationWithLoading } from "@/hooks/shared";
import { Calendar, Clock, BarChart } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { useMemo } from "react";

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
  index?: number;
}

const variants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
};

const VIBRANT_COLORS = [
  "#bd18b4", // Brand Pink
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#22c55e", // Green
  "#a855f7", // Purple
  "#0ea5e9", // Sky
];

export function CourseCard({
  title,
  description,
  technology,
  icon,
  isFree = false,
  iconColor: originalIconColor,
  courseId: propCourseId,
  isInCategoryPage = false,
  category: propCategory,
  duration = 'N/A',
  year,
  level = 'Intermediário',
  isSponsored = false,
}: CourseCardProps) {
  const { navigateWithLoading } = useNavigationWithLoading();

  const cardColor = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % VIBRANT_COLORS.length;
    return VIBRANT_COLORS[index];
  }, [title]);

  const displayCourseId = propCourseId || title.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

  const getCategoryFromCourseId = (courseId: string) => {
    const categoryMap: Record<string, string> = {
      'nodejs': 'nodejs',
      'react-completo': 'react',
      'python-django': 'python',
      'android-kotlin': 'mobile',
      'soft-skills': 'soft-skills',
      'tech-lead': 'leadership',
      'logica-programacao': 'fundamentals',
    };
    return categoryMap[courseId] || 'fundamentals';
  };

  const category = propCategory || getCategoryFromCourseId(displayCourseId);
  const href = isInCategoryPage
    ? `/courses/${category}/${displayCourseId}`
    : `/course/${propCourseId}/sub-courses`;

  const handleClick = () => {
    navigateWithLoading(href, `Carregando ${title}...`);
  };

  const displayYear = year || new Date().getFullYear().toString();

  const patterns = ['bg-dots-pattern', 'bg-grid-pattern', 'bg-waves-pattern'];
  const patternClass = patterns[title.length % patterns.length];

  return (
    <motion.div
      variants={variants}
      className="h-full"
    >
      <button
        onClick={handleClick}
        className="group relative block h-[420px] w-full text-left outline-none cursor-pointer"
      >
        {/* Container Principal - Cinza unificado e vibrante */}
        <div className="relative block h-full overflow-hidden rounded-2xl border border-white/10 bg-[#1c1c1f] backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-2">

          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-all duration-700 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${cardColor}44 0%, transparent 70%)`
            }}
          />

          <div
            className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none blur-sm"
            style={{
              background: `linear-gradient(135deg, ${cardColor}, transparent, ${cardColor})`,
              padding: '1px'
            }}
          />

          <div className={`relative h-44 w-full overflow-hidden ${patternClass}`}>
            {/* Overlay sutil para manter a profundidade sem escurecer demais o topo */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />

            <div className="absolute top-4 right-4 z-10">
              {isSponsored ? (
                <span className="bg-amber-400/20 border border-amber-400/30 text-amber-400 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest shadow-lg backdrop-blur-md">
                  Destaque
                </span>
              ) : (
                <span className="bg-white/10 border border-white/20 text-white/80 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest backdrop-blur-md">
                  {technology}
                </span>
              )}
            </div>

            {/* Ícone Area - Melhoria de VISIBILIDADE */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div
                className="relative flex items-center justify-center w-24 h-24 rounded-3xl transition-all duration-500 bg-white/5 backdrop-blur-md shadow-2xl group-hover:scale-110 z-10"
                style={{
                  border: `1.5px solid ${cardColor}66`,
                }}
              >
                {/* Glow ATRAZ do ícone (não sobre ele) */}
                <div
                  className="absolute inset-0 rounded-3xl blur-xl opacity-20 transition-opacity duration-500 group-hover:opacity-40 -z-10"
                  style={{ backgroundColor: cardColor }}
                />

                {/* Ícone em si - Ultra VIVO com filtros de saturação e brilho */}
                <span
                  className="text-6xl z-20 transition-all duration-300 saturate-[2] brightness-125 contrast-125 group-hover:scale-110"
                  style={{
                    filter: `drop-shadow(0 0 20px ${cardColor}88) drop-shadow(0 10px 15px rgba(0,0,0,0.6))`
                  }}
                >
                  {icon}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 flex flex-col h-[calc(420px-176px)] relative z-10">
            <h3 className="font-bold text-xl mb-3 text-white group-hover:text-white transition-colors duration-200 line-clamp-2 leading-tight">
              {title}
            </h3>

            {description && (
              <p className="text-sm text-white/60 line-clamp-3 mb-4 flex-grow font-medium leading-relaxed group-hover:text-white/80 transition-colors">
                {description}
              </p>
            )}

            <div className="mt-auto space-y-4">
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-lg text-xs text-white/70 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                  <BarChart className="w-3.5 h-3.5" style={{ color: cardColor }} />
                  <span>{level}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-lg text-xs text-white/70 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                  <Clock className="w-3.5 h-3.5" style={{ color: cardColor }} />
                  <span>{duration}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/40 text-xs font-semibold">
                  <Calendar className="w-4 h-4" />
                  <span>{displayYear}</span>
                </div>
                {isFree ? (
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 uppercase tracking-tighter">
                    Gratuito
                  </span>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cardColor, boxShadow: `0 0 10px ${cardColor}` }} />
                )}
              </div>
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
}