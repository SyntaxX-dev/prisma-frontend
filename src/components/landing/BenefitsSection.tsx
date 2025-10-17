"use client";

import { motion } from "motion/react";
import { Database, TrendingUp, Lock, Zap, Target, Users } from "lucide-react";

const benefits = [
  {
    icon: Database,
    title: "Dashboard Unificado",
    description:
      "Visualize estatísticas consolidadas de todos os seus cursos em uma única interface. Acompanhe seu progresso de forma clara e intuitiva.",
    color: "#B4FF39",
  },
  {
    icon: TrendingUp,
    title: "Análise Comparativa",
    description:
      "Compare seu desempenho entre diferentes tópicos e identifique oportunidades de crescimento com gráficos e métricas detalhadas.",
    color: "#8B5CF6",
  },
  {
    icon: Lock,
    title: "Sincronização Automática",
    description:
      "Seus dados de progresso são sincronizados em tempo real em todas as plataformas e dispositivos, mantendo tudo sempre atualizado.",
    color: "#EC4899",
  },
];

const features = [
  {
    icon: Target,
    title: "Curadoria Inteligente",
    description:
      "Conheça seu Produto Mais Lucrativo: identificamos automaticamente qual conteúdo gera mais valor para seu aprendizado.",
    badge: "Popular",
  },
  {
    icon: Users,
    title: "Comunidade Integrada",
    description:
      "Vincule seus colegas e analise o CR de todos os cursos de forma assertiva, criando um ambiente colaborativo de aprendizagem.",
    badge: "Novo",
  },
  {
    icon: Zap,
    title: "Poder sem Inteligência",
    description:
      "Saiba exatamente qual conteúdo assistir em cada momento graças à nossa análise detalhada de impacto por tópico.",
    badge: "Exclusivo",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-[#0A0E27] to-[#050818] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#B4FF39] to-transparent opacity-30" />

      <div className="container mx-auto px-4">
        {/* First benefit block */}
        <div className="max-w-6xl mx-auto mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left mb-12"
          >
            <h2 className="text-4xl md:text-6xl text-white mb-6">
              Pare de perder dinheiro{" "}
              <br className="hidden md:block" />
              com estudos no{" "}
              <span className="text-[#B4FF39]">Caos</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl">
              Estudantes amadores gastam tempo sem saber como está a performance
              do seu aprendizado, tornando-o uma operação sem previsibilidade de
              resultados. O PRISMA traz dados estratégicos em tempo real para
              você validar e escalar sua jornada.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 h-full hover:border-[#B4FF39] transition-all duration-300">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 relative"
                    style={{ backgroundColor: `${benefit.color}20` }}
                  >
                    <benefit.icon
                      className="w-7 h-7"
                      style={{ color: benefit.color }}
                    />
                    <div
                      className="absolute inset-0 opacity-20 blur-xl rounded-xl"
                      style={{ backgroundColor: benefit.color }}
                    />
                  </div>
                  <h3 className="text-2xl text-white mb-4">{benefit.title}</h3>
                  <p className="text-gray-400 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Second benefit block */}
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl text-white mb-6">
              Nunca mais pague por{" "}
              <span className="text-red-500 line-through decoration-2">
                conteúdos extras
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Chega de pagar taxas extras abusivas. Com o PRISMA você escala sem
              limites.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group"
              >
                {/* Badge */}
                <div className="absolute -top-3 left-6 z-10">
                  <div className="bg-[#B4FF39] text-black px-4 py-1 rounded-full text-sm">
                    {feature.badge}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 h-full hover:border-[#B4FF39] transition-all duration-300 pt-10">
                  <div className="w-12 h-12 bg-[#B4FF39]/10 rounded-lg flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-[#B4FF39]" />
                  </div>
                  <h3 className="text-xl text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
