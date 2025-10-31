"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, PlayCircle } from "lucide-react";
import Threads from "@/components/backgrounds/Threads";
import GradientText from "@/components/ui/GradientText";

const reviews = [
  {
    id: 1,
    rating: 5,
    text: "Egestas nullam nulla pellentesque tempor est cursus. Auctor ante senean varius dictum quam. Tincidunt sit eget neque viverra. Vitae et in in justo odio eget fermentum ut facilisi.",
    highlight: "Eo in aliquam placerat lorem, viverra elementum",
    author: "James Cooper",
    role: "Chief Marketing Officer",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: 2,
    rating: 5,
    text: "Essa plataforma transformou completamente minha carreira! Em apenas 3 meses consegui minha primeira vaga como desenvolvedora. O conteúdo é extremamente bem estruturado.",
    highlight: "Mudou minha vida profissional completamente",
    author: "Ana Carolina Silva",
    role: "Desenvolvedora Front-end",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 3,
    rating: 5,
    text: "Melhor investimento que já fiz na minha carreira! Os roteiros estruturados me pouparam centenas de horas de pesquisa. Aprendi mais em 2 meses do que em 1 ano.",
    highlight: "ROI incrível, vale cada centavo",
    author: "Pedro Henrique Costa",
    role: "Engenheiro de Software",
    avatar: "https://i.pravatar.cc/150?img=13",
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
    <section className="relative min-h-[600px] bg-[#050818] overflow-hidden">
      {/* Threads Background */}
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
        <Threads
          amplitude={1}
          distance={0}
          enableMouseInteraction={false}
        />
      </div>

      {/* Container */}
      <div className="relative z-10 container mx-auto px-6 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-8">
              {/* Main Heading */}
              <h1 
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
                style={{ fontFamily: 'Metropolis, sans-serif' }}
              >
                <span className="text-white">Veja o que outras pessoas</span>
                <br />
                <span className="text-white">Estão falando </span>
                <GradientText
                  colors={["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ef4444"]}
                  animationSpeed={5}
                  showBorder={false}
                >
                  sobre nós
                </GradientText>
              </h1>

              {/* Subtitle */}
              <p 
                className="text-lg md:text-xl text-gray-400 max-w-xl"
                style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
              >
                Veja como nossos alunos estão alcançando resultados reais e acelerando seus estudos.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-4">
                {/* Demo Button - Outline */}
                <button 
                  className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white font-medium hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                  style={{ fontFamily: 'Metropolis, sans-serif' }}
                >
                  <PlayCircle className="w-5 h-5" />
                  <span>Assinar</span>
                </button>

                {/* Sign up Button - White filled */}
                <button 
                  className="inline-flex items-center px-6 py-3.5 rounded-full bg-white text-black font-medium hover:bg-gray-100 transition-all duration-300"
                  style={{ fontFamily: 'Metropolis, sans-serif' }}
                >
                  Entrar
                </button>
              </div>
            </div>

            {/* Right Side - Review Card */}
            <div className="relative">
              {/* Animated glow behind card */}
              <motion.div
                animate={{
                  opacity: [0.4, 0.6, 0.4],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -inset-8 bg-gradient-to-br from-purple-600/30 via-fuchsia-600/30 to-purple-600/30 blur-3xl rounded-3xl"
              />

              {/* Review Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentReview.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(currentReview.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-orange-400 text-orange-400"
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <div className="space-y-4 mb-8">
                    <p 
                      className="text-gray-300 text-base leading-relaxed"
                      style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                    >
                      "{currentReview.text}"
                    </p>
                    <p 
                      className="text-gray-500 text-base italic"
                      style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                    >
                      {currentReview.highlight}
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-1 ring-white/10">
                      <img
                        src={currentReview.avatar}
                        alt={currentReview.author}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 
                        className="text-white font-semibold text-base"
                        style={{ fontFamily: 'Metropolis, sans-serif' }}
                      >
                        {currentReview.author}
                      </h3>
                      <p 
                        className="text-gray-500 text-sm"
                        style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
                      >
                        {currentReview.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Pagination dots */}
              <div className="flex justify-center gap-2 mt-6">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "w-8 bg-white"
                        : "w-1.5 bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}