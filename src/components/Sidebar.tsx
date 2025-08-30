import { Sun, Moon, BarChart3, BookOpen, Trophy, Users, Settings, Star } from "lucide-react";
import { Button } from "./ui/button";

interface SidebarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export function Sidebar({ isDark, toggleTheme }: SidebarProps) {
  const navigationItems = [
    { icon: BarChart3, label: "Dashboard", active: true },
    { icon: BookOpen, label: "Cursos" },
    { icon: Trophy, label: "Certificados" },
    { icon: Users, label: "Comunidade" },
    { icon: Star, label: "Favoritos" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
      {/* Theme Toggle Card */}
      <div className="bg-white/15 backdrop-blur-md rounded-full p-3 border border-white/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="text-white/80 hover:text-[#B3E240] hover:bg-white/10 rounded-full w-10 h-10 p-0"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      {/* Navigation Card */}
      <div className="bg-white/15 backdrop-blur-md rounded-full p-3 border border-white/20">
        <div className="flex flex-col gap-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className={`rounded-full w-10 h-10 p-0 transition-all ${
                  item.active
                    ? "bg-[#B3E240] text-black hover:bg-[#B3E240]/90"
                    : "text-white/80 hover:text-[#B3E240] hover:bg-white/10"
                }`}
              >
                <Icon className="w-5 h-5" />
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}