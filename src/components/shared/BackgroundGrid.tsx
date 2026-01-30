"use client";

import { motion } from "motion/react";
import { PencilScribble } from "@/components/ui/PencilScribble";

export function BackgroundGrid() {
    return (
        <div className="fixed inset-0 z-0 bg-[#1a1b1e] overflow-hidden pointer-events-none">
            {/* Subtle grid pattern from landing page */}
            <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage: `
            linear-gradient(to right, #bd18b4 1px, transparent 1px),
            linear-gradient(to bottom, #bd18b4 1px, transparent 1px)
          `,
                    backgroundSize: '60px 60px'
                }}
            />

            {/* Radial Glows */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
            radial-gradient(circle at 20% 30%, rgba(189, 24, 180, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(170, 34, 197, 0.05) 0%, transparent 40%)
          `
                }}
            />

            {/* Floating scribbles like HeroSection */}
            <div className="absolute inset-0 opacity-20">
                <motion.div
                    animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[15%] left-[5%]"
                >
                    <PencilScribble
                        path="M 0 30 Q 30 0, 60 30 T 120 30"
                        color="#bd18b4"
                        width={120}
                        height={40}
                    />
                </motion.div>

                <motion.div
                    animate={{ y: [0, 10, 0], rotate: [0, -2, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-[60%] right-[8%]"
                >
                    <PencilScribble
                        path="M 0 20 Q 20 0, 40 20 T 80 20"
                        color="#aa22c5"
                        width={100}
                        height={30}
                    />
                </motion.div>

                <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.15, 0.1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[20%] left-[15%]"
                >
                    <svg width="60" height="60" viewBox="0 0 80 80" fill="none">
                        <path
                            d="M 40 10 Q 65 10, 70 40 Q 70 65, 40 70 Q 15 70, 10 40 Q 10 15, 40 10"
                            stroke="#bd18b4"
                            strokeWidth="1"
                            fill="none"
                            strokeLinecap="round"
                        />
                    </svg>
                </motion.div>
            </div>

            {/* Noise overlay for texture */}
            <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none bg-[url('/noise.png')]" />
        </div>
    );
}
