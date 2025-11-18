import { useState, useEffect, useCallback } from 'react';
import { getConversationAttachments } from '@/api/messages/get-conversation-attachments';
import { getCommunityAttachments } from '@/api/communities/get-community-attachments';
import type { Attachment } from '@/types/attachments';

interface UseChatAttachmentsResult {
  attachments: Attachment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useChatAttachments(
  chatType: 'personal' | 'community',
  chatId: string | null
): UseChatAttachmentsResult {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttachments = useCallback(async () => {
    if (!chatId) {
      setAttachments([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      
      if (chatType === 'personal') {
        result = await getConversationAttachments(chatId);
      } else {
        result = await getCommunityAttachments(chatId);
      }

      if (result.success) {
        setAttachments(result.data);
      } else {
        setError(result.message);
        setAttachments([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao buscar anexos';
      setError(errorMessage);
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  }, [chatType, chatId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  return {
    attachments,
    loading,
    error,
    refetch: fetchAttachments,
  };
}

