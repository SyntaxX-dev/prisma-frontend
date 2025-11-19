"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import type {
  CallStatus,
  VoiceCallState,
  CallIncomingEvent,
  CallAcceptedEvent,
  CallRejectedEvent,
  CallOfferEvent,
  CallAnswerEvent,
  CallIceCandidateEvent,
  CallEndedEvent,
  CallInitiateResponse,
} from '@/types/voice-call';

// Configuração WebRTC (STUN + TURN servers)
// TURN servers são necessários em produção quando há NATs/firewalls restritivos
const getRTCConfig = (): RTCConfiguration => {
  const iceServers: RTCIceServer[] = [
    // STUN servers (descoberta de endereço IP público)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ];

  // TURN servers públicos gratuitos (relay quando conexão direta falha)
  // Estes são necessários em produção para contornar NATs/firewalls
  // Usando múltiplos servidores para redundância
  const publicTurnServers = [
    // Metered.ca Open Relay (gratuito, sem limite)
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:80?transport=udp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    // Open Relay alternativo
    {
      urls: 'turn:relay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:relay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ];

  iceServers.push(...publicTurnServers);

  // Permitir configuração customizada via variáveis de ambiente
  if (typeof window !== 'undefined') {
    const customTurnUrl = (window as any).__CUSTOM_TURN_URL;
    const customTurnUsername = (window as any).__CUSTOM_TURN_USERNAME;
    const customTurnCredential = (window as any).__CUSTOM_TURN_CREDENTIAL;

    if (customTurnUrl && customTurnUsername && customTurnCredential) {
      // Adicionar no início para ter prioridade
      iceServers.unshift({
        urls: customTurnUrl,
        username: customTurnUsername,
        credential: customTurnCredential,
      });
    }
  }

  console.log('[useVoiceCall] Configuração RTC com', iceServers.length, 'ICE servers');

  return { 
    iceServers,
    iceTransportPolicy: 'all', // Tentar todos os tipos de conexão (host, srflx, relay)
    iceCandidatePoolSize: 10, // Pré-coletar mais candidates
  };
};

const RTC_CONFIG = getRTCConfig();

export function useVoiceCall(socket: Socket | null) {
  const [callState, setCallState] = useState<VoiceCallState>({
    status: 'idle',
    roomId: null,
    callerId: null,
    receiverId: null,
    isLocalAudioEnabled: true,
    isRemoteAudioEnabled: true,
    error: null,
  });

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const callerInfoRef = useRef<{ id: string; name: string; avatar?: string | null } | null>(null);
  const activeSocketRef = useRef<Socket | null>(null);
  const pendingOfferRef = useRef<CallOfferEvent | null>(null);
  const ringtoneAudioRef = useRef<HTMLAudioElement | null>(null);
  const ringtoneIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingCallRef = useRef<{ receiverId: string; offer: RTCSessionDescriptionInit } | null>(null);
  const activeAudioContextsRef = useRef<Set<AudioContext>>(new Set());
  const activeOscillatorsRef = useRef<Set<OscillatorNode>>(new Set());
  const activeGainNodesRef = useRef<Set<GainNode>>(new Set());
  const isStoppingRingtoneRef = useRef<boolean>(false);

  // Obter ID do usuário atual do token
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          currentUserIdRef.current = payload.sub || payload.userId || payload.id || null;
        }
      } catch (e) {
        // Ignorar erro
      }
    }
  }, []);

  // Usar socket compartilhado se disponível, caso contrário usar o socket passado
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateActiveSocket = () => {
      const sharedSocket = window.__sharedChatSocket;
      if (sharedSocket && sharedSocket.connected) {
        activeSocketRef.current = sharedSocket;
        console.log('[useVoiceCall] Usando socket compartilhado:', sharedSocket.id, 'connected:', sharedSocket.connected);
      } else if (socket && socket.connected) {
        activeSocketRef.current = socket;
        console.log('[useVoiceCall] Usando socket passado:', socket.id, 'connected:', socket.connected);
      } else {
        activeSocketRef.current = null;
        console.log('[useVoiceCall] Socket não disponível ou não conectado');
      }
    };

    // Atualizar imediatamente
    updateActiveSocket();

    // Listener para quando o socket compartilhado conectar
    const sharedSocket = window.__sharedChatSocket;
    if (sharedSocket) {
      // Se já está conectado, atualizar imediatamente
      if (sharedSocket.connected) {
        updateActiveSocket();
      }
      sharedSocket.on('connect', updateActiveSocket);
    }

    // Listener para quando o socket passado conectar
    if (socket) {
      // Se já está conectado, atualizar imediatamente
      if (socket.connected) {
        updateActiveSocket();
      }
      socket.on('connect', updateActiveSocket);
    }

    return () => {
      if (sharedSocket) {
        sharedSocket.off('connect', updateActiveSocket);
      }
      if (socket) {
        socket.off('connect', updateActiveSocket);
      }
    };
  }, [socket]);

  // Configurar listeners de eventos WebSocket
  useEffect(() => {
    let cleanupFn: (() => void) | undefined;
    
    // Função para registrar listeners
    const registerListeners = (): (() => void) | undefined => {
      const activeSocket = activeSocketRef.current;
      
      if (!activeSocket || !activeSocket.connected) {
        console.log('[useVoiceCall] Socket não disponível ou não conectado, socket:', activeSocket?.id, 'connected:', activeSocket?.connected);
        return undefined;
      }

      console.log('[useVoiceCall] Registrando listeners de chamadas de voz no socket:', activeSocket.id);

    const handleIncomingCall = async (data: CallIncomingEvent) => {
      console.log('[useVoiceCall] Chamada recebida:', data);
      roomIdRef.current = data.roomId;
      
      // Buscar informações do caller se necessário
      try {
        const { getUserProfile } = await import('@/api/auth/get-user-profile');
        const response = await getUserProfile(data.callerId);
        if (response.success && response.data) {
          callerInfoRef.current = {
            id: response.data.id,
            name: response.data.name,
            avatar: response.data.profileImage,
          };
        }
      } catch (error) {
        console.error('[useVoiceCall] Erro ao buscar perfil do caller:', error);
        callerInfoRef.current = {
          id: data.callerId,
          name: 'Usuário',
          avatar: null,
        };
      }
      
      setCallState((prev) => ({
        ...prev,
        status: 'ringing',
        roomId: data.roomId,
        callerId: data.callerId,
        receiverId: currentUserIdRef.current,
        callerName: callerInfoRef.current?.name,
        callerAvatar: callerInfoRef.current?.avatar,
      }));
    };

    const handleCallAccepted = async (data: CallAcceptedEvent) => {
      console.log('[useVoiceCall] Evento call:accepted recebido:', data);
      
      // Usar setState com callback para garantir que estamos usando o estado mais recente
      setCallState((prev) => {
        // Verificar se somos o caller ou o receiver usando o estado atual
        const isCaller = prev.callerId === currentUserIdRef.current;
        const isReceiver = prev.receiverId === currentUserIdRef.current;
        
        console.log('[useVoiceCall] isCaller:', isCaller, 'isReceiver:', isReceiver, 'prev:', prev);
        
        if (isCaller && peerConnectionRef.current) {
          // Somos o caller, precisamos processar o answer recebido
          console.log('[useVoiceCall] Processando answer como caller');
          peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          ).then(() => {
            console.log('[useVoiceCall] Remote description definida (caller), atualizando estado para active');
            setCallState((prevState) => ({
              ...prevState,
              status: 'active',
            }));
          }).catch((error) => {
            console.error('[useVoiceCall] Erro ao definir remote description (caller):', error);
          });
          
          // Retornar estado atual enquanto processa
          return prev;
        } else if (isReceiver) {
          // Somos o receiver, já processamos o answer quando aceitamos, apenas confirmar
          console.log('[useVoiceCall] Confirmação de aceitação recebida (receiver), atualizando estado para active');
          return {
            ...prev,
            status: 'active',
          };
        } else {
          console.warn('[useVoiceCall] call:accepted recebido mas não somos caller nem receiver');
          return prev;
        }
      });
    };

    const handleCallRejected = () => {
      console.log('[useVoiceCall] Chamada rejeitada');
      
      // Parar som imediatamente ao receber evento de chamada rejeitada
      // Acessar diretamente os refs para garantir que o som pare
      if (ringtoneAudioRef.current) {
        ringtoneAudioRef.current.pause();
        ringtoneAudioRef.current.currentTime = 0;
        ringtoneAudioRef.current = null;
      }
      if (ringtoneIntervalRef.current) {
        clearInterval(ringtoneIntervalRef.current);
        ringtoneIntervalRef.current = null;
      }
      
      pendingOfferRef.current = null;
      setCallState((prev) => ({
        ...prev,
        status: 'rejected',
      }));
      cleanup();
    };

    const handleCallOffer = async (data: CallOfferEvent) => {
      console.log('[useVoiceCall] Offer recebido, armazenando para processar quando aceitar:', data);
      // Armazenar o offer para processar quando o usuário aceitar
      pendingOfferRef.current = data;
      
      // Não processar o offer automaticamente - esperar o usuário aceitar
    };

    const handleCallAnswer = async (data: CallAnswerEvent) => {
      console.log('[useVoiceCall] Answer recebido (call:answer):', data);
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
          console.log('[useVoiceCall] Remote description definida (answer), atualizando estado para active');
          setCallState((prev) => ({
            ...prev,
            status: 'active',
          }));
        } catch (error) {
          console.error('[useVoiceCall] Erro ao definir remote description (answer):', error);
        }
      } else {
        console.warn('[useVoiceCall] PeerConnection não existe quando recebeu call:answer');
      }
    };

    const handleIceCandidate = async (data: CallIceCandidateEvent) => {
      if (peerConnectionRef.current && data.candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        } catch (error) {
          console.error('Erro ao adicionar ICE candidate:', error);
        }
      }
    };

    const handleCallEnded = () => {
      // Primeiro: atualizar estado (isso fará o useEffect parar o som)
      setCallState((prev) => ({
        ...prev,
        status: 'ended',
      }));
      
      // Segundo: parar som diretamente (múltiplas camadas de proteção)
      // Acessar diretamente os refs para garantir que o som pare
      if (ringtoneAudioRef.current) {
        try {
          ringtoneAudioRef.current.pause();
          ringtoneAudioRef.current.currentTime = 0;
          ringtoneAudioRef.current.src = '';
          ringtoneAudioRef.current.load();
        } catch (error) {
          // Ignorar erros
        }
        ringtoneAudioRef.current = null;
      }
      if (ringtoneIntervalRef.current) {
        clearInterval(ringtoneIntervalRef.current);
        ringtoneIntervalRef.current = null;
      }
      
      // Silenciar e desconectar todos os gainNodes (para o som imediatamente)
      const gainNodesToDisconnect = Array.from(activeGainNodesRef.current);
      activeGainNodesRef.current.clear();
      gainNodesToDisconnect.forEach((gainNode) => {
        try {
          // Primeiro: silenciar (definir gain para 0)
          const audioContext = (gainNode as any).context;
          if (audioContext && audioContext.currentTime !== undefined) {
            gainNode.gain.cancelScheduledValues(audioContext.currentTime);
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          } else {
            gainNode.gain.value = 0;
          }
          // Segundo: desconectar
          gainNode.disconnect();
        } catch (error) {
          // Se falhar, tentar apenas desconectar
          try {
            gainNode.disconnect();
          } catch (e) {
            // Ignorar erros
          }
        }
      });
      
      // Parar todos os osciladores ativos
      const oscillatorsToStop = Array.from(activeOscillatorsRef.current);
      activeOscillatorsRef.current.clear();
      oscillatorsToStop.forEach((oscillator) => {
        try {
          oscillator.stop();
        } catch (error) {
          // Ignorar erros
        }
      });
      
      // Fechar todos os AudioContexts
      const contextsToClose = Array.from(activeAudioContextsRef.current);
      activeAudioContextsRef.current.clear();
      contextsToClose.forEach((audioContext) => {
        try {
          if (audioContext.state === 'running') {
            audioContext.suspend().catch(() => {
              if (audioContext.state !== 'closed') {
                audioContext.close().catch(() => {});
              }
            });
          } else if (audioContext.state !== 'closed') {
            audioContext.close().catch(() => {});
          }
        } catch (error) {
          // Ignorar erros
        }
      });
      
      // Terceiro: limpar recursos
      cleanup();
    };

      activeSocket.on('call:incoming', handleIncomingCall);
      activeSocket.on('call:accepted', handleCallAccepted);
      activeSocket.on('call:rejected', handleCallRejected);
      activeSocket.on('call:offer', handleCallOffer);
      activeSocket.on('call:answer', handleCallAnswer);
      activeSocket.on('call:ice-candidate', handleIceCandidate);
      activeSocket.on('call:ended', handleCallEnded);

      // Log para debug - verificar se eventos estão chegando
      activeSocket.onAny((eventName, ...args) => {
        if (eventName.startsWith('call:')) {
          console.log('[useVoiceCall] Evento recebido:', eventName, args);
        }
      });

      return () => {
        console.log('[useVoiceCall] Removendo listeners do socket:', activeSocket.id);
        activeSocket.off('call:incoming', handleIncomingCall);
        activeSocket.off('call:accepted', handleCallAccepted);
        activeSocket.off('call:rejected', handleCallRejected);
        activeSocket.off('call:offer', handleCallOffer);
        activeSocket.off('call:answer', handleCallAnswer);
        activeSocket.off('call:ice-candidate', handleIceCandidate);
        activeSocket.off('call:ended', handleCallEnded);
      };
    };

    // Função para tentar registrar listeners
    const tryRegisterListeners = () => {
      // Limpar listeners anteriores se existirem
      if (cleanupFn) {
        cleanupFn();
        cleanupFn = undefined;
      }
      
      // Tentar registrar novamente
      cleanupFn = registerListeners();
    };

    // Registrar listeners imediatamente se o socket já estiver conectado
    tryRegisterListeners();

    // Se não conseguiu registrar, tentar novamente quando o socket conectar
    const activeSocket = activeSocketRef.current;
    const sharedSocket = typeof window !== 'undefined' ? window.__sharedChatSocket : null;
    
    const onConnect = () => {
      console.log('[useVoiceCall] Socket conectou, atualizando activeSocket e registrando listeners...');
      // Atualizar activeSocket primeiro
      if (sharedSocket && sharedSocket.connected) {
        activeSocketRef.current = sharedSocket;
      } else if (socket && socket.connected) {
        activeSocketRef.current = socket;
      }
      // Depois tentar registrar listeners
      tryRegisterListeners();
    };

    // Adicionar listeners de connect em ambos os sockets
    if (activeSocket) {
      activeSocket.on('connect', onConnect);
    }
    if (sharedSocket && sharedSocket !== activeSocket) {
      sharedSocket.on('connect', onConnect);
    }
    if (socket && socket !== activeSocket && socket !== sharedSocket) {
      socket.on('connect', onConnect);
    }

    // Se o socket já está conectado mas os listeners não foram registrados, tentar novamente após um pequeno delay
    // Isso resolve o caso onde o socket conecta antes do hook ser montado
    const checkAndRegister = () => {
      const currentActiveSocket = activeSocketRef.current;
      if (currentActiveSocket && currentActiveSocket.connected && !cleanupFn) {
        console.log('[useVoiceCall] Socket já conectado, registrando listeners...');
        tryRegisterListeners();
      }
    };
    
    // Verificar após um pequeno delay para garantir que tudo está inicializado
    const timeoutId = setTimeout(checkAndRegister, 100);

    return () => {
      clearTimeout(timeoutId);
      if (cleanupFn) {
        cleanupFn();
        cleanupFn = undefined;
      }
      if (activeSocket) {
        activeSocket.off('connect', onConnect);
      }
      if (sharedSocket && sharedSocket !== activeSocket) {
        sharedSocket.off('connect', onConnect);
      }
      if (socket && socket !== activeSocket && socket !== sharedSocket) {
        socket.off('connect', onConnect);
      }
    };
  }, [socket]);

  // Parar som de toque
  const stopRingtone = useCallback(() => {
    console.log('[useVoiceCall] [stopRingtone] ===== INICIANDO PARADA DO SOM =====');
    console.log('[useVoiceCall] [stopRingtone] Estado ANTES de parar:', {
      intervalExists: !!ringtoneIntervalRef.current,
      oscillatorsCount: activeOscillatorsRef.current.size,
      gainNodesCount: activeGainNodesRef.current.size,
      contextsCount: activeAudioContextsRef.current.size,
      audioExists: !!ringtoneAudioRef.current,
      isStopping: isStoppingRingtoneRef.current
    });
    
    // PRIMEIRO: Marcar que estamos parando (evita criar novos osciladores)
    // Isso DEVE ser feito ANTES de limpar o intervalo para evitar race conditions
    isStoppingRingtoneRef.current = true;
    console.log('[useVoiceCall] [stopRingtone] Flag isStopping definida como true');
    
    // SEGUNDO: parar intervalo imediatamente (evita criar novos sons)
    if (ringtoneIntervalRef.current) {
      const intervalId = ringtoneIntervalRef.current;
      clearInterval(intervalId);
      ringtoneIntervalRef.current = null;
      console.log('[useVoiceCall] [stopRingtone] Intervalo limpo (ID:', intervalId, ')');
    } else {
      console.log('[useVoiceCall] [stopRingtone] Nenhum intervalo ativo para limpar');
    }

    // Segundo: PARAR todos os osciladores PRIMEIRO (evita criar novos sons)
    const oscillatorsToStop = Array.from(activeOscillatorsRef.current);
    console.log('[useVoiceCall] [stopRingtone] Parando', oscillatorsToStop.length, 'osciladores primeiro');
    activeOscillatorsRef.current.clear();
    oscillatorsToStop.forEach((oscillator, index) => {
      try {
        // Parar oscilador imediatamente
        const audioContext = (oscillator as any).context;
        const contextState = audioContext ? audioContext.state : 'unknown';
        const currentTime = audioContext && audioContext.currentTime !== undefined ? audioContext.currentTime : 0;
        
        console.log('[useVoiceCall] [stopRingtone] Parando oscilador', index + 1, 'de', oscillatorsToStop.length, {
          contextState,
          currentTime,
          oscillatorType: oscillator.type,
          oscillatorFrequency: oscillator.frequency?.value
        });
        
        if (audioContext && audioContext.currentTime !== undefined) {
          oscillator.stop(audioContext.currentTime);
        } else {
          oscillator.stop(0);
        }
        // Desconectar também
        try {
          oscillator.disconnect();
          console.log('[useVoiceCall] [stopRingtone] Oscilador', index + 1, 'desconectado');
        } catch (e) {
          console.warn('[useVoiceCall] [stopRingtone] Erro ao desconectar oscilador', index + 1, ':', e);
        }
      } catch (error) {
        console.error('[useVoiceCall] [stopRingtone] Erro ao parar oscilador', index + 1, ':', error);
        // Se tudo falhar, tentar desconectar
        try {
          oscillator.disconnect();
        } catch (e) {
          // Ignorar todos os erros
        }
      }
    });
    console.log('[useVoiceCall] [stopRingtone] Todos os osciladores foram processados');

    // Terceiro: SILENCIAR e DESCONECTAR todos os gainNodes (isso para o som IMEDIATAMENTE!)
    const gainNodesToDisconnect = Array.from(activeGainNodesRef.current);
    console.log('[useVoiceCall] [stopRingtone] Silenciando e desconectando', gainNodesToDisconnect.length, 'gainNodes');
    activeGainNodesRef.current.clear();
    gainNodesToDisconnect.forEach((gainNode, index) => {
      try {
        // Primeiro: cancelar TODOS os valores agendados e silenciar imediatamente
        const audioContext = (gainNode as any).context;
        const contextState = audioContext ? audioContext.state : 'unknown';
        const currentTime = audioContext && audioContext.currentTime !== undefined ? audioContext.currentTime : 0;
        const currentGain = gainNode.gain.value;
        
        console.log('[useVoiceCall] [stopRingtone] Processando gainNode', index + 1, 'de', gainNodesToDisconnect.length, {
          contextState,
          currentTime,
          currentGain
        });
        
        if (audioContext && audioContext.currentTime !== undefined) {
          // Cancelar todos os valores agendados
          gainNode.gain.cancelScheduledValues(0); // Cancelar desde o início
          // Definir gain para 0 AGORA (sem delay)
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          // Forçar valor imediatamente (bypass do agendamento)
          gainNode.gain.value = 0;
          console.log('[useVoiceCall] [stopRingtone] GainNode', index + 1, 'silenciado (gain = 0)');
        } else {
          // Fallback: silenciar diretamente
          gainNode.gain.value = 0;
          console.log('[useVoiceCall] [stopRingtone] GainNode', index + 1, 'silenciado (fallback, gain = 0)');
        }
        
        // Segundo: desconectar do destino (isso também para o som)
        gainNode.disconnect();
        console.log('[useVoiceCall] [stopRingtone] GainNode', index + 1, 'desconectado');
      } catch (error) {
        console.error('[useVoiceCall] [stopRingtone] Erro ao processar gainNode', index + 1, ':', error);
        // Se falhar, tentar apenas silenciar e desconectar
        try {
          gainNode.gain.value = 0;
          gainNode.disconnect();
        } catch (e) {
          // Ignorar todos os erros
        }
      }
    });
    console.log('[useVoiceCall] [stopRingtone] Todos os gainNodes foram processados');

    // Quarto: FECHAR todos os AudioContexts (isso para TODOS os osciladores conectados imediatamente!)
    const contextsToClose = Array.from(activeAudioContextsRef.current);
    console.log('[useVoiceCall] [stopRingtone] Fechando', contextsToClose.length, 'AudioContexts');
    activeAudioContextsRef.current.clear();
    
    // Fechar todos os contextos de forma mais agressiva
    contextsToClose.forEach((audioContext, index) => {
      try {
        const initialState = audioContext.state;
        console.log('[useVoiceCall] [stopRingtone] Processando AudioContext', index + 1, 'de', contextsToClose.length, {
          state: initialState,
          currentTime: audioContext.currentTime
        });
        
        // Primeiro: tentar suspender (mais rápido que fechar)
        if (audioContext.state === 'running') {
          console.log('[useVoiceCall] [stopRingtone] Suspendo AudioContext', index + 1);
          audioContext.suspend().then(() => {
            console.log('[useVoiceCall] [stopRingtone] AudioContext', index + 1, 'suspenso, fechando agora');
            // Depois de suspender, fechar para liberar recursos
            if (audioContext.state !== 'closed') {
              audioContext.close().catch(() => {});
            }
          }).catch((err) => {
            console.warn('[useVoiceCall] [stopRingtone] Erro ao suspender AudioContext', index + 1, ', fechando diretamente:', err);
            // Se suspender falhar, tentar fechar diretamente
            if (audioContext.state !== 'closed') {
              audioContext.close().catch(() => {});
            }
          });
        } else if (audioContext.state !== 'closed') {
          // Se não estiver rodando, fechar diretamente
          console.log('[useVoiceCall] [stopRingtone] Fechando AudioContext', index + 1, 'diretamente (state:', audioContext.state, ')');
          audioContext.close().catch(() => {});
        } else {
          console.log('[useVoiceCall] [stopRingtone] AudioContext', index + 1, 'já está fechado');
        }
      } catch (error) {
        console.error('[useVoiceCall] [stopRingtone] Erro ao processar AudioContext', index + 1, ':', error);
        // Se tudo falhar, tentar fechar como último recurso
        try {
          if (audioContext.state !== 'closed') {
            audioContext.close().catch(() => {});
          }
        } catch (e) {
          // Ignorar todos os erros
        }
      }
    });
    console.log('[useVoiceCall] [stopRingtone] Todos os AudioContexts foram processados');

    // Quinto: parar TODOS os osciladores ativos individualmente (backup, caso algum não tenha sido parado)
    const oscillatorsToStopBackup = Array.from(activeOscillatorsRef.current);
    console.log('[useVoiceCall] Parando', oscillatorsToStopBackup.length, 'osciladores individualmente (backup)');
    activeOscillatorsRef.current.clear();
    oscillatorsToStopBackup.forEach((oscillator) => {
      try {
        // Primeiro: desconectar o oscilador (isso para o som imediatamente)
        try {
          oscillator.disconnect();
        } catch (e) {
          // Ignorar erros de desconexão
        }
        
        // Segundo: parar o oscilador
        const audioContext = (oscillator as any).context;
        if (audioContext && audioContext.currentTime !== undefined) {
          oscillator.stop(audioContext.currentTime); // Parar agora
        } else {
          oscillator.stop(0); // Fallback: parar imediatamente
        }
      } catch (error) {
        // Se tudo falhar, tentar novamente
        try {
          oscillator.disconnect();
        } catch (e) {
          // Ignorar todos os erros
        }
      }
    });

    // Sexto: parar áudio de arquivo se existir
    if (ringtoneAudioRef.current) {
      try {
        console.log('[useVoiceCall] [stopRingtone] Parando áudio de arquivo');
        ringtoneAudioRef.current.pause();
        ringtoneAudioRef.current.currentTime = 0;
        ringtoneAudioRef.current.src = ''; // Limpar src para garantir que pare
        ringtoneAudioRef.current.load(); // Forçar reload
        console.log('[useVoiceCall] [stopRingtone] Áudio de arquivo parado');
      } catch (error) {
        console.warn('[useVoiceCall] [stopRingtone] Erro ao parar áudio de arquivo:', error);
      }
      ringtoneAudioRef.current = null;
    }
    
    // NÃO resetar a flag aqui - ela será resetada quando iniciarmos um novo som
    // Isso garante que nenhum callback pendente do intervalo possa criar novos toques
    
    console.log('[useVoiceCall] [stopRingtone] ===== PARADA DO SOM CONCLUÍDA =====');
    console.log('[useVoiceCall] [stopRingtone] Estado DEPOIS de parar:', {
      intervalExists: !!ringtoneIntervalRef.current,
      oscillatorsCount: activeOscillatorsRef.current.size,
      gainNodesCount: activeGainNodesRef.current.size,
      contextsCount: activeAudioContextsRef.current.size,
      audioExists: !!ringtoneAudioRef.current,
      isStopping: isStoppingRingtoneRef.current
    });
  }, []);

  // Função para criar som de toque usando Web Audio API (toque de telefone clássico)
  const createRingtone = useCallback(() => {
    if (typeof window === 'undefined' || !window.AudioContext) {
      return null;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      
      // Registrar AudioContext para poder fechá-lo depois
      activeAudioContextsRef.current.add(audioContext);
      
      // Se o AudioContext estiver suspenso, tentar resumir
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch((error) => {
          console.warn('[useVoiceCall] Não foi possível resumir AudioContext:', error);
          return null;
        });
      }

      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Registrar osciladores e gainNode para poder pará-los depois
      activeOscillatorsRef.current.add(oscillator1);
      activeOscillatorsRef.current.add(oscillator2);
      activeGainNodesRef.current.add(gainNode);
      
      console.log('[useVoiceCall] [createRingtone] Criados:', {
        audioContextId: audioContext.state,
        oscillatorsCount: activeOscillatorsRef.current.size,
        gainNodesCount: activeGainNodesRef.current.size,
        contextsCount: activeAudioContextsRef.current.size,
        isStopping: isStoppingRingtoneRef.current
      });

      // Frequências típicas de um toque de telefone (duas notas simultâneas)
      oscillator1.frequency.value = 440; // Lá (A4)
      oscillator2.frequency.value = 480; // Si bemol (Bb4)
      
      // Configurar volume com fade in/out suave
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.35);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);

      // Conectar
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Tipo de onda (sine para som mais suave)
      oscillator1.type = 'sine';
      oscillator2.type = 'sine';

      return { audioContext, oscillator1, oscillator2, gainNode };
    } catch (error) {
      console.error('[useVoiceCall] Erro ao criar toque:', error);
      return null;
    }
  }, []);

  // Função para iniciar toque com Web Audio API
  const startWebAudioRingtone = useCallback(() => {
    try {
      // Resetar flag quando iniciar
      isStoppingRingtoneRef.current = false;
      
      // Tocar toque em loop usando interval
      const playTone = () => {
        // Verificar se estamos parando OU se o intervalo foi limpo
        if (isStoppingRingtoneRef.current || !ringtoneIntervalRef.current) {
          console.log('[useVoiceCall] [startWebAudioRingtone] [playTone] Ignorando criação de novo toque (estamos parando ou intervalo foi limpo)');
          return;
        }
        
        console.log('[useVoiceCall] [startWebAudioRingtone] [playTone] Criando novo toque (intervalo ativo)');
        
        try {
          const ringtone = createRingtone();
          if (ringtone) {
            const { audioContext, oscillator1, oscillator2 } = ringtone;
            
            // Verificar se estamos parando antes de iniciar os osciladores
            if (isStoppingRingtoneRef.current) {
              // Se estamos parando, parar os osciladores imediatamente e limpar
              try {
                oscillator1.stop(0);
                oscillator2.stop(0);
                // Remover do Set já que não vamos usá-los
                activeOscillatorsRef.current.delete(oscillator1);
                activeOscillatorsRef.current.delete(oscillator2);
                activeAudioContextsRef.current.delete(audioContext);
                audioContext.close().catch(() => {});
              } catch (e) {
                // Ignorar erros
              }
              return;
            }
            
            // Iniciar os osciladores apenas se não estivermos parando
            console.log('[useVoiceCall] [startWebAudioRingtone] Iniciando osciladores:', {
              audioContextState: audioContext.state,
              currentTime: audioContext.currentTime,
              oscillatorsCount: activeOscillatorsRef.current.size,
              gainNodesCount: activeGainNodesRef.current.size,
              contextsCount: activeAudioContextsRef.current.size
            });
            oscillator1.start();
            oscillator2.start();
            oscillator1.stop(audioContext.currentTime + 0.4);
            oscillator2.stop(audioContext.currentTime + 0.4);
            console.log('[useVoiceCall] [startWebAudioRingtone] Osciladores iniciados e agendados para parar em', audioContext.currentTime + 0.4);
          }
        } catch (error) {
          console.error('[useVoiceCall] Erro ao tocar toque:', error);
        }
      };

      // Tocar a cada 2 segundos (0.4s de toque, 1.6s de pausa)
      console.log('[useVoiceCall] [startWebAudioRingtone] Configurando intervalo de 2000ms');
      ringtoneIntervalRef.current = setInterval(playTone, 2000);
      console.log('[useVoiceCall] [startWebAudioRingtone] Intervalo configurado, tocando imediatamente');
      playTone(); // Tocar imediatamente
    } catch (error) {
      console.error('[useVoiceCall] Erro ao iniciar Web Audio ringtone:', error);
    }
  }, [createRingtone]);

  // Tocar som de toque
  const playRingtone = useCallback(() => {
    console.log('[useVoiceCall] [playRingtone] Iniciando som de toque');
    try {
      // Parar qualquer toque anterior
      stopRingtone();

      // Tentar usar arquivo de áudio primeiro (se existir)
      const audioFile = '/ringtone.mp3'; // Você pode adicionar um arquivo de áudio aqui
      
      // Criar elemento de áudio
      const audio = new Audio();
      
      // Configurar eventos de erro para não interromper o fluxo
      audio.addEventListener('error', () => {
        // Se falhar ao carregar arquivo, usar Web Audio API
        console.log('[useVoiceCall] Arquivo de áudio não encontrado, usando Web Audio API');
        startWebAudioRingtone();
      });

      // Tentar carregar arquivo, se falhar usar Web Audio API
      audio.src = audioFile;
      audio.loop = true;
      audio.volume = 0.5;

      // Tentar tocar arquivo de áudio
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Arquivo de áudio funcionou
            ringtoneAudioRef.current = audio;
          })
          .catch((error) => {
            // Se falhar ao tocar (autoplay bloqueado ou arquivo não existe), usar Web Audio API
            console.log('[useVoiceCall] Não foi possível tocar arquivo de áudio, usando Web Audio API:', error);
            startWebAudioRingtone();
          });
      } else {
        // Se play() não retornar promise, tentar Web Audio API
        startWebAudioRingtone();
      }
    } catch (error) {
      // Se houver qualquer erro, apenas logar e não interromper a chamada
      console.error('[useVoiceCall] Erro ao tocar som de toque:', error);
    }
  }, [stopRingtone, startWebAudioRingtone]);

  // Controlar som de toque baseado no status da chamada
  useEffect(() => {
    try {
      // Só tocar som se houver uma chamada ativa (com roomId) e status for 'ringing'
      if (callState.status === 'ringing' && callState.roomId) {
        // Usar setTimeout para garantir que não interfira com o fluxo da chamada
        const timeoutId = setTimeout(() => {
          try {
            playRingtone();
          } catch (error) {
            console.error('[useVoiceCall] Erro ao tocar som de toque:', error);
          }
        }, 100);
        
        // Cleanup: parar som se o status mudar antes do timeout
        return () => {
          clearTimeout(timeoutId);
          stopRingtone();
        };
      } else {
        // Parar som imediatamente se não estiver em 'ringing'
        stopRingtone();
      }
    } catch (error) {
      // Se houver erro ao tocar som, apenas logar e não interromper a chamada
      console.error('[useVoiceCall] Erro ao controlar som de toque:', error);
      // Garantir que o som pare mesmo em caso de erro
      stopRingtone();
    }

    // Cleanup ao desmontar - sempre parar o som
    return () => {
      try {
        stopRingtone();
      } catch (error) {
        console.error('[useVoiceCall] Erro ao parar som de toque:', error);
      }
    };
  }, [callState.status, callState.roomId, playRingtone, stopRingtone]);

  // Limpar recursos
  const cleanup = useCallback(() => {
    stopRingtone();

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject = null;
      remoteAudioRef.current = null;
    }

    roomIdRef.current = null;
    pendingCallRef.current = null; // Limpar chamada pendente
  }, [stopRingtone]);

  // Iniciar chamada
  const startCall = useCallback(
    async (receiverId: string) => {
      const activeSocket = activeSocketRef.current || socket;
      if (!activeSocket || !activeSocket.connected) {
        console.error('[useVoiceCall] Socket não conectado para iniciar chamada');
        throw new Error('Socket não conectado');
      }

      try {
        // Limpar erro anterior
        setCallState((prev) => ({
          ...prev,
          status: 'initiating',
          receiverId: null, // Não definir receiverId aqui, será definido quando receber call:incoming
          error: null,
        }));

        // 1. Solicitar acesso ao microfone
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });

        // 2. Criar PeerConnection
        console.log('[useVoiceCall] Criando PeerConnection com configuração:', RTC_CONFIG);
        peerConnectionRef.current = new RTCPeerConnection(RTC_CONFIG);

        // Configurar listeners de conexão para debug
        peerConnectionRef.current.onconnectionstatechange = () => {
          const state = peerConnectionRef.current?.connectionState;
          console.log('[useVoiceCall] Estado da conexão mudou:', state);
          if (state === 'failed' || state === 'disconnected') {
            console.error('[useVoiceCall] Conexão WebRTC falhou ou desconectou:', state);
          }
        };

        peerConnectionRef.current.oniceconnectionstatechange = () => {
          const state = peerConnectionRef.current?.iceConnectionState;
          console.log('[useVoiceCall] Estado ICE mudou:', state);
          if (state === 'failed') {
            console.error('[useVoiceCall] ❌ Conexão ICE falhou - tentando reiniciar ICE...');
            // Tentar reiniciar ICE gathering
            if (peerConnectionRef.current) {
              try {
                peerConnectionRef.current.restartIce();
                console.log('[useVoiceCall] Reinício de ICE iniciado');
              } catch (error) {
                console.error('[useVoiceCall] Erro ao reiniciar ICE:', error);
              }
            }
          } else if (state === 'connected' || state === 'completed') {
            console.log('[useVoiceCall] ✅ Conexão ICE estabelecida com sucesso!');
          } else if (state === 'disconnected') {
            console.warn('[useVoiceCall] ⚠️ Conexão ICE desconectada - tentando reconectar...');
          }
        };

        peerConnectionRef.current.onicegatheringstatechange = () => {
          console.log('[useVoiceCall] Estado de coleta ICE:', peerConnectionRef.current?.iceGatheringState);
        };

        // 3. Adicionar stream local
        localStreamRef.current.getTracks().forEach((track) => {
          if (peerConnectionRef.current) {
            peerConnectionRef.current.addTrack(track, localStreamRef.current!);
            console.log('[useVoiceCall] Track local adicionado:', track.kind, track.id);
          }
        });

        // 4. Configurar ICE candidates
        peerConnectionRef.current.onicecandidate = (event) => {
          if (event.candidate) {
            const candidateType = event.candidate.type; // 'host', 'srflx', 'prflx', 'relay'
            const isRelay = candidateType === 'relay';
            console.log('[useVoiceCall] ICE candidate encontrado:', {
              type: candidateType,
              protocol: event.candidate.protocol,
              address: event.candidate.address,
              port: event.candidate.port,
              isRelay: isRelay,
              priority: event.candidate.priority,
            });
            
            // Log especial para relay (TURN) - importante para produção
            if (isRelay) {
              console.log('[useVoiceCall] ✅ Usando TURN server (relay) - necessário para produção!');
            }
            
            if (roomIdRef.current) {
              const activeSocket = activeSocketRef.current || socket;
              if (activeSocket) {
                activeSocket.emit('call:ice-candidate', {
                  roomId: roomIdRef.current,
                  candidate: event.candidate.toJSON(),
                });
              }
            }
          } else {
            console.log('[useVoiceCall] Coleta de ICE candidates concluída');
            // Verificar se temos candidates relay após um pequeno delay
            setTimeout(() => {
              if (peerConnectionRef.current) {
                peerConnectionRef.current.getStats().then((stats) => {
                  let hasRelay = false;
                  let relayCandidates: any[] = [];
                  let hostCandidates = 0;
                  let srflxCandidates = 0;
                  
                  stats.forEach((report) => {
                    if (report.type === 'local-candidate') {
                      if (report.candidateType === 'relay') {
                        hasRelay = true;
                        relayCandidates.push({
                          protocol: report.protocol,
                          address: report.address,
                          port: report.port,
                        });
                      } else if (report.candidateType === 'host') {
                        hostCandidates++;
                      } else if (report.candidateType === 'srflx') {
                        srflxCandidates++;
                      }
                    }
                  });
                  
                  console.log('[useVoiceCall] Estatísticas de candidates:', {
                    host: hostCandidates,
                    srflx: srflxCandidates,
                    relay: relayCandidates.length,
                    relayDetails: relayCandidates,
                  });
                  
                  if (hasRelay) {
                    console.log('[useVoiceCall] ✅ TURN server (relay) disponível na conexão!');
                  } else {
                    console.error('[useVoiceCall] ❌ NENHUM candidate relay encontrado!');
                    console.error('[useVoiceCall] ⚠️ A conexão provavelmente falhará em produção sem TURN servers.');
                    console.error('[useVoiceCall] Verifique se os TURN servers estão acessíveis e configurados corretamente.');
                  }
                }).catch((error) => {
                  console.error('[useVoiceCall] Erro ao obter stats:', error);
                });
              }
            }, 2000); // Aguardar 2 segundos para garantir que todos os candidates foram coletados
          }
        };

        // 5. Configurar stream remoto
        peerConnectionRef.current.ontrack = (event) => {
          console.log('[useVoiceCall] Stream remoto recebido:', {
            streams: event.streams.length,
            trackKind: event.track.kind,
            trackId: event.track.id,
          });
          if (event.streams[0]) {
            remoteAudioRef.current = new Audio();
            remoteAudioRef.current.srcObject = event.streams[0];
            remoteAudioRef.current.play().catch((error) => {
              console.error('[useVoiceCall] Erro ao reproduzir áudio remoto:', error);
            });
            console.log('[useVoiceCall] Áudio remoto configurado e reproduzindo');
          }
        };

        // 6. Criar offer
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);

        // 7. Iniciar chamada via WebSocket
        console.log('[useVoiceCall] Enviando call:initiate para receiverId:', receiverId);
        activeSocket.emit('call:initiate', { receiverId }, (response: CallInitiateResponse) => {
          console.log('[useVoiceCall] Resposta do call:initiate:', response);
          if (response.success && response.roomId) {
            const roomId = response.roomId;
            roomIdRef.current = roomId;
            
            setCallState((prev) => ({
              ...prev,
              status: 'ringing',
              roomId: roomId,
              callerId: currentUserIdRef.current,
              receiverId: null, // Não definir receiverId aqui, será definido quando receber call:incoming
              error: null,
            }));

            // 8. Enviar offer
            console.log('[useVoiceCall] Enviando call:offer com roomId:', roomId);
            activeSocket.emit('call:offer', {
              roomId: roomId,
              offer: offer,
            });
          } else {
            const errorMessage = response.error || 'Erro ao iniciar chamada';
            
            // Se o erro for "Usuário offline", permitir a chamada continuar (como Discord)
            // A chamada ficará tocando e o usuário poderá atender quando entrar online
            if (errorMessage.toLowerCase().includes('offline') || errorMessage.toLowerCase().includes('usuário offline')) {
              console.log('[useVoiceCall] Usuário offline, mas permitindo chamada continuar (como Discord)');
              
              // Armazenar chamada pendente para tentar novamente quando o usuário entrar online
              pendingCallRef.current = {
                receiverId: receiverId,
                offer: offer,
              };
              
              // Criar um roomId temporário para manter a chamada ativa
              // O backend pode não ter criado o room, mas vamos manter o estado de "ringing"
              const tempRoomId = `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              roomIdRef.current = tempRoomId;
              
              setCallState((prev) => ({
                ...prev,
                status: 'ringing',
                roomId: tempRoomId,
                callerId: currentUserIdRef.current,
                receiverId: receiverId, // Armazenar receiverId para referência
                error: null, // Não mostrar como erro
              }));

              // Tentar reenviar a chamada periodicamente (a cada 5 segundos)
              const retryInterval = setInterval(() => {
                const activeSocket = activeSocketRef.current || socket;
                if (activeSocket && activeSocket.connected && pendingCallRef.current) {
                  console.log('[useVoiceCall] Tentando reenviar chamada para usuário que estava offline...');
                  activeSocket.emit('call:initiate', { receiverId: pendingCallRef.current.receiverId }, (retryResponse: CallInitiateResponse) => {
                    if (retryResponse.success && retryResponse.roomId) {
                      const newRoomId = retryResponse.roomId; // TypeScript agora sabe que é string
                      console.log('[useVoiceCall] Usuário entrou online! Chamada criada:', newRoomId);
                      clearInterval(retryInterval);
                      
                      // Salvar offer antes de limpar pendingCallRef
                      const offerToSend = pendingCallRef.current?.offer || offer;
                      const savedReceiverId = pendingCallRef.current?.receiverId;
                      pendingCallRef.current = null;
                      
                      roomIdRef.current = newRoomId;
                      
                      setCallState((prev) => ({
                        ...prev,
                        roomId: newRoomId,
                      }));

                      // Enviar offer com o roomId correto
                      activeSocket.emit('call:offer', {
                        roomId: newRoomId,
                        offer: offerToSend,
                      });
                    }
                  });
                } else {
                  clearInterval(retryInterval);
                }
              }, 5000);

              // Limpar intervalo quando a chamada for aceita ou encerrada
              setTimeout(() => {
                clearInterval(retryInterval);
              }, 60000); // Parar de tentar após 1 minuto
            } else {
              // Para outros erros, mostrar normalmente
              console.warn('[useVoiceCall] Erro ao iniciar chamada:', errorMessage);
              
              // Limpar recursos antes de atualizar o estado
              cleanup();
              
              setCallState((prev) => ({
                ...prev,
                status: 'idle',
                error: errorMessage,
              }));
            }
          }
        });
      } catch (error) {
        console.error('Erro ao iniciar chamada:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao iniciar chamada';
        
        cleanup();
        
        setCallState((prev) => ({
          ...prev,
          status: 'idle',
          error: errorMessage,
        }));
      }
    },
    [socket, cleanup]
  );

  // Aceitar chamada recebida
  const acceptCall = useCallback(
    async (roomId: string) => {
      const activeSocket = activeSocketRef.current || socket;
      if (!activeSocket || !activeSocket.connected) {
        console.error('[useVoiceCall] Socket não conectado para aceitar chamada');
        throw new Error('Socket não conectado');
      }

      try {
        roomIdRef.current = roomId;
        
        // 1. Solicitar acesso ao microfone
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });

        // 2. Criar PeerConnection
        console.log('[useVoiceCall] Criando PeerConnection (aceitar chamada) com configuração:', RTC_CONFIG);
        peerConnectionRef.current = new RTCPeerConnection(RTC_CONFIG);

        // Configurar listeners de conexão para debug
        peerConnectionRef.current.onconnectionstatechange = () => {
          const state = peerConnectionRef.current?.connectionState;
          console.log('[useVoiceCall] Estado da conexão mudou (aceitar):', state);
          if (state === 'failed' || state === 'disconnected') {
            console.error('[useVoiceCall] Conexão WebRTC falhou ou desconectou (aceitar):', state);
          }
        };

        peerConnectionRef.current.oniceconnectionstatechange = () => {
          const state = peerConnectionRef.current?.iceConnectionState;
          console.log('[useVoiceCall] Estado ICE mudou (aceitar):', state);
          if (state === 'failed') {
            console.error('[useVoiceCall] ❌ Conexão ICE falhou (aceitar) - tentando reiniciar ICE...');
            // Tentar reiniciar ICE gathering
            if (peerConnectionRef.current) {
              try {
                peerConnectionRef.current.restartIce();
                console.log('[useVoiceCall] Reinício de ICE iniciado (aceitar)');
              } catch (error) {
                console.error('[useVoiceCall] Erro ao reiniciar ICE (aceitar):', error);
              }
            }
          } else if (state === 'connected' || state === 'completed') {
            console.log('[useVoiceCall] ✅ Conexão ICE estabelecida com sucesso (aceitar)!');
          } else if (state === 'disconnected') {
            console.warn('[useVoiceCall] ⚠️ Conexão ICE desconectada (aceitar) - tentando reconectar...');
          }
        };

        peerConnectionRef.current.onicegatheringstatechange = () => {
          console.log('[useVoiceCall] Estado de coleta ICE (aceitar):', peerConnectionRef.current?.iceGatheringState);
        };

        // 3. Adicionar stream local
        localStreamRef.current.getTracks().forEach((track) => {
          if (peerConnectionRef.current) {
            peerConnectionRef.current.addTrack(track, localStreamRef.current!);
            console.log('[useVoiceCall] Track local adicionado (aceitar):', track.kind, track.id);
          }
        });

        // 4. Configurar ICE candidates
        peerConnectionRef.current.onicecandidate = (event) => {
          if (event.candidate) {
            const candidateType = event.candidate.type; // 'host', 'srflx', 'prflx', 'relay'
            const isRelay = candidateType === 'relay';
            console.log('[useVoiceCall] ICE candidate encontrado (aceitar):', {
              type: candidateType,
              protocol: event.candidate.protocol,
              address: event.candidate.address,
              port: event.candidate.port,
              isRelay: isRelay,
              priority: event.candidate.priority,
            });
            
            // Log especial para relay (TURN) - importante para produção
            if (isRelay) {
              console.log('[useVoiceCall] ✅ Usando TURN server (relay) - necessário para produção! (aceitar)');
            }
            
            const activeSocket = activeSocketRef.current || socket;
            if (activeSocket) {
              activeSocket.emit('call:ice-candidate', {
                roomId,
                candidate: event.candidate.toJSON(),
              });
            }
          } else {
            console.log('[useVoiceCall] Coleta de ICE candidates concluída (aceitar)');
            // Verificar se temos candidates relay após um pequeno delay
            setTimeout(() => {
              if (peerConnectionRef.current) {
                peerConnectionRef.current.getStats().then((stats) => {
                  let hasRelay = false;
                  let relayCandidates: any[] = [];
                  let hostCandidates = 0;
                  let srflxCandidates = 0;
                  
                  stats.forEach((report) => {
                    if (report.type === 'local-candidate') {
                      if (report.candidateType === 'relay') {
                        hasRelay = true;
                        relayCandidates.push({
                          protocol: report.protocol,
                          address: report.address,
                          port: report.port,
                        });
                      } else if (report.candidateType === 'host') {
                        hostCandidates++;
                      } else if (report.candidateType === 'srflx') {
                        srflxCandidates++;
                      }
                    }
                  });
                  
                  console.log('[useVoiceCall] Estatísticas de candidates (aceitar):', {
                    host: hostCandidates,
                    srflx: srflxCandidates,
                    relay: relayCandidates.length,
                    relayDetails: relayCandidates,
                  });
                  
                  if (hasRelay) {
                    console.log('[useVoiceCall] ✅ TURN server (relay) disponível na conexão (aceitar)!');
                  } else {
                    console.error('[useVoiceCall] ❌ NENHUM candidate relay encontrado (aceitar)!');
                    console.error('[useVoiceCall] ⚠️ A conexão provavelmente falhará em produção sem TURN servers.');
                    console.error('[useVoiceCall] Verifique se os TURN servers estão acessíveis e configurados corretamente.');
                  }
                }).catch((error) => {
                  console.error('[useVoiceCall] Erro ao obter stats (aceitar):', error);
                });
              }
            }, 2000); // Aguardar 2 segundos para garantir que todos os candidates foram coletados
          }
        };

        // 5. Configurar stream remoto
        peerConnectionRef.current.ontrack = (event) => {
          console.log('[useVoiceCall] Stream remoto recebido (aceitar):', {
            streams: event.streams.length,
            trackKind: event.track.kind,
            trackId: event.track.id,
          });
          if (event.streams[0]) {
            remoteAudioRef.current = new Audio();
            remoteAudioRef.current.srcObject = event.streams[0];
            remoteAudioRef.current.play().catch((error) => {
              console.error('[useVoiceCall] Erro ao reproduzir áudio remoto (aceitar):', error);
            });
            console.log('[useVoiceCall] Áudio remoto configurado e reproduzindo (aceitar)');
          }
        };

        // 6. Processar o offer pendente se existir
        const pendingOffer = pendingOfferRef.current;
        if (pendingOffer && peerConnectionRef.current) {
          console.log('[useVoiceCall] Processando offer pendente:', pendingOffer);
          try {
            await peerConnectionRef.current.setRemoteDescription(
              new RTCSessionDescription(pendingOffer.offer)
            );

            // Criar answer
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);

            // Enviar answer
            console.log('[useVoiceCall] Enviando answer após aceitar chamada');
            activeSocket.emit('call:accept', {
              roomId: pendingOffer.roomId,
              answer: answer,
            });

            // Limpar offer pendente
            pendingOfferRef.current = null;
          } catch (error) {
            console.error('[useVoiceCall] Erro ao processar offer pendente:', error);
            throw error;
          }
        }

        // 7. Atualizar estado para active
        setCallState((prev) => ({
          ...prev,
          status: 'active',
        }));
      } catch (error) {
        console.error('[useVoiceCall] Erro ao aceitar chamada:', error);
        cleanup();
        throw error;
      }
    },
    [socket, cleanup]
  );

  // Rejeitar chamada
  const rejectCall = useCallback(
    (roomId: string) => {
      // Parar som imediatamente ao rejeitar
      stopRingtone();
      
      const activeSocket = activeSocketRef.current || socket;
      if (!activeSocket || !activeSocket.connected) {
        // Mesmo sem socket, limpar estado e recursos
        setCallState({
          status: 'idle',
          roomId: null,
          callerId: null,
          receiverId: null,
          isLocalAudioEnabled: true,
          isRemoteAudioEnabled: true,
          error: null,
        });
        cleanup();
        return;
      }

      console.log('[useVoiceCall] Rejeitando chamada, roomId:', roomId);
      pendingOfferRef.current = null;
      activeSocket.emit('call:reject', { roomId });
      setCallState({
        status: 'idle',
        roomId: null,
        callerId: null,
        receiverId: null,
        isLocalAudioEnabled: true,
        isRemoteAudioEnabled: true,
        error: null,
      });
      cleanup();
    },
    [socket, cleanup, stopRingtone]
  );

  // Encerrar chamada
  const endCall = useCallback(() => {
    // Primeiro: atualizar estado para 'idle' imediatamente (isso fará o useEffect parar o som)
    setCallState({
      status: 'idle',
      roomId: null,
      callerId: null,
      receiverId: null,
      isLocalAudioEnabled: true,
      isRemoteAudioEnabled: true,
      error: null,
    });
    
    // Segundo: parar som imediatamente (múltiplas camadas de proteção)
    stopRingtone();
    
    // Terceiro: limpar recursos
    cleanup();
    
    // Quarto: notificar backend (não bloqueia a parada do som)
    const activeSocket = activeSocketRef.current || socket;
    if (activeSocket && activeSocket.connected && callState.roomId) {
      activeSocket.emit('call:end', { roomId: callState.roomId });
    }
  }, [socket, callState.roomId, cleanup, stopRingtone]);

  // Alternar áudio local (mute/unmute)
  const toggleLocalAudio = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setCallState((prev) => ({
        ...prev,
        isLocalAudioEnabled: !prev.isLocalAudioEnabled,
      }));
    }
  }, []);

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    callState,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleLocalAudio,
  };
}

