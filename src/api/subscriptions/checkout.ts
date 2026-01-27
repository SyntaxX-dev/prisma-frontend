import { httpClient } from '../http/client';
import { CheckoutRequestDto, CheckoutResponseDto } from '@/types/subscription-api';
import { ApiError } from '../http/client';

export async function createCheckout(data: CheckoutRequestDto): Promise<CheckoutResponseDto> {
    try {
        // Backend espera os mesmos nomes de campos (camelCase)
        // customerName, customerEmail, planId, billingType
        // Garantir que não enviamos strings vazias ou undefined
        if (!data.customerName?.trim()) {
            throw new Error('Nome é obrigatório');
        }
        if (!data.customerEmail?.trim()) {
            throw new Error('Email é obrigatório');
        }
        if (!data.planId) {
            throw new Error('Plano é obrigatório');
        }
        if (!data.billingType) {
            throw new Error('Método de pagamento é obrigatório');
        }

        const backendPayload = {
            customerName: data.customerName.trim(),
            customerEmail: data.customerEmail.trim().toLowerCase(),
            planId: data.planId,
            billingType: data.billingType,
            ...(data.cpfCnpj && data.cpfCnpj.trim() && { cpfCnpj: data.cpfCnpj.trim() }),
            ...(data.phone && data.phone.trim() && { phone: data.phone.trim() }),
        };

        // Log para debug
        console.log('[Checkout] Enviando payload:', backendPayload);
        console.log('[Checkout] Payload JSON:', JSON.stringify(backendPayload));

        // Validar que todos os campos obrigatórios estão presentes
        if (!backendPayload.customerName || !backendPayload.customerEmail || !backendPayload.planId || !backendPayload.billingType) {
            console.error('[Checkout] Campos obrigatórios faltando:', {
                customerName: !!backendPayload.customerName,
                customerEmail: !!backendPayload.customerEmail,
                planId: !!backendPayload.planId,
                billingType: !!backendPayload.billingType,
            });
            throw new Error('Campos obrigatórios não preenchidos');
        }

        const response = await httpClient.post<CheckoutResponseDto>('/subscriptions/checkout', backendPayload);
        return response;
    } catch (error) {
        // Não logar aqui - deixar o componente tratar o erro
        throw error as ApiError;
    }
}
