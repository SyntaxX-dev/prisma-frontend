"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { BenefitsSection } from "./BenefitsSection";
import { Features } from "./Features";
import { IntegrationsSection } from "./IntegrationsSection";
import { Pricing } from "./Pricing";
import { FAQ } from "./FAQ";
import { Footer } from "./Footer";
import { HeroSection as HowItWorksSection } from "./HowItWorks";

function MouseFollower() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for touch device - if strictly mobile per user request, preventing listeners is good
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);
    document.body.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible]);

  return (
    <motion.div
      className="hidden md:block fixed pointer-events-none z-[9999] mix-blend-difference"
      animate={{
        x: mousePosition.x - 10,
        y: mousePosition.y - 10,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 28,
        mass: 0.5,
      }}
    >
      <div className="w-5 h-5 bg-white rounded-full" />
    </motion.div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1a1b1e] text-white">
      <MouseFollower />
      <Navbar />
      <HeroSection />
      <BenefitsSection />
      <Features />
      <HowItWorksSection />
      <IntegrationsSection />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}
