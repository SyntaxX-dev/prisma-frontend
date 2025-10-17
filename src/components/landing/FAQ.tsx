"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "Como funciona a curadoria dos vídeos?",
    answer:
      "Nossa equipe de especialistas seleciona cuidadosamente os melhores vídeos do YouTube para cada tópico. Analisamos qualidade de conteúdo, didática, avaliações e feedback dos usuários para garantir apenas o melhor material para seu aprendizado.",
  },
  {
    question: "Posso acessar de qualquer dispositivo?",
    answer:
      "Sim! O PRISMA é totalmente responsivo e funciona perfeitamente em computadores, tablets e smartphones. Seu progresso é sincronizado automaticamente entre todos os dispositivos.",
  },
  {
    question: "Qual a diferença entre o PRISMA e assistir diretamente no YouTube?",
    answer:
      "No YouTube, você perde tempo procurando conteúdo e não tem uma sequência estruturada de aprendizado. No PRISMA, todo o conteúdo é organizado em trilhas de aprendizado progressivas, com o melhor conteúdo já selecionado para você.",
  },
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer:
      "Sim, você pode cancelar sua assinatura quando quiser, sem multas ou taxas extras. Você continuará tendo acesso até o fim do período já pago.",
  },
  {
    question: "Vocês emitem certificados?",
    answer:
      "Sim! Ao concluir uma trilha de aprendizado completa, você recebe um certificado digital que pode ser compartilhado em suas redes sociais e currículo.",
  },
  {
    question: "Com que frequência o conteúdo é atualizado?",
    answer:
      "Adicionamos novos cursos e videoaulas semanalmente. Nossa equipe está sempre buscando o melhor conteúdo novo do YouTube para manter a plataforma sempre atualizada.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="suporte" className="py-20 md:py-32 bg-gradient-to-b from-[#0A0E27] to-[#050818] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#B4FF39] opacity-5 blur-3xl rounded-full" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500 opacity-5 blur-3xl rounded-full" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl text-white mb-6">
            Perguntas <span className="text-[#B4FF39]">Frequentes</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Tudo o que você precisa saber sobre o PRISMA
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="mb-4"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-[#B4FF39] transition-all duration-300 text-left"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg md:text-xl text-white pr-8">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0 w-8 h-8 bg-[#B4FF39]/10 rounded-lg flex items-center justify-center">
                    {openIndex === index ? (
                      <Minus className="w-5 h-5 text-[#B4FF39]" />
                    ) : (
                      <Plus className="w-5 h-5 text-[#B4FF39]" />
                    )}
                  </div>
                </div>

                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? "auto" : 0,
                    opacity: openIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="text-gray-400 mt-4 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              </button>
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
          <p className="text-gray-400 mb-4">Ainda tem dúvidas?</p>
          <button className="text-[#B4FF39] hover:underline text-lg">
            Entre em contato com nosso suporte →
          </button>
        </motion.div>
      </div>
    </section>
  );
}
