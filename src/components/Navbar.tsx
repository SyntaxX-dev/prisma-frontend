"use client";

import { Search, Bell, HelpCircle, X, LogOut, User, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { useStreak } from "../hooks/useStreak";
import { StreakIcon } from "./StreakIcon";
import { StreakCalendar } from "./StreakCalendar";

interface NavbarProps {
  isDark?: boolean;
  toggleTheme?: () => void;
}

export function Navbar({ }: NavbarProps) {

  const navItems = ["Dashboard", "Cursos", "Trilhas", "Certificados", "Minha Conta", "Suporte"];
  const [searchExpanded, setSearchExpanded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { streakData, isStreakActive } = useStreak();


  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const handleNavClick = (item: string) => {
    if (item === "Dashboard") {
      router.push('/dashboard');
    }
  };

  const isActive = (item: string) => {
    if (item === "Dashboard") {
      return pathname === '/dashboard';
    }
    return false;
  };

  return (
    <div className={`fixed top-0 right-0 z-50 w-[calc(100vw-20%)] p-4 transition-all duration-300 bg-transparent`}>
      <div className="flex items-center justify-between gap-4 relative w-full">

        <div className="bg-white/15 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className={`transition-colors cursor-pointer ${
                  isActive(item) 
                    ? 'text-[#B3E240]' 
                    : 'text-white/80 hover:text-[#B3E240]'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

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
            <Popover>
              <PopoverTrigger asChild>
                <div className="cursor-pointer hover:bg-white/10 rounded-full w-12 h-8 flex items-center justify-center transition-all duration-200 ease-out group">
                  <StreakIcon 
                    count={streakData.currentStreak} 
                    isActive={isStreakActive}
                    className="text-white"
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent 
                className="w-96 p-0 border-0 bg-transparent"
                side="bottom"
                align="end"
                sideOffset={8}
              >
                <div className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-1 mt-4">
                  <StreakCalendar streakData={streakData} />
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-[#B3E240] hover:bg-white/10 rounded-full w-8 h-8 p-0 relative cursor-pointer"
            >
              <Bell className="w-6 h-6" />
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

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div className="bg-white/15 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/api/placeholder/32/32" />
                  <AvatarFallback className="bg-[#B3E240] text-black">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-white">
                  <div className="text-sm font-medium">
                    {user?.name || 'Usuário'}
                  </div>
                  <div className="text-xs text-white/60">
                    {user?.email || 'usuario@email.com'}
                  </div>
                </div>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="bottom"
            sideOffset={8}
            className="w-48 min-w-[12rem] text-white"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
            avoidCollisions={true}
            collisionPadding={16}
            alignOffset={-20}
          >
            <DropdownMenuLabel className="text-gray-300 font-medium px-3 py-2">Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/20" />
            <DropdownMenuItem
              onClick={() => router.push('/profile')}
              className="text-gray-300 hover:text-gray-100 rounded-lg px-3 py-2 mx-2 my-1 cursor-pointer transition-colors data-[highlighted]:!bg-white/30"
            >
              <User className="mr-3 h-4 w-4 text-[#B3E240]" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push('/settings')}
              className="text-gray-300 hover:text-gray-100 rounded-lg px-3 py-2 mx-2 my-1 cursor-pointer transition-colors data-[highlighted]:!bg-white/30"
            >
              <Settings className="mr-3 h-4 w-4 text-[#B3E240]" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/20" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-400 hover:text-white rounded-lg px-3 py-2 mx-2 my-1 cursor-pointer transition-colors data-[highlighted]:!bg-red-500/20 data-[highlighted]:!text-white"
            >
              <LogOut className="mr-3 h-4 w-4 text-[#B3E240]" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
