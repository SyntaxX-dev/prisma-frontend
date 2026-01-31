'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, QrCode, X, Check, Loader2, User, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import { createCheckout } from '@/api/subscriptions/checkout';
import { useNotifications } from '@/hooks/shared';
import { useAuth } from '@/hooks/features/auth';
import { getSubscription } from '@/api/subscriptions/get-subscription';
import { useChangePlan } from '@/hooks/features/subscriptions';
import { UpgradeConfirmationModal } from '@/components/features/subscriptions/UpgradeConfirmationModal';
import { DowngradeConfirmationModal } from '@/components/features/subscriptions/DowngradeConfirmationModal';
import { PixPaymentModal } from '@/components/features/subscriptions/PixPaymentModal';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlanType, BillingType, PLAN_NAMES, PLAN_PRICES, PLAN_DESCRIPTIONS, ChangePlanData } from '@/types/subscription-api';

export function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showError, showSuccess } = useNotifications();
    const { isAuthenticated, user } = useAuth();
    const { changeUserPlan, loading: isChangingPlan } = useChangePlan();

    const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
    const [currentPlanId, setCurrentPlanId] = useState<PlanType | null>(null);
    const [upgradeData, setUpgradeData] = useState<ChangePlanData | null>(null);
    const [downgradeData, setDowngradeData] = useState<ChangePlanData | null>(null);
    const [showPixModal, setShowPixModal] = useState(false);
    const [pixData, setPixData] = useState<{ qrCode: ChangePlanData['pixQrCode']; amount: number; paymentUrl?: string } | null>(null);
    const [showSubscriptionActiveModal, setShowSubscriptionActiveModal] = useState(false);

    // Dados do usuário (não autenticado)
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [cpf, setCpf] = useState('');
    const [phone, setPhone] = useState('');

    // Ref para evitar múltiplas chamadas de verificação
    const hasCheckedSubscription = useRef(false);

    // Pré-preencher dados se autenticado
    useEffect(() => {
        if (isAuthenticated && user) {
            if (!customerName) setCustomerName(user.name || '');
            if (!customerEmail) {
                const emailStr = typeof user.email === 'object' ? user.email.value : user.email;
                setCustomerEmail(emailStr || '');
            }
        }
    }, [isAuthenticated, user]);

    // Verificar se usuário autenticado tem assinatura
    useEffect(() => {
        // Evitar múltiplas execuções
        if (hasCheckedSubscription.current) return;

        const checkSubscription = async () => {
            if (!isAuthenticated) {
                setIsCheckingSubscription(false);
                return;
            }

            hasCheckedSubscription.current = true;

            try {
                const response = await getSubscription();
                if (response.success && response.data) {
                    setCurrentPlanId(response.data.planId);

                    // Se tem assinatura e está tentando fazer checkout, redirecionar para upgrade/downgrade
                    const planFromUrl = searchParams.get('plan') as PlanType;
                    const planFromStorage = localStorage.getItem('selectedPlan') as PlanType;
                    const targetPlan = (planFromUrl || planFromStorage) as PlanType;

                    const planOrder: PlanType[] = ['START', 'PRO', 'ULTRA', 'PRODUCER'];
                    if (targetPlan && planOrder.includes(targetPlan)) {
                        if (response.data.planId === targetPlan) {
                            showError('Você já está neste plano');
                            router.push('/');
                            return;
                        }

                        // Usuário tem assinatura e quer mudar de plano - usar upgrade/downgrade
                        try {
                            const result = await changeUserPlan(targetPlan);
                            if (result.isUpgrade && result.creditAmount !== undefined) {
                                setUpgradeData(result);
                                setCurrentPlanId(targetPlan);
                            } else {
                                setDowngradeData(result);
                            }
                        } catch (error: any) {
                            const errorMessage = error.details?.message || error.message || 'Erro ao trocar de plano. Tente novamente mais tarde.';
                            showError(errorMessage);
                            router.push('/');
                        }
                    }
                }
            } catch (error: any) {
                // Se não houver assinatura (404), continuar com checkout normal
                if (error?.status !== 404) {
                    console.error('Erro ao verificar assinatura:', error);
                }
                setCurrentPlanId(null);
            } finally {
                setIsCheckingSubscription(false);
            }
        };

        checkSubscription();
    }, [isAuthenticated]);


    useEffect(() => {
        // Se já verificou assinatura, carregar plano selecionado
        if (!isCheckingSubscription) {
            const planFromUrl = searchParams.get('plan') as PlanType;
            const planFromStorage = localStorage.getItem('selectedPlan') as PlanType;

            const plan = planFromUrl || planFromStorage;

            if (plan && ['START', 'PRO', 'ULTRA', 'PRODUCER'].includes(plan)) {
                setSelectedPlan(plan);
                localStorage.setItem('selectedPlan', plan);
            } else {
                // Redirecionar para página de seleção de planos se nenhum plano foi selecionado
                router.push('/plans');
            }
        }
    }, [isCheckingSubscription, currentPlanId, searchParams, router]);

    const handlePaymentMethodSelect = async (billingType: BillingType) => {
        // Validar dados obrigatórios
        if (!selectedPlan) {
            showError('Nenhum plano selecionado');
            return;
        }

        if (!customerName.trim()) {
            showError('Por favor, informe seu nome');
            return;
        }

        if (!customerEmail.trim() || !customerEmail.includes('@')) {
            showError('Por favor, informe um email válido');
            return;
        }

        // Se usuário está autenticado, verificar novamente se tem assinatura antes de fazer checkout
        if (isAuthenticated && !currentPlanId) {
            try {
                const response = await getSubscription();
                if (response.success && response.data) {
                    // Mostrar modal em vez de toast
                    setShowSubscriptionActiveModal(true);
                    return;
                }
            } catch (error: any) {
                // Se não houver assinatura (404), continuar com checkout normal
                if (error?.status !== 404) {
                    console.error('Erro ao verificar assinatura antes do checkout:', error);
                }
            }
        }

        setIsProcessing(true);

        try {
            // Validar novamente antes de enviar
            if (!selectedPlan) {
                showError('Nenhum plano selecionado');
                setIsProcessing(false);
                return;
            }

            if (!customerName.trim()) {
                showError('Por favor, informe seu nome');
                setIsProcessing(false);
                return;
            }

            if (!customerEmail.trim() || !customerEmail.includes('@')) {
                showError('Por favor, informe um email válido');
                setIsProcessing(false);
                return;
            }

            if (!billingType) {
                showError('Por favor, selecione uma forma de pagamento');
                setIsProcessing(false);
                return;
            }

            const response = await createCheckout({
                customerName: customerName.trim(),
                customerEmail: customerEmail.trim().toLowerCase(),
                planId: selectedPlan,
                billingType,
                cpfCnpj: cpf.replace(/\D/g, '') || undefined,
                phone: phone.replace(/\D/g, '') || undefined,
            });

            if (response.success && response.data) {
                // A API pode retornar checkoutUrl ou invoiceUrl
                const paymentUrl = response.data.checkoutUrl || response.data.invoiceUrl;

                if (paymentUrl) {
                    showSuccess('Redirecionando para pagamento...');
                    // Redirecionar para URL de pagamento do Asaas
                    window.location.href = paymentUrl;
                } else if (response.data.qrCode) {
                    // Se tiver QR Code PIX, mostrar modal (caso implementado no futuro)
                    showSuccess('Checkout realizado com sucesso! Verifique seu email para o QR Code PIX.');
                } else {
                    showSuccess('Checkout realizado com sucesso! Verifique seu email para mais informações.');
                }
            } else {
                showError('Erro ao processar checkout');
            }
        } catch (error: any) {
            // Tratar erro específico de assinatura já existente
            // O erro pode vir em error.message ou error.details.message
            const errorMessage = error?.message || (error?.details as any)?.message || '';
            const errorStatus = error?.status || (error?.details as any)?.statusCode || 0;

            // Verificar se é erro de assinatura ativa
            const errorMessageLower = errorMessage.toLowerCase();
            const hasActiveSubscription = errorStatus === 400 && (
                errorMessageLower.includes('já existe uma assinatura ativa') ||
                errorMessageLower.includes('assinatura ativa para este email') ||
                errorMessageLower.includes('status: active') ||
                errorMessageLower.includes('se você já se registrou')
            );

            if (hasActiveSubscription) {
                // Mostrar modal em vez de toast - não logar erro
                setShowSubscriptionActiveModal(true);
            } else {
                // Só logar e mostrar erro se não for de assinatura ativa
                if (errorMessage.toLowerCase().includes('plano deve ser')) {
                    showError('Plano selecionado inválido. Por favor, escolha outro plano.');
                } else {
                    showError(errorMessage || 'Erro ao processar pagamento. Tente novamente.');
                }
            }
        } finally {
            setIsProcessing(false);
            setShowPaymentModal(false);
        }
    };

    const formatCPF = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }
        return numbers.slice(0, 11);
    };

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{5})(\d)/, '$1-$2');
        }
        return numbers.slice(0, 11);
    };

    const handleGoToPayment = (url: string) => {
        window.open(url, '_blank');
        setUpgradeData(null);
    };

    const handleShowPix = (qrCode: ChangePlanData['pixQrCode']) => {
        if (qrCode && upgradeData) {
            const amount = upgradeData.creditAmount
                ? upgradeData.newPlan.price! - upgradeData.creditAmount
                : upgradeData.newPlan.price || 0;

            setPixData({
                qrCode,
                amount,
                paymentUrl: upgradeData.paymentUrl,
            });
            setShowPixModal(true);
            setUpgradeData(null);
        }
    };

    // Se está verificando assinatura ou processando upgrade/downgrade, mostrar loading
    if (isCheckingSubscription || isChangingPlan || upgradeData || downgradeData) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin" />
            </div>
        );
    }

    if (!selectedPlan) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin" />
            </div>
        );
    }

    const isFormValid = customerName.trim() && customerEmail.trim() && customerEmail.includes('@');

    return (
        <div className="min-h-screen bg-transparent py-12 px-4 relative">
            {/* Back Button */}
            <div className="absolute top-6 left-4 md:left-8 z-30">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#202024] hover:bg-[#29292E] border border-[#323238] hover:border-[#8b5cf6]/40 text-white rounded-xl transition-all duration-300 group cursor-pointer"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Voltar para Home</span>
                </button>
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Finalizar Assinatura
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Preencha seus dados e escolha a forma de pagamento
                    </p>
                </div>

                {/* Plan Summary Card */}
                <div className="bg-[#202024] rounded-2xl p-8 mb-8 border border-[#323238]">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Plano {PLAN_NAMES[selectedPlan]}
                            </h2>
                            <p className="text-gray-400">
                                {PLAN_DESCRIPTIONS[selectedPlan]}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold text-white whitespace-nowrap">
                                R$ {PLAN_PRICES[selectedPlan]}
                            </div>
                            <div className="text-gray-400 text-sm">por mês</div>
                        </div>
                    </div>

                    {/* Plan Features */}
                    <div className="border-t border-[#323238] pt-6">
                        <h3 className="text-white font-semibold mb-4">O que está incluído:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedPlan === 'START' && (
                                <>
                                    <FeatureItem text="Conteúdo segmentado" />
                                    <FeatureItem text="Acesso a comunidades" />
                                    <FeatureItem text="Direito a ofensivas" />
                                    <FeatureItem text="Suporte 24/7" />
                                </>
                            )}
                            {selectedPlan === 'PRO' && (
                                <>
                                    <FeatureItem text="Conteúdo segmentado" />
                                    <FeatureItem text="Acesso a comunidades" />
                                    <FeatureItem text="Direito a ofensivas" />
                                    <FeatureItem text="Suporte 24/7" />
                                    <FeatureItem text="Prioridade no suporte" />
                                    <FeatureItem text="Todos os cursos premiums" />
                                </>
                            )}
                            {selectedPlan === 'ULTRA' && (
                                <>
                                    <FeatureItem text="Conteúdo segmentado" />
                                    <FeatureItem text="Acesso a comunidades" />
                                    <FeatureItem text="Direito a ofensivas" />
                                    <FeatureItem text="Suporte 24/7" />
                                    <FeatureItem text="Prioridade no suporte" />
                                    <FeatureItem text="Todos os cursos premiums" />
                                    <FeatureItem text="Trilhas e PDF's" />
                                    <FeatureItem text="IA de resumos" highlighted />
                                </>
                            )}
                            {selectedPlan === 'PRODUCER' && (
                                <>
                                    <FeatureItem text="Conteúdo segmentado" />
                                    <FeatureItem text="Acesso a comunidades" />
                                    <FeatureItem text="Direito a ofensivas" />
                                    <FeatureItem text="Suporte 24/7" />
                                    <FeatureItem text="Prioridade no suporte" />
                                    <FeatureItem text="Todos os cursos premiums" />
                                    <FeatureItem text="Trilhas e PDF's" />
                                    <FeatureItem text="IA de resumos" highlighted />
                                    <FeatureItem text="Lançamento de cursos" highlighted />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Customer Info Form - OBRIGATÓRIO */}
                <div className="bg-[#202024] rounded-2xl p-8 mb-8 border border-[#323238]">
                    <h3 className="text-white font-semibold mb-4">Seus Dados</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">
                                Nome Completo <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Seu nome completo"
                                    className="w-full bg-[#29292E] border border-[#323238] text-white placeholder-gray-500 rounded-xl h-12 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6]"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">
                                Email <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="w-full bg-[#29292E] border border-[#323238] text-white placeholder-gray-500 rounded-xl h-12 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6]"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-3">
                        📧 Após o pagamento, você receberá um email com o link para criar sua conta
                    </p>
                </div>

                {/* Additional Info Form - OPCIONAL */}
                <div className="bg-[#202024] rounded-2xl p-8 mb-8 border border-[#323238]">
                    <h3 className="text-white font-semibold mb-4">Informações Adicionais (Opcional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">CPF</label>
                            <input
                                type="text"
                                value={cpf}
                                onChange={(e) => setCpf(formatCPF(e.target.value))}
                                placeholder="000.000.000-00"
                                className="w-full bg-[#29292E] border border-[#323238] text-white placeholder-gray-500 rounded-xl h-12 px-4 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6]"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Telefone</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(formatPhone(e.target.value))}
                                placeholder="(00) 00000-0000"
                                className="w-full bg-[#29292E] border border-[#323238] text-white placeholder-gray-500 rounded-xl h-12 px-4 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6]"
                            />
                        </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-3">
                        Essas informações ajudam a agilizar o processo de pagamento
                    </p>
                </div>

                {/* Checkout Button */}
                <button
                    onClick={() => setShowPaymentModal(true)}
                    disabled={isProcessing || !isFormValid}
                    className="w-full cursor-pointer bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] hover:from-[#7c3aed] hover:to-[#9333ea] text-white rounded-xl h-14 font-bold text-lg transition-all shadow-lg shadow-[#8b5cf6]/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? 'Processando...' : 'Continuar para Pagamento'}
                </button>

                {!isFormValid && (
                    <p className="text-center text-red-400 text-sm mt-3">
                        Preencha seu nome e email para continuar
                    </p>
                )}

                {/* Security Note */}
                <div className="text-center mt-6">
                    <p className="text-gray-500 text-sm">
                        🔒 Pagamento seguro processado pelo Asaas
                    </p>
                </div>
            </div>

            {/* Payment Method Modal */}
            {
                showPaymentModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-[#202024] rounded-2xl max-w-md w-full p-8 border border-[#323238] relative animate-in fade-in zoom-in duration-200">
                            {/* Close Button */}
                            <button
                                onClick={() => !isProcessing && setShowPaymentModal(false)}
                                disabled={isProcessing}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Modal Header */}
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Escolha a forma de pagamento
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    Selecione como deseja pagar sua assinatura
                                </p>
                            </div>

                            {/* Payment Options */}
                            <div className="space-y-4">
                                {/* PIX Option */}
                                <button
                                    onClick={() => handlePaymentMethodSelect('PIX')}
                                    disabled={isProcessing}
                                    className="w-full cursor-pointer bg-[#29292E] hover:bg-[#323238] border-2 border-[#323238] hover:border-[#8b5cf6] rounded-xl p-6 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#8b5cf6]/10 rounded-xl flex items-center justify-center group-hover:bg-[#8b5cf6]/20 transition-colors">
                                            <QrCode className="w-6 h-6 text-[#8b5cf6]" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="text-white font-semibold mb-1">PIX</div>
                                            <div className="text-gray-400 text-sm">
                                                Pagamento instantâneo via QR Code
                                            </div>
                                        </div>
                                        <Check className="w-5 h-5 text-[#8b5cf6] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </button>

                                {/* Credit Card Option */}
                                <button
                                    onClick={() => handlePaymentMethodSelect('CREDIT_CARD')}
                                    disabled={isProcessing}
                                    className="w-full cursor-pointer bg-[#29292E] hover:bg-[#323238] border-2 border-[#323238] hover:border-[#8b5cf6] rounded-xl p-6 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#8b5cf6]/10 rounded-xl flex items-center justify-center group-hover:bg-[#8b5cf6]/20 transition-colors">
                                            <CreditCard className="w-6 h-6 text-[#8b5cf6]" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="text-white font-semibold mb-1">Cartão de Crédito</div>
                                            <div className="text-gray-400 text-sm">
                                                Parcelamento disponível
                                            </div>
                                        </div>
                                        <Check className="w-5 h-5 text-[#8b5cf6] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </button>
                            </div>

                            {/* Processing State */}
                            {isProcessing && (
                                <div className="mt-6 flex items-center justify-center gap-3 text-[#8b5cf6]">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span className="text-sm">Processando pagamento...</span>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Modal de Confirmação de Upgrade */}
            {
                upgradeData && (
                    <UpgradeConfirmationModal
                        data={upgradeData}
                        isOpen={!!upgradeData}
                        onClose={() => {
                            setUpgradeData(null);
                            router.push('/');
                        }}
                        onGoToPayment={handleGoToPayment}
                        onShowPix={handleShowPix}
                    />
                )
            }

            {/* Modal de Confirmação de Downgrade */}
            {
                downgradeData && (
                    <DowngradeConfirmationModal
                        data={downgradeData}
                        isOpen={!!downgradeData}
                        onClose={() => {
                            setDowngradeData(null);
                            router.push('/');
                        }}
                    />
                )
            }

            {/* Modal de Pagamento PIX */}
            {
                pixData && pixData.qrCode && (
                    <PixPaymentModal
                        isOpen={showPixModal}
                        onClose={() => {
                            setShowPixModal(false);
                            setPixData(null);
                            router.push('/');
                        }}
                        qrCode={pixData.qrCode}
                        amount={pixData.amount}
                        paymentUrl={pixData.paymentUrl}
                    />
                )
            }

            {/* Modal de Assinatura Ativa */}
            <Dialog open={showSubscriptionActiveModal} onOpenChange={setShowSubscriptionActiveModal}>
                <DialogContent className="bg-[#202024] border-[#323238] text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-yellow-500" />
                            </div>
                            Assinatura Ativa Detectada
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Este email já possui uma assinatura ativa
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <p className="text-white text-base leading-relaxed">
                            Um usuário assinante só pode gerenciar sua assinatura dentro da plataforma.
                        </p>
                        <p className="text-gray-300 text-sm mt-3">
                            {isAuthenticated
                                ? 'Acesse as configurações para gerenciar seu plano, fazer upgrade ou downgrade.'
                                : 'Faça login para acessar suas configurações e gerenciar seu plano.'
                            }
                        </p>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            onClick={() => {
                                setShowSubscriptionActiveModal(false);
                                router.push('/');
                            }}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 cursor-pointer"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={() => {
                                setShowSubscriptionActiveModal(false);
                                if (isAuthenticated) {
                                    router.push('/settings');
                                } else {
                                    router.push('/auth/login');
                                }
                            }}
                            className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white cursor-pointer"
                        >
                            {isAuthenticated ? 'Ir para Configurações' : 'Fazer Login'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}

function FeatureItem({ text, highlighted = false }: { text: string; highlighted?: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-[#8b5cf6]" strokeWidth={3} />
            </div>
            <span className={highlighted ? 'text-[#8b5cf6] font-semibold' : 'text-gray-300'}>
                {text}
            </span>
        </div>
    );
}
