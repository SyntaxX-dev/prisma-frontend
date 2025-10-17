"use client";

import { motion } from "motion/react";
import { Youtube, BookOpen, GraduationCap, Video, Play, Library } from "lucide-react";

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
    description: "Em desenvolvimento",
    color: "#A435F0",
    badge: "Planejado",
  },
  {
    icon: GraduationCap,
    name: "Coursera",
    description: "Em análise",
    color: "#0056D2",
    badge: "Planejado",
  },
  {
    icon: Library,
    name: "Khan Academy",
    description: "Em avaliação",
    color: "#14BF96",
    badge: "Planejado",
  },
  {
    icon: Play,
    name: "TED",
    description: "Em estudo",
    color: "#E62B1E",
    badge: "Planejado",
  },
];

export function IntegrationsSection() {
  return (
    <section className="py-20 md:py-32 bg-[#050818] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(180,255,57,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(180,255,57,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl text-white mb-6">
            Integrações <span className="text-[#B4FF39]">Disponíveis</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Conecte-se com as maiores plataformas de conteúdo educacional do
            mundo. Atualmente integrado com YouTube, com muito mais por vir.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {integrations.map((integration, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="group relative"
            >
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-opacity-50 transition-all duration-300 text-center h-full flex flex-col items-center justify-center"
                style={{
                  borderColor:
                    integration.badge === "Integrado"
                      ? integration.color + "80"
                      : undefined,
                }}
              >
                {/* Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div
                    className={`px-3 py-1 rounded-full text-xs ${
                      integration.badge === "Integrado"
                        ? "bg-[#B4FF39] text-black"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {integration.badge}
                  </div>
                </div>

                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 relative"
                  style={{
                    backgroundColor:
                      integration.badge === "Integrado"
                        ? `${integration.color}20`
                        : "#1F293710",
                  }}
                >
                  <integration.icon
                    className="w-8 h-8"
                    style={{
                      color:
                        integration.badge === "Integrado"
                          ? integration.color
                          : "#9CA3AF",
                    }}
                  />
                  {integration.badge === "Integrado" && (
                    <div
                      className="absolute inset-0 opacity-20 blur-xl rounded-2xl"
                      style={{ backgroundColor: integration.color }}
                    />
                  )}
                </div>

                {/* Name */}
                <h3
                  className="text-lg mb-1"
                  style={{
                    color:
                      integration.badge === "Integrado" ? "white" : "#9CA3AF",
                  }}
                >
                  {integration.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-500">
                  {integration.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 mb-4">
            Tem alguma sugestão de integração?
          </p>
          <button className="text-[#B4FF39] hover:underline">
            Fale conosco →
          </button>
        </motion.div>
      </div>
    </section>
  );
}
