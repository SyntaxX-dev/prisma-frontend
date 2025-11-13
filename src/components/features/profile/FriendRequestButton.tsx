"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import ShinyText from '@/components/shared/ShinyText';
import { sendFriendRequest } from '@/api/friends/send-friend-request';
import { getFriendRequests } from '@/api/friends/get-friend-requests';
import { removeFriendship } from '@/api/friends/remove-friendship';
import toast from 'react-hot-toast';
import { useNotificationsContext } from '@/contexts/NotificationsContext';

interface FriendRequestButtonProps {
  userId: string;
  isFriend?: boolean;
}

export function FriendRequestButton({ userId, isFriend: initialIsFriend }: FriendRequestButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'accepted' | 'rejected'>('none');
  const [isChecking, setIsChecking] = useState(true);
  const [isFriend, setIsFriend] = useState(initialIsFriend ?? false);
  const { socket } = useNotificationsContext();

  const checkRequestStatus = useCallback(async () => {
    if (!userId) {
      setIsChecking(false);
      return;
    }

    try {
      // Buscar pedidos enviados e recebidos
      const [sentResponse, receivedResponse] = await Promise.all([
        getFriendRequests('sent'),
        getFriendRequests('received'),
      ]);
      
      console.log('[FriendRequestButton] Resposta completa:', { sentResponse, receivedResponse });
      console.log('[FriendRequestButton] userId sendo verificado:', userId);
      
      // Verificar se há pedido enviado para este usuário
      const sentRequest = sentResponse.data.requests?.find(
        (req) => req.receiverId === userId && req.status === 'PENDING'
      );
      
      // Verificar se há pedido recebido deste usuário
      const receivedRequest = receivedResponse.data.requests?.find(
        (req) => req.requesterId === userId && req.status === 'PENDING'
      );

      if (sentRequest) {
        setRequestStatus('pending');
      } else if (receivedRequest) {
        setRequestStatus('pending');
      } else {
        // Verificar se já são amigos (status ACCEPTED)
        const allRequests = [
          ...(sentResponse.data.requests || []),
          ...(receivedResponse.data.requests || []),
        ];
        const acceptedRequest = allRequests.find(
          (req) => 
            (req.receiverId === userId || req.requesterId === userId) && 
            req.status === 'ACCEPTED'
        );
        
        if (acceptedRequest) {
          console.log('[FriendRequestButton] ✅ Amizade encontrada, status ACCEPTED');
          setRequestStatus('accepted');
          setIsFriend(true);
        } else {
          console.log('[FriendRequestButton] ❌ Nenhuma amizade encontrada, status NONE');
          setRequestStatus('none');
          setIsFriend(false);
        }
      }
    } catch (error: any) {
      console.error('Erro ao verificar status do pedido:', error);
      setRequestStatus('none');
      setIsFriend(false);
    } finally {
      setIsChecking(false);
    }
  }, [userId]);

  // Atualizar isFriend quando a prop mudar
  useEffect(() => {
    if (initialIsFriend !== undefined) {
      setIsFriend(initialIsFriend);
      // Se isFriend for true, definir status como accepted
      if (initialIsFriend === true) {
        setRequestStatus('accepted');
        setIsChecking(false);
      } else {
        // Se for false, verificar status normalmente
        checkRequestStatus();
      }
    } else {
      // Se não foi fornecido, verificar status normalmente
      checkRequestStatus();
    }
  }, [initialIsFriend, userId, checkRequestStatus]);

  // Escutar eventos do Socket.IO para atualização em tempo real
  useEffect(() => {
    if (!socket) return;

    // Escutar quando amizade for removida - igual ao pedido de amizade
    const handleFriendRemoved = (data: { userId: string; friendId: string; friendName: string; removedAt: string }) => {
      console.log('[FriendRequestButton] 🗑️ Evento friend_removed recebido via Socket.IO:', data);
      console.log('[FriendRequestButton] 📊 Verificando se evento é relacionado ao perfil visualizado:', {
        userId: userId,
        dataUserId: data.userId,
        dataFriendId: data.friendId,
        isRelated: data.friendId === userId || data.userId === userId
      });
      
      // Se o evento é relacionado ao perfil sendo visualizado (userId), recarregar status
      // Isso garante que quando qualquer um dos dois usuários remove a amizade, ambos veem a atualização
      if (data.friendId === userId || data.userId === userId) {
        console.log('[FriendRequestButton] ✅ Evento relacionado ao perfil visualizado!');
        console.log('[FriendRequestButton] 🔄 Recarregando status do pedido...');
        // Recarregar status do pedido, igual ao que acontece quando recebe friend_request
        checkRequestStatus();
        console.log('[FriendRequestButton] ✅ Status recarregado - botão será atualizado');
      } else {
        console.log('[FriendRequestButton] ⚠️ Evento não relacionado ao perfil visualizado - ignorando');
      }
    };

    // Escutar quando amizade for aceita
    const handleFriendAccepted = (data: any) => {
      console.log('[FriendRequestButton] ✅ Amizade aceita via Socket.IO:', data);
      // Verificar se o evento é relacionado ao perfil sendo visualizado
      const relatedUserId = data.relatedUserId || data.requester?.id || data.receiver?.id;
      if (relatedUserId === userId || data.requester?.id === userId || data.receiver?.id === userId) {
        console.log('[FriendRequestButton] ✅ Evento relacionado, recarregando status...');
        // Recarregar status do pedido
        checkRequestStatus();
      }
    };

    socket.on('friend_removed', handleFriendRemoved);
    socket.on('friend_accepted', handleFriendAccepted);

    return () => {
      socket.off('friend_removed', handleFriendRemoved);
      socket.off('friend_accepted', handleFriendAccepted);
    };
  }, [socket, userId, checkRequestStatus]);

  const handleSendRequest = async () => {
    if (!userId || isLoading) return;

    setIsLoading(true);
    try {
      await sendFriendRequest(userId);
      setRequestStatus('pending');
      setIsFriend(false);
      toast.success('Pedido de amizade enviado!');
      // Recarregar status após enviar
      const response = await getFriendRequests('sent');
      const sentRequest = response.data.requests?.find(
        (req) => req.receiverId === userId && req.status === 'PENDING'
      );
      if (sentRequest) {
        setRequestStatus('pending');
      }
    } catch (error: any) {
      console.error('Erro ao enviar pedido de amizade:', error);
      
      // Se já existe pedido pendente, atualizar status
      if (error.message?.includes('já existe') || error.message?.includes('Já existe')) {
        setRequestStatus('pending');
        toast.error('Já existe um pedido de amizade pendente');
      } else {
        toast.error(error.message || 'Erro ao enviar pedido de amizade');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriendship = async () => {
    if (!userId || isLoading) return;

    console.log('[FriendRequestButton] 🗑️ Iniciando remoção de amizade...');
    console.log('[FriendRequestButton] 📍 userId do amigo a ser removido:', userId);
    
    setIsLoading(true);
    try {
      console.log('[FriendRequestButton] 📤 Enviando requisição DELETE para /friendships/' + userId);
      const response = await removeFriendship(userId);
      console.log('[FriendRequestButton] ✅ Resposta da API de remover amizade:', response);
      console.log('[FriendRequestButton] ⏳ Aguardando evento friend_removed via Socket.IO...');
      
      // O estado será atualizado via Socket.IO quando o backend emitir o evento
      // Mas atualizamos localmente também para feedback imediato
      setIsFriend(false);
      setRequestStatus('none');
      toast.success('Amizade desfeita');
      
      // Recarregar status após um pequeno delay para garantir que o backend processou
      setTimeout(() => {
        console.log('[FriendRequestButton] 🔄 Recarregando status após delay...');
        checkRequestStatus();
      }, 500);
    } catch (error: any) {
      console.error('[FriendRequestButton] ❌ Erro ao desfazer amizade:', error);
      console.error('[FriendRequestButton] 📋 Detalhes do erro:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      toast.error(error.message || 'Erro ao desfazer amizade');
    } finally {
      setIsLoading(false);
      console.log('[FriendRequestButton] ✅ Processo de remoção finalizado');
    }
  };

  if (isChecking) {
    return (
      <Button 
        className="w-full bg-[#29292E] hover:bg-[#323238] border border-[#B3E240] px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
        disabled
      >
        <ShinyText 
          text="Carregando..." 
          disabled={true} 
          speed={3} 
          className="font-medium"
        />
      </Button>
    );
  }

  if (requestStatus === 'accepted' || isFriend) {
    return (
      <Button 
        onClick={handleRemoveFriendship}
        disabled={isLoading}
        className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500 px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
      >
        <ShinyText 
          text={isLoading ? "Desfazendo..." : "Desfazer amizade"} 
          disabled={isLoading} 
          speed={3} 
          className="font-medium text-red-400"
        />
      </Button>
    );
  }

  if (requestStatus === 'pending') {
    return (
      <Button 
        className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500 px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
        disabled
      >
        <ShinyText 
          text="Pedido enviado" 
          disabled={true} 
          speed={3} 
          className="font-medium text-yellow-400"
        />
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleSendRequest}
      disabled={isLoading}
      className="w-full bg-[#29292E] hover:bg-[#323238] border border-[#B3E240] px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
    >
      <ShinyText 
        text={isLoading ? "Enviando..." : "Solicitar amizade"} 
        disabled={isLoading} 
        speed={3} 
        className="font-medium"
      />
    </Button>
  );
}

