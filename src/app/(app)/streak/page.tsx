"use client";

import { useState, Suspense } from "react";
import { Navbar } from "../../../components/Navbar";
import { StreakCalendar } from "../../../components/StreakCalendar";
import { WeeklyProgress } from "../../../components/WeeklyProgress";
import { CurrentGoal } from "../../../components/CurrentGoal";
import { OffensiveInfo } from "../../../components/OffensiveInfo";
import { useStreak } from "../../../hooks/useStreak";
import { useOffensives } from "../../../hooks/useOffensives";
import { Button } from "../../../components/ui/button";
import { Flame, Target, Calendar, Clock } from "lucide-react";

function CurrentGoalWithOffensives() {
  const { data: offensivesData, isLoading } = useOffensives();
  
  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded mb-4"></div>
          <div className="h-8 bg-white/10 rounded mb-2"></div>
          <div className="h-4 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  const currentStreak = offensivesData?.stats.currentStreak || 0;
  const currentType = offensivesData?.currentOffensive.type || 'NORMAL';
  
  // Definir próximo objetivo baseado no tipo atual
  let nextTarget = 7; // SUPER
  if (currentType === 'SUPER') nextTarget = 30; // ULTRA
  if (currentType === 'ULTRA') nextTarget = 180; // KING
  if (currentType === 'KING') nextTarget = 365; // INFINITY
  if (currentType === 'INFINITY') nextTarget = 365; // Manter INFINITY

  return (
    <CurrentGoal current={currentStreak} target={nextTarget} />
  );
}

function StreakContent() {
  const { streakData, isStreakActive, addStudyDay, breakStreak } = useStreak();
  const { data: offensivesData, isLoading: offensivesLoading } = useOffensives();
  const [isDark] = useState(true);

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div
        className={`fixed inset-0 transition-all duration-300 ${isDark
          ? 'bg-gray-950'
          : 'bg-gray-500'
          }`}
        style={{
          backgroundImage: isDark
            ? `
        radial-gradient(circle at 25% 25%, rgba(179, 226, 64, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(179, 226, 64, 0.04) 0%, transparent 50%)
      `
            : `
        radial-gradient(circle at 25% 25%, rgba(179, 226, 64, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(179, 226, 64, 0.05) 0%, transparent 50%)
      `
        }}
      />

      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 10%, rgba(201, 254, 2, 0.06), transparent 20%),
            radial-gradient(circle at 85% 90%, rgba(201, 254, 2, 0.04), transparent 20%)
          `
        }}
      />

      <div
        className={`fixed inset-0 backdrop-blur-sm transition-all duration-300 ${isDark ? 'bg-black/30' : 'bg-black/10'
          }`}
      />

      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0'
        }}
      />

      <div className="relative z-10">
        <Navbar isDark={isDark} />
        
        <div className="pt-20 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
                <Flame className="w-10 h-10 text-orange-500" />
                Sistema de Ofensiva
              </h1>
              <p className="text-white/70 text-lg">
                Acompanhe seu progresso diário e mantenha sua ofensiva de estudos!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div>
                <StreakCalendar />
              </div>

              <div>
                <WeeklyProgress />
              </div>

              <div>
                <CurrentGoalWithOffensives />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <OffensiveInfo />
              </div>
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    Status da Ofensiva
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Ofensiva Ativa:</span>
                      <span className={`font-semibold ${isStreakActive ? 'text-orange-500' : 'text-gray-500'}`}>
                        {isStreakActive ? 'Sim' : 'Não'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Dias Consecutivos:</span>
                      <span className="text-white font-semibold">
                        {offensivesLoading ? '...' : (offensivesData?.stats.currentStreak || 0)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Melhor Ofensiva:</span>
                      <span className="text-white font-semibold">
                        {offensivesLoading ? '...' : (offensivesData?.stats.longestStreak || 0)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Tipo Atual:</span>
                      <span className="text-white font-semibold">
                        {offensivesLoading ? '...' : (offensivesData?.currentOffensive.type || 'NORMAL')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <h3 className="text-white font-semibold text-lg mb-4">Controles de Teste</h3>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={addStudyDay}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                    >
                      Adicionar Dia de Estudo
                    </Button>
                    
                    <Button
                      onClick={breakStreak}
                      variant="outline"
                      className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      Quebrar Ofensiva
                    </Button>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-500" />
                    Meta Atual
                  </h3>
                  
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
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
                          strokeDasharray={`${offensivesLoading ? 0 : ((offensivesData?.stats.currentStreak || 0) / 7) * 251.2} 251.2`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {offensivesLoading ? '...' : `${offensivesData?.stats.currentStreak || 0} / 7`}
                          </div>
                          <div className="text-white/60 text-sm">Para SUPER</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Tempo para receber o boost de hoje
                  </h3>
                  
                  <div className="text-center">
                    <div className="text-4xl font-mono font-bold text-orange-500 mb-2">
                      20:39:42
                    </div>
                    <div className="text-white/60 text-sm">
                      Próximo boost disponível
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StreakPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    }>
      <StreakContent />
    </Suspense>
  );
}
