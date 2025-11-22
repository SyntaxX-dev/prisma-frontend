"use client";

import { motion } from 'framer-motion';

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">

      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full" style={{
          backgroundImage: `
            linear-gradient(rgba(179, 226, 64, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(179, 226, 64, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#bd18b4] rounded-full shadow-[0_0_10px_#bd18b4]"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
      
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 border border-[#bd18b4] opacity-20"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
        }}
      />
      
      <motion.div
        className="absolute top-40 right-32 w-24 h-24 border border-[#bd18b4] opacity-20"
        animate={{
          rotate: [360, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <motion.div
        className="absolute top-1/4 left-1/4 w-4 h-4 bg-[#bd18b4] rounded-full"
        style={{
          filter: 'blur(10px)',
          boxShadow: '0 0 30px #bd18b4',
        }}
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -80, 40, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-[#bd18b4] rounded-full"
        style={{
          filter: 'blur(8px)',
          boxShadow: '0 0 25px #bd18b4',
        }}
        animate={{
          x: [0, -120, 80, 0],
          y: [0, 60, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );
}
