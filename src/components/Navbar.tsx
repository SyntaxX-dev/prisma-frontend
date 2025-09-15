"use client";

import { Search, Bell, HelpCircle, X, LogOut, User, Settings, AlertCircle, Loader2 } from "lucide-react";
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
import { useSearch } from "../hooks/useSearch";
import { StreakIcon } from "./StreakIcon";
import { StreakCalendar } from "./StreakCalendar";
import { ProfileCompletionModal } from "./ProfileCompletionModal";

interface NavbarProps {
  isDark?: boolean;
  toggleTheme?: () => void;
}

export function Navbar({}: NavbarProps) {

  const navItems = ["Dashboard", "Cursos", "Trilhas", "Certificados", "Minha Conta", "Suporte"];
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { streakData, isStreakActive } = useStreak();
  const { searchQuery, updateSearch, clearSearch, isSearching, isLoading } = useSearch();

  // Verificar se há notificações
  const hasNotification = user?.notification?.hasNotification || false;
  const notificationData = user?.notification;


  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const handleNavClick = (item: string) => {
    if (item === "Dashboard") {
      router.push('/dashboard');
    } else if (item === "Cursos") {
      router.push('/courses');
    }
  };

  const isActive = (item: string) => {
    if (item === "Dashboard") {
      return pathname === '/dashboard';
    } else if (item === "Cursos") {
      return pathname.startsWith('/courses');
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
                className={`transition-colors cursor-pointer ${isActive(item)
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
            <div className={`transition-all duration-500 ease-out overflow-hidden ${searchExpanded || isSearching ? 'w-64' : 'w-8'
              }`}>
              {searchExpanded || isSearching ? (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Pesquisar..."
                      value={searchQuery}
                      onChange={(e) => updateSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateSearch(searchQuery);
                        }
                      }}
                      className="bg-white/20 text-white placeholder-white/60 rounded-full px-3 py-1 pr-8 text-sm outline-none border border-white/20 focus:border-[#B3E240] transition-colors w-full"
                      autoFocus
                    />
                    {isLoading && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 text-white/60 animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-[#B3E240] hover:bg-white/10 rounded-full w-8 h-8 p-0 cursor-pointer flex-shrink-0"
                    onClick={() => updateSearch(searchQuery)}
                    title="Pesquisar"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-[#B3E240] hover:bg-white/10 rounded-full w-8 h-8 p-0 cursor-pointer flex-shrink-0"
                    onClick={() => {
                      clearSearch();
                      setSearchExpanded(false);
                    }}
                    title="Fechar"
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
                  title="Abrir pesquisa"
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
            <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/80 hover:text-[#B3E240] hover:bg-white/10 rounded-full w-8 h-8 p-0 relative cursor-pointer transition-all duration-300"
                >
                  <Bell className="w-6 h-6 transition-all duration-300" />
                  {hasNotification && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#B3E240] rounded-full animate-ping"></span>
                  )}
                  {hasNotification && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#B3E240] rounded-full"></span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 p-0 border-0 bg-transparent"
                side="bottom"
                align="end"
                sideOffset={8}
              >
                <div className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-1 mt-4">
                  {hasNotification ? (
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                        <h3 className="font-semibold text-white">Notificação</h3>
                      </div>
                      <div className="space-y-3">
                        <p className="text-white/80 text-sm">
                          {notificationData?.message}
                        </p>
                        {notificationData?.missingFields && notificationData.missingFields.length > 0 && (
                          <div>
                            <p className="text-white/60 text-xs mb-2">Campos pendentes:</p>
                            <div className="flex flex-wrap gap-2">
                              {notificationData.missingFields.map((field: string, index: number) => (
                                <span
                                  key={index}
                                  className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs border border-yellow-500/30"
                                >
                                  {field}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="pt-2 border-t border-white/20">
                          <Button
                            onClick={() => {
                              setNotificationOpen(false);
                              setProfileModalOpen(true);
                            }}
                            className="w-full bg-[#B3E240] hover:bg-[#B3E240]/90 text-black text-sm"
                          >
                            Completar Perfil
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <Bell className="w-8 h-8 text-white/40 mx-auto mb-2" />
                      <p className="text-white/60 text-sm">Nenhuma notificação</p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
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

      {/* Modal de completar perfil */}
      {notificationData && (
        <ProfileCompletionModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          notificationData={notificationData}
        />
      )}
    </div>
  );
}
