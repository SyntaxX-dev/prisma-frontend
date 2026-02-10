"use client";

import { useState, useEffect, Suspense } from "react";
import { Navbar } from "../../../components/Navbar";
import { Sidebar } from "../../../components/Sidebar";
import { LoadingGrid } from "@/components/ui/loading-grid";
import { useAuth } from "../../../hooks/features/auth";
import { useNotifications, useCacheInvalidation } from "../../../hooks/shared";
import { usePageDataLoad } from "@/hooks/shared";
import { useChangePlan } from "../../../hooks/features/subscriptions";
import { getSubscription } from "../../../api/subscriptions/get-subscription";
import { cancelPlanChange } from "../../../api/subscriptions/cancel-plan-change";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import { UpgradeConfirmationModal } from "../../../components/features/subscriptions/UpgradeConfirmationModal";
import { DowngradeConfirmationModal } from "../../../components/features/subscriptions/DowngradeConfirmationModal";
import { PixPaymentModal } from "../../../components/features/subscriptions/PixPaymentModal";
import { PlanType, ChangePlanData, PLAN_NAMES, PendingPlanChange } from "../../../types/subscription-api";
import {
  Settings,
  CreditCard,
  AlertTriangle,
  X,
  ArrowRight,
  Check,
  MessageCircle,
  UserPlus,
  Clock,
  XCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

function SettingsContent() {
  const [isDark, setIsDark] = useState(true);
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const { subscription: invalidateSubscription } = useCacheInvalidation();
  const { changeUserPlan, loading: isChangingPlan } = useChangePlan();
  const [showCancelSubscriptionDialog, setShowCancelSubscriptionDialog] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);
  const [upgradeData, setUpgradeData] = useState<ChangePlanData | null>(null);
  const [downgradeData, setDowngradeData] = useState<ChangePlanData | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode: ChangePlanData['pixQrCode']; amount: number; paymentUrl?: string } | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [pendingPlanChange, setPendingPlanChange] = useState<PendingPlanChange | null>(null);
  const [isCancellingPlanChange, setIsCancellingPlanChange] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Níveis dos planos para verificar upgrade/downgrade
  const PLAN_LEVELS: Record<string, number> = {
    'Start': 0,
    'Ultra': 1,
    'Produtor': 2
  };

  usePageDataLoad({
    waitForData: false,
    customDelay: 0
  });



  const toggleTheme = () => {
    setIsDark(!isDark);
  };


  // Carregar informações da assinatura
  const loadSubscription = async () => {
    try {
      setIsLoadingSubscription(true);
      const response = await getSubscription();
      if (response.success && response.data) {
        // A API pode retornar planId diretamente ou dentro de plan.id
        const planId = response.data.planId || response.data.plan?.id;
        if (planId) {
          setSubscriptionPlan(PLAN_NAMES[planId]);
        } else {
          setSubscriptionPlan(null);
        }
        setSubscriptionDetails(response.data);
        setPendingPlanChange(response.data.pendingPlanChange || null);
      } else {
        setSubscriptionPlan(null);
        setSubscriptionDetails(null);
        setPendingPlanChange(null);
      }
    } catch (error: any) {
      // Se não houver assinatura (404), não mostrar erro
      if (error?.status !== 404) {
        console.error('Erro ao carregar assinatura:', error);
      }
      setSubscriptionPlan(null);
      setSubscriptionDetails(null);
      setPendingPlanChange(null);
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const handleRequestCancellation = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      // Aqui você faria a chamada à API para solicitar cancelamento
      // await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/cancel`, {
      //   method: 'POST',
      //   headers: { 
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // });

      showSuccess('Solicitação de cancelamento enviada com sucesso! Nossa equipe entrará em contato em breve.');
      setShowCancelSubscriptionDialog(false);
    } catch (error) {
      showError('Erro ao solicitar cancelamento. Tente novamente mais tarde.');
    }
  };

  // Mapear nome do plano para ID
  const planNameToId = (planName: string): PlanType => {
    const mapping: Record<string, PlanType> = {
      'Start': 'START',
      'Ultra': 'ULTRA',
      'Produtor': 'PRODUCER',
    };
    return mapping[planName] || 'START';
  };

  // Mapear ID do plano para nome
  const planIdToName = (planId: PlanType): string => {
    const mapping: Record<PlanType, string> = {
      'START': 'Start',
      'PRO': 'Pro',
      'ULTRA': 'Ultra',
      'PRODUCER': 'Produtor',
    };
    return mapping[planId] || planId;
  };

  const handleChangePlan = async (newPlanName: string) => {
    try {
      const newPlanId = planNameToId(newPlanName);

      // Verificar se já está no mesmo plano
      if (subscriptionPlan === newPlanName) {
        showError('Você já está neste plano');
        return;
      }

      // Verificar se é um downgrade
      const currentLevel = PLAN_LEVELS[subscriptionPlan || 'Start'] || 0;
      const newLevel = PLAN_LEVELS[newPlanName] || 0;

      if (newLevel < currentLevel) {
        setShowSupportModal(true);
        // Fechar o modal de seleção de planos se estiver aberto
        setShowChangePlanDialog(false);
        return;
      }

      const result = await changeUserPlan(newPlanId);

      // Invalidar cache de assinatura após mudança de plano
      await invalidateSubscription();

      if (result.isUpgrade && result.paymentUrl) {
        // É upgrade com pagamento pendente - armazenar dados e mostrar modal
        setUpgradeData(result);
        setShowChangePlanDialog(false);

        // Armazenar a mudança pendente para exibir na interface
        setPendingPlanChange({
          planId: result.newPlan.id,
          planName: result.newPlan.name,
          planPrice: result.newPlan.price || 0,
          createdAt: new Date().toISOString(),
          expiresInMinutes: 30,
          paymentUrl: result.paymentUrl,
        });
      } else if (result.isUpgrade && result.creditAmount !== undefined) {
        // É upgrade imediato sem pagamento adicional
        setUpgradeData(result);
        setShowChangePlanDialog(false);
        setSubscriptionPlan(newPlanName);
        await loadSubscription();
      } else {
        // Downgrade ou mudança agendada - mostrar modal informativo
        setDowngradeData(result);
        setShowChangePlanDialog(false);
        await loadSubscription();
      }
    } catch (error: any) {
      const errorMessage = error.details?.message || error.message || 'Erro ao trocar de plano. Tente novamente mais tarde.';
      showError(errorMessage);
    }
  };

  const handleCancelPlanChange = async () => {
    try {
      setIsCancellingPlanChange(true);
      const response = await cancelPlanChange();
      if (response.success) {
        // Invalidar cache de assinatura
        await invalidateSubscription();

        showSuccess('Mudança de plano cancelada com sucesso!');
        setPendingPlanChange(null);
        await loadSubscription();
      }
    } catch (error: any) {
      const errorMessage = error.details?.message || error.message || 'Erro ao cancelar mudança de plano.';
      showError(errorMessage);
    } finally {
      setIsCancellingPlanChange(false);
    }
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

  const plans = [
    {
      name: 'Start',
      price: 'R$ 12,90',
      period: '/mês',
      features: [
        'Conteúdo segmentado',
        'Acesso a comunidades',
        'Direito a ofensivas',
        'Suporte 24/7',
      ],
      popular: false
    },
    {
      name: 'Ultra',
      price: 'R$ 39,90',
      period: '/mês',
      features: [
        'Conteúdo segmentado',
        'Acesso a comunidades',
        'Direito a ofensivas',
        'Suporte 24/7',
        'Prioridade no suporte 24/7',
        'Acesso a todos os cursos premiums',
        'Geração de mapas mentais',
        'Acesso a IA de resumos para cada curso',
      ],
      popular: true
    },
    {
      name: 'Produtor',
      price: 'R$ 59,90',
      period: '/mês',
      features: [
        'Conteúdo segmentado',
        'Acesso a comunidades',
        'Direito a ofensivas',
        'Suporte 24/7',
        'Prioridade no suporte 24/7',
        'Acesso a todos os cursos premiums',
        'Geração de mapas mentais',
        'Acesso a IA de resumos para cada curso',
        'Lançamento de cursos próprios',
      ],
      popular: false,
      highlight: true
    }
  ];


  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div
        className={`fixed inset-0 transition-all duration-300 ${isDark
          ? 'bg-[#1a1b1e]'
          : 'bg-gray-500'
          }`}
      />

      <div
        className={`fixed inset-0 backdrop-blur-sm transition-all duration-300 ${isDark ? 'bg-black/30' : 'bg-black/10'
          }`}
      />

      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0'
        }}
      />

      <div className="relative z-10 flex">
        <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
        <div className="flex-1">
          <Navbar isDark={isDark} toggleTheme={toggleTheme} />

          <div className="p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 ml-0 md:ml-10 pt-24 md:pt-10">
            <div className="mb-6 md:mb-8">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4 md:mb-6">
                <div className="text-center md:text-left">
                  <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold">Configurações</h1>
                  <p className="text-gray-400 text-base md:text-lg">Personalize sua experiência na plataforma</p>
                </div>
              </div>
            </div>

            <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[120rem] mx-auto space-y-6 lg:space-y-8">
              {/* Seção de Trocar de Plano - Topo, largura completa */}
              <Card className="bg-[#202024] backdrop-blur-sm border-[#323238]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    Trocar de Plano
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm lg:text-base mb-6">
                    Escolha o plano que melhor se adequa às suas necessidades. Você pode trocar a qualquer momento.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 xl:gap-8 mx-auto">
                    {plans.map((plan) => (
                      <div
                        key={plan.name}
                        className={`relative rounded-xl lg:rounded-2xl border-2 p-4 md:p-6 lg:p-8 transition-all cursor-pointer flex flex-col h-full ${subscriptionPlan === plan.name
                          ? 'border-[#bd18b4] bg-[#29292E] ring-2 ring-[#bd18b4]/30 ring-offset-2 ring-offset-[#1a1b1e]'
                          : plan.popular
                            ? 'border-[#bd18b4] bg-[#29292E]'
                            : 'border-[#323238] bg-[#29292E] hover:border-[#bd18b4]/40'
                          }`}
                        onClick={() => handleChangePlan(plan.name)}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="bg-[#bd18b4] text-white text-xs font-bold px-3 py-1 rounded-full">
                              Popular
                            </span>
                          </div>
                        )}

                        {subscriptionPlan === plan.name && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 rounded-full bg-[#bd18b4] flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}

                        <div className="text-center mb-4 lg:mb-6">
                          <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">{plan.name}</h3>
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-3xl lg:text-4xl font-bold text-[#bd18b4]">{plan.price}</span>
                            <span className="text-gray-400 text-sm lg:text-base">{plan.period}</span>
                          </div>
                        </div>

                        <ul className="space-y-2 lg:space-y-3 mb-4 lg:mb-6 flex-1">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm lg:text-base text-white/80">
                              <Check className="w-4 h-4 lg:w-5 lg:h-5 text-[#bd18b4] mt-0.5 flex-shrink-0" />
                              <span className={feature === 'Acesso a IA de resumos para cada curso'
                                ? 'animate-rainbow font-bold'
                                : ''}>
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-auto">
                          <Button
                            onClick={() => handleChangePlan(plan.name)}
                            className={`w-full cursor-pointer ${subscriptionPlan === plan.name
                              ? 'bg-[#29292E] hover:bg-[#29292E] text-[#bd18b4] border border-[#bd18b4] cursor-not-allowed'
                              : plan.popular
                                ? 'bg-[#bd18b4] hover:bg-[#aa22c5] text-white'
                                : 'bg-[#29292E] hover:bg-[#323238] text-white border border-[#323238]'
                              }`}
                            disabled={subscriptionPlan === plan.name}
                          >
                            {subscriptionPlan === plan.name ? 'Plano Atual' : 'Selecionar Plano'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cards de Ações - Grid com 3 cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
                {/* Card de Sugestões via WhatsApp */}
                <Card className="bg-[#202024] backdrop-blur-sm border-[#323238] flex flex-col h-full">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-[#bd18b4]" />
                      Sugestões
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 space-y-4">
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm">
                        Tem alguma sugestão ou feedback? Entre em contato conosco via WhatsApp!
                      </p>
                    </div>
                    <div className="mt-auto">
                      <Button
                        variant="default"
                        onClick={() => {
                          const phoneNumber = '5583987690902';
                          const message = encodeURIComponent('Olá! Gostaria de dar uma sugestão sobre a plataforma.');
                          window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
                        }}
                        className="w-full bg-[#29292E] hover:bg-[#323238] text-white border border-[#323238] cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Enviar Mensagem
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Card de Produtor Exclusivo */}
                <Card className="bg-[#202024] backdrop-blur-sm border-[#323238] flex flex-col h-full">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-[#bd18b4]" />
                      Produtor Exclusivo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 space-y-4">
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm">
                        Quer criar conteúdo exclusivo na plataforma? Torne-se um produtor e compartilhe seu conhecimento!
                      </p>
                    </div>
                    <div className="mt-auto">
                      <Button
                        variant="default"
                        onClick={() => {
                          const phoneNumber = '5583987690902';
                          const message = encodeURIComponent('Olá! Tenho interesse em me tornar um produtor exclusivo da plataforma.');
                          window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
                        }}
                        className="w-full bg-[#29292E] hover:bg-[#323238] text-white border border-[#323238] cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Quero Ser Produtor
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Card de Assinatura/Cancelamento */}
                <Card className="bg-[#202024] backdrop-blur-sm border-[#323238] flex flex-col h-full">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#bd18b4]" />
                      Assinatura
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 space-y-4">
                    {isLoadingSubscription ? (
                      <div className="text-gray-400 text-sm">Carregando informações da assinatura...</div>
                    ) : subscriptionPlan ? (
                      <>
                        <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                            <p className="text-white font-medium">Plano Atual</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[#bd18b4] font-semibold text-lg">{subscriptionPlan}</span>
                              <span className="text-gray-400 text-sm">Ativo</span>
                            </div>
                          </div>

                          <Separator className="bg-[#323238]" />

                          <div className="space-y-2">
                            <p className="text-white font-medium">Próxima cobrança</p>
                            <p className="text-gray-400 text-sm">
                              {subscriptionDetails?.currentPeriodEnd
                                ? `Em ${new Date(subscriptionDetails.currentPeriodEnd).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                : 'Data não disponível'
                              }
                            </p>
                          </div>
                        </div>

                        {/* Mudança de Plano Pendente */}
                        {pendingPlanChange && (
                          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <Clock className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-yellow-500 font-medium text-sm">Mudança de Plano Pendente</p>
                                <p className="text-gray-300 text-sm mt-1">
                                  {pendingPlanChange.paymentUrl ? (
                                    <>
                                      Para mudar para o plano <span className="font-semibold text-white">{pendingPlanChange.planName}</span> (R$ {pendingPlanChange.planPrice.toFixed(2).replace('.', ',')}/mês), realize o pagamento para concluir a mudança.
                                    </>
                                  ) : (
                                    <>
                                      Sua mudança para o plano <span className="font-semibold text-white">{pendingPlanChange.planName}</span> (R$ {pendingPlanChange.planPrice.toFixed(2).replace('.', ',')}/mês) está agendada.
                                    </>
                                  )}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {pendingPlanChange.paymentUrl && (
                                    <Button
                                      onClick={() => window.open(pendingPlanChange.paymentUrl, '_blank')}
                                      size="sm"
                                      className="bg-[#bd18b4] hover:bg-[#aa22c5] text-white cursor-pointer"
                                    >
                                      <CreditCard className="w-4 h-4 mr-2" />
                                      Realizar Pagamento
                                    </Button>
                                  )}
                                  <Button
                                    onClick={handleCancelPlanChange}
                                    disabled={isCancellingPlanChange}
                                    variant="outline"
                                    size="sm"
                                    className="bg-transparent hover:bg-yellow-500/10 text-yellow-500 border-yellow-500/50 hover:border-yellow-500 cursor-pointer"
                                  >
                                    {isCancellingPlanChange ? (
                                      <>Cancelando...</>
                                    ) : (
                                      <>
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Cancelar Mudança
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-auto pt-2">
                          <Button
                            onClick={() => setShowCancelSubscriptionDialog(true)}
                            variant="destructive"
                            className="w-full bg-[#29292E] hover:bg-[#323238] text-red-400 border border-red-500/30 cursor-pointer"
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Solicitar Cancelamento
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col flex-1 space-y-4">
                        <div className="flex-1">
                          <div className="text-gray-400 text-sm">
                            Você não possui uma assinatura ativa no momento.
                          </div>
                        </div>
                        <div className="mt-auto">
                          <Button
                            onClick={() => setShowChangePlanDialog(true)}
                            className="w-full bg-[#bd18b4] hover:bg-[#aa22c5] text-white cursor-pointer"
                          >
                            Ver Planos Disponíveis
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Dialog de Confirmação de Cancelamento */}
      <Dialog open={showCancelSubscriptionDialog} onOpenChange={setShowCancelSubscriptionDialog}>
        <DialogContent className="bg-[#202024] border-[#323238] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Cancelamento de Assinatura
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Tem certeza que deseja solicitar o cancelamento da sua assinatura?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-[#29292E] border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 text-sm font-medium mb-2">Importante:</p>
              <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                <li>Sua assinatura continuará ativa até o final do período pago</li>
                <li>Você perderá acesso aos recursos premium após o término do período</li>
                <li>Nossa equipe entrará em contato para confirmar o cancelamento</li>
                <li>Você pode reativar sua assinatura a qualquer momento</li>
              </ul>
            </div>

            <div className="bg-[#29292E] rounded-lg p-4">
              <p className="text-gray-400 text-sm">
                Se você está cancelando por algum problema ou insatisfação, por favor, entre em contato conosco primeiro.
                Estamos sempre prontos para ajudar e melhorar sua experiência.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCancelSubscriptionDialog(false)}
              className="border-[#323238] text-white hover:bg-[#29292E] cursor-pointer"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleRequestCancellation}
              variant="destructive"
              className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Confirmar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Trocar de Plano */}
      <Dialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
        <DialogContent className="bg-[#202024] border-[#323238] text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#bd18b4]">
              <CreditCard className="w-5 h-5" />
              Trocar de Plano
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Escolha o plano que melhor se adequa às suas necessidades
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border-2 p-4 md:p-6 transition-all cursor-pointer flex flex-col h-full ${subscriptionPlan === plan.name
                  ? 'border-[#bd18b4] bg-[#29292E] ring-2 ring-[#bd18b4]/30 ring-offset-2 ring-offset-[#1a1b1e]'
                  : plan.popular
                    ? 'border-[#bd18b4] bg-[#29292E]'
                    : 'border-[#323238] bg-[#29292E] hover:border-[#bd18b4]/40'
                  }`}
                onClick={() => handleChangePlan(plan.name)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#bd18b4] text-white text-xs font-bold px-3 py-1 rounded-full">
                      Popular
                    </span>
                  </div>
                )}

                {subscriptionPlan === plan.name && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 rounded-full bg-[#bd18b4] flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-[#bd18b4]">{plan.price}</span>
                    <span className="text-gray-400 text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-4 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-white/80">
                      <Check className="w-4 h-4 text-[#bd18b4] mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <Button
                    className={`w-full ${subscriptionPlan === plan.name
                      ? 'bg-[#29292E] hover:bg-[#29292E] text-[#bd18b4] border border-[#bd18b4] cursor-not-allowed'
                      : plan.popular
                        ? 'bg-[#bd18b4] hover:bg-[#aa22c5] text-white cursor-pointer'
                        : 'bg-[#29292E] hover:bg-[#323238] text-white border border-[#323238] cursor-pointer'
                      }`}
                    disabled={subscriptionPlan === plan.name}
                  >
                    {subscriptionPlan === plan.name ? 'Plano Atual' : 'Selecionar Plano'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowChangePlanDialog(false)}
              className="border-[#323238] text-white hover:bg-[#29292E] cursor-pointer"
              disabled={isChangingPlan}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Upgrade */}
      {upgradeData && (
        <UpgradeConfirmationModal
          data={upgradeData}
          isOpen={!!upgradeData}
          onClose={() => setUpgradeData(null)}
          onGoToPayment={handleGoToPayment}
          onShowPix={handleShowPix}
        />
      )}

      {/* Modal de Confirmação de Downgrade */}
      {downgradeData && (
        <DowngradeConfirmationModal
          data={downgradeData}
          isOpen={!!downgradeData}
          onClose={() => setDowngradeData(null)}
        />
      )}

      {/* Modal de Pagamento PIX */}
      {pixData && pixData.qrCode && (
        <PixPaymentModal
          isOpen={showPixModal}
          onClose={() => {
            setShowPixModal(false);
            setPixData(null);
          }}
          qrCode={pixData.qrCode}
          amount={pixData.amount}
          paymentUrl={pixData.paymentUrl}
        />
      )}

      {/* Modal de Suporte para Downgrade */}
      <Dialog open={showSupportModal} onOpenChange={setShowSupportModal}>
        <DialogContent className="bg-[#202024] border-[#323238] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <MessageCircle className="w-5 h-5 text-[#bd18b4]" />
              Fale com nosso suporte
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Para realizar o downgrade do seu plano, por favor entre em contato com nossa equipe de suporte.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-300 text-sm">
              Nossa equipe irá auxiliar você no processo de alteração do seu plano para garantir que tudo ocorra da melhor forma possível.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSupportModal(false)}
              className="border-[#323238] text-white hover:bg-[#29292E] cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                const phoneNumber = '5583987690902';
                const message = encodeURIComponent('Olá! Gostaria de solicitar o downgrade do meu plano.');
                window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
                setShowSupportModal(false);
              }}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contatar via WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1a1b1e] flex items-center justify-center">
        <LoadingGrid size="60" color="#bd18b4" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
