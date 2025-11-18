"use client";

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { env } from '@/lib/env';
import toast from 'react-hot-toast';

export interface Notification {
  id: string;
  type: 'FRIEND_REQUEST' | 'FRIEND_ACCEPTED' | 'FRIEND_REQUEST_REJECTED' | 'FRIEND_REMOVED';
  title: string;
  message: string;
  relatedUserId?: string;
  relatedEntityId?: string;
  requester?: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
  receiver?: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
  friendship?: {
    id: string;
    userId1: string;
    userId2: string;
    createdAt: string;
  };
  createdAt: string;
  read?: boolean;
}

export interface FriendRequestRejectedData {
  friendRequestId: string;
  receiverId: string;
  receiver: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
  rejectedAt: string;
}

export function useNotifications() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Verificar se estamos no cliente
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('auth_token');
    if (!token) {
      return;
    }

    // Se já existe uma conexão, não criar outra
    if (socketRef.current?.connected) {
      return;
    }

    
    // Conectar ao WebSocket
    let apiUrl = env.NEXT_PUBLIC_API_URL;
    if (apiUrl.startsWith('https://')) {
      apiUrl = apiUrl.replace('https://', '');
    } else if (apiUrl.startsWith('http://')) {
      apiUrl = apiUrl.replace('http://', '');
    }
    const wsProtocol = env.NEXT_PUBLIC_API_URL.startsWith('https') ? 'wss' : 'ws';
    const socketUrl = `${wsProtocol}://${apiUrl}/notifications`;

    // Opção 1: Header Authorization (recomendado)
    const newSocket = io(socketUrl, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      // Opção 3: Auth object (fallback caso o backend não suporte extraHeaders)
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Evento de conexão
    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    // Evento de desconexão
    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      
      // Se foi desconectado pelo servidor, pode ser problema de autenticação
      if (reason === 'io server disconnect') {
      }
    });

    // Erro de conexão
    newSocket.on('connect_error', (error) => {
      setIsConnected(false);
    });

    // Evento quando conectado com sucesso (autenticado)
    newSocket.on('connected', (data: { userId: string }) => {
    });
    
    // Log de todos os eventos recebidos para debug
    newSocket.onAny((eventName, ...args) => {
    });

    // Receber pedido de amizade
    newSocket.on('friend_request', (data: Notification) => {
      
      const notification: Notification = {
        ...data,
        read: false,
      };
      
      // Verificar se já existe uma notificação com o mesmo relatedEntityId para evitar duplicatas
      setNotifications((prev) => {
        const alreadyExists = prev.some(
          (notif) => 
            notif.type === 'FRIEND_REQUEST' && 
            notif.relatedEntityId === notification.relatedEntityId
        );
        
        if (alreadyExists) {
          return prev;
        }
        
        // Incrementar contador apenas se for uma nova notificação
        setUnreadCount((prev) => prev + 1);
        return [notification, ...prev];
      });
      
      toast.success(data.message, {
        duration: 5000,
        icon: '👋',
      });
    });

    // Receber confirmação de aceitação
    newSocket.on('friend_accepted', (data: Notification) => {
      
      const notification: Notification = {
        ...data,
        read: false,
      };
      
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      toast.success(data.message, {
        duration: 5000,
        icon: '🎉',
      });
    });

    // Receber confirmação de rejeição
    newSocket.on('friend_request_rejected', (data: FriendRequestRejectedData) => {
      
      const notification: Notification = {
        id: `rejected-${data.friendRequestId}`,
        type: 'FRIEND_REQUEST_REJECTED',
        title: 'Pedido de amizade rejeitado',
        message: `${data.receiver.name} rejeitou seu pedido de amizade`,
        relatedUserId: data.receiverId,
        relatedEntityId: data.friendRequestId,
        receiver: data.receiver,
        createdAt: data.rejectedAt,
        read: false,
      };
      
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      toast.error(notification.message, {
        duration: 5000,
        icon: '😔',
      });
    });

    // Receber confirmação de remoção de amizade
    // NOTA: Não mostra notificação global aqui - apenas o ProfilePage mostra se o usuário estiver visualizando o perfil
    newSocket.on('friend_removed', (data: { userId: string; friendId: string; friendName: string; removedAt: string }) => {
      // Não criar notificação global - apenas o ProfilePage/FriendRequestButton tratarão isso
    });

    // Ping/Pong para manter conexão viva
    newSocket.on('pong', (data: { event: string; data: { timestamp: string } }) => {
    });

    setSocket(newSocket);
    socketRef.current = newSocket;

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.close();
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (notificationId: string) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
      }
      return prev.filter((n) => n.id !== notificationId);
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    socket,
    isConnected,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  };
}

