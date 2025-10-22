"use client";

import { motion } from "motion/react";
import { Search, ListChecks, Rocket } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Escolha seu tópico",
    description:
      "Navegue por centenas de categorias organizadas ou busque exatamente o que você precisa aprender.",
  },
  {
    icon: ListChecks,
    number: "02",
    title: "Siga o roteiro",
    description:
      "Cada tópico possui uma sequência cuidadosamente planejada de videoaulas, do básico ao avançado.",
  },
  {
    icon: Rocket,
    number: "03",
    title: "Evolua rapidamente",
    description:
      "Aprenda de forma estruturada e acompanhe seu progresso enquanto domina novos conhecimentos.",
  },
];

export function HowItWorks() {
  return (
    <section id="tutorial" className="py-20 md:py-32 bg-gradient-to-b from-[#0A0E27] to-[#050818] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-[#B4FF39] opacity-5 blur-3xl rounded-full" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#B4FF39] opacity-5 blur-3xl rounded-full" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl mb-6 text-white">
            Como <span className="text-[#B4FF39]">funciona</span>?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Três passos simples para transformar sua jornada de aprendizado.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative mb-12 last:mb-0"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Number and icon */}
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#B4FF39]/20 to-[#B4FF39]/5 border border-[#B4FF39] rounded-full flex items-center justify-center relative">
                    <step.icon className="w-10 h-10 text-[#B4FF39]" />
                  </div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#B4FF39] rounded-lg flex items-center justify-center text-black text-2xl">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl mb-3 text-white">
                    {step.title}
                  </h3>
                  <p className="text-lg text-gray-400 max-w-xl">
                    {step.description}
                  </p>
                </div>

                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute left-12 top-24 w-px h-24 bg-gradient-to-b from-[#B4FF39] to-transparent" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
