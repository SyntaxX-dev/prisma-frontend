"use client";

import { useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { VoiceCallState } from '@/types/voice-call';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceCallModalProps {
  callState: VoiceCallState;
  callerName?: string;
  callerAvatar?: string | null;
  receiverName?: string;
  receiverAvatar?: string | null;
  currentUserId?: string;
  onAccept?: (roomId: string) => void;
  onReject?: (roomId: string) => void;
  onEnd?: () => void;
  onToggleAudio?: () => void;
}

export function VoiceCallModal({
  callState,
  callerName,
  callerAvatar,
  receiverName,
  receiverAvatar,
  currentUserId,
  onAccept,
  onReject,
  onEnd,
  onToggleAudio,
}: VoiceCallModalProps) {
  const isOpen = callState.status !== 'idle' || (callState.status === 'idle' && !!callState.error);
  const isRinging = callState.status === 'ringing';
  const isActive = callState.status === 'active';
  const hasError = !!callState.error;
  
  // Determinar se é chamada recebida ou enviada
  // Chamada recebida: quando o currentUserId é o receiverId (ou seja, não é o callerId)
  // Chamada enviada: quando o currentUserId é o callerId
  const isIncoming = isRinging && callState.callerId && currentUserId && callState.callerId !== currentUserId;
  const isOutgoing = isRinging && callState.callerId && currentUserId && callState.callerId === currentUserId;

  // Determinar qual nome e avatar mostrar
  const displayName = isIncoming
    ? callerName || 'Usuário'
    : receiverName || 'Usuário';
  const displayAvatar = isIncoming ? callerAvatar : receiverAvatar;

  // Auto-fechar após alguns segundos se rejeitada ou encerrada
  useEffect(() => {
    if (callState.status === 'rejected' || callState.status === 'ended') {
      const timer = setTimeout(() => {
        if (onEnd) {
          onEnd();
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [callState.status, onEnd]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-[#1a1a1a] border border-white/10 max-w-md p-8">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {hasError && 'Erro na chamada'}
            {isRinging && isIncoming && `Chamada recebida de ${displayName}`}
            {isRinging && !isIncoming && `Chamando ${displayName}`}
            {isActive && `Chamada em andamento com ${displayName}`}
            {callState.status === 'rejected' && 'Chamada rejeitada'}
            {callState.status === 'ended' && 'Chamada encerrada'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6">
          {/* Se houver erro e status for idle, mostrar apenas o erro */}
          {hasError && callState.status === 'idle' ? (
            <div className="text-center w-full">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                  <PhoneOff className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Erro ao iniciar chamada
              </h3>
              <div className="mt-3 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-400">{callState.error}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Avatar com animação de pulso quando tocando */}
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-[#C9FE02]">
                  <AvatarImage src={displayAvatar || undefined} alt={displayName} />
                  <AvatarFallback className="bg-[#C9FE02] text-black text-2xl">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isRinging && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-[#C9FE02]"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.8, 0, 0.8],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </div>

              {/* Nome e status */}
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {displayName}
                </h3>
                <DialogDescription className="text-gray-400">
                  {isRinging && isIncoming && 'Chamada recebida'}
                  {isRinging && !isIncoming && 'Chamando...'}
                  {isActive && 'Chamada em andamento'}
                  {callState.status === 'rejected' && 'Chamada rejeitada'}
                  {callState.status === 'ended' && 'Chamada encerrada'}
                </DialogDescription>
                {/* Mensagem de erro */}
                {callState.error && (
                  <div className="mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-sm text-red-400">{callState.error}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Botões de ação */}
          <AnimatePresence mode="wait">
            {isRinging && isIncoming && (
              <motion.div
                key="incoming"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex gap-4"
              >
                <Button
                  onClick={() => {
                    if (onReject && callState.roomId) {
                      onReject(callState.roomId);
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full w-14 h-14 p-0"
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>
                <Button
                  onClick={() => {
                    if (onAccept && callState.roomId) {
                      onAccept(callState.roomId);
                    }
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 p-0"
                >
                  <Phone className="w-6 h-6" />
                </Button>
              </motion.div>
            )}

            {isOutgoing && (
              <motion.div
                key="outgoing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex gap-4"
              >
                <Button
                  onClick={() => {
                    if (onEnd) {
                      onEnd();
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full w-14 h-14 p-0"
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>
              </motion.div>
            )}

            {isActive && (
              <motion.div
                key="active"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex gap-4"
              >
                <Button
                  onClick={onToggleAudio}
                  className={`${
                    callState.isLocalAudioEnabled
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white rounded-full w-14 h-14 p-0`}
                >
                  {callState.isLocalAudioEnabled ? (
                    <Mic className="w-6 h-6" />
                  ) : (
                    <MicOff className="w-6 h-6" />
                  )}
                </Button>
                <Button
                  onClick={() => {
                    if (onEnd) {
                      onEnd();
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full w-14 h-14 p-0"
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>
              </motion.div>
            )}

            {(callState.status === 'rejected' || callState.status === 'ended' || hasError) && (
              <motion.div
                key="ended"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex gap-4"
              >
                <Button
                  onClick={() => {
                    if (onEnd) {
                      onEnd();
                    }
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white rounded-full px-6"
                >
                  Fechar
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

