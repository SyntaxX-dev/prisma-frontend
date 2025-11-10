import { useState } from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { Button } from "../../ui/button";
import { useOffensives } from "@/hooks/features/offensives";
import { OffensiveType } from "@/types/offensives";

interface StreakCalendarProps {
  streakData?: {
    currentStreak: number;
    bestStreak: number;
    lastStudyDate: string | null;
    isActive: boolean;
  };
}

export function StreakCalendar({ streakData }: StreakCalendarProps = {}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  // Sempre tentar acessar dados do cache, mesmo quando disabled
  const { data: offensivesData, isLoading, refetch } = useOffensives(true);


  // Função para formatar data como YYYY-MM-DD usando data local (não UTC)
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Função para normalizar data da API (pode vir como ISO completo ou apenas YYYY-MM-DD)
  const normalizeApiDate = (apiDate: string): string => {
    // Se já está no formato YYYY-MM-DD, retorna direto
    if (/^\d{4}-\d{2}-\d{2}$/.test(apiDate)) {
      return apiDate;
    }
    // Se está no formato ISO, extrai apenas a parte da data
    return apiDate.split('T')[0];
  };

  // Funções auxiliares para trabalhar com os dados das ofensivas
  const hasOffensiveOnDay = (date: Date) => {
    if (!offensivesData) {
      return false;
    }

    // Formatar data local (não UTC) para evitar diferença de um dia
    const dateStr = formatDateLocal(date);

    if (offensivesData.history && offensivesData.history.length > 0) {
      const hasOffensive = offensivesData.history.some(day => {
        // Normalizar data da API para comparar corretamente
        const normalizedApiDate = normalizeApiDate(day.date);
        return normalizedApiDate === dateStr && day.hasOffensive;
      });

      return hasOffensive;
    }

    // Se não há histórico, não há ofensiva
    return false;
  };

  const getOffensiveTypeForDay = (date: Date) => {
    if (!offensivesData?.history) return 'NORMAL';
    const dateStr = formatDateLocal(date);
    const dayData = offensivesData.history.find(day => {
      const normalizedApiDate = normalizeApiDate(day.date);
      return normalizedApiDate === dateStr;
    });
    return dayData?.type || 'NORMAL';
  };

  // Função para lidar com clique na ofensiva
  const handleOffensiveClick = async (day: number) => {
    if (!day || !hasStreakOnDay(day)) return;
    
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    try {
      await refetch();
    } catch (error) {
      console.error('❌ Erro ao refazer requisição de ofensivas:', error);
    }
  };

  const getOffensivesInMonth = (date: Date) => {
    if (!offensivesData?.history) return [];
    const year = date.getFullYear();
    const month = date.getMonth();
    return offensivesData.history.filter(day => {
      // Normalizar data da API e criar objeto Date
      const normalizedDate = normalizeApiDate(day.date);
      const dayDate = new Date(normalizedDate + 'T00:00:00');
      return dayDate.getFullYear() === year && dayDate.getMonth() === month && day.hasOffensive;
    });
  };

  const getConsecutiveOffensiveDays = (date: Date) => {
    if (!offensivesData?.history) return 0;
    const dateStr = formatDateLocal(date);
    const sortedHistory = [...offensivesData.history]
      .filter(day => day.hasOffensive)
      .sort((a, b) => {
        const dateA = normalizeApiDate(a.date);
        const dateB = normalizeApiDate(b.date);
        return dateB.localeCompare(dateA);
      });
    
    let consecutiveDays = 0;
    let currentDateStr = dateStr;
    
    for (const day of sortedHistory) {
      const normalizedApiDate = normalizeApiDate(day.date);
      if (normalizedApiDate === currentDateStr) {
        consecutiveDays++;
        // Calcular data anterior
        const prevDate = new Date(currentDateStr + 'T00:00:00');
        prevDate.setDate(prevDate.getDate() - 1);
        currentDateStr = formatDateLocal(prevDate);
      } else {
        break;
      }
    }
    
    return consecutiveDays;
  };

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const daysOfWeek = ["D", "S", "T", "Q", "Q", "S", "S"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const hasStreakOnDay = (day: number) => {
    if (!day) return false;
    
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    // Verificar se é um dia da ofensiva atual
    const isConsecutiveDay = hasOffensiveOnDay(checkDate);
    
    if (isConsecutiveDay) {
      return true;
    }
    
    // Verificar histórico
    return hasOffensiveOnDay(checkDate);
  };

  const getOffensiveTypeForDayLocal = (day: number): OffensiveType | null => {
    if (!day) return null;
    
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    // Verificar se é um dia da ofensiva atual
    const isConsecutiveDay = hasOffensiveOnDay(checkDate);
    
    if (isConsecutiveDay && offensivesData?.currentOffensive) {
      return offensivesData.currentOffensive.type;
    }
    
    // Verificar histórico
    return getOffensiveTypeForDay(checkDate) as OffensiveType | null;
  };

  const getFlameColor = (type: OffensiveType | null): string => {
    switch (type) {
      case 'NORMAL':
        return 'text-yellow-500';
      case 'SUPER':
        return 'text-orange-500';
      case 'ULTRA':
        return 'text-red-500';
      case 'KING':
        return 'text-purple-500';
      case 'INFINITY':
        return 'text-blue-500';
      default:
        return 'text-yellow-500';
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const days = getDaysInMonth(currentDate);

  if (isLoading) {
    return (
      <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/20 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded mb-3"></div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-8 bg-white/10 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square bg-white/10 rounded"></div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-white/20">
            <div className="grid grid-cols-3 gap-3 text-center">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <div className="h-6 bg-white/20 rounded mb-1"></div>
                  <div className="h-4 bg-white/10 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-lg">
          {months[currentDate.getMonth()]} • {currentDate.getFullYear()}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 p-0 transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 p-0 transition-colors duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="text-center text-white/60 text-sm font-medium py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div key={index} className="aspect-square flex items-center justify-center relative">
            {day ? (
              <div 
                className={`w-full h-full flex flex-col items-center justify-center relative transition-all duration-200 hover:bg-white/10 rounded-lg cursor-pointer ${
                  hasStreakOnDay(day) ? 'bg-orange-500/20 border border-orange-500/30' : ''
                }`}
                onClick={() => handleOffensiveClick(day)}
              >
                <span className={`text-sm font-medium ${
                  hasStreakOnDay(day) ? 'text-orange-200' : 'text-white/80'
                }`}>{day}</span>
                {hasStreakOnDay(day) && (
                  <div className="absolute -top-1 -right-1">
                    <Flame className={`w-4 h-4 ${getFlameColor(getOffensiveTypeForDayLocal(day))} drop-shadow-sm`} />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full"></div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/20">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xl font-bold text-white">
              {offensivesData?.stats.currentStreak || 0}
            </div>
            <div className="text-white/60 text-sm">Streak atual</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">
              {offensivesData?.stats.longestStreak || 0}
            </div>
            <div className="text-white/60 text-sm">Melhor streak</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">
              {getOffensivesInMonth(currentDate).length}
            </div>
            <div className="text-white/60 text-sm">Ofensivas no mês</div>
          </div>
        </div>
      </div>
    </div>
  );
}
