// Tipos para eventos WebSocket enviados pelo frontend
export interface CallInitiateData {
  receiverId: string; // ID do usuário que vai receber a chamada
}

export interface CallAcceptData {
  roomId: string;
  answer: RTCSessionDescriptionInit; // SDP answer do WebRTC
}

export interface CallRejectData {
  roomId: string;
}

export interface CallOfferData {
  roomId: string;
  offer: RTCSessionDescriptionInit; // SDP offer do WebRTC
}

export interface CallAnswerData {
  roomId: string;
  answer: RTCSessionDescriptionInit; // SDP answer do WebRTC
}

export interface CallIceCandidateData {
  roomId: string;
  candidate: RTCIceCandidateInit; // ICE candidate do WebRTC
}

export interface CallEndData {
  roomId: string;
}

// Tipos para eventos recebidos do backend
export interface CallIncomingEvent {
  roomId: string;
  callerId: string;
  type: 'personal'; // Sempre 'personal' para 1:1
}

export interface CallAcceptedEvent {
  roomId: string;
  answer: RTCSessionDescriptionInit;
}

export interface CallRejectedEvent {
  roomId: string;
}

export interface CallOfferEvent {
  roomId: string;
  offer: RTCSessionDescriptionInit;
}

export interface CallAnswerEvent {
  roomId: string;
  answer: RTCSessionDescriptionInit;
}

export interface CallIceCandidateEvent {
  roomId: string;
  candidate: RTCIceCandidateInit;
}

export interface CallEndedEvent {
  roomId: string;
}

// Resposta do backend para call:initiate
export interface CallInitiateResponse {
  success?: boolean;
  roomId?: string;
  error?: string;
}

// Estado da chamada
export type CallStatus = 'idle' | 'initiating' | 'ringing' | 'active' | 'ended' | 'rejected' | 'missed';

export interface VoiceCallState {
  status: CallStatus;
  roomId: string | null;
  callerId: string | null;
  receiverId: string | null;
  isLocalAudioEnabled: boolean;
  isRemoteAudioEnabled: boolean;
  callerName?: string;
  callerAvatar?: string | null;
}

