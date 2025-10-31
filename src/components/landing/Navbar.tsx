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
            ? "bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl mx-4"
            : "bg-transparent"
        }`}>
        <div className="flex items-center justify-center md:justify-between h-20 px-8">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-white hover:text-[#B4FF39] transition-colors"
                style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 400 }}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-white hover:text-[#B4FF39] transition-colors"
              onClick={() => window.location.href = '/auth/login'}
              style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 400 }}
            >
              Login
            </Button>
            <Button 
              className="bg-[#B4FF39] text-black hover:bg-[#a3e830] transition-colors"
              onClick={() => window.location.href = '/auth/register'}
              style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 400 }}
            >
              Cadastre se
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white hover:text-[#B4FF39] transition-colors"
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
            className="md:hidden py-4 border-t border-gray-800"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-white hover:text-[#B4FF39] transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-4">
                <Button
                  variant="ghost"
                  className="text-white hover:text-[#B4FF39] justify-start transition-colors"
                  onClick={() => window.location.href = '/auth/login'}
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 400 }}
                >
                  Login
                </Button>
                <Button 
                  className="bg-[#B4FF39] text-black hover:bg-[#a3e830] justify-start transition-colors"
                  onClick={() => window.location.href = '/auth/register'}
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
