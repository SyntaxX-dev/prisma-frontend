import { Edit3 } from "lucide-react";
import { Button } from "../../ui/button";

interface CurrentGoalProps {
  current: number;
  target: number;
}

export function CurrentGoal({ current, target }: CurrentGoalProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">Meta Atual</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 p-0"
        >
          <Edit3 className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#10B981"
              strokeWidth="8"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {current} / {target}
              </div>
              <div className="text-white/60 text-sm">Meta atual</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
