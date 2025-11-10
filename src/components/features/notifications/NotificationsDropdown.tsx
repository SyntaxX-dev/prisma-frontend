"use client";

import { useState, useRef, useEffect } from 'react';
import { Bell, X, UserPlus, Check, XCircle, Clock } from 'lucide-react';
import { useNotificationsContext } from '@/contexts/NotificationsContext';
import { acceptFriendRequest } from '@/api/friends/accept-friend-request';
import { rejectFriendRequest } from '@/api/friends/reject-friend-request';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import toast from 'react-hot-toast';

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotificationsContext();
  const router = useRouter();

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

  const handleAcceptFriendRequest = async (notification: typeof notifications[0]) => {
    if (!notification.relatedEntityId) return;

    try {
      await acceptFriendRequest(notification.relatedEntityId);
      markAsRead(notification.id);
      toast.success('Pedido de amizade aceito!');
      removeNotification(notification.id);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aceitar pedido de amizade');
    }
  };

  const handleRejectFriendRequest = async (notification: typeof notifications[0]) => {
    if (!notification.relatedEntityId) return;

    try {
      await rejectFriendRequest(notification.relatedEntityId);
      markAsRead(notification.id);
      toast.success('Pedido de amizade rejeitado');
      removeNotification(notification.id);
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
        return <Check className="w-4 h-4 text-green-400" />;
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
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-14 w-96 bg-[rgb(30,30,30)] border border-white/10 rounded-xl shadow-2xl z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-semibold text-lg">Notificações</h3>
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
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
                <p className="text-gray-400 text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-white/5 transition-colors ${
                      !notification.read ? 'bg-blue-500/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Avatar */}
                      {notification.requester?.profileImage || notification.receiver?.profileImage ? (
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage
                            src={
                              notification.requester?.profileImage ||
                              notification.receiver?.profileImage ||
                              undefined
                            }
                            alt={notification.requester?.name || notification.receiver?.name || 'User'}
                          />
                          <AvatarFallback className="bg-[#C9FE02] text-black text-xs">
                            {(notification.requester?.name || notification.receiver?.name || 'U')
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#C9FE02] flex items-center justify-center flex-shrink-0">
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
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>

                        {/* Actions for friend requests */}
                        {notification.type === 'FRIEND_REQUEST' && notification.requester && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleAcceptFriendRequest(notification)}
                              className="flex-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Aceitar
                            </button>
                            <button
                              onClick={() => handleRejectFriendRequest(notification)}
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
                        className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

