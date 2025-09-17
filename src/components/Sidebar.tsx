import { ChevronDown, Home, BookOpen, Users, MessageCircle, Eye, FileText, FolderOpen, Zap, User, Settings, PenTool } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNavigationWithLoading } from "../hooks/useNavigationWithLoading";

interface SidebarProps {
  isDark: boolean;
  toggleTheme: () => void;
  isVideoPlaying?: boolean;
}

export function Sidebar({ isDark, toggleTheme, isVideoPlaying = false }: SidebarProps) {
  const router = useRouter();
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
    } else if (item === "Cursos") {
      navigateWithLoading('/courses', 'Carregando Cursos...');
    } else if (item === "Comunidades") {
      navigateWithLoading('/courses', 'Carregando Comunidades...');
    } else if (item === "Chats") {
      navigateWithLoading('/courses', 'Carregando Chats...');
    } else if (item === "Vistos atualmente") {
      navigateWithLoading('/courses', 'Carregando Vistos atualmente...');
    } else if (item === "Meu resumo") {
      navigateWithLoading('/courses', 'Carregando Meu resumo...');
    } else if (item === "Perfil") {
      navigateWithLoading('/profile', 'Carregando Perfil...');
    } else if (item === "Configurações") {
      navigateWithLoading('/settings', 'Carregando Configurações...');
    }
  };

  const mainItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: BookOpen, label: "Cursos" },
    { icon: Users, label: "Comunidades" },
    { icon: MessageCircle, label: "Chats" },
    { icon: Eye, label: "Vistos atualmente" },
    { icon: FileText, label: "Meu resumo" }
  ];

  const featuresItems = [
    { icon: FolderOpen, label: "Questões", disabled: true },
    { icon: Zap, label: "IA study", disabled: true }
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
        className="h-full w-full rounded-2xl"
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
            <div className="flex items-center justify-center">
              <img
                src="/logo-prisma.png"
                alt="RichPath Logo"
                width={isExpanded ? 100 : 40}
                height={isExpanded ? 100 : 40}
                className="rounded-full transition-all duration-300 ease-in-out"
              />
            </div>
          </div>
        </div>

        <div className={`flex-1 space-y-6 transition-all duration-300 ease-in-out ${isExpanded ? 'p-4' : 'p-2'}`}>

          <div>
            {isExpanded && (
              <button
                onClick={() => toggleSection('main')}
                className="flex items-center justify-between w-full text-gray-300 font-medium mb-3 hover:text-gray-100 transition-colors cursor-pointer overflow-hidden"
              >
                <span className={`transition-all duration-500 ease-in-out ${showText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                  MAIN
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
                      className={`w-full text-gray-300 hover:text-gray-100 hover:bg-white/30 rounded-lg cursor-pointer transition-all duration-300 ease-in-out ${item.active ? 'bg-[#C9FE02] text-black' : ''} ${isExpanded ? 'justify-start px-3 py-2' : 'justify-center px-2 py-2'}`}
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
                className="flex items-center justify-between w-full text-gray-300 font-medium mb-3 hover:text-gray-100 transition-colors cursor-pointer overflow-hidden"
              >
                <span className={`transition-all duration-500 ease-in-out ${showText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                  FEATURES
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
                      disabled={item.disabled}
                      className={`w-full text-gray-300 hover:text-gray-100 hover:bg-white/30 rounded-lg transition-all duration-300 ease-in-out ${isExpanded ? 'justify-start px-3 py-2' : 'justify-center px-2 py-2'} ${item.disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-300' : 'cursor-pointer'}`}
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
                className="flex items-center justify-between w-full text-gray-300 font-medium mb-3 hover:text-gray-100 transition-colors cursor-pointer overflow-hidden"
              >
                <span className={`transition-all duration-500 ease-in-out ${showText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                  TOOLS
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
                      className={`w-full text-gray-300 hover:text-gray-100 hover:bg-white/30 rounded-lg cursor-pointer transition-all duration-300 ease-in-out ${isExpanded ? 'justify-start px-3 py-2' : 'justify-center px-2 py-2'}`}
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
          <div className="p-4 border-t border-white/20">
            <div
              className="rounded-2xl p-6 relative w-full overflow-hidden"
              style={{
                background: 'rgba(201, 254, 2, 0.2)',
                borderRadius: '16px',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
                border: '1px solid rgba(201, 254, 2, 0.3)'
              }}
            >
              <div className={`flex items-center gap-3 mb-2 transition-all duration-500 ease-in-out ${showText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <PenTool className="w-5 h-5 text-[#C9FE02]" />
                <span className="text-[#C9FE02] font-bold text-sm">Upgrade Pro!</span>
              </div>

              <p className={`text-[#C9FE02] text-xs leading-relaxed transition-all duration-500 ease-in-out delay-200 ${showText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                Upgrade to Pro and elevate your experience today
              </p>
            </div>
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
            className="px-4 py-2 text-white text-sm"
            style={{
              background: 'rgba(179, 226, 64, 0.14)',
              borderRadius: '16px',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(6.3px)',
              WebkitBackdropFilter: 'blur(6.3px)',
              border: '1px solid rgba(179, 226, 64, 0.07)'
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
