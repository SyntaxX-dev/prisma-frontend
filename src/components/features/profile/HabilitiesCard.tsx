"use client";

import { UserProfile } from '@/types/auth-api';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Edit3, Plus, Star } from 'lucide-react';

// Array de cores para as habilidades
const habilityColors = [
  { bg: 'bg-blue-500/20', border: 'border-blue-400/30', text: 'text-blue-300' },
  { bg: 'bg-[#bd18b4]/20', border: 'border-[#c532e2]/30', text: 'text-[#c532e2]' },
  { bg: 'bg-purple-500/20', border: 'border-purple-400/30', text: 'text-purple-300' },
  { bg: 'bg-yellow-500/20', border: 'border-yellow-400/30', text: 'text-yellow-300' },
  { bg: 'bg-pink-500/20', border: 'border-pink-400/30', text: 'text-pink-300' },
  { bg: 'bg-orange-500/20', border: 'border-orange-400/30', text: 'text-orange-300' },
  { bg: 'bg-red-500/20', border: 'border-red-400/30', text: 'text-red-300' },
  { bg: 'bg-indigo-500/20', border: 'border-indigo-400/30', text: 'text-indigo-300' },
  { bg: 'bg-teal-500/20', border: 'border-teal-400/30', text: 'text-teal-300' },
  { bg: 'bg-cyan-500/20', border: 'border-cyan-400/30', text: 'text-cyan-300' },
];

// Função para obter cor baseada no índice da habilidade
const getHabilityColor = (index: number) => {
  const colorIndex = index % habilityColors.length;
  const color = habilityColors[colorIndex];
  return `${color.bg} backdrop-blur-md border ${color.border} rounded-full px-3 py-1 text-center`;
};

// Função para obter cor do texto baseada no índice da habilidade
const getHabilityTextColor = (index: number) => {
  const colorIndex = index % habilityColors.length;
  return habilityColors[colorIndex].text;
};

interface HabilitiesCardProps {
  userProfile: UserProfile | null;
  isPublicView: boolean;
  onEditClick: () => void;
}

export function HabilitiesCard({ userProfile, isPublicView, onEditClick }: HabilitiesCardProps) {
  // Parse das habilidades do usuário
  const habilities = userProfile?.habilities 
    ? userProfile.habilities.split(',').map(h => h.trim()).filter(h => h)
    : [];

  return (
    <Card className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#bd18b4]/5 before:to-transparent before:pointer-events-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white font-semibold flex items-center gap-2">
            <Star className="w-5 h-5 text-[#bd18b4]" />
            Habilidades
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
        {habilities.length > 0 ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {habilities.map((hability, index) => (
                <div 
                  key={index}
                  className={`${getHabilityColor(index)} text-xs font-medium`}
                >
                  <span className={`${getHabilityTextColor(index)}`}>
                    {hability}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-[#323238] rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {isPublicView 
                ? 'Nenhuma habilidade cadastrada' 
                : 'Adicione suas habilidades para se destacar'
              }
            </p>
            {!isPublicView && (
              <Button 
                className="bg-[#bd18b4] hover:bg-[#aa22c5] text-black px-4 py-2 rounded-lg font-medium flex items-center space-x-2 mx-auto cursor-pointer"
                onClick={onEditClick}
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar habilidades</span>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
