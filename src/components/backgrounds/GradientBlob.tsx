"use client";

import React from "react";
import { motion } from "motion/react";

interface GradientBlobProps {
  className?: string;
  color1?: string;
  color2?: string;
  color3?: string;
  blur?: string;
}

export function GradientBlob({
  className = "",
  color1 = "#B4FF39",
  color2 = "#3A29FF",
  color3 = "#FF94B4",
  blur = "blur-3xl",
}: GradientBlobProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Blob 1 */}
      <motion.div
        className={`absolute rounded-full ${blur} opacity-20`}
        style={{
          background: `radial-gradient(circle, ${color1} 0%, transparent 70%)`,
          width: "40%",
          height: "40%",
          top: "10%",
          left: "10%",
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Blob 2 */}
      <motion.div
        className={`absolute rounded-full ${blur} opacity-20`}
        style={{
          background: `radial-gradient(circle, ${color2} 0%, transparent 70%)`,
          width: "50%",
          height: "50%",
          top: "40%",
          right: "10%",
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Blob 3 */}
      <motion.div
        className={`absolute rounded-full ${blur} opacity-15`}
        style={{
          background: `radial-gradient(circle, ${color3} 0%, transparent 70%)`,
          width: "45%",
          height: "45%",
          bottom: "10%",
          left: "30%",
        }}
        animate={{
          x: [0, 60, 0],
          y: [0, -60, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
