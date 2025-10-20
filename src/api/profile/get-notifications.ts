import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface NotificationResponse {
  hasNotification: boolean;
  missingFields: string[];
  message: string;
  badge: string | null;
  profileCompletionPercentage: number;
  completedFields: string[];
}

export async function getNotifications(): Promise<NotificationResponse> {
  try {
    const response = await httpClient.get<NotificationResponse>('/profile/notifications');
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}
