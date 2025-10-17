"use client";

import { motion } from "motion/react";
import { Check, Zap, Sparkles, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Start",
    price: "29",
    period: "por mês",
    description: "Ideal para começar sua jornada",
    popular: false,
    color: "gray",
    features: [
      "Acesso a cursos básicos",
      "Videoaulas organizadas por tópico",
      "Atualizações mensais de conteúdo",
      "Suporte por email",
      "Acompanhamento de progresso",
    ],
  },
  {
    name: "Pro",
    price: "49",
    period: "por mês",
    description: "Para quem quer acelerar o aprendizado",
    popular: true,
    color: "purple",
    features: [
      "Acesso ilimitado a todos os cursos",
      "Videoaulas organizadas por tópico",
      "Atualizações semanais de conteúdo",
      "Suporte prioritário",
      "Acompanhamento de progresso",
      "Certificados de conclusão",
      "Downloads para assistir offline",
    ],
  },
  {
    name: "Ultra",
    price: "79",
    period: "por mês",
    description: "Aprendizado potencializado com IA",
    popular: false,
    color: "lime",
    features: [
      "Tudo do plano Pro +",
      "🤖 Assistente IA integrado",
      "Resumos automáticos de videoaulas",
      "Recomendações personalizadas por IA",
      "Quiz gerados por IA",
      "Tutoria com IA 24/7",
      "Análise de desempenho avançada",
      "Acesso antecipado a novos recursos",
    ],
  },
];

export function Pricing() {
  return (
    <section id="planos" className="py-20 md:py-32 bg-[#050818] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(180,255,57,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(180,255,57,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl mb-6 text-white">
            Escolha seu <span className="text-[#B4FF39]">Plano</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Investimento simples para um aprendizado ilimitado. Cancele quando quiser.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {/* Glow effect for popular/ultra */}
              {(plan.popular || plan.name === "Ultra") && (
                <div
                  className={`absolute -inset-1 bg-gradient-to-r ${
                    plan.name === "Ultra"
                      ? "from-[#B4FF39] via-purple-500 to-blue-500"
                      : "from-purple-500 to-purple-700"
                  } rounded-2xl blur opacity-25`}
                />
              )}

              {/* Card */}
              <div
                className={`relative bg-gradient-to-br from-gray-900 to-gray-800 border-2 ${
                  plan.popular
                    ? "border-purple-500"
                    : plan.name === "Ultra"
                    ? "border-[#B4FF39]"
                    : "border-gray-700"
                } rounded-2xl p-8 h-full flex flex-col`}
              >
                {/* Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-6 py-2 rounded-full flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">Mais popular</span>
                  </div>
                )}
                {plan.name === "Ultra" && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#B4FF39] to-[#8ac929] text-black px-6 py-2 rounded-full flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    <span className="text-sm">Com IA</span>
                  </div>
                )}

                {/* Plan name */}
                <div className="mb-4 mt-4">
                  <h3
                    className={`text-2xl mb-2 ${
                      plan.name === "Ultra" ? "text-[#B4FF39]" : "text-white"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-400 text-xl">R$</span>
                    <span
                      className={`text-5xl ${
                        plan.name === "Ultra" ? "text-[#B4FF39]" : "text-white"
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span className="text-gray-400 text-xl">,90</span>
                  </div>
                  <p className="text-gray-400 mt-1 text-sm">{plan.period}</p>
                </div>

                {/* Features */}
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
                      <div
                        className={`w-5 h-5 ${
                          plan.name === "Ultra"
                            ? "bg-[#B4FF39]/20"
                            : plan.popular
                            ? "bg-purple-500/20"
                            : "bg-gray-700"
                        } rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            plan.name === "Ultra"
                              ? "text-[#B4FF39]"
                              : plan.popular
                              ? "text-purple-400"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  size="lg"
                  className={`w-full py-6 ${
                    plan.name === "Ultra"
                      ? "bg-[#B4FF39] text-black hover:bg-[#a3e830]"
                      : plan.popular
                      ? "bg-purple-500 text-white hover:bg-purple-600"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                  onClick={() => window.location.href = '/auth/register'}
                >
                  {plan.name === "Ultra" ? "Experimentar Ultra" : "Começar agora"}
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="ml-2"
                  >
                    →
                  </motion.div>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {[
            { number: "10.000+", label: "Alunos ativos" },
            { number: "500+", label: "Cursos disponíveis" },
            { number: "50.000+", label: "Videoaulas" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl text-[#B4FF39] mb-2">
                {stat.number}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
