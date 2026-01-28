"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { PencilScribble } from "@/components/ui/PencilScribble";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#1a1b1e]">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #bd18b4 1px, transparent 1px),
            linear-gradient(to bottom, #bd18b4 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Floating scribbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%]"
        >
          <PencilScribble
            path="M 0 30 Q 30 0, 60 30 T 120 30"
            color="#bd18b4"
            width={140}
            height={50}
            className="opacity-20"
          />
        </motion.div>

        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-40 right-[15%]"
        >
          <PencilScribble
            path="M 0 20 Q 20 0, 40 20 T 80 20"
            color="#aa22c5"
            width={100}
            height={40}
            className="opacity-15"
          />
        </motion.div>

        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-40 left-[20%]"
        >
          <PencilScribble
            path="M 0 15 Q 25 0, 50 15 T 100 15"
            color="#bd18b4"
            width={120}
            height={35}
            className="opacity-15"
          />
        </motion.div>

        {/* Hand-drawn circles */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-[10%]"
        >
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <path
              d="M 40 10 Q 65 10, 70 40 Q 70 65, 40 70 Q 15 70, 10 40 Q 10 15, 40 10"
              stroke="#bd18b4"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              style={{ strokeDasharray: "200", strokeDashoffset: "0" }}
            />
          </svg>
        </motion.div>

        {/* Arrow scribble */}
        <motion.div
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 right-[25%]"
        >
          <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
            <path
              d="M 5 20 L 45 20 M 35 10 L 50 20 L 35 30"
              stroke="#aa22c5"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-20"
            />
          </svg>
        </motion.div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo with animation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <Image
              src="/logo-prisma.svg"
              alt="Prisma Logo"
              width={80}
              height={80}
              className="mx-auto mb-6"
              priority
            />
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative inline-block mb-6"
          >
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
              style={{ fontFamily: 'Metropolis, sans-serif' }}
            >
              Aprenda de forma
              <br />
              <span className="relative inline-block">
                <span className="text-[#bd18b4]">organizada</span>
                <PencilScribble
                  path="M 0 5 Q 50 0, 100 5 T 200 5"
                  color="#bd18b4"
                  width={220}
                  height={20}
                  className="absolute -bottom-2 left-0 opacity-60"
                />
              </span>
              {" "}e{" "}
              <span className="relative inline-block">
                <span className="text-[#aa22c5]">eficiente</span>
                <PencilScribble
                  path="M 0 5 Q 40 0, 80 5 T 160 5"
                  color="#aa22c5"
                  width={180}
                  height={20}
                  className="absolute -bottom-2 left-0 opacity-60"
                />
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
            style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
          >
            Transformamos o caos do YouTube em trilhas de aprendizado
            estruturadas. Chega de perder tempo procurando conteúdo.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => window.location.href = '/plans'}
              className="px-8 py-4 bg-[#bd18b4] text-white font-semibold rounded-xl hover:bg-[#aa22c5] transition-all duration-300 cursor-pointer shadow-lg shadow-[#bd18b4]/20 hover:shadow-[#bd18b4]/40"
              style={{ fontFamily: 'Metropolis, sans-serif' }}
            >
              Começar gratuitamente
            </button>
            <button
              onClick={() => document.getElementById('funcionalidades')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 text-gray-400 hover:text-white font-medium transition-colors cursor-pointer flex items-center gap-2"
              style={{ fontFamily: 'Metropolis, sans-serif' }}
            >
              Saiba mais
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm"
            style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 300 }}
          >
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#bd18b4]">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Pagamento seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#bd18b4]">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#bd18b4]">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Suporte 24/7</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1a1b1e] to-transparent" />
    </section>
  );
}
