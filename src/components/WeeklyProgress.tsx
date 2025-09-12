import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

export function WeeklyProgress() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const weeks = [
    { id: "S1", progress: 0, isActive: false },
    { id: "S2", progress: 60, isActive: true }, // Semana ativa como na imagem
    { id: "S3", progress: 0, isActive: false },
    { id: "S4", progress: 0, isActive: false },
    { id: "S5", progress: 0, isActive: false },
  ];

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">
          {months[currentMonth.getMonth()]} • {currentMonth.getFullYear()}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {weeks.map((week, index) => (
          <div key={week.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${
                week.isActive ? 'text-white' : 'text-white/60'
              }`}>
                {week.id}
              </span>
              {week.isActive && (
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              )}
            </div>
            <div className="relative">
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    week.isActive ? 'bg-gradient-to-r from-orange-500 to-orange-400' : 'bg-white/30'
                  }`}
                  style={{ width: `${week.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
