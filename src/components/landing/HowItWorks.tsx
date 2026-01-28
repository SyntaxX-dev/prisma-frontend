"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Quote } from "lucide-react";
import { PencilScribble } from "@/components/ui/PencilScribble";

const reviews = [
  {
    id: 1,
    rating: 5,
    text: "O Prisma mudou completamente minha forma de estudar! Antes eu perdia horas procurando videoaulas no YouTube. Agora tudo está organizado em trilhas.",
    author: "Lucas Almeida",
    role: "Estudante de Engenharia",
  },
  {
    id: 2,
    rating: 5,
    text: "Estava estudando para o ENEM sem rumo nenhum. Com o Prisma consegui seguir uma trilha estruturada e acompanhar meu progresso.",
    author: "Mariana Costa",
    role: "Estudante de Medicina",
  },
  {
    id: 3,
    rating: 5,
    text: "Melhor plataforma para quem quer passar em concurso! O conteúdo curado poupa centenas de horas de pesquisa.",
    author: "Rafael Souza",
    role: "Estudante de Direito",
  },
];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentReview = reviews[currentIndex];

  return (
    <section className="py-24 bg-[#1a1b1e] relative overflow-hidden">
      {/* Decorative scribbles */}
      <div className="absolute inset-0 pointer-events-none">
        <PencilScribble
          path="M 0 30 Q 50 10, 100 30 T 200 30"
          color="#bd18b4"
          width={250}
          height={50}
          className="absolute top-20 left-10 opacity-10"
        />
        <PencilScribble
          path="M 0 20 Q 40 40, 80 20 T 160 20"
          color="#aa22c5"
          width={200}
          height={50}
          className="absolute bottom-20 right-10 opacity-10"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight"
                style={{ fontFamily: 'Metropolis, sans-serif' }}
              >
                O que nossos alunos
                <br />
                <span className="relative inline-block">
                  <span className="text-[#bd18b4]">estão dizendo</span>
                  <PencilScribble
                    path="M 0 5 Q 60 0, 120 5 T 240 5"
                    color="#bd18b4"
                    width={260}
                    height={15}
                    className="absolute -bottom-1 left-0 opacity-50"
                  />
                </span>
              </h2>

              <p
                className="text-gray-400 text-lg"
                style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
              >
                Milhares de estudantes já transformaram sua forma de aprender.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => window.location.href = '/plans'}
                  className="px-6 py-3 bg-[#bd18b4] text-white font-medium rounded-lg hover:bg-[#aa22c5] transition-colors cursor-pointer"
                  style={{ fontFamily: 'Metropolis, sans-serif' }}
                >
                  Começar agora
                </button>
                <button
                  onClick={() => window.location.href = '/auth/login'}
                  className="px-6 py-3 text-gray-400 hover:text-white font-medium transition-colors cursor-pointer"
                  style={{ fontFamily: 'Metropolis, sans-serif' }}
                >
                  Já tenho conta
                </button>
              </div>
            </motion.div>

            {/* Right Side - Review Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentReview.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-[#202024] border border-[#323238] rounded-2xl p-8 relative"
                >
                  {/* Quote icon */}
                  <Quote className="w-8 h-8 text-[#bd18b4]/30 mb-4" />

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(currentReview.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-[#bd18b4] text-[#bd18b4]"
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p
                    className="text-gray-300 mb-6 leading-relaxed"
                    style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                  >
                    "{currentReview.text}"
                  </p>

                  {/* Author */}
                  <div>
                    <h4
                      className="text-white font-semibold"
                      style={{ fontFamily: 'Metropolis, sans-serif' }}
                    >
                      {currentReview.author}
                    </h4>
                    <p
                      className="text-gray-500 text-sm"
                      style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                    >
                      {currentReview.role}
                    </p>
                  </div>

                  {/* Decorative scribble */}
                  <PencilScribble
                    path="M 0 10 Q 15 0, 30 10"
                    color="#bd18b4"
                    width={40}
                    height={20}
                    className="absolute top-4 right-4 opacity-30"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Pagination dots */}
              <div className="flex justify-center gap-2 mt-6">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${index === currentIndex
                      ? "w-8 bg-[#bd18b4]"
                      : "w-2 bg-[#323238] hover:bg-[#bd18b4]/50"
                      }`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}