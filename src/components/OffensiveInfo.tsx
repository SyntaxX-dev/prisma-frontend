import { Flame, Target, Trophy, Zap } from "lucide-react";
import { useOffensives } from "../hooks/useOffensives";
import { OffensiveType } from "../types/offensives";

const getOffensiveTypeInfo = (type: OffensiveType) => {
  switch (type) {
    case 'NORMAL':
      return {
        name: 'Ofensiva Normal',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        icon: Flame,
        description: '1-6 dias consecutivos'
      };
    case 'SUPER':
      return {
        name: 'Super Ofensiva',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        icon: Flame,
        description: '7 dias consecutivos'
      };
    case 'ULTRA':
      return {
        name: 'Ultra Ofensiva',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        icon: Zap,
        description: '30 dias consecutivos'
      };
    case 'KING':
      return {
        name: 'King Ofensiva',
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        icon: Trophy,
        description: '180 dias consecutivos'
      };
    case 'INFINITY':
      return {
        name: 'Infinity Ofensiva',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        icon: Target,
        description: '365 dias consecutivos'
      };
    default:
      return {
        name: 'Ofensiva',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        icon: Flame,
        description: 'Em progresso'
      };
  }
};

export function OffensiveInfo() {
  const { data: offensivesData, isLoading } = useOffensives();

  if (isLoading) {
    return (
      <div className="p-6 animate-in fade-in-0 slide-in-from-top-1 duration-300">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-white/10 rounded"></div>
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!offensivesData) {
    return (
      <div className="p-6 animate-in fade-in-0 slide-in-from-top-1 duration-300">
        <div className="text-center text-white/60">
          <Flame className="w-12 h-12 mx-auto mb-4 text-white/30" />
          <p>Nenhuma ofensiva encontrada</p>
        </div>
      </div>
    );
  }

  const currentTypeInfo = getOffensiveTypeInfo(offensivesData.currentOffensive.type);
  const CurrentIcon = currentTypeInfo.icon;

  return (
    <div className="p-6 animate-in fade-in-0 slide-in-from-top-1 duration-300">
      <div className="mb-6">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <CurrentIcon className={`w-5 h-5 ${currentTypeInfo.color}`} />
          Ofensiva Atual
        </h3>
        
        <div className={`p-4 rounded-lg border ${currentTypeInfo.bgColor} ${currentTypeInfo.borderColor}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`font-bold ${currentTypeInfo.color}`}>
              {currentTypeInfo.name}
            </span>
            <span className="text-white/80 text-sm">
              {offensivesData.currentOffensive.consecutiveDays} dias
            </span>
          </div>
          <p className="text-white/70 text-sm">
            {currentTypeInfo.description}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-white/60" />
          Próximos Marcos
        </h4>
        
        <div className="space-y-2">
          {offensivesData.nextMilestones.daysToSuper > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/80">Super Ofensiva</span>
              <span className="text-white/60">
                {offensivesData.nextMilestones.daysToSuper} dias
              </span>
            </div>
          )}
          
          {offensivesData.nextMilestones.daysToUltra > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/80">Ultra Ofensiva</span>
              <span className="text-white/60">
                {offensivesData.nextMilestones.daysToUltra} dias
              </span>
            </div>
          )}
          
          {offensivesData.nextMilestones.daysToKing > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/80">King Ofensiva</span>
              <span className="text-white/60">
                {offensivesData.nextMilestones.daysToKing} dias
              </span>
            </div>
          )}
          
          {offensivesData.nextMilestones.daysToInfinity > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/80">Infinity Ofensiva</span>
              <span className="text-white/60">
                {offensivesData.nextMilestones.daysToInfinity} dias
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-white/20">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-white">
              {offensivesData.stats.totalOffensives}
            </div>
            <div className="text-white/60 text-sm">Total de Ofensivas</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">
              {offensivesData.stats.longestStreak}
            </div>
            <div className="text-white/60 text-sm">Maior Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
}
