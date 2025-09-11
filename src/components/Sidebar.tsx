import { ChevronDown, Home, Wallet, ArrowLeftRight, Clock, CreditCard, RotateCcw, FolderOpen, Zap, Settings, HelpCircle, PenTool } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SidebarProps {
  isDark: boolean;
  toggleTheme: () => void;
  isVideoPlaying?: boolean;
}

export function Sidebar({ isDark, toggleTheme, isVideoPlaying = false }: SidebarProps) {
  const router = useRouter();
  const [collapsedSections, setCollapsedSections] = useState({
    main: false,
    features: false,
    tools: false
  });
  const [isHovered, setIsHovered] = useState(false);

  // A sidebar está expandida quando não está tocando vídeo OU quando está sendo hovered
  const isExpanded = !isVideoPlaying || isHovered;

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNavigation = (item: string) => {
    if (item === "Dashboard") {
      router.push('/dashboard');
    }
    // Adicionar outras rotas conforme necessário
  };

  const mainItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: Wallet, label: "My Wallet" },
    { icon: ArrowLeftRight, label: "Transfer" },
    { icon: Clock, label: "Transactions" },
    { icon: CreditCard, label: "Payment" },
    { icon: RotateCcw, label: "Exchange" }
  ];

  const featuresItems = [
    { icon: FolderOpen, label: "Integration" },
    { icon: Zap, label: "Automation" }
  ];

  const toolsItems = [
    { icon: Settings, label: "Settings" },
    { icon: HelpCircle, label: "Help center" }
  ];

  return (
    <div 
      className={`fixed left-4 top-4 h-[calc(100vh-2rem)] z-50 transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-16'}`}
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
                className="flex items-center justify-between w-full text-gray-300 font-medium mb-3 hover:text-gray-100 transition-colors cursor-pointer"
              >
                <span>MAIN</span>
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
                className="flex items-center justify-between w-full text-gray-300 font-medium mb-3 hover:text-gray-100 transition-colors cursor-pointer"
              >
                <span>FEATURES</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ease-in-out ${collapsedSections.features ? 'rotate-180' : ''}`} />
              </button>
            )}

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? (collapsedSections.features ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100') : 'max-h-none opacity-100'
                }`}
            >
              <div className={`space-y-1 transition-transform duration-300 ease-in-out ${isExpanded ? `ml-2 ${collapsedSections.features ? '-translate-x-4' : 'translate-x-0'}` : 'ml-0'}`}>
                {featuresItems.map((item, index) => (
                  <div key={index} className="relative">
                    <Button
                      variant="ghost"
                      className={`w-full text-gray-300 hover:text-gray-100 hover:bg-white/30 rounded-lg cursor-pointer transition-all duration-300 ease-in-out ${isExpanded ? 'justify-start px-3 py-2' : 'justify-center px-2 py-2'}`}
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
                className="flex items-center justify-between w-full text-gray-300 font-medium mb-3 hover:text-gray-100 transition-colors cursor-pointer"
              >
                <span>TOOLS</span>
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
              className="rounded-2xl p-6 relative w-full"
              style={{
                background: 'rgba(201, 254, 2, 0.2)',
                borderRadius: '16px',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
                border: '1px solid rgba(201, 254, 2, 0.3)'
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <PenTool className="w-5 h-5 text-[#C9FE02]" />
                <span className="text-[#C9FE02] font-bold text-sm">Upgrade Pro!</span>
              </div>

              <p className="text-[#C9FE02] text-xs leading-relaxed">
                Upgrade to Pro and elevate your experience today
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
