"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Tutorial", href: "#tutorial" },
    { name: "Planos", href: "#planos" },
    { name: "Funcionalidades", href: "#funcionalidades" },
    { name: "Suporte", href: "#suporte" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    >
      <div className="container mx-auto px-4 mt-8">
        <div className={`transition-all duration-300 ${
          isScrolled
            ? "md:bg-white/10 md:backdrop-blur-md md:border md:border-white/20 md:rounded-2xl md:mx-4"
            : ""
        }`}>
        <div className="flex items-center justify-between h-20 px-8">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-white hover:text-white transition-all duration-300 hover:scale-110 relative group cursor-pointer"
                style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 400 }}
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-white hover:text-white hover:bg-[#8b5cf6]/10 hover:scale-105 transition-all duration-300 border border-transparent hover:border-[#8b5cf6]/30 cursor-pointer"
              onClick={() => window.location.href = '/auth/login'}
              style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 400 }}
            >
              Login
            </Button>
            <Button 
              className="bg-[#8b5cf6] text-white hover:bg-[#7c3aed] hover:scale-105 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-300 cursor-pointer"
              onClick={() => window.location.href = '/auth/register'}
              style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 400 }}
            >
              Cadastre se
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white hover:text-[#8b5cf6] transition-colors cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-gray-800 bg-black/80 backdrop-blur-md"
          >
            <div className="flex flex-col space-y-4 px-8">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-white hover:text-[#8b5cf6] transition-colors cursor-pointer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-4">
                <Button
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-[#8b5cf6]/10 justify-start transition-all duration-300 border border-transparent hover:border-[#8b5cf6]/30 cursor-pointer"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.location.href = '/auth/login';
                  }}
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 400 }}
                >
                  Login
                </Button>
                <Button 
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-[#8b5cf6]/10 justify-start transition-all duration-300 border border-transparent hover:border-[#8b5cf6]/30 cursor-pointer"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.location.href = '/auth/register';
                  }}
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 400 }}
                >
                  Cadastre-se
                </Button>
              </div>
            </div>
          </motion.div>
        )}
        </div>
      </div>
    </motion.nav>
  );
}
