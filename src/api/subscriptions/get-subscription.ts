import { httpClient } from '../http/client';
import { SubscriptionResponseDto } from '@/types/subscription-api';
import { ApiError } from '../http/client';

export async function getSubscription(): Promise<SubscriptionResponseDto> {
    try {
        const response = await httpClient.get<SubscriptionResponseDto>('/subscriptions/me');
        return response;
    } catch (error) {
        throw error as ApiError;
    }
}
