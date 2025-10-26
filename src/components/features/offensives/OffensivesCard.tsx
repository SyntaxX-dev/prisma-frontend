"use client";

import { useOffensives } from '@/hooks/features/offensives';
import { OffensiveType } from '@/types/offensives';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { LoadingGrid } from '../../ui/loading-grid';
import { Trophy, Flame, Target, Crown, Infinity, Zap } from 'lucide-react';

// Função para obter o ícone baseado no tipo de ofensiva
const getOffensiveIcon = (type: OffensiveType) => {
  switch (type) {
    case 'NORMAL':
      return <Target className="w-4 h-4" />;
    case 'SUPER':
      return <Zap className="w-4 h-4" />;
    case 'ULTRA':
      return <Flame className="w-4 h-4" />;
    case 'KING':
      return <Crown className="w-4 h-4" />;
    case 'INFINITY':
      return <Infinity className="w-4 h-4" />;
    default:
      return <Target className="w-4 h-4" />;
  }
};

// Função para obter a cor baseada no tipo de ofensiva
const getOffensiveColor = (type: OffensiveType) => {
  switch (type) {
    case 'NORMAL':
      return 'bg-gray-500 text-white';
    case 'SUPER':
      return 'bg-blue-500 text-white';
    case 'ULTRA':
      return 'bg-purple-500 text-white';
    case 'KING':
      return 'bg-yellow-500 text-black';
    case 'INFINITY':
      return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

// Função para obter o label do tipo de ofensiva
const getOffensiveLabel = (type: OffensiveType) => {
  switch (type) {
    case 'NORMAL':
      return 'Normal';
    case 'SUPER':
      return 'Super';
    case 'ULTRA':
      return 'Ultra';
    case 'KING':
      return 'King';
    case 'INFINITY':
      return 'Infinity';
    default:
      return 'Normal';
  }
};

export function OffensivesCard() {
  const { data: offensivesData, isLoading, error } = useOffensives();

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#B3E240]/5 before:to-transparent before:pointer-events-none">
        <CardHeader>
          <CardTitle className="text-white font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#B3E240]" />
            Ofensivas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingGrid size="32" color="#B3E240" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#B3E240]/5 before:to-transparent before:pointer-events-none">
        <CardHeader>
          <CardTitle className="text-white font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#B3E240]" />
            Ofensivas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-400 text-sm">Erro ao carregar ofensivas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!offensivesData) {
    return null;
  }

  const { currentOffensive, stats } = offensivesData;

  return (
    <Card className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#B3E240]/5 before:to-transparent before:pointer-events-none">
      <CardHeader>
        <CardTitle className="text-white font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#B3E240]" />
          Ofensivas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ofensiva Atual - Destaque Principal */}
        <div className="bg-gradient-to-r from-[#29292E] to-[#323238] border border-[#404040] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Badge className={`${getOffensiveColor(currentOffensive.type)} flex items-center gap-1 px-3 py-1`}>
                {getOffensiveIcon(currentOffensive.type)}
                {getOffensiveLabel(currentOffensive.type)}
              </Badge>
              <div className="text-sm text-gray-300">
                {currentOffensive.consecutiveDays} dias consecutivos
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#B3E240]">
                {stats.totalOffensives}
              </div>
              <div className="text-xs text-gray-400">Total de ofensivas</div>
            </div>
          </div>
          
          {/* Data da última ofensiva */}
          <div className="text-xs text-gray-500">
            Última ofensiva: {new Date(currentOffensive.lastVideoCompletedAt).toLocaleDateString('pt-BR')}
          </div>
        </div>

        {/* Estatísticas Detalhadas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#29292E] border border-[#323238] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-[#B3E240] rounded-full"></div>
              <div className="text-lg font-bold text-white">
                {stats.currentStreak}
              </div>
            </div>
            <div className="text-xs text-gray-400">Sequência atual</div>
          </div>
          
          <div className="bg-[#29292E] border border-[#323238] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-[#ff6b6b] rounded-full"></div>
              <div className="text-lg font-bold text-white">
                {stats.longestStreak}
              </div>
            </div>
            <div className="text-xs text-gray-400">Maior sequência</div>
          </div>
        </div>

        {/* Progresso da Ofensiva Atual */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Progresso da ofensiva atual</span>
            <span className="text-xs text-gray-400">{currentOffensive.consecutiveDays} dias</span>
          </div>
          <div className="w-full bg-[#323238] rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#B3E240] to-[#8BC34A] h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((currentOffensive.consecutiveDays / 30) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Próximos Marcos */}
        {offensivesData.nextMilestones && (
          <div className="space-y-2">
            <div className="text-sm text-gray-300 mb-2">Próximos marcos</div>
            <div className="space-y-2">
              {offensivesData.nextMilestones.daysToSuper > 0 && (
                <div className="flex items-center justify-between bg-[#1e3a8a]/10 border border-[#3b82f6]/20 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-blue-400 font-medium">Super Ofensiva</span>
                  </div>
                  <span className="text-xs text-gray-400">{offensivesData.nextMilestones.daysToSuper} dias</span>
                </div>
              )}
              
              {offensivesData.nextMilestones.daysToSuper === 0 && offensivesData.nextMilestones.daysToUltra > 0 && (
                <div className="flex items-center justify-between bg-[#7c3aed]/10 border border-[#8b5cf6]/20 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-purple-400 font-medium">Ultra Ofensiva</span>
                  </div>
                  <span className="text-xs text-gray-400">{offensivesData.nextMilestones.daysToUltra} dias</span>
                </div>
              )}
              
              {offensivesData.nextMilestones.daysToSuper === 0 && offensivesData.nextMilestones.daysToUltra === 0 && offensivesData.nextMilestones.daysToKing > 0 && (
                <div className="flex items-center justify-between bg-[#f59e0b]/10 border border-[#fbbf24]/20 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-yellow-400 font-medium">King Ofensiva</span>
                  </div>
                  <span className="text-xs text-gray-400">{offensivesData.nextMilestones.daysToKing} dias</span>
                </div>
              )}
              
              {offensivesData.nextMilestones.daysToSuper === 0 && offensivesData.nextMilestones.daysToUltra === 0 && offensivesData.nextMilestones.daysToKing === 0 && offensivesData.nextMilestones.daysToInfinity > 0 && (
                <div className="flex items-center justify-between bg-[#ec4899]/10 border border-[#f472b6]/20 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span className="text-sm text-pink-400 font-medium">Infinity Ofensiva</span>
                  </div>
                  <span className="text-xs text-gray-400">{offensivesData.nextMilestones.daysToInfinity} dias</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data de início da sequência */}
        <div className="text-center">
          <div className="text-xs text-gray-500">
            Sequência iniciada em {new Date(currentOffensive.streakStartDate).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
