'use client'

import { useState, useEffect } from 'react';
import { Crown, Check, Calendar, Loader2 } from 'lucide-react';
import { getSubscription } from '@/api/subscriptions/get-subscription';
import { SubscriptionDto, PLAN_NAMES } from '@/types/subscription-api';

export function SubscriptionStatus() {
    const [subscription, setSubscription] = useState<SubscriptionDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSubscription();
    }, []);

    const loadSubscription = async () => {
        try {
            setIsLoading(true);
            const response = await getSubscription();
            if (response.success && response.data) {
                setSubscription(response.data);
            }
        } catch (err: any) {
            // Se não houver assinatura, não mostrar erro
            if (err?.status !== 404) {
                setError('Erro ao carregar assinatura');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-[#202024] rounded-xl p-6 border border-[#323238]">
                <div className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-[#8b5cf6] animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !subscription) {
        return (
            <div className="bg-[#202024] rounded-xl p-6 border border-[#323238]">
                <div className="text-center">
                    <Crown className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <h3 className="text-white font-semibold mb-2">Nenhuma Assinatura Ativa</h3>
                    <p className="text-gray-400 text-sm mb-4">
                        Assine um plano para ter acesso a todos os recursos premium
                    </p>
                    <button
                        onClick={() => window.location.href = '/#planos'}
                        className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                        Ver Planos
                    </button>
                </div>
            </div>
        );
    }

    const isActive = subscription.status === 'ACTIVE';
    const isPending = subscription.status === 'PENDING';
    const endDate = new Date(subscription.endDate);
    const formattedEndDate = endDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className={`bg-gradient-to-br ${isActive
                ? 'from-[#8b5cf6]/10 to-[#a855f7]/5'
                : 'from-gray-800/10 to-gray-700/5'
            } rounded-xl p-6 border-2 ${isActive ? 'border-[#8b5cf6]/30' : 'border-gray-700/30'
            } relative overflow-hidden`}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/5 rounded-full blur-3xl" />

            <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${isActive ? 'bg-[#8b5cf6]/20' : 'bg-gray-700/20'
                            } flex items-center justify-center`}>
                            <Crown className={`w-6 h-6 ${isActive ? 'text-[#8b5cf6]' : 'text-gray-500'
                                }`} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">
                                Plano {PLAN_NAMES[subscription.planId]}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${isActive
                                        ? 'bg-green-500/20 text-green-400'
                                        : isPending
                                            ? 'bg-yellow-500/20 text-yellow-400'
                                            : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {isActive && <Check className="w-3 h-3" />}
                                    {isActive ? 'Ativa' : isPending ? 'Pendente' : 'Inativa'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscription Info */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                            {isActive ? 'Renova em' : 'Expira em'}: <span className="font-semibold">{formattedEndDate}</span>
                        </span>
                    </div>

                    {/* Features based on plan */}
                    <div className="pt-3 border-t border-gray-700/30">
                        <p className="text-gray-400 text-xs mb-2">Recursos inclusos:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {subscription.planId === 'START' && (
                                <>
                                    <FeatureBadge text="Conteúdo segmentado" />
                                    <FeatureBadge text="Comunidades" />
                                    <FeatureBadge text="Ofensivas" />
                                    <FeatureBadge text="Suporte 24/7" />
                                </>
                            )}
                            {subscription.planId === 'PRO' && (
                                <>
                                    <FeatureBadge text="Todos do Start" />
                                    <FeatureBadge text="Cursos Premium" />
                                    <FeatureBadge text="Trilhas e PDFs" />
                                    <FeatureBadge text="Suporte Prioritário" />
                                </>
                            )}
                            {subscription.planId === 'ULTRA' && (
                                <>
                                    <FeatureBadge text="Todos do PRO" />
                                    <FeatureBadge text="IA de Resumos" highlighted />
                                    <FeatureBadge text="Acesso Total" />
                                    <FeatureBadge text="Suporte VIP" />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                {!isActive && (
                    <button
                        onClick={() => window.location.href = '/#planos'}
                        className="w-full mt-4 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-2 rounded-lg font-semibold transition-colors text-sm"
                    >
                        Renovar Assinatura
                    </button>
                )}
            </div>
        </div>
    );
}

function FeatureBadge({ text, highlighted = false }: { text: string; highlighted?: boolean }) {
    return (
        <div className={`flex items-center gap-1 text-xs ${highlighted ? 'text-[#8b5cf6] font-semibold' : 'text-gray-400'
            }`}>
            <Check className="w-3 h-3 flex-shrink-0" strokeWidth={3} />
            <span className="truncate">{text}</span>
        </div>
    );
}
