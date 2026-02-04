'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Sparkles, Zap } from 'lucide-react';
import { changePlan } from '@/api/subscriptions/change-plan';
import type { PlanType, ChangePlanData } from '@/types/subscription-api';
import { UpgradeConfirmationModal } from './UpgradeConfirmationModal';
import { PixPaymentModal } from './PixPaymentModal';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string; // Nome do recurso bloqueado (ex: "Geração de Questões com IA")
}

const PLANS = [
  {
    id: 'ULTRA' as PlanType,
    name: 'Ultra',
    price: 39.90,
    description: 'O plano completo para quem quer ser aprovado em qualquer prova.',
    popular: true,
    badge: 'Mais escolhido',
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
  },
  {
    id: 'PRODUCER' as PlanType,
    name: 'Produtor',
    price: 59.90,
    description: 'Tudo do Ultra + a liberdade de criar e monetizar seu conhecimento.',
    popular: false,
    badge: 'Para Criadores',
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
  },
];

export function PlanUpgradeModal({ isOpen, onClose, feature = 'este recurso' }: PlanUpgradeModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [upgradeData, setUpgradeData] = useState<ChangePlanData | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode: ChangePlanData['pixQrCode']; amount: number; paymentUrl?: string } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Controlar animação de entrada e saída
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Pequeno delay para garantir que o DOM renderizou antes de animar
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timeout = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (loading) return;
    setIsAnimating(false);
    setTimeout(() => onClose(), 300);
  };

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, loading]);

  if (!shouldRender) return null;

  const handleUpgrade = async (planId: PlanType) => {
    setLoading(true);
    setSelectedPlan(planId);

    try {
      const response = await changePlan({ newPlanId: planId });

      // Mostrar modal de detalhes do upgrade ao invés de redirecionar direto
      setUpgradeData(response.data);
      setLoading(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Erro ao fazer upgrade:', error);
      alert('Erro ao processar upgrade. Tente novamente.');
      setLoading(false);
      setSelectedPlan(null);
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

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 transition-all duration-300 ease-out ${
        isAnimating ? 'bg-black/80 opacity-100' : 'bg-black/0 opacity-0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          handleClose();
        }
      }}
    >
      <div
        className={`max-w-4xl w-full rounded-2xl md:rounded-3xl p-6 md:p-8 max-h-[90vh] overflow-y-auto transition-all duration-300 ease-out ${
          isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Recurso Premium
          </h2>
          <p className="text-white/70 text-sm md:text-base max-w-2xl mx-auto">
            {feature} é exclusivo para assinantes dos planos Ultra e Produtor.
            Escolha o plano ideal para você e desbloqueie todo o potencial da plataforma!
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="relative rounded-xl p-6 flex flex-col"
              style={{
                background: plan.popular
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: plan.popular
                  ? '2px solid rgba(139, 92, 246, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {plan.badge}
              </div>

              {/* Header */}
              <div className="mb-6 pt-2">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed min-h-[40px]">
                  {plan.description}
                </p>
              </div>

              {/* Features - flex-grow para empurrar botão para baixo */}
              <ul className="space-y-3 mb-6 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#bd18b4]" strokeWidth={3} />
                    <span className={`text-sm ${feature === 'Acesso a IA de resumos para cada curso' 
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-accent to-brand-secondary animate-gradient bg-[length:200%_auto] font-bold' 
                      : 'text-gray-300'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">R$ {plan.price.toFixed(2)}</span>
                  <span className="text-gray-500 text-sm">/mês</span>
                </div>
              </div>

              {/* Button sempre embaixo */}
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading && selectedPlan !== plan.id}
                className="w-full py-3 rounded-full font-medium transition-all duration-300 text-sm md:text-base text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-105 hover:brightness-110 active:scale-95"
                style={{
                  background: plan.popular
                    ? 'linear-gradient(135deg, #8b5cf6 0%, #db2777 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  border: plan.popular ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 0 0 0 rgba(139, 92, 246, 0)',
                  transition: 'all 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = plan.popular
                    ? '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(219, 39, 119, 0.4)'
                    : '0 0 20px rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 0 rgba(139, 92, 246, 0)';
                }}
              >
                {loading && selectedPlan === plan.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Escolher {plan.name}
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-center">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2.5 rounded-full font-medium transition-all duration-300 text-sm md:text-base text-white disabled:opacity-50 cursor-pointer hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#dc2626';
              e.currentTarget.style.borderColor = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <X className="w-4 h-4" />
              Fechar
            </div>
          </button>
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
    </div>
  );
}
