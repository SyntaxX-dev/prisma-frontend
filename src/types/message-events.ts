// Tipos para eventos WebSocket de mensagens

export interface MessageEditedEvent {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  updatedAt: string | null;
}

