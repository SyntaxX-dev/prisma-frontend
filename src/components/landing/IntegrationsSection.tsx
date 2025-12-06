"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { Youtube, BookOpen, GraduationCap, Video, Play, Library } from "lucide-react";
import VariableProximity from "@/components/ui/VariableProximity";
import { GlowCard } from "@/components/external/nurui";

const integrations = [
  {
    icon: Youtube,
    name: "YouTube",
    description: "Principal fonte",
    color: "#FF0000",
    badge: "Integrado",
  },
  {
    icon: Video,
    name: "Vimeo",
    description: "Em breve",
    color: "#1AB7EA",
    badge: "Em breve",
  },
  {
    icon: BookOpen,
    name: "Udemy",
    description: "Em breve",
    color: "#A435F0",
    badge: "Em breve",
  },
  {
    icon: GraduationCap,
    name: "Coursera",
    description: "Em breve",
    color: "#0056D2",
    badge: "Em breve",
  },
  {
    icon: Library,
    name: "Khan Academy",
    description: "Em breve",
    color: "#14BF96",
    badge: "Em breve",
  },
  {
    icon: Play,
    name: "TED",
    description: "Em breve",
    color: "#E62B1E",
    badge: "Em breve",
  },
];

export function IntegrationsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-20 md:py-32 bg-[#050818] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(180,255,57,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(180,255,57,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
          style={{ position: 'relative' }}
        >
          <h2 className="text-4xl md:text-6xl text-white mb-6" style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 700 }}>
            <VariableProximity
              label="Integrações Disponíveis"
              fromFontVariationSettings="'wght' 300"
              toFontVariationSettings="'wght' 900"
              containerRef={containerRef}
              radius={150}
              falloff="exponential"
            />
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto" style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}>
            <VariableProximity
              label="Conecte-se com as maiores plataformas de conteúdo educacional do mundo. Atualmente integrado com YouTube, com muito mais por vir."
              fromFontVariationSettings="'wght' 300"
              toFontVariationSettings="'wght' 700"
              containerRef={containerRef}
              radius={120}
              falloff="linear"
            />
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {integrations.map((integration, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="relative"
            >
              {/* Badge */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    integration.badge === "Integrado"
                      ? "bg-[#B4FF39] text-black"
                      : "bg-gray-800/90 text-gray-400 border border-gray-700/50"
                  }`}
                  style={{ fontFamily: 'Metropolis, sans-serif' }}
                >
                  {integration.badge}
                </div>
              </div>

              <GlowCard
                glowColor={integration.badge === "Integrado" ? "green" : "blue"}
                customSize
                className="h-full w-full p-6 pt-8"
              >
                <div className="flex flex-col items-center justify-center text-center h-full space-y-3">
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center relative transition-all duration-300"
                    style={{
                      backgroundColor: integration.badge === "Integrado"
                        ? `${integration.color}15`
                        : "rgba(255,255,255,0.05)",
                    }}
                  >
                    <integration.icon
                      className="w-7 h-7 transition-all duration-300"
                      style={{
                        color: integration.badge === "Integrado"
                          ? integration.color
                          : "#6B7280",
                      }}
                    />
                  </div>

                  {/* Name */}
                  <h3
                    className="text-base font-semibold"
                    style={{
                      fontFamily: 'Metropolis, sans-serif',
                      color: integration.badge === "Integrado" ? "white" : "#9CA3AF",
                    }}
                  >
                    {integration.name}
                  </h3>

                  {/* Description */}
                  <p 
                    className="text-xs"
                    style={{
                      fontFamily: 'Metropolis, sans-serif',
                      fontWeight: 300,
                      color: integration.badge === "Integrado" ? "#D1D5DB" : "#6B7280",
                    }}
                  >
                    {integration.description}
                  </p>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p 
            className="text-gray-400 mb-4 text-lg"
            style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
          >
            Tem alguma sugestão de integração?
          </p>
          <button 
            className="text-[#B4FF39] hover:text-[#a3e830] transition-colors font-medium cursor-pointer"
            style={{ fontFamily: 'Metropolis, sans-serif' }}
          >
            Fale conosco →
          </button>
        </motion.div>
      </div>
    </section>
  );
}
