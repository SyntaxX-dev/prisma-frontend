import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Play, Clock, BarChart } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

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
  videoUrl?: string;
  thumbnailUrl: string;
  iconColor: string;
}

export function CourseCard({
  title,
  instructor,
  duration,
  level,
  year,
  technology,
  icon,
  isSubscriber,
  isFree = false,
  videoUrl,
  thumbnailUrl,
  iconColor
}: CourseCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card 
        className={`
          bg-white/10 dark:bg-white/5 backdrop-blur-md border-white/20 dark:border-white/10
          transition-all duration-500 ease-in-out cursor-pointer
          ${isHovered ? 'scale-150 shadow-2xl z-50 transform-gpu' : 'hover:shadow-lg'}
        `}
        style={{
          transformOrigin: 'center center',
        }}
      >
        {/* Tag */}
        <div className="absolute top-3 right-3 z-20">
          {isSubscriber && (
            <Badge className="bg-purple-600 text-white text-xs px-2 py-1">
              PARA ASSINANTES
            </Badge>
          )}
          {isFree && (
            <Badge className="bg-green-600 text-white text-xs px-2 py-1">
              GRÁTIS
            </Badge>
          )}
        </div>

        {/* Thumbnail/Video Preview */}
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          {isHovered ? (
            <div className="absolute inset-0 bg-black">
              {/* Simulação de vídeo com gradiente animado */}
              <div 
                className="w-full h-full bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 animate-pulse"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'gradient 3s ease infinite'
                }}
              />
              <div className="absolute inset-0 bg-black/40" />
              
              {/* Indicador de reprodução */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
              </div>
              
              <Button
                size="sm"
                className="absolute bottom-3 right-3 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Play className="w-4 h-4 mr-1" />
                Iniciar
              </Button>

              {/* Informações adicionais quando expandido */}
              <div className="absolute bottom-12 left-3 right-3 text-white">
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="bg-white/20 px-2 py-1 rounded text-xs">SWIFT</span>
                  <span className="bg-white/20 px-2 py-1 rounded text-xs">MOBILE</span>
                  <span className="bg-white/20 px-2 py-1 rounded text-xs">UNIT</span>
                  <span className="bg-white/20 px-2 py-1 rounded text-xs">VIEWMODEL</span>
                </div>
                <p className="text-xs opacity-80">
                  Desenvolver aplicações nativas para iOS
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <ImageWithFallback
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-3 left-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: iconColor }}
                >
                  <span className="text-white text-sm font-bold">{icon}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-black dark:text-white font-semibold mb-2 line-clamp-2">{title}</h3>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {instructor?.charAt(0) || '?'}
              </span>
            </div>
            <span className="text-black/70 dark:text-white/60 text-sm">{instructor}</span>
          </div>

          <div className="flex items-center justify-between text-black/60 dark:text-white/60 text-xs">
            <div className="flex items-center gap-4">
              <span>FORMAÇÃO • {year}</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart className="w-3 h-3" />
                <span>{level}</span>
              </div>
            </div>
          </div>

          {/* Progress bar (placeholder) */}
          <div className="mt-3 w-full bg-black/20 dark:bg-white/20 rounded-full h-1">
            <div 
              className="bg-green-500 h-1 rounded-full" 
              style={{ width: `${Math.random() * 100}%` }}
            />
          </div>
        </div>
      </Card>
      
      {/* Espaço extra para o hover expandido */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none" style={{ padding: '25%' }} />
      )}
    </div>
  );
}