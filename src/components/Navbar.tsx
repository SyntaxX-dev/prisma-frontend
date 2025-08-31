"use client";

import { Search, Bell, HelpCircle, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import React, { useState, useEffect } from "react";

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export function Navbar({ isDark, toggleTheme }: NavbarProps) {
  const navItems = ["Dashboard", "Cursos", "Trilhas", "Certificados", "Minha Conta", "Suporte"];
  const [scrolled, setScrolled] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

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
    <div className={`fixed top-0 right-0 z-50 w-[calc(100%-20%)] p-4 transition-all duration-300 bg-transparent`}>
      <div className="flex items-center justify-between gap-4">

        {/* Navigation Menu Card */}
        <div className="bg-white/15 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item}
                className="text-white/80 hover:text-[#B3E240] transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        {/* Action Icons Card */}
        <div className="bg-white/15 backdrop-blur-md rounded-full px-4 py-3 border border-white/20">
          <div className="flex items-center gap-3">
            <div className={`transition-all duration-500 ease-out overflow-hidden ${searchExpanded ? 'w-56' : 'w-8'
              }`}>
              {searchExpanded ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Pesquisar..."
                    className="bg-white/20 text-white placeholder-white/60 rounded-full px-3 py-1 text-sm outline-none border border-white/20 focus:border-[#B3E240] transition-colors w-full"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-[#B3E240] hover:bg-white/10 rounded-full w-8 h-8 p-0 cursor-pointer flex-shrink-0"
                    onClick={() => setSearchExpanded(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-[#B3E240] hover:bg-white/10 rounded-full w-8 h-8 p-0 cursor-pointer"
                  onClick={() => setSearchExpanded(true)}
                >
                  <Search className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-[#B3E240] hover:bg-white/10 rounded-full w-8 h-8 p-0 relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#B3E240] rounded-full"></span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-[#B3E240] hover:bg-white/10 rounded-full w-8 h-8 p-0 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white/15 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 cursor-pointer">
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
