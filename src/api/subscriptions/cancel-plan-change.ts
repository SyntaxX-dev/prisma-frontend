import { httpClient } from '../http/client';
import { ApiError } from '../http/client';

export interface CancelPlanChangeResponseDto {
    success: boolean;
    message: string;
}

export async function cancelPlanChange(): Promise<CancelPlanChangeResponseDto> {
    try {
        const response = await httpClient.post<CancelPlanChangeResponseDto>('/subscriptions/cancel-plan-change');
        return response;
    } catch (error) {
        console.error('[CancelPlanChange] Erro:', error);
        throw error as ApiError;
    }
}
