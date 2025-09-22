import { useState } from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { Button } from "../../ui/button";

interface StreakCalendarProps {
  streakData: {
    currentStreak: number;
    bestStreak: number;
    lastStudyDate: string | null;
    isActive: boolean;
  };
}

export function StreakCalendar({ streakData }: StreakCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

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
    const dateString = checkDate.toISOString().split('T')[0];

    const mockStreakDays = [5, 20];
    return mockStreakDays.includes(day);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="p-6 animate-in fade-in-0 slide-in-from-top-1 duration-300">
      <div className="flex items-center justify-between mb-4">
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

      <div className="grid grid-cols-7 gap-1 mb-2 animate-in fade-in-0 slide-in-from-top-1 duration-300 delay-75">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="text-center text-white/60 text-sm font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 animate-in fade-in-0 slide-in-from-top-1 duration-300 delay-150">
        {days.map((day, index) => (
          <div key={index} className="aspect-square flex items-center justify-center relative">
            {day ? (
              <div className="w-full h-full flex flex-col items-center justify-center relative transition-colors duration-200 hover:bg-white/10 rounded-lg cursor-pointer">
                <span className="text-white/80 text-sm font-medium">{day}</span>
                {hasStreakOnDay(day) && (
                  <div className="absolute -top-1 -right-1">
                    <Flame className="w-5 h-5 text-orange-500 drop-shadow-sm" />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full"></div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/20 animate-in fade-in-0 slide-in-from-top-1 duration-300 delay-300">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{streakData.currentStreak}</div>
            <div className="text-white/60 text-sm">Streak atual</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{streakData.bestStreak}</div>
            <div className="text-white/60 text-sm">Melhor streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">2</div>
            <div className="text-white/60 text-sm">Boosts no mês</div>
          </div>
        </div>
      </div>
    </div>
  );
}
