"use client";

import { motion } from "motion/react";
import { Users, BookOpen, Brain, Zap, Target, Database } from "lucide-react";
import TextType from "@/components/ui/TextType";
import FuzzyText from "@/components/ui/FuzzyText";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { Aurora, Orb } from "@/components/backgrounds";

const benefits = [
  {
    icon: Users,
    title: "Comunidades Interativas",
    description:
      "Monte comunidades com outros estudantes e participe de chats em tempo real. Conecte-se com pessoas que compartilham os mesmos objetivos de aprendizado.",
    color: "#B4FF39",
  },
  {
    icon: BookOpen,
    title: "Conteúdo Organizado",
    description:
      "Nosso conteúdo é cuidadosamente separado por módulos e subcursos, facilitando sua navegação e garantindo um aprendizado estruturado e eficiente.",
    color: "#8B5CF6",
  },
  {
    icon: Brain,
    title: "IA de Resumos",
    description:
      "Nossa inteligência artificial gera resumos automáticos dos conteúdos estudados, otimizando seu tempo de revisão e fixação do conhecimento.",
    color: "#EC4899",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-[#0A0E27] to-[#050818] relative overflow-hidden">
      {/* Orb Background */}
      <div style={{ width: '100%', height: '600px', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0 }}>
        <Orb
          hoverIntensity={0.5}
          rotateOnHover={true}
          hue={0}
          forceHoverState={false}
        />
      </div>
      
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#B4FF39] to-transparent opacity-30 z-10" />

      <div className="container mx-auto px-4 relative z-20">
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
              <div style={{ fontFamily: 'Cubron Grotesk, sans-serif', fontWeight: 400 }}>
                <TextType 
                  text={["Pare de perder tempo"]}
                  typingSpeed={75}
                  pauseDuration={1500}
                  showCursor={false}
                  loop={false}
                  deletingSpeed={0}
                  startOnVisible={true}
                  className="block"
                />
                <br className="hidden md:block" />
                <span>
                  <TextType 
                    text={["com estudos no "]}
                    typingSpeed={75}
                    pauseDuration={1500}
                    showCursor={false}
                    loop={false}
                    deletingSpeed={0}
                    initialDelay={2000}
                    startOnVisible={true}
                    className="inline"
                  />
                  <TextType 
                    text={["Caos"]}
                    typingSpeed={75}
                    pauseDuration={1500}
                    showCursor={false}
                    loop={false}
                    deletingSpeed={0}
                    initialDelay={4000}
                    startOnVisible={true}
                    className="inline text-[#B4FF39] text-6xl font-bold"
                  />
                </span>
              </div>
            </h2>
            <p 
              className="text-xl text-gray-400 max-w-3xl"
              style={{ fontFamily: 'Cubron Grotesk, sans-serif', fontWeight: 300 }}
            >
              Estudantes perdem tempo navegando entre conteúdos descentralizados
              em diferentes plataformas, criando uma experiência fragmentada e
              ineficiente. O PRISMA centraliza e organiza todo o conteúdo em um
              só lugar, permitindo que você foque no que realmente importa.
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
                <SpotlightCard 
                  className="h-full"
                  spotlightColor={`rgba(${benefit.color === "#B4FF39" ? "180, 255, 57" : benefit.color === "#8B5CF6" ? "139, 92, 246" : "236, 72, 153"}, 0.2)`}
                >
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
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
