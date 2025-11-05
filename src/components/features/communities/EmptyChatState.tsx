"use client";

import { MessageCircle, Sparkles } from "lucide-react";

export function EmptyChatState() {
  return (
    <div 
      className="flex-1 flex items-center justify-center relative"
      style={{
        background: 'rgba(15, 15, 20, 0.7)',
      }}
    >
      {/* Animated Background */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 40%, rgba(179, 226, 64, 0.05) 0%, transparent 50%),
                       radial-gradient(circle at 70% 60%, rgba(179, 226, 64, 0.03) 0%, transparent 50%)`,
        }}
      />

      <div className="text-center max-w-md px-6 relative z-10">
        <div className="mb-8 flex justify-center relative">
          <div 
            className="w-32 h-32 rounded-[32px] flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 38, 0.8) 0%, rgba(20, 20, 28, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(179, 226, 64, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            <MessageCircle className="w-16 h-16 text-[#B3E240]" strokeWidth={1.5} />
            
            {/* Floating Sparkle */}
            <Sparkles 
              className="w-6 h-6 text-[#B3E240] absolute -top-2 -right-2 animate-pulse"
            />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-white mb-3">
          Bem-vindo às Comunidades
        </h3>
        
        <p className="text-gray-400 text-sm leading-relaxed">
          Selecione uma comunidade ao lado ou crie uma nova para começar a conversar e se conectar com pessoas
        </p>

        {/* Decorative Elements */}
        <div className="mt-8 flex justify-center gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#B3E240]"
              style={{
                opacity: 0.3 + (i * 0.2),
                animation: `pulse 2s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}