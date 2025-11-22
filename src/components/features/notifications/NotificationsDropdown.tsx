"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, X, UserPlus, Check, XCircle, Clock } from 'lucide-react';
import { useNotificationsContext } from '@/contexts/NotificationsContext';
import { acceptFriendRequest } from '@/api/friends/accept-friend-request';
import { rejectFriendRequest } from '@/api/friends/reject-friend-request';
import { getFriendRequests, FriendRequestItem } from '@/api/friends/get-friend-requests';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import toast from 'react-hot-toast';
import { Notification } from '@/hooks/features/notifications/useNotifications';

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendRequestItem[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    socket,
    isConnected,
  } = useNotificationsContext();
  const router = useRouter();

  const loadFriendRequests = useCallback(async () => {
    setIsLoadingRequests(true);
    try {
      const response = await getFriendRequests('received');
      
      // Filtrar apenas pedidos pendentes
      const pendingRequests = (response.data.requests || []).filter(
        (req) => req.status === 'PENDING'
      );
      
      setFriendRequests(pendingRequests);
      
      // Atualizar contador de não lidas se houver pedidos pendentes
      if (pendingRequests.length > 0) {
      }
    } catch (error) {
    } finally {
      setIsLoadingRequests(false);
    }
  }, []);

  // Carregar pedidos de amizade ao montar o componente
  useEffect(() => {
    loadFriendRequests();
  }, [loadFriendRequests]);

  // Recarregar pedidos quando abrir o dropdown
  useEffect(() => {
    if (isOpen) {
      loadFriendRequests();
    }
  }, [isOpen, loadFriendRequests]);

  // Escutar eventos do WebSocket para atualizar pedidos em tempo real
  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleFriendRequest = () => {
      loadFriendRequests();
    };

    const handleFriendRemoved = () => {
      loadFriendRequests();
    };

    const handleFriendAccepted = () => {
      loadFriendRequests();
    };

    // Escutar eventos de amizade
    socket.on('friend_request', handleFriendRequest);
    socket.on('friend_removed', handleFriendRemoved);
    socket.on('friend_accepted', handleFriendAccepted);

    // Log quando socket conectar
    socket.on('connect', () => {
    });

    // Log quando socket desconectar
    socket.on('disconnect', (reason) => {
    });

    // Log quando autenticado
    socket.on('connected', (data: { userId: string }) => {
    });

    return () => {
      socket.off('friend_request', handleFriendRequest);
      socket.off('friend_removed', handleFriendRemoved);
      socket.off('friend_accepted', handleFriendAccepted);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connected');
    };
  }, [socket, loadFriendRequests, isConnected]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAcceptFriendRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      toast.success('Pedido de amizade aceito!');
      // Remover da lista e recarregar
      setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
      await loadFriendRequests();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aceitar pedido de amizade');
    }
  };

  const handleRejectFriendRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      toast.success('Pedido de amizade rejeitado');
      // Remover da lista e recarregar
      setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
      await loadFriendRequests();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao rejeitar pedido de amizade');
    }
  };

  const handleAcceptFromNotification = async (notification: Notification) => {
    if (!notification.relatedEntityId) return;

    try {
      await acceptFriendRequest(notification.relatedEntityId);
      markAsRead(notification.id);
      toast.success('Pedido de amizade aceito!');
      removeNotification(notification.id);
      // Recarregar pedidos
      await loadFriendRequests();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aceitar pedido de amizade');
    }
  };

  const handleRejectFromNotification = async (notification: Notification) => {
    if (!notification.relatedEntityId) return;

    try {
      await rejectFriendRequest(notification.relatedEntityId);
      markAsRead(notification.id);
      toast.success('Pedido de amizade rejeitado');
      removeNotification(notification.id);
      // Recarregar pedidos
      await loadFriendRequests();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao rejeitar pedido de amizade');
    }
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.relatedUserId) {
      router.push(`/profile?userId=${notification.relatedUserId}`);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'FRIEND_REQUEST':
        return <UserPlus className="w-4 h-4 text-blue-400" />;
      case 'FRIEND_ACCEPTED':
        return <Check className="w-4 h-4 text-[#c532e2]" />;
      case 'FRIEND_REQUEST_REJECTED':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            markAllAsRead();
          }
        }}
        className="w-12 h-12 rounded-full flex items-center justify-center transition-colors hover:bg-[#3a3a3a] cursor-pointer relative"
        style={{ background: 'rgb(30, 30, 30)' }}
      >
        <Bell className="w-5 h-5 text-gray-400" />
        {/* Bolinha verde animada quando há pedidos de amizade */}
        {friendRequests.length > 0 && (
          <>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#bd18b4] rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#bd18b4] rounded-full"></span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-14 w-96 bg-[rgb(30,30,30)] border border-white/10 rounded-xl shadow-2xl z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-white font-semibold text-lg">Notificações</h3>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  removeNotification('all');
                  setIsOpen(false);
                }}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Limpar todas
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {/* Loading state */}
            {isLoadingRequests && (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bd18b4] mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Carregando pedidos...</p>
              </div>
            )}

            {/* Pedidos de Amizade Recebidos */}
            {!isLoadingRequests && friendRequests.length > 0 && (
              <div className="p-3 border-b border-white/10">
                <h4 className="text-white/60 text-xs font-semibold mb-2 uppercase tracking-wider">
                  Pedidos de Amizade ({friendRequests.length})
                </h4>
                <div className="space-y-2">
                  {friendRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="flex gap-3">
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarImage
                            src={request.requesterProfileImage || undefined}
                            alt={request.requesterName}
                          />
                          <AvatarFallback className="bg-[#bd18b4] text-black text-xs">
                            {request.requesterName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm mb-1">
                            {request.requesterName}
                          </p>
                          <p className="text-gray-400 text-xs mb-2">
                            Enviou um pedido de amizade
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptFriendRequest(request.id)}
                              className="flex-1 px-3 py-1.5 bg-[#bd18b4]/20 hover:bg-[#bd18b4]/30 text-[#c532e2] rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Aceitar
                            </button>
                            <button
                              onClick={() => handleRejectFriendRequest(request.id)}
                              className="flex-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Rejeitar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notificações em Tempo Real */}
            {notifications
              .filter((notification) => {
                // NÃO mostrar notificações de pedido de amizade aqui - elas já aparecem na seção "Pedidos de Amizade"
                if (notification.type === 'FRIEND_REQUEST') {
                  return false;
                }
                return true;
              })
              .length > 0 && (
              <div className="divide-y divide-white/5">
                {notifications
                  .filter((notification) => notification.type !== 'FRIEND_REQUEST')
                  .map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-white/5 transition-colors ${
                      !notification.read ? 'bg-blue-500/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Avatar */}
                      {notification.requester?.profileImage || notification.receiver?.profileImage ? (
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarImage
                            src={
                              notification.requester?.profileImage ||
                              notification.receiver?.profileImage ||
                              undefined
                            }
                            alt={notification.requester?.name || notification.receiver?.name || 'User'}
                          />
                          <AvatarFallback className="bg-[#bd18b4] text-black text-xs">
                            {(notification.requester?.name || notification.receiver?.name || 'U')
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#bd18b4] flex items-center justify-center shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm mb-1">
                              {notification.title}
                            </p>
                            <p className="text-gray-400 text-xs mb-2">{notification.message}</p>
                            <p className="text-gray-500 text-xs">
                              {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1" />
                          )}
                        </div>

                        {/* Actions for friend requests */}
                        {notification.type === 'FRIEND_REQUEST' && notification.requester && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleAcceptFromNotification(notification)}
                              className="flex-1 px-3 py-1.5 bg-[#bd18b4]/20 hover:bg-[#bd18b4]/30 text-[#c532e2] rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Aceitar
                            </button>
                            <button
                              onClick={() => handleRejectFromNotification(notification)}
                              className="flex-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Rejeitar
                            </button>
                          </div>
                        )}

                        {/* Click to view profile */}
                        {notification.relatedUserId && (
                          <button
                            onClick={() => handleNotificationClick(notification)}
                            className="mt-2 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                          >
                            Ver perfil →
                          </button>
                        )}
                      </div>

                      {/* Close button */}
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="text-gray-500 hover:text-white transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Estado vazio */}
            {!isLoadingRequests && 
             notifications.filter(n => n.type !== 'FRIEND_REQUEST').length === 0 && 
             friendRequests.length === 0 && (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
                <p className="text-gray-400 text-sm">Nenhuma notificação</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

