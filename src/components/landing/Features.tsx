"use client";

import { motion } from "motion/react";
import { FolderTree, Sparkles, Clock, Shield } from "lucide-react";
import { PencilScribble } from "@/components/ui/PencilScribble";

const features = [
  {
    icon: FolderTree,
    title: "Organização",
    description: "Videoaulas categorizadas por tópicos e níveis.",
  },
  {
    icon: Sparkles,
    title: "Curadoria",
    description: "Apenas os melhores vídeos, selecionados por especialistas.",
  },
  {
    icon: Clock,
    title: "Economia de tempo",
    description: "Encontre exatamente o que precisa em segundos.",
  },
  {
    icon: Shield,
    title: "Acesso ilimitado",
    description: "Uma assinatura para todos os cursos da plataforma.",
  },
];

export function Features() {
  return (
    <section id="funcionalidades" className="py-24 bg-[#202024] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Hand-drawn star */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 opacity-10"
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path
              d="M 20 5 L 23 15 L 35 15 L 25 22 L 28 32 L 20 25 L 12 32 L 15 22 L 5 15 L 17 15 Z"
              stroke="#bd18b4"
              strokeWidth="1.5"
              fill="none"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        <PencilScribble
          path="M 0 40 Q 60 10, 120 40 T 240 40"
          color="#bd18b4"
          width={300}
          height={60}
          className="absolute bottom-10 left-10 opacity-10"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: 'Metropolis, sans-serif' }}
          >
            Funcionalidades
          </h2>
          <p
            className="text-gray-400 max-w-lg mx-auto"
            style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
          >
            Tudo que você precisa para estudar de forma eficiente.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-[#1a1b1e] border border-[#323238] rounded-xl p-6 h-full hover:border-[#bd18b4]/30 transition-all duration-300 text-center">
                {/* Icon */}
                <div className="w-14 h-14 bg-[#bd18b4]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-[#bd18b4]" />
                </div>

                {/* Title */}
                <h3
                  className="text-lg font-semibold text-white mb-2"
                  style={{ fontFamily: 'Metropolis, sans-serif' }}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p
                  className="text-gray-400 text-sm"
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                >
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
