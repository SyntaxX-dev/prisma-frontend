"use client";

import { Search, Bell, HelpCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import React, { useState, useEffect } from "react";

export function Navbar() {
  const navItems = ["Dashboard", "Cursos", "Trilhas", "Certificados", "Minha Conta", "Suporte"];
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 w-full p-4 transition-all duration-300 ${scrolled ? "bg-black/90 backdrop-blur-md border-b border-white/10" : "bg-transparent"}`}>
      <div className="flex items-center justify-between gap-4">
        {/* Logo Card */}
        <div className="bg-white/15 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#B3E240] rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">R</span>
            </div>
            <span className="text-white font-semibold">RichPath</span>
          </div>
        </div>

        {/* Navigation Menu Card */}
        <div className="bg-white/15 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item}
                className="text-white/80 hover:text-[#B3E240] transition-colors"
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        {/* Action Icons Card */}
        <div className="bg-white/15 backdrop-blur-md rounded-full px-4 py-3 border border-white/20">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-[#B3E240] hover:bg-white/10 rounded-full w-8 h-8 p-0"
            >
              <Search className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-[#B3E240] hover:bg-white/10 rounded-full w-8 h-8 p-0 relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#B3E240] rounded-full"></span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-[#B3E240] hover:bg-white/10 rounded-full w-8 h-8 p-0"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white/15 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/api/placeholder/32/32" />
              <AvatarFallback className="bg-[#B3E240] text-black">SR</AvatarFallback>
            </Avatar>
            <div className="text-white">
              <div className="text-sm font-medium">Sajibur Rahman</div>
              <div className="text-xs text-white/60">sajibur@man.com</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}