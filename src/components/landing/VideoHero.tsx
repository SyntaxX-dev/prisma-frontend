"use client";

import { motion } from "motion/react";
import { Play, ArrowRight, Sparkles, BookOpen, Video, FileText, Users, Brain, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VideoHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0E27]">
      {/* ==================== VÍDEO DE FUNDO ==================== */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* Vídeo de fundo real */}
        <motion.video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.8 }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-data-visualization-network-6840/1080p.mp4"
            type="video/mp4"
          />
        </motion.video>
        
        {/* Fallback caso o vídeo não carregue */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27]">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(180,255,57,0.03)_50%,transparent_52%)] bg-[length:20px_20px] animate-pulse" />
        </div>

        {/* Constelação de pontos animados - materiais de estudos */}
        <div className="absolute inset-0">
          {/* Pontos de constelação */}
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#B4FF39] rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}
          
          {/* Linhas conectando os pontos */}
          <svg className="absolute inset-0 w-full h-full">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.line
                key={i}
                x1={`${Math.random() * 100}%`}
                y1={`${Math.random() * 100}%`}
                x2={`${Math.random() * 100}%`}
                y2={`${Math.random() * 100}%`}
                stroke="#B4FF39"
                strokeWidth="0.5"
                opacity="0.3"
                animate={{
                  opacity: [0.1, 0.4, 0.1],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </svg>
        </div>

        {/* Ícones flutuantes de materiais de estudos */}
        <div className="absolute inset-0">
          {[
            { icon: BookOpen, x: 15, y: 20, delay: 0 },
            { icon: Video, x: 85, y: 15, delay: 0.5 },
            { icon: FileText, x: 10, y: 70, delay: 1 },
            { icon: Users, x: 90, y: 75, delay: 1.5 },
            { icon: Brain, x: 50, y: 10, delay: 2 },
            { icon: Target, x: 20, y: 50, delay: 2.5 },
            { icon: Zap, x: 80, y: 45, delay: 3 },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0.7, 1],
                scale: [0, 1, 0.9, 1],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: item.delay,
                ease: "easeInOut",
              }}
            >
              <div className="w-12 h-12 bg-[#B4FF39]/20 backdrop-blur-sm border border-[#B4FF39]/40 rounded-full flex items-center justify-center shadow-lg shadow-[#B4FF39]/20">
                <item.icon className="w-6 h-6 text-[#B4FF39]" />
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Efeitos de luz sutis */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#B4FF39] opacity-10 blur-3xl rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 opacity-10 blur-3xl rounded-full"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Overlay escuro para melhor legibilidade - estilo Netflix */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Floating badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute top-24 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="flex items-center gap-2 bg-[#B4FF39]/10 backdrop-blur-md border border-[#B4FF39]/30 rounded-full px-6 py-3 shadow-lg shadow-[#B4FF39]/20">
          <Sparkles className="w-4 h-4 text-[#B4FF39]" />
          <span className="text-[#B4FF39] text-sm">
            Melhor custo benefício do mercado
          </span>
        </div>
      </motion.div>

      {/* Content - TEXTO SOBRE O VÍDEO */}
      <div className="container mx-auto px-4 relative z-30 pt-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl mb-8 text-white leading-tight"
          >
            <motion.span
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Organize seu aprendizado
            </motion.span>
            <br />
            de forma{" "}
            <span className="text-[#B4FF39] relative inline-block">
              <motion.span
                animate={{ textShadow: ["0 0 10px rgba(180, 255, 57, 0)", "0 0 20px rgba(180, 255, 57, 0.5)", "0 0 10px rgba(180, 255, 57, 0)"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                precisa
              </motion.span>
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 bg-[#B4FF39]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              />
            </span>{" "}
            e{" "}
            <span className="text-[#B4FF39] relative inline-block">
              <motion.span
                animate={{ textShadow: ["0 0 10px rgba(180, 255, 57, 0)", "0 0 20px rgba(180, 255, 57, 0.5)", "0 0 10px rgba(180, 255, 57, 0)"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                acessível
              </motion.span>
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 bg-[#B4FF39]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 mb-4 max-w-4xl mx-auto leading-relaxed"
          >
            Primeira plataforma de <span className="text-[#B4FF39]">videoaulas do YouTube</span> organizadas por tópicos no Brasil
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg text-gray-400 mb-4 max-w-3xl mx-auto"
          >
            Nunca mais pague aplicativos caros para ter acesso aos seus estudos.
            Com o PRISMA você escala sem limites sua jornada de conhecimento.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-12 flex flex-wrap items-center justify-center gap-3 text-sm"
          >
            <span className="text-gray-500">Planos disponíveis:</span>
            <span className="px-3 py-1 bg-gray-800/50 border border-gray-700 rounded-full text-gray-300">
              Start
            </span>
            <span className="px-3 py-1 bg-gray-800/50 border border-purple-500/50 rounded-full text-purple-300">
              Pro
            </span>
            <span className="px-3 py-1 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-[#B4FF39]/50 rounded-full text-[#B4FF39]">
              Ultra 🤖 com IA
            </span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              size="lg"
              className="bg-[#B4FF39] text-black hover:bg-[#a3e830] px-10 py-7 text-lg group"
              onClick={() => window.location.href = '/auth/register'}
            >
              Cadastre-se
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#B4FF39] text-[#B4FF39] hover:bg-[#B4FF39] hover:text-black px-10 py-7 text-lg group"
              onClick={() => window.location.href = '/auth/login'}
            >
              <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              Ver demonstração
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {[
              { value: "10K+", label: "Alunos ativos" },
              { value: "500+", label: "Cursos organizados" },
              { value: "50K+", label: "Videoaulas" },
              { value: "98%", label: "Satisfação" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-[#B4FF39] transition-all"
              >
                <div className="text-3xl md:text-4xl text-[#B4FF39] mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-[#B4FF39] rounded-full flex justify-center pt-2"
        >
          <motion.div className="w-1 h-2 bg-[#B4FF39] rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
