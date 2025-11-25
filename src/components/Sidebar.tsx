import { ChevronDown, Home, MessageCircle, Eye, FileText, FolderOpen, Zap, User, Settings, PenTool, Brain, UserPlus } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useNavigationWithLoading } from "../hooks/shared";
import { getAuthState } from "@/lib/auth";
import GlareHover from "./GlareHover";

interface SidebarProps {
  isDark: boolean;
  toggleTheme: () => void;
  isVideoPlaying?: boolean;
}

export function Sidebar({ isDark, toggleTheme, isVideoPlaying = false }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { navigateWithLoading } = useNavigationWithLoading();
  const [collapsedSections, setCollapsedSections] = useState({
    main: false,
    features: false,
    tools: false
  });
  const [isHovered, setIsHovered] = useState(false);
  const [showText, setShowText] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  const isExpanded = !isVideoPlaying || isHovered;

  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        setShowText(true);
      }, 200);

      return () => clearTimeout(timer);
    } else {
      setShowText(false);
    }
  }, [isExpanded]);

  useEffect(() => {
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hideTimeout]);

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleMouseEnter = (e: React.MouseEvent, label: string) => {

    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }

    setTooltipPosition({ x: e.clientX, y: e.clientY });
    setShowTooltip(label);
    setIsTooltipVisible(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (showTooltip) {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }

    const timeout = setTimeout(() => {
      setIsTooltipVisible(false);
      setTimeout(() => {
        setShowTooltip(null);
      }, 300);
    }, 150);

    setHideTimeout(timeout);
  };

  const handleNavigation = (item: string) => {
    if (item === "Dashboard") {
      navigateWithLoading('/dashboard', 'Carregando Dashboard...');
    } else if (item === "Chats") {
      navigateWithLoading('/communities', 'Carregando Chats...');
    } else if (item === "Vistos atualmente") {
      navigateWithLoading('/watching', 'Carregando Vistos atualmente...');
    } else if (item === "Meu resumo") {
      navigateWithLoading('/my-summaries', 'Carregando Meus Resumos...');
    } else if (item === "Mapas Mentais") {
      navigateWithLoading('/mind-maps', 'Carregando Mapas Mentais...');
    } else if (item === "Questões") {
      navigateWithLoading('/questions', 'Carregando Questões...');
    } else if (item === "Perfil") {
      // Obter ID do usuário logado e redirecionar para o perfil
      const authState = getAuthState();
      const userId = authState.user?.id;
      if (userId) {
        router.push(`/profile?userId=${userId}`);
      } else {
        router.push('/profile');
      }
    } else if (item === "Configurações") {
      navigateWithLoading('/settings', 'Carregando Configurações...');
    }
  };

  const isActive = (item: string) => {
    if (item === "Dashboard") {
      return pathname === '/dashboard';
    } else if (item === "Chats") {
      return pathname === '/communities' || pathname?.startsWith('/communities');
    } else if (item === "Vistos atualmente") {
      return pathname === '/watching' || pathname?.startsWith('/watching');
    } else if (item === "Meu resumo") {
      return pathname === '/my-summaries' || pathname?.startsWith('/my-summaries');
    } else if (item === "Mapas Mentais") {
      return pathname === '/mind-maps' || pathname?.startsWith('/mind-maps');
    } else if (item === "Questões") {
      return pathname === '/questions' || pathname?.startsWith('/questions');
    } else if (item === "Perfil") {
      return pathname === '/profile' || pathname?.startsWith('/profile');
    } else if (item === "Configurações") {
      return pathname === '/settings' || pathname?.startsWith('/settings');
    }
    return false;
  };

  const mainItems = [
    { icon: Home, label: "Dashboard" },
    { icon: MessageCircle, label: "Chats" },
    { icon: Eye, label: "Vistos atualmente" },
    { icon: FileText, label: "Meu resumo" },
    { icon: Brain, label: "Mapas Mentais" }
  ];

  const featuresItems = [
    { icon: FolderOpen, label: "Questões", disabled: false },
  ];

  const toolsItems = [
    { icon: User, label: "Perfil" },
    { icon: Settings, label: "Configurações" }
  ];

  return (
    <div
      className={`fixed left-4 top-4 h-[calc(100vh-2rem)] z-50 transition-all duration-300 ease-in-out overflow-visible ${isExpanded ? 'w-64' : 'w-16'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="h-full w-full rounded-2xl flex flex-col"
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >

        <div className="flex items-center justify-center border-b border-white/20 flex-shrink-0">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center p-4">
              <img
                src="/logo-prisma.svg"
                alt="RichPath Logo"
                width={isExpanded ? 50 : 30}
                height={isExpanded ? 70 : 30}
                className=" transition-all duration-300 ease-in-out"
              />
            </div>
          </div>
        </div>

        <div className={`flex-1 overflow-hidden space-y-3 transition-all duration-300 ease-in-out ${isExpanded ? 'px-4 pt-3 pb-2' : 'p-2'}`}>

          <div>
            {isExpanded && (
              <button
                onClick={() => toggleSection('main')}
                className="flex items-center justify-between w-full text-gray-300 font-medium mb-2 hover:text-gray-100 transition-colors cursor-pointer overflow-hidden"
              >
                <span className={`transition-all duration-500 ease-in-out ${showText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                  Principal
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ease-in-out ${collapsedSections.main ? 'rotate-180' : ''}`} />
              </button>
            )}

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? (collapsedSections.main ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100') : 'max-h-none opacity-100'
                }`}
            >
              <div className={`space-y-1 transition-transform duration-300 ease-in-out ${isExpanded ? `ml-2 ${collapsedSections.main ? '-translate-x-4' : 'translate-x-0'}` : 'ml-0'}`}>
                {mainItems.map((item, index) => (
                  <div key={index} className="relative">
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigation(item.label)}
                      className={`w-full text-gray-300 hover:text-gray-100 hover:bg-white/30 rounded-lg cursor-pointer transition-all duration-300 ease-in-out ${isActive(item.label) ? 'bg-[#bd18b4] text-white' : ''} ${isExpanded ? 'justify-start px-3 py-1.5' : 'justify-center px-2 py-2'}`}
                    >
                      <item.icon className={`w-4 h-4 ${isExpanded ? 'mr-3' : ''}`} />
                      {isExpanded && item.label}
                    </Button>
                    {isExpanded && index < mainItems.length - 1 && (
                      <div className="absolute left-5 top-8 w-px h-4 bg-gray-500"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            {isExpanded && (
              <button
                onClick={() => toggleSection('features')}
                className="flex items-center justify-between w-full text-gray-300 font-medium mb-2 hover:text-gray-100 transition-colors cursor-pointer overflow-hidden"
              >
                <span className={`transition-all duration-500 ease-in-out ${showText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                  Novidades
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ease-in-out ${collapsedSections.features ? 'rotate-180' : ''}`} />
              </button>
            )}

            <div
              className={`overflow-visible transition-all duration-300 ease-in-out ${isExpanded ? (collapsedSections.features ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100') : 'max-h-none opacity-100'
                }`}
            >
              <div className={`space-y-1 transition-transform duration-300 ease-in-out ${isExpanded ? `ml-2 ${collapsedSections.features ? '-translate-x-4' : 'translate-x-0'}` : 'ml-0'}`}>
                {featuresItems.map((item, index) => (
                  <div
                    key={index}
                    className="relative group"
                    onMouseEnter={(e) => {
                      if (item.disabled) {
                        handleMouseEnter(e, item.label);
                      }
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Button
                      variant="ghost"
                      onClick={() => !item.disabled && handleNavigation(item.label)}
                      disabled={item.disabled}
                      className={`w-full text-gray-300 hover:text-gray-100 hover:bg-white/30 rounded-lg transition-all duration-300 ease-in-out ${isActive(item.label) ? 'bg-[#bd18b4] text-white' : ''} ${isExpanded ? 'justify-start px-3 py-1.5' : 'justify-center px-2 py-2'} ${item.disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-300' : 'cursor-pointer'}`}
                    >
                      <item.icon className={`w-4 h-4 ${isExpanded ? 'mr-3' : ''}`} />
                      {isExpanded && item.label}
                    </Button>
                    {isExpanded && index < featuresItems.length - 1 && (
                      <div className="absolute left-5 top-8 w-px h-4 bg-gray-500"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            {isExpanded && (
              <button
                onClick={() => toggleSection('tools')}
                className="flex items-center justify-between w-full text-gray-300 font-medium mb-2 hover:text-gray-100 transition-colors cursor-pointer overflow-hidden"
              >
                <span className={`transition-all duration-500 ease-in-out ${showText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                  Ferramentas
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ease-in-out ${collapsedSections.tools ? 'rotate-180' : ''}`} />
              </button>
            )}

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? (collapsedSections.tools ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100') : 'max-h-none opacity-100'
                }`}
            >
              <div className={`space-y-1 transition-transform duration-300 ease-in-out ${isExpanded ? `ml-2 ${collapsedSections.tools ? '-translate-x-4' : 'translate-x-0'}` : 'ml-0'}`}>
                {toolsItems.map((item, index) => (
                  <div key={index} className="relative">
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigation(item.label)}
                      className={`w-full text-gray-300 hover:text-gray-100 hover:bg-white/30 rounded-lg cursor-pointer transition-all duration-300 ease-in-out ${isActive(item.label) ? 'bg-[#bd18b4] text-white' : ''} ${isExpanded ? 'justify-start px-3 py-1.5' : 'justify-center px-2 py-2'}`}
                    >
                      <item.icon className={`w-4 h-4 ${isExpanded ? 'mr-3' : ''}`} />
                      {isExpanded && item.label}
                    </Button>
                    {isExpanded && index < toolsItems.length - 1 && (
                      <div className="absolute left-5 top-8 w-px h-4 bg-gray-500"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="pt-3 px-4 pb-3 border-t border-white/20 flex flex-col space-y-3 flex-1 flex-shrink-0">
            {/* Card de Upgrade Plan */}
            <GlareHover
              width="100%"
              height="100%"
              background="#202024"
              borderRadius="16px"
              borderColor="rgba(201, 254, 2, 0.4)"
              glareColor="#bd18b4"
              glareOpacity={0.4}
              glareAngle={-30}
              glareSize={300}
              transitionDuration={800}
              playOnce={false}
              className="flex-1 cursor-pointer group"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(201, 254, 2, 0.1)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(201, 254, 2, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                padding: '1rem',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                transition: 'all 0.3s ease',
              }}
              onClick={() => navigateWithLoading('/settings', 'Carregando Configurações...')}
            >
              <div className={`flex items-center gap-2.5 mb-2 transition-all duration-500 ease-in-out ${showText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                  <PenTool className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-sm">Upgrade Pro!</span>
              </div>

              <p className={`text-white/80 text-xs leading-relaxed transition-all duration-500 ease-in-out delay-200 ${showText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                Faça upgrade para Pro e eleve sua experiência hoje
              </p>
            </GlareHover>

            {/* Card de Produtor Exclusivo */}
            <GlareHover
              width="100%"
              height="100%"
              background="#202024"
              borderRadius="16px"
              borderColor="rgba(168, 85, 247, 0.4)"
              glareColor="#a855f7"
              glareOpacity={0.4}
              glareAngle={-30}
              glareSize={300}
              transitionDuration={800}
              playOnce={false}
              className="flex-1 cursor-pointer group"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(168, 85, 247, 0.1)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                padding: '1rem',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                transition: 'all 0.3s ease',
              }}
              onClick={() => {
                const phoneNumber = '5583987690902';
                const message = encodeURIComponent('Olá! Tenho interesse em me tornar um produtor exclusivo da plataforma.');
                window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
              }}
            >
              <div className={`flex items-center gap-2.5 mb-2 transition-all duration-500 ease-in-out ${showText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-sm">Produtor Exclusivo</span>
              </div>

              <p className={`text-white/80 text-xs leading-relaxed transition-all duration-500 ease-in-out delay-200 ${showText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                Torne-se um produtor e compartilhe seu conhecimento
              </p>
            </GlareHover>

            {/* Card de Sugestões */}
            <GlareHover
              width="100%"
              height="100%"
              background="#202024"
              borderRadius="16px"
              borderColor="rgba(34, 197, 94, 0.4)"
              glareColor="#bd18b4"
              glareOpacity={0.4}
              glareAngle={-30}
              glareSize={300}
              transitionDuration={800}
              playOnce={false}
              className="flex-1 cursor-pointer group"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(34, 197, 94, 0.1)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                padding: '1rem',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                transition: 'all 0.3s ease',
              }}
              onClick={() => {
                const phoneNumber = '5583987690902';
                const message = encodeURIComponent('Olá! Gostaria de dar uma sugestão sobre a plataforma.');
                window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
              }}
            >
              <div className={`flex items-center gap-2.5 mb-2 transition-all duration-500 ease-in-out ${showText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-sm">Sugestões</span>
              </div>

              <p className={`text-white/80 text-xs leading-relaxed transition-all duration-500 ease-in-out delay-200 ${showText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                Compartilhe suas ideias e ajude a melhorar a plataforma
              </p>
            </GlareHover>
          </div>
        )}
      </div>

      {showTooltip && (
        <div
          className={`fixed pointer-events-none z-[9999] ${isTooltipVisible
            ? 'animate-tooltip-in'
            : 'animate-tooltip-out'
            }`}
          style={{
            left: tooltipPosition.x + 15,
            top: tooltipPosition.y - 40,
            animationDuration: '300ms',
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            animationFillMode: 'both'
          }}
        >
          <div
            className="px-4 py-2 text-white text-sm whitespace-nowrap"
            style={{
              background: 'rgba(189, 24, 180, 0.14)',
              borderRadius: '16px',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(6.3px)',
              WebkitBackdropFilter: 'blur(6.3px)',
              border: '1px solid rgba(189, 24, 180, 0.07)'
            }}
          >
            <span className="font-medium">Em breve</span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes tooltip-in {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes tooltip-out {
          0% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          100% {
            opacity: 0;
            transform: scale(0.8) translateY(10px);
          }
        }

        .animate-tooltip-in {
          animation-name: tooltip-in;
        }

        .animate-tooltip-out {
          animation-name: tooltip-out;
        }
      `}</style>

    </div>
  );
}
