"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ShinyText from '@/components/shared/ShinyText';
import { sendFriendRequest } from '@/api/friends/send-friend-request';
import { getFriendRequests } from '@/api/friends/get-friend-requests';
import toast from 'react-hot-toast';
import { useNotificationsContext } from '@/contexts/NotificationsContext';

interface FriendRequestButtonProps {
  userId: string;
}

export function FriendRequestButton({ userId }: FriendRequestButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'accepted' | 'rejected'>('none');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkRequestStatus() {
      if (!userId) {
        setIsChecking(false);
        return;
      }

      try {
        const response = await getFriendRequests();
        
        // Verificar se há pedido enviado para este usuário
        const sentRequest = response.data.sent.find(
          (req) => req.receiverId === userId && req.status === 'PENDING'
        );
        
        // Verificar se há pedido recebido deste usuário
        const receivedRequest = response.data.received.find(
          (req) => req.requesterId === userId && req.status === 'PENDING'
        );

        if (sentRequest) {
          setRequestStatus('pending');
        } else if (receivedRequest) {
          setRequestStatus('pending');
        } else {
          // Verificar se já são amigos (status ACCEPTED)
          const acceptedRequest = response.data.sent.find(
            (req) => req.receiverId === userId && req.status === 'ACCEPTED'
          ) || response.data.received.find(
            (req) => req.requesterId === userId && req.status === 'ACCEPTED'
          );
          
          if (acceptedRequest) {
            setRequestStatus('accepted');
          } else {
            setRequestStatus('none');
          }
        }
      } catch (error: any) {
        console.error('Erro ao verificar status do pedido:', error);
        setRequestStatus('none');
      } finally {
        setIsChecking(false);
      }
    }

    checkRequestStatus();
  }, [userId]);

  const handleSendRequest = async () => {
    if (!userId || isLoading) return;

    setIsLoading(true);
    try {
      await sendFriendRequest(userId);
      setRequestStatus('pending');
      toast.success('Pedido de amizade enviado!');
    } catch (error: any) {
      console.error('Erro ao enviar pedido de amizade:', error);
      toast.error(error.message || 'Erro ao enviar pedido de amizade');
    } finally {
      setIsLoading(false);
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

  if (requestStatus === 'accepted') {
    return (
      <Button 
        className="w-full bg-green-500/20 hover:bg-green-500/30 border border-green-500 px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
        disabled
      >
        <ShinyText 
          text="Amigos" 
          disabled={true} 
          speed={3} 
          className="font-medium text-green-400"
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

