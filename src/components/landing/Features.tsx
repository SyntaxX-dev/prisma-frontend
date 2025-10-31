"use client";

import { motion } from "motion/react";
import { FolderTree, Sparkles, Clock, Shield } from "lucide-react";
import BlurText from "@/components/ui/BlurText";
import { GlowCard } from "@/components/external/nurui";

const features = [
  {
    icon: FolderTree,
    title: "Organização Inteligente",
    description:
      "Videoaulas categorizadas por tópicos e níveis de dificuldade para um aprendizado progressivo.",
    glowColor: "red" as const,
  },
  {
    icon: Sparkles,
    title: "Curadoria de Qualidade",
    description:
      "Apenas os melhores vídeos do YouTube, selecionados e organizados por especialistas.",
    glowColor: "orange" as const,
  },
  {
    icon: Clock,
    title: "Economize Tempo",
    description:
      "Pare de perder horas procurando conteúdo. Encontre exatamente o que precisa em segundos.",
    glowColor: "green" as const,
  },
  {
    icon: Shield,
    title: "Acesso Ilimitado",
    description:
      "Uma única assinatura para acesso completo a todos os cursos e videoaulas da plataforma.",
    glowColor: "purple" as const,
  },
];

export function Features() {
  return (
    <section id="funcionalidades" className="py-20 md:py-32 bg-[#050818] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#B4FF39] to-transparent opacity-50" />

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl mb-6 text-white">
            <BlurText
              text="Por que escolher o"
              delay={100}
              animateBy="words"
              direction="top"
              className="inline-block"
            />
            {' '}
            <BlurText
              text="PRISMA"
              delay={100}
              animateBy="words"
              direction="top"
              className="inline-block text-[#B4FF39]"
            />
            <BlurText
              text="?"
              delay={100}
              animateBy="words"
              direction="top"
              className="inline-block"
            />
          </h2>
          <BlurText
            text="Transformamos o caos do YouTube em uma experiência de aprendizado organizada e eficiente."
            delay={150}
            animateBy="words"
            direction="top"
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="h-full"
            >
              <GlowCard
                glowColor={feature.glowColor}
                customSize
                className="h-full w-full p-6"
              >
                <div className="flex flex-col h-full">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 
                    className="text-xl mb-3 text-white font-semibold"
                    style={{ fontFamily: 'Metropolis, sans-serif' }}
                  >
                    {feature.title}
                  </h3>
                  <p 
                    className="text-gray-300"
                    style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                  >
                    {feature.description}
                  </p>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
