import { useState } from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { Button } from "./ui/button";
import { useOffensives } from "../hooks/useOffensives";
import { OffensiveType } from "../types/offensives";

interface StreakCalendarProps {
  streakData?: {
    currentStreak: number;
    bestStreak: number;
    lastStudyDate: string | null;
    isActive: boolean;
  };
}

export function StreakCalendar({ streakData }: StreakCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { offensivesData, hasOffensiveOnDay, getOffensiveTypeForDay, getOffensivesInMonth, getConsecutiveOffensiveDays, isLoading } = useOffensives();

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
    
    // Verificar se é um dia da ofensiva atual (incluindo dias consecutivos)
    const consecutiveDays = getConsecutiveOffensiveDays();
    const isConsecutiveDay = consecutiveDays.some(consecutiveDay => {
      const consecutiveDateStr = consecutiveDay.toISOString().split('T')[0];
      const checkDateStr = checkDate.toISOString().split('T')[0];
      return consecutiveDateStr === checkDateStr;
    });
    
    if (isConsecutiveDay) {
      return true;
    }
    
    // Verificar histórico
    return hasOffensiveOnDay(checkDate);
  };

  const getOffensiveTypeForDayLocal = (day: number): OffensiveType | null => {
    if (!day) return null;
    
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    // Verificar se é um dia da ofensiva atual (incluindo dias consecutivos)
    const consecutiveDays = getConsecutiveOffensiveDays();
    const isConsecutiveDay = consecutiveDays.some(consecutiveDay => {
      const consecutiveDateStr = consecutiveDay.toISOString().split('T')[0];
      const checkDateStr = checkDate.toISOString().split('T')[0];
      return consecutiveDateStr === checkDateStr;
    });
    
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
              <div className={`w-full h-full flex flex-col items-center justify-center relative transition-all duration-200 hover:bg-white/10 rounded-lg cursor-pointer ${
                hasStreakOnDay(day) ? 'bg-orange-500/20 border border-orange-500/30' : ''
              }`}>
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
              {getOffensivesInMonth(currentDate.getFullYear(), currentDate.getMonth()).length}
            </div>
            <div className="text-white/60 text-sm">Ofensivas no mês</div>
          </div>
        </div>
      </div>
    </div>
  );
}
