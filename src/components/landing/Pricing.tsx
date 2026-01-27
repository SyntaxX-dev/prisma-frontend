"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Check, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PencilScribble } from "@/components/ui/PencilScribble";
import GradientText from "@/components/ui/GradientText";
import { useAuth } from "@/hooks/features/auth";
import { useChangePlan } from "@/hooks/features/subscriptions";
import { getSubscription } from "@/api/subscriptions/get-subscription";
import { UpgradeConfirmationModal } from "@/components/features/subscriptions/UpgradeConfirmationModal";
import { DowngradeConfirmationModal } from "@/components/features/subscriptions/DowngradeConfirmationModal";
import { PixPaymentModal } from "@/components/features/subscriptions/PixPaymentModal";
import { ChangePlanData, PlanType, PLAN_NAMES } from "@/types/subscription-api";
import { useNotifications } from "@/hooks/shared";

const plans = [
  {
    planId: 'START' as const,
    name: "Start",
    price: "12.90",
    period: "Mensal",
    description: "Ideal para quem quer começar a estudar e acelerar seus estudos de forma rápida e simples.",
    popular: false,
    features: [
      "Conteúdo segmentado",
      "Acesso a comunidades",
      "Direito a ofensivas",
      "Suporte 24/7",
    ],
    cta: "Assinar Start",
    trial: "",
    checkoutUrl: undefined, // Usa o fluxo padrão de checkout
  },
  {
    planId: 'PRO' as const,
    name: "Pro",
    price: "39.90",
    period: "Mensal",
    description: "O plano perfeito para quem quer acelerar seus estudos e alcançar resultados reais.",
    popular: true,
    features: [
      "Conteúdo segmentado",
      "Acesso a comunidades",
      "Direito a ofensivas",
      "Suporte 24/7",
      "Prioridade no suporte 24/7",
      "Acesso a todos os cursos premiums",
      "Acesso as trilhas de aprendizado e PDF's",
    ],
    cta: "Assinar PRO",
    trial: "",
    checkoutUrl: undefined, // Usa o fluxo padrão de checkout
  },
  {
    planId: 'ULTRA' as const,
    name: "Ultra",
    price: "59.90",
    period: "Mensal",
    description: "Ideal para quem quer ser aprovado em qualquer prova.",
    popular: false,
    features: [
      "Conteúdo segmentado",
      "Acesso a comunidades",
      "Direito a ofensivas",
      "Suporte 24/7",
      "Prioridade no suporte 24/7",
      "Acesso a todos os cursos premiums",
      "Acesso as trilhas de aprendizado e PDF's",
      "Acesso a IA de resumos para cada curso"
    ],
    cta: "Assinar Ultra",
    trial: "",
    checkoutUrl: undefined, // Usa o fluxo padrão de checkout
  },
];

