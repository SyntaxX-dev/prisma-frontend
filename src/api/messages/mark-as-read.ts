import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
}

export async function markMessagesAsRead(
  senderId: string
): Promise<MarkAsReadResponse> {
  try {
    const response = await httpClient.put<MarkAsReadResponse>(
      `/messages/read/${senderId}`,
      {}
    );
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}

