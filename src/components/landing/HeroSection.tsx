"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { DarkVeil } from "@/components/backgrounds";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A1435]">
      {/* DarkVeil Background */}
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
        <DarkVeil />
      </div>
      
      {/* Gradient rainbow bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-[#bd18b4] via-blue-500 via-indigo-500 to-purple-500 z-20" />

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-8 md:px-16 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-24 lg:gap-32 xl:gap-40 min-h-[calc(100vh-8rem)]">
          
          {/* Left side - Logo */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex items-center justify-center lg:justify-start flex-shrink-0"
          >
            <img 
              src="/prisma-white.svg" 
              alt="PRISMA Logo" 
              className="w-[250px] md:w-[300px] lg:w-[350px] h-auto"
            />
          </motion.div>

          {/* Right side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="space-y-8 text-center lg:text-left flex-1"
          >
            {/* Main heading */}
            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight"
                style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 700 }}
              >
                Descubra o Universo<br />
                <span className="whitespace-nowrap">Desbrave o Conhecimento</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-base md:text-lg lg:text-xl font-thin text-white max-w-2xl"
                style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 100 }}
              >
                Explore trilhas personalizadas, aulas interativas e resumos inteligentes.
              </motion.p>
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex justify-center lg:justify-end mt-46"
            >
              <div 
                className="relative p-[3px] rounded-lg"
                style={{
                  background: 'linear-gradient(90deg, #ff6b6b, #ffa500, #ffd700, #90ee90, #4169e1, #6a5acd, #9370db, #ff6b6b)',
                  backgroundSize: '200% 100%',
                  animation: 'rainbow-border 3s linear infinite',
                }}
              >
                <button
                  className="px-12 py-4 text-lg font-bold cursor-pointer text-white rounded-lg transition-all duration-300"
                  onClick={() => window.location.href = '/auth/register'}
                  style={{ 
                    fontFamily: 'Metropolis, sans-serif',
                    fontWeight: 700,
                    background: '#0A1435',
                  }}
                >
                  COMECE AGORA
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes rainbow-border {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
      `}</style>
    </section>
  );
}

