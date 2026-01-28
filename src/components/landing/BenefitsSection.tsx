"use client";

import { motion } from "motion/react";
import { Users, BookOpen, Brain } from "lucide-react";
import { PencilScribble } from "@/components/ui/PencilScribble";

const benefits = [
  {
    icon: Users,
    title: "Comunidades",
    description: "Conecte-se com outros estudantes em grupos de estudo.",
    color: "#bd18b4",
  },
  {
    icon: BookOpen,
    title: "Conteúdo Curado",
    description: "Vídeos selecionados e organizados em trilhas de aprendizado.",
    color: "#aa22c5",
  },
  {
    icon: Brain,
    title: "IA de Resumos",
    description: "Resumos automáticos para otimizar seu tempo de estudo.",
    color: "#a727a0",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-24 bg-[#1a1b1e] relative overflow-hidden">
      {/* Decorative scribbles */}
      <div className="absolute inset-0 pointer-events-none">
        <PencilScribble
          path="M 0 50 Q 100 20, 200 50 T 400 50"
          color="#bd18b4"
          width={500}
          height={80}
          className="absolute top-10 left-5 opacity-10"
        />
        <PencilScribble
          path="M 0 30 Q 80 50, 160 30 T 320 30"
          color="#aa22c5"
          width={400}
          height={60}
          className="absolute bottom-20 right-10 opacity-10"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: 'Metropolis, sans-serif' }}
          >
            Por que escolher o{" "}
            <span className="relative inline-block">
              <span className="text-[#bd18b4]">Prisma</span>
              <PencilScribble
                path="M 0 5 Q 30 0, 60 5 T 120 5"
                color="#bd18b4"
                width={130}
                height={15}
                className="absolute -bottom-1 left-0 opacity-60"
              />
            </span>
            ?
          </h2>
          <p
            className="text-gray-400 max-w-xl mx-auto"
            style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
          >
            Focamos no que realmente importa: seu aprendizado eficiente.
          </p>
        </motion.div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-[#202024] border border-[#323238] rounded-2xl p-8 h-full hover:border-[#bd18b4]/30 transition-all duration-300">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${benefit.color}15` }}
                >
                  <benefit.icon
                    className="w-6 h-6"
                    style={{ color: benefit.color }}
                  />
                </div>

                {/* Title */}
                <h3
                  className="text-xl font-semibold text-white mb-3"
                  style={{ fontFamily: 'Metropolis, sans-serif' }}
                >
                  {benefit.title}
                </h3>

                {/* Description */}
                <p
                  className="text-gray-400 text-sm leading-relaxed"
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                >
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
