import { httpClient } from '../http/client';
import { ChangePlanRequestDto, ChangePlanResponseDto } from '@/types/subscription-api';
import { ApiError } from '../http/client';

export async function changePlan(data: ChangePlanRequestDto): Promise<ChangePlanResponseDto> {
    try {
        if (!data.newPlanId) {
            throw new Error('ID do novo plano é obrigatório');
        }

        if (!['START', 'PRO', 'ULTRA'].includes(data.newPlanId)) {
            throw new Error('Plano inválido. Use START, PRO ou ULTRA');
        }

        const response = await httpClient.post<ChangePlanResponseDto>('/subscriptions/change-plan', {
            newPlanId: data.newPlanId,
        });

        return response;
    } catch (error) {
        console.error('[ChangePlan] Erro:', error);
        throw error as ApiError;
    }
}
