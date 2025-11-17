// Tipos para status online de usuários

export interface UserStatus {
  userId: string;
  status: 'online' | 'offline';
  lastSeen: string;
}

export interface UserStatusResponse {
  success: boolean;
  data: UserStatus;
}

export interface BatchUserStatusResponse {
  success: boolean;
  data: UserStatus[];
}

// Eventos WebSocket
export interface UserStatusChangedEvent {
  userId: string;
  status: 'online' | 'offline';
  lastSeen: string;
}

