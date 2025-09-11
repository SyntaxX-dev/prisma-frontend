import { Flame } from "lucide-react";

interface StreakIconProps {
  count: number;
  isActive: boolean;
  className?: string;
}

export function StreakIcon({ count, isActive, className = "" }: StreakIconProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Flame 
          className={`w-5 h-5 transition-all duration-300 ease-out ${
            isActive 
              ? 'text-orange-500 drop-shadow-md' 
              : 'text-gray-500'
          }`}
          style={{
            filter: isActive ? 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.6))' : 'none'
          }}
        />
        {isActive && (
          <div className="absolute inset-0 animate-pulse">
            <Flame className="w-5 h-5 text-orange-400 opacity-40" />
          </div>
        )}
      </div>
      <span className={`text-sm font-semibold transition-colors duration-300 ease-out ${
        isActive ? 'text-orange-500' : 'text-gray-500'
      }`}>
        {count}
      </span>
    </div>
  );
}
