"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Check, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PencilScribble } from "@/components/ui/PencilScribble";
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
    period: "mês",
    description: "Ideal para quem quer começar a estudar de forma rápida e simples.",
    popular: false,
    features: [
      "Conteúdo segmentado",
      "Acesso a comunidades",
      "Direito a ofensivas",
      "Suporte 24/7",
    ],
    cta: "Assinar Start",
  },
  {
    planId: 'ULTRA' as const,
    name: "Ultra",
    price: "39.90",
    period: "mês",
    description: "O plano completo para quem quer ser aprovado em qualquer prova.",
    popular: true,
    features: [
      "Conteúdo segmentado",
      "Acesso a comunidades",
      "Direito a ofensivas",
      "Suporte 24/7",
      "Prioridade no suporte 24/7",
      "Acesso a todos os cursos premiums",
      "Geração de mapas mentais",
      "Acesso a IA de resumos para cada curso",
    ],
    cta: "Assinar Ultra",
  },
  {
    planId: 'PRODUCER' as const,
    name: "Produtor",
    price: "59.90",
    period: "mês",
    description: "Tudo do Ultra + a liberdade de criar e monetizar seu conhecimento.",
    popular: false,
    highlight: true,
    features: [
      "Conteúdo segmentado",
      "Acesso a comunidades",
      "Direito a ofensivas",
      "Suporte 24/7",
      "Prioridade no suporte 24/7",
      "Acesso a todos os cursos premiums",
      "Geração de mapas mentais",
      "Acesso a IA de resumos para cada curso",
      "Lançamento de cursos próprios",
    ],
    cta: "Começar a Criar",
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
    if (!isAuthenticated) {
      localStorage.setItem('selectedPlan', planId);
      window.location.href = `/checkout?plan=${planId}`;
      return;
    }

    if (!currentPlanId) {
      localStorage.setItem('selectedPlan', planId);
      window.location.href = `/checkout?plan=${planId}`;
      return;
    }

    if (currentPlanId === planId) {
      showError('Você já está neste plano');
      return;
    }


    try {
      const result = await changeUserPlan(planId);

      if (result.isUpgrade && result.creditAmount !== undefined) {
        setUpgradeData(result);
        setCurrentPlanId(planId);
      } else {
        setDowngradeData(result);
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

  const getButtonText = (planId: PlanType) => {
    if (!isAuthenticated || !currentPlanId) {
      const plan = plans.find(p => p.planId === planId);
      return plan?.cta || 'Assinar';
    }

    if (currentPlanId === planId) {
      return 'Plano Atual';
    }

    const planOrder: PlanType[] = ['START', 'PRO', 'ULTRA', 'PRODUCER'];
    const currentIndex = planOrder.indexOf(currentPlanId);
    const newIndex = planOrder.indexOf(planId);

    if (newIndex > currentIndex) {
      return `Upgrade para ${PLAN_NAMES[planId]}`;
    } else {
      return `Mudar para ${PLAN_NAMES[planId]}`;
    }
  };

  return (
    <section id="planos" className="py-12 bg-transparent relative overflow-hidden w-full">
      {/* Decorative scribbles */}
      <div className="absolute inset-0 pointer-events-none">
        <PencilScribble
          path="M 0 40 Q 80 10, 160 40 T 320 40"
          color="#bd18b4"
          width={400}
          height={60}
          className="absolute top-20 left-10 opacity-10"
        />
        <PencilScribble
          path="M 0 30 Q 60 50, 120 30 T 240 30"
          color="#aa22c5"
          width={300}
          height={60}
          className="absolute bottom-40 right-10 opacity-10"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: 'Metropolis, sans-serif' }}
          >
            Escolha seu{" "}
            <span className="relative inline-block">
              <span className="text-[#bd18b4]">plano</span>
              <PencilScribble
                path="M 0 5 Q 25 0, 50 5 T 100 5"
                color="#bd18b4"
                width={110}
                height={15}
                className="absolute -bottom-1 left-0 opacity-60"
              />
            </span>
          </h2>

          {/* Simple explanation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-400 text-sm mt-6">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-[#bd18b4]/20 text-[#bd18b4] rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}>Escolha um plano</span>
            </div>
            <ArrowRight className="w-4 h-4 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#bd18b4]" />
              <span style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}>Receba acesso por email</span>
            </div>
          </div>
        </motion.div>

        {/* Plans Container */}
        <div className="flex flex-nowrap lg:flex-wrap justify-center gap-6 lg:gap-8 max-w-[1440px] mx-auto w-full">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="w-full md:w-[calc(48%)] lg:w-[calc(31%)] min-w-[320px] max-w-[420px]"
            >
              <div
                className={`bg-surface-card rounded-2xl p-8 lg:p-12 min-h-[600px] flex flex-col relative transition-all duration-300 ${plan.popular
                  ? 'border-2 border-brand/50 shadow-[0_0_20px_rgba(189,24,180,0.15)]'
                  : plan.highlight
                    ? 'border-2 border-brand-accent/60 shadow-[0_0_25px_rgba(197,50,226,0.2)]'
                    : 'border border-surface-border'
                  } hover:border-brand/50 group`}
              >
                {/* Popular/Highlight badge */}
                {(plan.popular || plan.highlight) && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap z-20">
                    <span
                      className={`${plan.popular ? 'bg-[#bd18b4]' : 'bg-gradient-to-r from-brand to-brand-accent'} text-white text-[10px] lg:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg`}
                      style={{ fontFamily: 'Metropolis, sans-serif' }}
                    >
                      {plan.popular ? 'Mais escolhido' : 'Para Criadores'}
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6 pt-2">
                  <h3
                    className="text-xl font-bold mb-2 text-white"
                    style={{ fontFamily: 'Metropolis, sans-serif' }}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className="text-gray-400 text-sm leading-relaxed min-h-[40px]"
                    style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand" strokeWidth={3} />
                      <span
                        className={`text-sm ${feature === "Lançamento de cursos próprios"
                          ? "text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-accent to-brand-secondary animate-gradient bg-[length:200%_auto] font-bold"
                          : "text-gray-300"
                          }`}
                        style={{
                          fontFamily: 'Metropolis, sans-serif',
                          fontWeight: feature === "Lançamento de cursos próprios" ? 800 : 300,
                          animationDuration: feature === "Lançamento de cursos próprios" ? '3s' : undefined
                        }}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-3xl font-bold text-white"
                      style={{ fontFamily: 'Metropolis, sans-serif' }}
                    >
                      R${plan.price}
                    </span>
                    <span
                      className="text-gray-500 text-sm"
                      style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                    >
                      /{plan.period}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <Button
                  size="lg"
                  disabled={isChangingPlan || isLoadingSubscription || (isAuthenticated && currentPlanId === plan.planId)}
                  className={`w-full py-6 rounded-xl font-bold transition-all duration-300 cursor-pointer ${isAuthenticated && currentPlanId === plan.planId
                    ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                    : plan.highlight
                      ? "bg-gradient-to-r from-brand to-brand-accent text-white hover:scale-[1.02] shadow-lg shadow-brand/20"
                      : plan.popular
                        ? "bg-brand text-white hover:bg-brand-secondary"
                        : "bg-surface-card-alt text-white hover:bg-surface-border border border-surface-border"
                    }`}
                  onClick={() => handlePlanClick(plan.planId)}
                  style={{ fontFamily: 'Metropolis, sans-serif' }}
                >
                  {isChangingPlan || isLoadingSubscription ? 'Carregando...' : getButtonText(plan.planId)}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {upgradeData && (
        <UpgradeConfirmationModal
          data={upgradeData}
          isOpen={!!upgradeData}
          onClose={() => setUpgradeData(null)}
          onGoToPayment={handleGoToPayment}
          onShowPix={handleShowPix}
        />
      )}

      {downgradeData && (
        <DowngradeConfirmationModal
          data={downgradeData}
          isOpen={!!downgradeData}
          onClose={() => setDowngradeData(null)}
        />
      )}

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