"use client";

import { useState, useEffect, Suspense } from "react";
import { Navbar } from "../../../components/Navbar";
import { Sidebar } from "../../../components/Sidebar";
import { LoadingGrid } from "@/components/ui/loading-grid";
import { useAuth } from "../../../hooks/features/auth";
import { useNotifications } from "../../../hooks/shared";
import { usePageDataLoad } from "@/hooks/shared";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import {
  Settings,
  CreditCard,
  AlertTriangle,
  X,
  ArrowRight,
  Check,
  MessageCircle,
  UserPlus
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
  const [showCancelSubscriptionDialog, setShowCancelSubscriptionDialog] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);

  usePageDataLoad({
    waitForData: false,
    customDelay: 0
  });



  const toggleTheme = () => {
    setIsDark(!isDark);
  };


  // Carregar informações da assinatura
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        setIsLoadingSubscription(true);
        const token = localStorage.getItem('auth_token');
        // Aqui você faria a chamada à API para obter informações da assinatura
        // Por enquanto, vamos simular
        // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription`, {
        //   headers: { 'Authorization': `Bearer ${token}` }
        // });
        // const data = await response.json();
        // setSubscriptionPlan(data.plan || null);
        
        // Simulação - você deve substituir pela chamada real à API
        setSubscriptionPlan('Pro'); // ou null se não tiver assinatura
      } catch (error) {
        console.error('Erro ao carregar assinatura:', error);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

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

  const handleChangePlan = async (newPlan: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      // Aqui você faria a chamada à API para trocar de plano
      // await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/change-plan`, {
      //   method: 'POST',
      //   headers: { 
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ plan: newPlan })
      // });
      
      setSubscriptionPlan(newPlan);
      showSuccess(`Plano alterado para ${newPlan} com sucesso!`);
      setShowChangePlanDialog(false);
    } catch (error) {
      showError('Erro ao trocar de plano. Tente novamente mais tarde.');
    }
  };

  const plans = [
    {
      name: 'Start',
      price: 'R$ 29,90',
      period: '/mês',
      features: [
        'Acesso a todos os cursos',
        'Comunidades ilimitadas',
        'Suporte por email',
        'Certificados de conclusão'
      ],
      popular: false
    },
    {
      name: 'Pro',
      price: 'R$ 49,90',
      period: '/mês',
      features: [
        'Tudo do plano Start',
        'Acesso prioritário a novos cursos',
        'Suporte prioritário',
        'Mapas mentais ilimitados',
        'Relatórios de progresso avançados'
      ],
      popular: true
    },
    {
      name: 'Ultra',
      price: 'R$ 79,90',
      period: '/mês',
      features: [
        'Tudo do plano Pro',
        'Mentoria individual mensal',
        'Acesso a conteúdo exclusivo',
        'Sessões de coaching',
        'Suporte 24/7'
      ],
      popular: false
    }
  ];


  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div
        className={`fixed inset-0 transition-all duration-300 ${isDark
          ? 'bg-gray-950'
          : 'bg-gray-500'
          }`}
        style={{
          backgroundImage: isDark
            ? `
            radial-gradient(circle at 25% 25%, rgba(179, 226, 64, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(179, 226, 64, 0.04) 0%, transparent 50%)
          `
            : `
            radial-gradient(circle at 25% 25%, rgba(179, 226, 64, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(179, 226, 64, 0.05) 0%, transparent 50%)
          `
        }}
      />

      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 10%, rgba(201, 254, 2, 0.06), transparent 20%),
            radial-gradient(circle at 85% 90%, rgba(201, 254, 2, 0.04), transparent 20%)
          `
        }}
      />

      <div
        className={`fixed inset-0 backdrop-blur-sm transition-all duration-300 ${isDark ? 'bg-black/30' : 'bg-black/10'
          }`}
      />

      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0'
        }}
      />

      <div className="relative z-10 flex">
        <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
        <div className="flex-1">
          <Navbar isDark={isDark} toggleTheme={toggleTheme} />

          <div className="p-2 ml-10" style={{ marginTop: '80px' }}>
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div>
                  <h1 className="text-white text-3xl font-bold">Configurações</h1>
                  <p className="text-white/60 text-lg">Personalize sua experiência na plataforma</p>
                </div>
              </div>
            </div>

            <div className="w-full space-y-6">
              {/* Seção de Trocar de Plano - Topo, largura completa */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    Trocar de Plano
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/60 text-sm mb-6">
                    Escolha o plano que melhor se adequa às suas necessidades. Você pode trocar a qualquer momento.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                      <div
                        key={plan.name}
                        className={`relative rounded-xl border-2 p-6 transition-all cursor-pointer flex flex-col h-full ${
                          plan.popular
                            ? 'border-[#B4FF39] bg-[#B4FF39]/10'
                            : 'border-white/20 bg-white/5 hover:border-white/40'
                        } ${
                          subscriptionPlan === plan.name
                            ? 'ring-2 ring-[#B4FF39] ring-offset-2 ring-offset-gray-900'
                            : ''
                        }`}
                        onClick={() => handleChangePlan(plan.name)}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="bg-[#B4FF39] text-black text-xs font-bold px-3 py-1 rounded-full">
                              Popular
                            </span>
                          </div>
                        )}

                        {subscriptionPlan === plan.name && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 rounded-full bg-[#B4FF39] flex items-center justify-center">
                              <Check className="w-4 h-4 text-black" />
                            </div>
                          </div>
                        )}

                        <div className="text-center mb-4">
                          <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-3xl font-bold text-[#B4FF39]">{plan.price}</span>
                            <span className="text-white/60 text-sm">{plan.period}</span>
                          </div>
                        </div>

                        <ul className="space-y-2 mb-4 flex-1">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-white/80">
                              <Check className="w-4 h-4 text-[#B4FF39] mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-auto">
                          <Button
                            onClick={() => handleChangePlan(plan.name)}
                            className={`w-full cursor-pointer ${
                              subscriptionPlan === plan.name
                                ? 'bg-white/20 text-white cursor-not-allowed'
                                : plan.popular
                                ? 'bg-[#B4FF39] hover:bg-[#B4FF39]/80 text-black'
                                : 'bg-white/10 hover:bg-white/20 text-white'
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card de Sugestões via WhatsApp */}
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 flex flex-col h-full">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-green-400" />
                      Sugestões
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 space-y-4">
                    <div className="flex-1">
                      <p className="text-white/60 text-sm">
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
                        className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Enviar Mensagem
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Card de Produtor Exclusivo */}
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 flex flex-col h-full">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-purple-400" />
                      Produtor Exclusivo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 space-y-4">
                    <div className="flex-1">
                      <p className="text-white/60 text-sm">
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
                        className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Quero Ser Produtor
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Card de Assinatura/Cancelamento */}
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 flex flex-col h-full">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-yellow-400" />
                      Assinatura
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 space-y-4">
                    {isLoadingSubscription ? (
                      <div className="text-white/60 text-sm">Carregando informações da assinatura...</div>
                    ) : subscriptionPlan ? (
                      <>
                        <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                            <p className="text-white font-medium">Plano Atual</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[#B4FF39] font-semibold text-lg">{subscriptionPlan}</span>
                              <span className="text-white/60 text-sm">Ativo</span>
                            </div>
                          </div>

                          <Separator className="bg-white/10" />

                          <div className="space-y-2">
                            <p className="text-white font-medium">Próxima cobrança</p>
                            <p className="text-white/60 text-sm">Em 15 de fevereiro de 2025</p>
                          </div>
                        </div>

                        <div className="mt-auto pt-2">
                          <Button
                            onClick={() => setShowCancelSubscriptionDialog(true)}
                            variant="destructive"
                            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 cursor-pointer"
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Solicitar Cancelamento
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col flex-1 space-y-4">
                        <div className="flex-1">
                          <div className="text-white/60 text-sm">
                            Você não possui uma assinatura ativa no momento.
                          </div>
                        </div>
                        <div className="mt-auto">
                          <Button
                            onClick={() => setShowChangePlanDialog(true)}
                            className="w-full bg-[#B4FF39] hover:bg-[#B4FF39]/80 text-black cursor-pointer"
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
        <DialogContent className="bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Cancelamento de Assinatura
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Tem certeza que deseja solicitar o cancelamento da sua assinatura?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 text-sm font-medium mb-2">Importante:</p>
              <ul className="text-white/70 text-sm space-y-1 list-disc list-inside">
                <li>Sua assinatura continuará ativa até o final do período pago</li>
                <li>Você perderá acesso aos recursos premium após o término do período</li>
                <li>Nossa equipe entrará em contato para confirmar o cancelamento</li>
                <li>Você pode reativar sua assinatura a qualquer momento</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-white/60 text-sm">
                Se você está cancelando por algum problema ou insatisfação, por favor, entre em contato conosco primeiro. 
                Estamos sempre prontos para ajudar e melhorar sua experiência.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCancelSubscriptionDialog(false)}
              className="border-white/20 text-white hover:bg-white/10 cursor-pointer"
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
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#B4FF39]">
              <CreditCard className="w-5 h-5" />
              Trocar de Plano
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Escolha o plano que melhor se adequa às suas necessidades
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border-2 p-6 transition-all cursor-pointer flex flex-col h-full ${
                  plan.popular
                    ? 'border-[#B4FF39] bg-[#B4FF39]/10'
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                } ${
                  subscriptionPlan === plan.name
                    ? 'ring-2 ring-[#B4FF39] ring-offset-2 ring-offset-gray-900'
                    : ''
                }`}
                onClick={() => handleChangePlan(plan.name)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#B4FF39] text-black text-xs font-bold px-3 py-1 rounded-full">
                      Popular
                    </span>
                  </div>
                )}

                {subscriptionPlan === plan.name && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 rounded-full bg-[#B4FF39] flex items-center justify-center">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-[#B4FF39]">{plan.price}</span>
                    <span className="text-white/60 text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-4 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-white/80">
                      <Check className="w-4 h-4 text-[#B4FF39] mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <Button
                    className={`w-full ${
                      subscriptionPlan === plan.name
                        ? 'bg-white/20 text-white cursor-not-allowed'
                        : plan.popular
                        ? 'bg-[#B4FF39] hover:bg-[#B4FF39]/80 text-black cursor-pointer'
                        : 'bg-white/10 hover:bg-white/20 text-white cursor-pointer'
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
              className="border-white/20 text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingGrid size="60" color="#B3E240" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
