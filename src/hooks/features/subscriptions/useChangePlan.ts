import { useState } from 'react';
import { changePlan } from '@/api/subscriptions/change-plan';
import { PlanType, ChangePlanResponseDto } from '@/types/subscription-api';
import { ApiError } from '@/api/http/client';

export function useChangePlan() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const changeUserPlan = async (newPlanId: PlanType): Promise<ChangePlanResponseDto['data']> => {
        setLoading(true);
        setError(null);

        try {
            const response = await changePlan({ newPlanId });
            return response.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            const message = (apiError.details as any)?.message || apiError.message || 'Erro ao mudar de plano';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { changeUserPlan, loading, error };
}
