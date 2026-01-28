"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Lock, Globe, Loader2 } from "lucide-react";
import type { Community } from "@/types/community";
import { joinCommunity } from "@/api/communities/join-community";
import { useNotifications } from "@/hooks/shared/useNotifications";

interface CommunityJoinTooltipProps {
  community: Community;
  isOpen: boolean;
  onClose: () => void;
  onJoinSuccess: () => void;
  position?: { x: number; y: number };
}

export function CommunityJoinTooltip({
  community,
  isOpen,
  onClose,
  onJoinSuccess,
  position,
}: CommunityJoinTooltipProps) {
  const [isJoining, setIsJoining] = useState(false);
  const { showSuccess, showError } = useNotifications();

  // Calcular posição ajustada para não cortar
  const getAdjustedPosition = () => {
    if (!position) {
      return { x: '50%', y: '50%', transform: 'translate(-50%, -50%)' };
    }

    const tooltipWidth = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 450 :
      typeof window !== 'undefined' && window.innerWidth >= 768 ? 400 : 320;
    const tooltipHeight = 320; // Altura aproximada do tooltip
    const padding = 16; // Padding da tela
    const spacing = 10; // Espaçamento do elemento

    let x = position.x;
    let y = position.y;

    // Verificar limites horizontais
    if (x + tooltipWidth > window.innerWidth - padding) {
      x = window.innerWidth - tooltipWidth - padding;
    }
    if (x < padding) {
      x = padding;
    }

    // Verificar limites verticais
    if (y + tooltipHeight > window.innerHeight - padding) {
      // Se não cabe abaixo, colocar acima
      y = position.y - tooltipHeight - spacing;
      // Se ainda não cabe acima, centralizar verticalmente
      if (y < padding) {
        y = (window.innerHeight - tooltipHeight) / 2;
      }
    }
    if (y < padding) {
      y = padding;
    }

    return { x: `${x}px`, y: `${y}px`, transform: 'none' };
  };

  const adjustedPosition = getAdjustedPosition();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleJoin = async () => {
    try {
      setIsJoining(true);
      await joinCommunity(community.id);
      showSuccess("Você entrou na comunidade com sucesso!");
      onJoinSuccess();
      onClose();
    } catch (error: any) {
      showError(error.message || "Erro ao entrar na comunidade");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50"
          />

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 w-[320px] md:w-[400px] lg:w-[450px] rounded-2xl border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{
              background: 'rgb(30, 30, 30)',
              left: adjustedPosition.x,
              top: adjustedPosition.y,
              transform: adjustedPosition.transform,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header com avatar */}
            <div className="p-4 md:p-5 lg:p-6 border-b border-white/10">
              <div className="flex items-center gap-3 md:gap-4">
                <Avatar className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl shrink-0">
                  <AvatarImage src={community.avatarUrl || undefined} className="rounded-xl" />
                  <AvatarFallback
                    className="font-semibold text-lg md:text-xl lg:text-2xl rounded-xl"
                    style={{
                      background: '#bd18b4',
                      color: '#000',
                    }}
                  >
                    {getInitials(community.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-base md:text-lg lg:text-xl mb-1 md:mb-2 truncate">
                    {community.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
                    {community.visibility === 'PRIVATE' ? (
                      <Lock className="w-3 h-3 md:w-4 md:h-4" />
                    ) : (
                      <Globe className="w-3 h-3 md:w-4 md:h-4" />
                    )}
                    <span>{community.visibility === 'PRIVATE' ? 'Privada' : 'Pública'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações */}
            <div className="p-4 md:p-5 lg:p-6 space-y-3 md:space-y-4">
              {community.description && (
                <div>
                  <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                    {community.description}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm md:text-base text-gray-400">
                <Users className="w-4 h-4 md:w-5 md:h-5" />
                <span>{community.memberCount || 0} membros</span>
              </div>

              {community.focus && (
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-white/10 text-gray-400">
                    {community.focus}
                  </span>
                </div>
              )}
            </div>

            {/* Botão de ação */}
            <div className="p-4 md:p-5 lg:p-6 border-t border-white/10">
              <Button
                onClick={handleJoin}
                disabled={isJoining}
                className="w-full h-10 md:h-12 rounded-xl font-semibold text-sm md:text-base transition-all hover:scale-[1.02] cursor-pointer"
                style={{
                  background: '#bd18b4',
                  color: '#000',
                }}
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar na Comunidade'
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

