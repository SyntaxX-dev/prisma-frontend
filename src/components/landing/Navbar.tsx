"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
    { name: "Funcionalidades", href: "#funcionalidades" },
    { name: "Planos", href: "#planos" },
    { name: "FAQ", href: "#suporte" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    >
      <div className="container mx-auto px-4 mt-4">
        <div className={`transition-all duration-300 ${isScrolled
            ? "bg-[#202024]/90 backdrop-blur-md border border-[#323238] rounded-2xl mx-4"
            : ""
          }`}>
          <div className="flex items-center justify-between h-16 px-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Image
                src="/logo-prisma.svg"
                alt="Prisma Logo"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
              <span className="text-xl font-bold text-white" style={{ fontFamily: 'Metropolis, sans-serif' }}>
                Prisma
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors duration-300 text-sm cursor-pointer"
                  style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 400 }}
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-transparent transition-colors cursor-pointer"
                onClick={() => window.location.href = '/auth/login'}
                style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 400 }}
              >
                Entrar
              </Button>
              <Button
                size="sm"
                className="bg-[#bd18b4] text-white hover:bg-[#aa22c5] transition-colors cursor-pointer rounded-lg px-4"
                onClick={() => window.location.href = '/plans'}
                style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 500 }}
              >
                Começar agora
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white hover:text-[#bd18b4] transition-colors cursor-pointer"
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
              className="md:hidden py-4 border-t border-[#323238] bg-[#202024]/95 backdrop-blur-md rounded-b-2xl"
            >
              <div className="flex flex-col space-y-4 px-6">
                {navLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <div className="flex flex-col space-y-2 pt-4 border-t border-[#323238]">
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white hover:bg-transparent justify-start cursor-pointer"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      window.location.href = '/auth/login';
                    }}
                    style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 400 }}
                  >
                    Entrar
                  </Button>
                  <Button
                    className="bg-[#bd18b4] text-white hover:bg-[#aa22c5] cursor-pointer"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      window.location.href = '/plans';
                    }}
                    style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 500 }}
                  >
                    Começar agora
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
