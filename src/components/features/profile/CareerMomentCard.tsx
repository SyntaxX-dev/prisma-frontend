"use client";

import { UserProfile } from '@/types/auth-api';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Briefcase, TrendingUp, Target, Users, Lightbulb, Rocket, Edit3 } from 'lucide-react';
import { Button } from '../../ui/button';

// Função para obter ícone baseado no momento de carreira
const getCareerIcon = (momentCareer: string) => {
  const momentLower = momentCareer.toLowerCase();
  
  if (momentLower.includes('iniciante') || momentLower.includes('começando') || momentLower.includes('estudante')) {
    return <Target className="w-5 h-5 text-[#B3E240]" />;
  }
  if (momentLower.includes('júnior') || momentLower.includes('junior') || momentLower.includes('desenvolvedor')) {
    return <TrendingUp className="w-5 h-5 text-[#B3E240]" />;
  }
  if (momentLower.includes('pleno') || momentLower.includes('sênior') || momentLower.includes('senior') || momentLower.includes('especialista')) {
    return <Briefcase className="w-5 h-5 text-[#B3E240]" />;
  }
  if (momentLower.includes('líder') || momentLower.includes('lider') || momentLower.includes('coordenador') || momentLower.includes('gerente')) {
    return <Users className="w-5 h-5 text-[#B3E240]" />;
  }
  if (momentLower.includes('empreendedor') || momentLower.includes('fundador') || momentLower.includes('ceo') || momentLower.includes('diretor')) {
    return <Rocket className="w-5 h-5 text-[#B3E240]" />;
  }
  if (momentLower.includes('freelancer') || momentLower.includes('consultor') || momentLower.includes('mentor')) {
    return <Lightbulb className="w-5 h-5 text-[#B3E240]" />;
  }
  
  return <Briefcase className="w-5 h-5 text-[#B3E240]" />; // Ícone padrão
};

// Função para obter cor baseada no momento de carreira
const getCareerColor = (momentCareer: string) => {
  const momentLower = momentCareer.toLowerCase();
  
  if (momentLower.includes('iniciante') || momentLower.includes('começando') || momentLower.includes('estudante')) {
    return 'bg-green-500/20 backdrop-blur-md border border-green-400/30 rounded-full px-3 py-1 text-center';
  }
  if (momentLower.includes('júnior') || momentLower.includes('junior') || momentLower.includes('desenvolvedor')) {
    return 'bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-full px-3 py-1 text-center';
  }
  if (momentLower.includes('pleno') || momentLower.includes('sênior') || momentLower.includes('senior') || momentLower.includes('especialista')) {
    return 'bg-purple-500/20 backdrop-blur-md border border-purple-400/30 rounded-full px-3 py-1 text-center';
  }
  if (momentLower.includes('líder') || momentLower.includes('lider') || momentLower.includes('coordenador') || momentLower.includes('gerente')) {
    return 'bg-orange-500/20 backdrop-blur-md border border-orange-400/30 rounded-full px-3 py-1 text-center';
  }
  if (momentLower.includes('empreendedor') || momentLower.includes('fundador') || momentLower.includes('ceo') || momentLower.includes('diretor')) {
    return 'bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-full px-3 py-1 text-center';
  }
  if (momentLower.includes('freelancer') || momentLower.includes('consultor') || momentLower.includes('mentor')) {
    return 'bg-yellow-500/20 backdrop-blur-md border border-yellow-400/30 rounded-full px-3 py-1 text-center';
  }
  
  return 'bg-gray-500/20 backdrop-blur-md border border-gray-400/30 rounded-full px-3 py-1 text-center'; // Cor padrão
};

// Função para obter cor do texto baseada no momento de carreira
const getCareerTextColor = (momentCareer: string) => {
  const momentLower = momentCareer.toLowerCase();
  
  if (momentLower.includes('iniciante') || momentLower.includes('começando') || momentLower.includes('estudante')) {
    return 'text-green-300';
  }
  if (momentLower.includes('júnior') || momentLower.includes('junior') || momentLower.includes('desenvolvedor')) {
    return 'text-blue-300';
  }
  if (momentLower.includes('pleno') || momentLower.includes('sênior') || momentLower.includes('senior') || momentLower.includes('especialista')) {
    return 'text-purple-300';
  }
  if (momentLower.includes('líder') || momentLower.includes('lider') || momentLower.includes('coordenador') || momentLower.includes('gerente')) {
    return 'text-orange-300';
  }
  if (momentLower.includes('empreendedor') || momentLower.includes('fundador') || momentLower.includes('ceo') || momentLower.includes('diretor')) {
    return 'text-red-300';
  }
  if (momentLower.includes('freelancer') || momentLower.includes('consultor') || momentLower.includes('mentor')) {
    return 'text-yellow-300';
  }
  
  return 'text-gray-300'; // Cor padrão
};

interface CareerMomentCardProps {
  userProfile: UserProfile | null;
  isPublicView: boolean;
  onEditClick: () => void;
}

export function CareerMomentCard({ userProfile, isPublicView, onEditClick }: CareerMomentCardProps) {
  const momentCareer = userProfile?.momentCareer;

  if (!momentCareer) {
    return null; // Não mostra o card se não houver momento de carreira
  }

  return (
    <Card className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#B3E240]/5 before:to-transparent before:pointer-events-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white font-semibold flex items-center gap-2">
            {getCareerIcon(momentCareer)}
            Momento de Carreira
          </CardTitle>
          {!isPublicView && (
            <Button
              className="bg-transparent hover:bg-white/5 text-gray-400 p-1 cursor-pointer"
              size="sm"
              onClick={onEditClick}
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex justify-center">
          <div className={`${getCareerColor(momentCareer)} text-xs font-medium`}>
            <span className={`${getCareerTextColor(momentCareer)}`}>
              {momentCareer}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
