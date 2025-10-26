"use client";

import { motion } from "motion/react";
import { Play, ArrowRight, Sparkles, BookOpen, Video, FileText, Users, Brain, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Prism from "./Prism";
import SplitText from "./SplitText";

export function VideoHero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#0A0E27]">
      {/* ==================== PRISM BACKGROUND ==================== */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
          <Prism
            animationType="rotate"
            timeScale={0.5}
            height={3.5}
            baseWidth={5.5}
            scale={3.6}
            hueShift={0}
            colorFrequency={1}
            noise={0}
            glow={1}
          />
        </div>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content - LAYOUT DIVIDIDO EM DUAS COLUNAS */}
      <div className="container mx-auto px-4 relative z-30 h-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center">

          {/* LADO ESQUERDO - CONTEÚDO PRINCIPAL */}
          <div className="space-y-8">
            {/* Main heading */}
            <div className="text-4xl md:text-6xl lg:text-7xl text-white leading-tight font-bold text-left">
              <SplitText
                text="Desbloqueie o"
                className="text-white"
                tag="span"
                splitType="chars"
                delay={50}
                duration={0.8}
                ease="power3.out"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                textAlign="left"
                style={{ fontFamily: 'Cubron Grotesk, sans-serif', fontWeight: 400 }}
              />
              <span className="text-[#B4FF39] relative inline-block">
                <SplitText
                  text="conhecimento"
                  className="text-[#B4FF39]"
                  tag="span"
                  splitType="chars"
                  delay={30}
                  duration={0.6}
                  ease="power3.out"
                  from={{ opacity: 0, y: 40, scale: 0.8 }}
                  to={{ opacity: 1, y: 0, scale: 1 }}
                  textAlign="left"
                  style={{ fontFamily: 'Cubron Grotesk, sans-serif', fontWeight: 600 }}
                />
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-[#B4FF39]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 2 }}
                />
              </span>
              <SplitText
                text="que você pensava estar fora de alcance"
                className="text-white"
                tag="span"
                splitType="chars"
                delay={40}
                duration={0.7}
                ease="power3.out"
                from={{ opacity: 0, y: 30 }}
                to={{ opacity: 1, y: 0 }}
                textAlign="left"
                style={{ fontFamily: 'Cubron Grotesk, sans-serif', fontWeight: 400 }}
              />
            </div>

            <SplitText
              text="Agora a apenas um clique de distância"
              className="text-xl text-gray-300 leading-relaxed text-left"
              tag="p"
              splitType="words"
              delay={80}
              duration={0.6}
              ease="power2.out"
              from={{ opacity: 0, y: 30, scale: 0.9 }}
              to={{ opacity: 1, y: 0, scale: 1 }}
              textAlign="left"
              style={{ fontFamily: 'Cubron Grotesk, sans-serif', fontWeight: 300 }}
            />

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center gap-4"
            >
              <Button
                size="lg"
                className="bg-black cursor-pointer text-white hover:bg-gray-900 px-8 py-6 text-lg group border border-purple-500/30"
                onClick={() => {
                  const planosSection = document.getElementById('planos');
                  if (planosSection) {
                    planosSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                style={{ fontFamily: 'Cubron Grotesk, sans-serif', fontWeight: 400 }}
              >
                Ver Planos
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>

          {/* LADO DIREITO - VISUALIZAÇÃO DE DADOS */}
          <div className="relative flex items-center justify-center h-96 lg:h-full">
            {/* Círculos concêntricos */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[1, 2, 3, 4].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute border border-white/20 rounded-full"
                  style={{
                    width: `${ring * 120}px`,
                    height: `${ring * 120}px`,
                  }}
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 20 + ring * 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ))}
            </div>

            {/* Texto central */}
            <div className="text-center z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-6xl md:text-8xl font-bold text-white"
                style={{ fontFamily: 'Cubron Grotesk, sans-serif', fontWeight: 800 }}
              >
                20k+
              </motion.div>
            </div>

            {/* Elementos flutuantes - Fotos de perfil */}
            {[
              { position: "top-4 left-1/2 -translate-x-1/2", delay: 0.8, isCustom: true, iconSrc: "/icone7.png" },
              { position: "right-4 top-1/2 -translate-y-1/2", delay: 1.0, isCustom: true, iconSrc: "/icone8.png" },
              { position: "bottom-4 left-1/2 -translate-x-1/2", delay: 1.2, isCustom: true, iconSrc: "/icone9.png" },
              { position: "left-4 top-1/2 -translate-y-1/2", delay: 1.4, isCustom: true, iconSrc: "/icone10.png" },
            ].map((item, index) => (
              <motion.div
                key={index}
                className={`absolute ${item.position}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: item.delay }}
              >
                {item.isCustom ? (
                  <img 
                    src={item.iconSrc} 
                    alt="Custom Icon" 
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {String.fromCharCode(65 + index)}
                  </div>
                )}
              </motion.div>
            ))}

            {/* Elementos flutuantes - Ícones */}
            {[
              { icon: "custom", iconSrc: "/icone1.png", position: "top-8 right-8", color: "blue", delay: 1.6 },
              { icon: "custom", iconSrc: "/icone2.png", position: "left-8 top-1/3", color: "pink", delay: 1.8 },
              { icon: "custom", iconSrc: "/icone3.png", position: "bottom-8 right-1/3", color: "purple", delay: 2.0 },
              { icon: "custom", iconSrc: "/icone4.png", position: "right-16 bottom-1/4", color: "pink", delay: 2.2 },
              { icon: "custom", iconSrc: "/icone5.png", position: "top-1/3 right-1/4", color: "blue", delay: 2.4 },
              { icon: "custom", iconSrc: "/icone6.png", position: "left-1/3 bottom-1/4", color: "pink", delay: 2.6 },
            ].map((item, index) => (
              <motion.div
                key={index}
                className={`absolute ${item.position} w-16 h-16 flex items-center justify-center text-2xl`}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: item.delay }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {item.icon === "custom" ? (
                  <img 
                    src={item.iconSrc} 
                    alt="Custom Icon" 
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  item.icon
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
