"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { PencilScribble } from "@/components/ui/PencilScribble";

const faqs = [
  {
    question: "Como funciona a curadoria dos vídeos?",
    answer:
      "Nossa equipe seleciona cuidadosamente os melhores vídeos do YouTube para cada tópico, analisando qualidade de conteúdo, didática e avaliações.",
  },
  {
    question: "Posso acessar de qualquer dispositivo?",
    answer:
      "Sim! O Prisma é totalmente responsivo e funciona em computadores, tablets e smartphones. Seu progresso é sincronizado automaticamente.",
  },
  {
    question: "Qual a diferença entre o Prisma e o YouTube?",
    answer:
      "No YouTube você perde tempo procurando conteúdo. No Prisma, tudo é organizado em trilhas de aprendizado progressivas com o melhor conteúdo já selecionado.",
  },
  {
    question: "Posso cancelar minha assinatura?",
    answer:
      "Sim, você pode cancelar quando quiser, sem multas. Você continua com acesso até o fim do período pago.",
  },
  {
    question: "Vocês emitem certificados?",
    answer:
      "Sim! Ao concluir uma trilha completa, você recebe um certificado digital que pode compartilhar.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="suporte" className="py-24 bg-[#202024] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <PencilScribble
          path="M 0 30 Q 50 10, 100 30 T 200 30"
          color="#bd18b4"
          width={250}
          height={50}
          className="absolute top-16 left-10 opacity-10"
        />
        <PencilScribble
          path="M 0 20 Q 30 40, 60 20 T 120 20"
          color="#aa22c5"
          width={150}
          height={40}
          className="absolute bottom-20 right-20 opacity-10"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: 'Metropolis, sans-serif' }}
          >
            Perguntas{" "}
            <span className="text-[#bd18b4]">frequentes</span>
          </h2>
          <p
            className="text-gray-400"
            style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
          >
            Tudo que você precisa saber sobre o Prisma.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-2xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full bg-[#1a1b1e] border border-[#323238] rounded-xl p-5 hover:border-[#bd18b4]/30 transition-all duration-300 text-left cursor-pointer"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3
                    className="text-white font-medium"
                    style={{ fontFamily: 'Metropolis, sans-serif' }}
                  >
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0 w-6 h-6 bg-[#bd18b4]/10 rounded-lg flex items-center justify-center">
                    {openIndex === index ? (
                      <Minus className="w-4 h-4 text-[#bd18b4]" />
                    ) : (
                      <Plus className="w-4 h-4 text-[#bd18b4]" />
                    )}
                  </div>
                </div>

                <div
                  className={`grid transition-all duration-300 ${openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                >
                  <div className="overflow-hidden">
                    <p
                      className="text-gray-400 mt-3 text-sm leading-relaxed"
                      style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-10"
        >
          <p
            className="text-gray-500 text-sm"
            style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
          >
            Ainda tem dúvidas?{" "}
            <button
              className="text-[#bd18b4] hover:underline cursor-pointer"
              style={{ fontFamily: 'Metropolis, sans-serif' }}
            >
              Entre em contato
            </button>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
