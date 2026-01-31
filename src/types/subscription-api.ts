// Subscription API Types

export type PlanType = 'START' | 'PRO' | 'ULTRA' | 'PRODUCER';
export type BillingType = 'PIX' | 'CREDIT_CARD';

export interface CheckoutRequestDto {
    customerName: string;
    customerEmail: string;
    planId: PlanType;
    billingType: BillingType;
    cpfCnpj?: string;
    phone?: string;
}

export interface CheckoutResponseDto {
    success: boolean;
    data: {
        subscriptionId?: string;
        asaasSubscriptionId?: string;
        paymentId: string;
        checkoutUrl?: string;
        invoiceUrl?: string; // URL da fatura do Asaas
        qrCode?: string;
        value?: number;
        plan?: {
            id: PlanType;
            name: string;
            price: number;
        };
    };
}

export interface PendingPlanChange {
    planId: PlanType;
    planName: string;
    planPrice: number;
    createdAt: string;
    expiresInMinutes: number;
    paymentUrl?: string;
}

export interface SubscriptionPlan {
    id: PlanType;
    name: string;
    price: number;
    features: Array<{ name: string; included: boolean }>;
}

export interface SubscriptionDto {
    id: string;
    userId?: string;
    planId: PlanType;
    plan?: SubscriptionPlan;
    status: 'ACTIVE' | 'PENDING' | 'CANCELLED' | 'EXPIRED';
    hasAccess?: boolean;
    paymentMethod?: 'PIX' | 'CREDIT_CARD';
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    startDate?: string;
    endDate?: string;
    paymentId?: string;
    pendingPlanChange?: PendingPlanChange;
    createdAt: string;
    updatedAt?: string;
}

export interface SubscriptionResponseDto {
    success: boolean;
    data: SubscriptionDto;
}

export const PLAN_NAMES: Record<PlanType, string> = {
    START: 'Start',
    PRO: 'Pro',
    ULTRA: 'Ultra',
    PRODUCER: 'Produtor'
};

export const PLAN_PRICES: Record<PlanType, string> = {
    START: '12.90',
    PRO: '39.90',
    ULTRA: '39.90',
    PRODUCER: '59.90'
};

export const PLAN_DESCRIPTIONS: Record<PlanType, string> = {
    START: 'Ideal para quem quer começar a estudar e acelerar seus estudos de forma rápida e simples.',
    PRO: 'O plano perfeito para quem quer acelerar seus estudos e alcançar resultados reais.',
    ULTRA: 'Ideal para quem quer ser aprovado em qualquer prova.',
    PRODUCER: 'Crie e venda seus próprios cursos com a nossa estrutura.'
};

// Change Plan Types
export interface ChangePlanRequestDto {
    newPlanId: PlanType;
}

export interface PlanInfo {
    id: PlanType;
    name: string;
    price?: number;
}

export interface PixQrCode {
    encodedImage: string;
    payload: string;
    expirationDate: string;
}

export interface ChangePlanData {
    success: boolean;
    message: string;
    currentPlan: PlanInfo;
    newPlan: PlanInfo;
    effectiveDate: string;
    isUpgrade: boolean;
    proratedAmount?: number;
    unusedDays?: number;
    creditAmount?: number;
    paymentUrl?: string;
    pixQrCode?: PixQrCode;
}

export interface ChangePlanResponseDto {
    success: boolean;
    data: ChangePlanData;
}
