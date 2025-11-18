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

// Configuração WebRTC (STUN servers gratuitos)
const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useVoiceCall(socket: Socket | null) {
  const [callState, setCallState] = useState<VoiceCallState>({
    status: 'idle',
    roomId: null,
    callerId: null,
    receiverId: null,
    isLocalAudioEnabled: true,
    isRemoteAudioEnabled: true,
  });

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const callerInfoRef = useRef<{ id: string; name: string; avatar?: string | null } | null>(null);
  const activeSocketRef = useRef<Socket | null>(null);
  const pendingOfferRef = useRef<CallOfferEvent | null>(null);

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
      setCallState((prev) => ({
        ...prev,
        status: 'ended',
      }));
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

  // Limpar recursos
  const cleanup = useCallback(() => {
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
  }, []);

  // Iniciar chamada
  const startCall = useCallback(
    async (receiverId: string) => {
      const activeSocket = activeSocketRef.current || socket;
      if (!activeSocket || !activeSocket.connected) {
        console.error('[useVoiceCall] Socket não conectado para iniciar chamada');
        throw new Error('Socket não conectado');
      }

      try {
        setCallState((prev) => ({
          ...prev,
          status: 'initiating',
          receiverId: null, // Não definir receiverId aqui, será definido quando receber call:incoming
        }));

        // 1. Solicitar acesso ao microfone
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });

        // 2. Criar PeerConnection
        peerConnectionRef.current = new RTCPeerConnection(RTC_CONFIG);

        // 3. Adicionar stream local
        localStreamRef.current.getTracks().forEach((track) => {
          if (peerConnectionRef.current) {
            peerConnectionRef.current.addTrack(track, localStreamRef.current!);
          }
        });

        // 4. Configurar ICE candidates
        peerConnectionRef.current.onicecandidate = (event) => {
          if (event.candidate && roomIdRef.current) {
            const activeSocket = activeSocketRef.current || socket;
            if (activeSocket) {
              activeSocket.emit('call:ice-candidate', {
                roomId: roomIdRef.current,
                candidate: event.candidate.toJSON(),
              });
            }
          }
        };

        // 5. Configurar stream remoto
        peerConnectionRef.current.ontrack = (event) => {
          if (event.streams[0]) {
            remoteAudioRef.current = new Audio();
            remoteAudioRef.current.srcObject = event.streams[0];
            remoteAudioRef.current.play().catch((error) => {
              console.error('Erro ao reproduzir áudio remoto:', error);
            });
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
            }));

            // 8. Enviar offer
            console.log('[useVoiceCall] Enviando call:offer com roomId:', roomId);
            activeSocket.emit('call:offer', {
              roomId: roomId,
              offer: offer,
            });
          } else {
            console.error('[useVoiceCall] Erro ao iniciar chamada:', response.error);
            setCallState((prev) => ({
              ...prev,
              status: 'idle',
            }));
            cleanup();
            throw new Error(response.error || 'Erro ao iniciar chamada');
          }
        });
      } catch (error) {
        console.error('Erro ao iniciar chamada:', error);
        setCallState((prev) => ({
          ...prev,
          status: 'idle',
        }));
        cleanup();
        throw error;
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
        peerConnectionRef.current = new RTCPeerConnection(RTC_CONFIG);

        // 3. Adicionar stream local
        localStreamRef.current.getTracks().forEach((track) => {
          if (peerConnectionRef.current) {
            peerConnectionRef.current.addTrack(track, localStreamRef.current!);
          }
        });

        // 4. Configurar ICE candidates
        peerConnectionRef.current.onicecandidate = (event) => {
          if (event.candidate) {
            const activeSocket = activeSocketRef.current || socket;
            if (activeSocket) {
              activeSocket.emit('call:ice-candidate', {
                roomId,
                candidate: event.candidate.toJSON(),
              });
            }
          }
        };

        // 5. Configurar stream remoto
        peerConnectionRef.current.ontrack = (event) => {
          if (event.streams[0]) {
            remoteAudioRef.current = new Audio();
            remoteAudioRef.current.srcObject = event.streams[0];
            remoteAudioRef.current.play().catch((error) => {
              console.error('Erro ao reproduzir áudio remoto:', error);
            });
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
      const activeSocket = activeSocketRef.current || socket;
      if (!activeSocket || !activeSocket.connected) return;

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
      });
      cleanup();
    },
    [socket, cleanup]
  );

  // Encerrar chamada
  const endCall = useCallback(() => {
    const activeSocket = activeSocketRef.current || socket;
    if (!activeSocket || !activeSocket.connected) return;

    if (callState.roomId) {
      activeSocket.emit('call:end', { roomId: callState.roomId });
    }

    setCallState({
      status: 'idle',
      roomId: null,
      callerId: null,
      receiverId: null,
      isLocalAudioEnabled: true,
      isRemoteAudioEnabled: true,
    });
    cleanup();
  }, [socket, callState.roomId, cleanup]);

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

