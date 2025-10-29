"use client";

import React from "react";
import { motion } from "motion/react";

interface BeamsProps {
  className?: string;
}

export function Beams({ className = "" }: BeamsProps) {
  const beams = [
    { delay: 0, duration: 7, top: "10%", left: "10%", rotate: 45 },
    { delay: 2, duration: 8, top: "20%", left: "60%", rotate: -30 },
    { delay: 4, duration: 6, top: "60%", left: "20%", rotate: 60 },
    { delay: 1, duration: 9, top: "70%", left: "70%", rotate: -45 },
    { delay: 3, duration: 7, top: "40%", left: "80%", rotate: 30 },
  ];

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {beams.map((beam, index) => (
        <motion.div
          key={index}
          className="absolute h-px w-96 bg-gradient-to-r from-transparent via-[#B4FF39] to-transparent"
          style={{
            top: beam.top,
            left: beam.left,
            rotate: `${beam.rotate}deg`,
            filter: "blur(1px)",
          }}
          initial={{ opacity: 0, x: -200 }}
          animate={{
            opacity: [0, 1, 0],
            x: [0, 300],
          }}
          transition={{
            duration: beam.duration,
            delay: beam.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Additional vertical beams */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`vertical-${i}`}
          className="absolute h-96 w-px bg-gradient-to-b from-transparent via-[#B4FF39]/50 to-transparent"
          style={{
            left: `${30 + i * 25}%`,
            top: "-100%",
            filter: "blur(1px)",
          }}
          animate={{
            top: ["0%", "100%"],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 8 + i,
            delay: i * 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