export function Pricing() {
  const { isAuthenticated, user } = useAuth();
  const { changeUserPlan, loading: isChangingPlan } = useChangePlan();
  const { showError, showSuccess } = useNotifications();
  
  const [currentPlanId, setCurrentPlanId] = useState<PlanType | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [upgradeData, setUpgradeData] = useState<ChangePlanData | null>(null);
  const [downgradeData, setDowngradeData] = useState<ChangePlanData | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode: ChangePlanData['pixQrCode']; amount: number; paymentUrl?: string } | null>(null);

  // Carregar assinatura atual se usuário estiver autenticado
  useEffect(() => {
    const loadSubscription = async () => {
      if (!isAuthenticated) {
        setCurrentPlanId(null);
        setIsLoadingSubscription(false);
        return;
      }

      try {
        setIsLoadingSubscription(true);
        const response = await getSubscription();
        if (response.success && response.data) {
          setCurrentPlanId(response.data.planId);
        } else {
          setCurrentPlanId(null);
        }
      } catch (error: any) {
        // Se não houver assinatura (404) ou erro de autenticação (401), não mostrar erro
        // 401 pode acontecer se o token expirou, mas não queremos bloquear o usuário
        if (error?.status !== 404 && error?.status !== 401) {
          console.error('Erro ao carregar assinatura:', error);
        }
        setCurrentPlanId(null);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    loadSubscription();
  }, [isAuthenticated]);

  const handlePlanClick = async (planId: PlanType) => {
    // Se usuário não estiver autenticado, usar fluxo normal de checkout
    if (!isAuthenticated) {
      localStorage.setItem('selectedPlan', planId);
      window.location.href = `/checkout?plan=${planId}`;
      return;
    }

    // Se usuário estiver autenticado mas não tiver assinatura, usar checkout
    if (!currentPlanId) {
      localStorage.setItem('selectedPlan', planId);
      window.location.href = `/checkout?plan=${planId}`;
      return;
    }

    // Se já está no mesmo plano
    if (currentPlanId === planId) {
      showError('Você já está neste plano');
      return;
    }

    // Usuário autenticado com assinatura - usar upgrade/downgrade
    try {
      const result = await changeUserPlan(planId);

      if (result.isUpgrade && result.creditAmount !== undefined) {
        // É upgrade imediato - mostrar modal com detalhes
        setUpgradeData(result);
        // Atualizar plano na interface imediatamente
        setCurrentPlanId(planId);
      } else {
        // Downgrade ou mudança agendada - mostrar modal informativo
        setDowngradeData(result);
        // Não atualizar plano na interface (será efetivado na data informada)
      }
    } catch (error: any) {
      const errorMessage = error.details?.message || error.message || 'Erro ao trocar de plano. Tente novamente mais tarde.';
      showError(errorMessage);
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

  // Função para determinar o texto do botão
  const getButtonText = (planId: PlanType) => {
    if (!isAuthenticated || !currentPlanId) {
      const plan = plans.find(p => p.planId === planId);
      return plan?.cta || 'Assinar';
    }

    if (currentPlanId === planId) {
      return 'Plano Atual';
    }

    // Determinar se é upgrade ou downgrade
    const planOrder: PlanType[] = ['START', 'PRO', 'ULTRA'];
    const currentIndex = planOrder.indexOf(currentPlanId);
    const newIndex = planOrder.indexOf(planId);
    
    if (newIndex > currentIndex) {
      return `Fazer Upgrade para ${PLAN_NAMES[planId]}`;
    } else {
      return `Mudar para ${PLAN_NAMES[planId]}`;
    }
  };

  return (
    <section id="planos" className="min-h-screen w-full py-20 md:py-32 bg-[#1a1b1e] relative overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        .pricing-button,
        .pricing-button *,
        .pricing-button button,
        .pricing-button [data-slot="button"] {
          cursor: pointer !important;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        .scribble-float {
          animation: float 3s ease-in-out infinite;
        }
      `}} />
      
      {/* Pencil Scribbles Background - Decorative */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <PencilScribble
          path="M 50 100 Q 200 50, 350 100 T 650 100 T 950 100"
          color="#3b82f6"
          width={1000}
          height={200}
          className="absolute top-20 left-10 opacity-30 scribble-float"
          style={{ animationDelay: '0s' }}
        />
        <PencilScribble
          path="M 100 300 Q 250 250, 400 300 T 700 300"
          color="#8b5cf6"
          width={800}
          height={200}
          className="absolute top-1/3 right-20 opacity-25 scribble-float"
          style={{ animationDelay: '1s' }}
        />
        <PencilScribble
          path="M 200 500 Q 400 450, 600 500"
          color="#3b82f6"
          width={600}
          height={150}
          className="absolute bottom-1/4 left-1/4 opacity-20 scribble-float"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-20">
        {/* Header with explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="relative inline-block mb-6">
            <h2
              className="text-4xl md:text-6xl mb-4 text-white font-bold relative"
              style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 700 }}
            >
              Primeiro Passo: Escolha seu Plano
              <PencilScribble
                path="M 10 50 Q 100 30, 200 50 T 400 50"
                color="#3b82f6"
                width={450}
                height={60}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-60"
              />
            </h2>
          </div>
          
          {/* Explanation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#202024] rounded-2xl p-6 md:p-8 border border-[#323238] max-w-3xl mx-auto mb-8 relative"
          >
            <div className="absolute -top-3 -right-3">
              <PencilScribble
                path="M 0 20 Q 10 0, 20 20 T 40 20"
                color="#8b5cf6"
                width={50}
                height={30}
                className="opacity-50"
              />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 text-left">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <span className="bg-[#8b5cf6] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  Escolha seu plano
                </h3>
                <p className="text-gray-400 text-sm md:text-base">
                  Selecione o plano que melhor se adequa às suas necessidades de estudo.
                </p>
              </div>
              <ArrowRight className="text-[#8b5cf6] w-6 h-6 flex-shrink-0 hidden md:block" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Mail className="text-[#8b5cf6] w-6 h-6" />
                  Receba acesso por email
                </h3>
                <p className="text-gray-400 text-sm md:text-base">
                  Após o pagamento, você receberá um email com o link para criar sua conta e começar a estudar!
                </p>
              </div>
            </div>
            <div className="absolute -bottom-2 -left-2">
              <PencilScribble
                path="M 0 0 Q 15 10, 30 0"
                color="#3b82f6"
                width={40}
                height={20}
                className="opacity-40"
              />
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group"
            >
              {/* Card with checkout colors */}
              <div
                className={`
                  relative rounded-2xl p-8 h-full flex flex-col
                  ${plan.popular
                    ? 'bg-[#202024] border-2 border-[#8b5cf6]/70 shadow-[0_0_40px_rgba(139,92,246,0.3)]'
                    : 'bg-[#202024] border border-[#323238]'
                  }
                  transition-all duration-300
                  ${plan.popular ? 'hover:shadow-[0_0_60px_rgba(139,92,246,0.4)] hover:border-[#8b5cf6]' : 'hover:border-[#8b5cf6]/40'}
                `}
              >
                {/* Pencil scribble on popular card */}
                {plan.popular && (
                  <div className="absolute -top-4 right-8">
                    <PencilScribble
                      path="M 0 10 Q 15 0, 30 10"
                      color="#8b5cf6"
                      width={40}
                      height={20}
                      className="opacity-60"
                    />
                  </div>
                )}

                {/* Badge */}
                {plan.popular && (
                  <div className="relative">
                    <div
                      className="absolute -top-3 right-6 bg-[#8b5cf6] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg"
                      style={{ fontFamily: 'Metropolis, sans-serif' }}
                    >
                      Mais Popular
                    </div>
                    <PencilScribble
                      path="M 0 15 Q 10 5, 20 15"
                      color="#3b82f6"
                      width={30}
                      height={20}
                      className="absolute -top-1 right-4 opacity-50"
                    />
                  </div>
                )}

                {/* Plan name and description */}
                <div className="mb-8">
                  <h3
                    className="text-2xl font-bold text-white mb-3"
                    style={{ fontFamily: 'Metropolis, sans-serif' }}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className="text-gray-400 text-sm leading-relaxed"
                    style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Features list */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.li
                      key={featureIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: featureIndex * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-[#8b5cf6]" strokeWidth={3} />
                      </div>
                      <span
                        className="text-gray-300 text-sm leading-relaxed"
                        style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                      >
                        {feature === "Acesso a IA de resumos para cada curso" ? (
                          <GradientText
                            colors={["#ef4444", "#f97316", "#eab308", "#bd18b4", "#3b82f6", "#8b5cf6", "#ef4444"]}
                            animationSpeed={3}
                            showBorder={false}
                          >
                            {feature}
                          </GradientText>
                        ) : (
                          feature
                        )}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                {/* Price section */}
                <div className="mt-auto">
                  <div className="flex items-end justify-between mb-6">
                    <div className="flex items-baseline gap-1">
                      <span
                        className="text-5xl font-bold text-white"
                        style={{ fontFamily: 'Metropolis, sans-serif' }}
                      >
                        R${plan.price}
                      </span>
                      {plan.period && (
                        <span
                          className="text-gray-500 text-sm ml-1"
                          style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                        >
                          / {plan.period}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="space-y-2">
                    <Button
                      size="lg"
                      disabled={isChangingPlan || isLoadingSubscription || (isAuthenticated && currentPlanId === plan.planId)}
                      className={`
                        pricing-button w-full py-6 rounded-xl font-bold text-sm tracking-wider uppercase
                        transition-all duration-300 relative z-10
                        ${isAuthenticated && currentPlanId === plan.planId
                          ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                          : plan.popular
                          ? "bg-white text-black hover:bg-gray-100 hover:scale-[1.02] cursor-pointer"
                          : "bg-[#8b5cf6] text-white hover:bg-[#7c3aed] hover:scale-[1.02] cursor-pointer"
                        }
                      `}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePlanClick(plan.planId);
                      }}
                    >
                      {isChangingPlan || isLoadingSubscription ? 'Carregando...' : getButtonText(plan.planId)}
                    </Button>
                    <p
                      className="text-gray-500 text-xs text-center pt-1 cursor-pointer"
                      style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                    >
                      {plan.trial}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

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
    </section>
  );
}