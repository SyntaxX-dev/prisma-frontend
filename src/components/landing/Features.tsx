"use client";

import { motion } from "motion/react";
import { FolderTree, Sparkles, Clock, Shield } from "lucide-react";

const features = [
  {
    icon: FolderTree,
    title: "Organização Inteligente",
    description:
      "Videoaulas categorizadas por tópicos e níveis de dificuldade para um aprendizado progressivo.",
  },
  {
    icon: Sparkles,
    title: "Curadoria de Qualidade",
    description:
      "Apenas os melhores vídeos do YouTube, selecionados e organizados por especialistas.",
  },
  {
    icon: Clock,
    title: "Economize Tempo",
    description:
      "Pare de perder horas procurando conteúdo. Encontre exatamente o que precisa em segundos.",
  },
  {
    icon: Shield,
    title: "Acesso Ilimitado",
    description:
      "Uma única assinatura para acesso completo a todos os cursos e videoaulas da plataforma.",
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
            Por que escolher o <span className="text-[#B4FF39]">PRISMA</span>?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Transformamos o caos do YouTube em uma experiência de aprendizado
            organizada e eficiente.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="relative h-full bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-[#B4FF39] transition-all duration-300">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-[#B4FF39] opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300" />

                <div className="relative">
                  <div className="w-12 h-12 bg-[#B4FF39]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#B4FF39]/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-[#B4FF39]" />
                  </div>

                  <h3 className="text-xl mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
