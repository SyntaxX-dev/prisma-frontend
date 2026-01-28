"use client";

import { motion } from "motion/react";
import { Youtube, BookOpen, Video, GraduationCap } from "lucide-react";
import { PencilScribble } from "@/components/ui/PencilScribble";

const integrations = [
  {
    icon: Youtube,
    name: "YouTube",
    status: "Integrado",
    color: "#FF0000",
    active: true,
  },
  {
    icon: Video,
    name: "Vimeo",
    status: "Em breve",
    color: "#1AB7EA",
    active: false,
  },
  {
    icon: BookOpen,
    name: "Udemy",
    status: "Em breve",
    color: "#A435F0",
    active: false,
  },
  {
    icon: GraduationCap,
    name: "Coursera",
    status: "Em breve",
    color: "#0056D2",
    active: false,
  },
];

export function IntegrationsSection() {
  return (
    <section className="py-24 bg-[#202024] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <PencilScribble
          path="M 0 25 Q 40 10, 80 25 T 160 25"
          color="#bd18b4"
          width={200}
          height={40}
          className="absolute top-16 right-20 opacity-10"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: 'Metropolis, sans-serif' }}
          >
            Integrações
          </h2>
          <p
            className="text-gray-400 max-w-lg mx-auto"
            style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
          >
            Conectamos você às melhores plataformas de conteúdo educacional.
          </p>
        </motion.div>

        {/* Integrations grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {integrations.map((integration, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div
                className={`bg-[#1a1b1e] border rounded-xl p-5 text-center transition-all duration-300 ${integration.active
                  ? 'border-[#bd18b4]/30 hover:border-[#bd18b4]/60'
                  : 'border-[#323238] opacity-60'
                  }`}
              >
                {/* Badge */}
                <div className="mb-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${integration.active
                      ? 'bg-[#bd18b4]/20 text-[#bd18b4]'
                      : 'bg-[#323238] text-gray-500'
                      }`}
                    style={{ fontFamily: 'Metropolis, sans-serif' }}
                  >
                    {integration.status}
                  </span>
                </div>

                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${integration.active ? '' : 'grayscale'
                    }`}
                  style={{
                    backgroundColor: integration.active ? `${integration.color}15` : '#29292E'
                  }}
                >
                  <integration.icon
                    className="w-6 h-6"
                    style={{ color: integration.active ? integration.color : '#6B7280' }}
                  />
                </div>

                {/* Name */}
                <h3
                  className={`font-medium ${integration.active ? 'text-white' : 'text-gray-500'}`}
                  style={{ fontFamily: 'Metropolis, sans-serif' }}
                >
                  {integration.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-10"
        >
          <p
            className="text-gray-500 text-sm"
            style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
          >
            Tem alguma sugestão?{" "}
            <button
              className="text-[#bd18b4] hover:underline cursor-pointer"
              style={{ fontFamily: 'Metropolis, sans-serif' }}
            >
              Fale conosco
            </button>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
