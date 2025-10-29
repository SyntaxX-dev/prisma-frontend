"use client";

import React from "react";
import { motion } from "motion/react";

interface DotPatternProps {
  className?: string;
  dotSize?: number;
  dotColor?: string;
  backgroundColor?: string;
  gap?: number;
  animated?: boolean;
}

export function DotPattern({
  className = "",
  dotSize = 1,
  dotColor = "rgba(180, 255, 57, 0.3)",
  backgroundColor = "transparent",
  gap = 20,
  animated = false,
}: DotPatternProps) {
  const patternId = React.useId();

  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ backgroundColor }}
    >
      <defs>
        <pattern
          id={patternId}
          width={gap}
          height={gap}
          patternUnits="userSpaceOnUse"
        >
          {animated ? (
            <motion.circle
              cx={gap / 2}
              cy={gap / 2}
              r={dotSize}
              fill={dotColor}
              animate={{
                r: [dotSize, dotSize * 1.5, dotSize],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ) : (
            <circle cx={gap / 2} cy={gap / 2} r={dotSize} fill={dotColor} />
          )}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
