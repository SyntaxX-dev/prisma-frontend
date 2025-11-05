"use client";

import { useState } from "react";
import { 
  Mic, 
  MicOff, 
  Phone, 
  Settings,
  MessageSquare,
  Users,
  MoreVertical,
  Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface VoiceCallScreenProps {
  communityName: string;
  participants: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
    isMuted?: boolean;
    isSpeaking?: boolean;
  }>;
  onEndCall: () => void;
}

export function VoiceCallScreen({
  communityName,
  participants,
  onEndCall,
}: VoiceCallScreenProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [callDuration, setCallDuration] = useState("00:00");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      }}
    >
      {/* Decorative Background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(179, 226, 64, 0.15) 0%, transparent 60%),
                       radial-gradient(circle at 20% 80%, rgba(179, 226, 64, 0.1) 0%, transparent 40%),
                       radial-gradient(circle at 80% 20%, rgba(179, 226, 64, 0.1) 0%, transparent 40%)`,
          filter: 'blur(60px)',
        }}
      />

      {/* Header */}
      <div 
        className="h-16 px-6 flex items-center justify-between flex-shrink-0 relative z-10"
        style={{
          background: 'rgba(18, 18, 23, 0.95)',
          backdropFilter: 'blur(30px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #B3E240 0%, #8BC34A 100%)',
            }}
          >
            <Phone className="w-4 h-4 text-black" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">{communityName}</h2>
            <p className="text-xs text-[#B3E240]">{callDuration}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowChat(!showChat)}
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full w-9 h-9"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full w-9 h-9"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-4xl">
          {/* Active Speaker / Main View */}
          <div className="flex flex-col items-center mb-12">
            <div className="relative mb-6">
              <div 
                className="w-48 h-48 rounded-full relative"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 30, 38, 0.8) 0%, rgba(20, 20, 28, 0.8) 100%)',
                  border: '3px solid rgba(179, 226, 64, 0.3)',
                  boxShadow: '0 0 60px rgba(179, 226, 64, 0.2)',
                }}
              >
                <Avatar className="w-full h-full">
                  <AvatarImage src={participants[0]?.avatarUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-[#B3E240] to-[#8BC34A] text-black text-5xl font-bold">
                    {getInitials(participants[0]?.name || "User")}
                  </AvatarFallback>
                </Avatar>

                {/* Speaking Animation */}
                {participants[0]?.isSpeaking && (
                  <>
                    <div 
                      className="absolute inset-0 rounded-full"
                      style={{
                        border: '3px solid #B3E240',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      }}
                    />
                    <div 
                      className="absolute inset-0 rounded-full"
                      style={{
                        border: '3px solid #B3E240',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        animationDelay: '1s',
                      }}
                    />
                  </>
                )}

                {/* Muted Badge */}
                {participants[0]?.isMuted && (
                  <div 
                    className="absolute bottom-2 right-2 w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(239, 68, 68, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <MicOff className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">
              {participants[0]?.name}
            </h3>
            <p className="text-gray-400 text-sm">
              {participants[0]?.isSpeaking ? 'Falando agora' : 'Conectado'}
            </p>
          </div>

          {/* Other Participants Grid */}
          <div className="grid grid-cols-5 gap-6 justify-center max-w-3xl mx-auto">
            {participants.slice(1).map((participant) => (
              <div
                key={participant.id}
                className="flex flex-col items-center"
              >
                <div className="relative mb-3">
                  <div 
                    className="w-20 h-20 rounded-full relative"
                    style={{
                      background: 'rgba(30, 30, 38, 0.6)',
                      border: participant.isSpeaking 
                        ? '2px solid #B3E240' 
                        : '2px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Avatar className="w-full h-full">
                      <AvatarImage src={participant.avatarUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-800 text-white text-lg font-semibold">
                        {getInitials(participant.name)}
                      </AvatarFallback>
                    </Avatar>

                    {participant.isMuted && (
                      <div 
                        className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{
                          background: 'rgba(239, 68, 68, 0.9)',
                          border: '2px solid rgba(15, 15, 20, 0.8)',
                        }}
                      >
                        <MicOff className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {participant.isSpeaking && (
                    <div className="absolute inset-0">
                      <div 
                        className="absolute inset-0 rounded-full"
                        style={{
                          border: '2px solid #B3E240',
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        }}
                      />
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-400 text-center truncate w-full px-1">
                  {participant.name}
                </p>
              </div>
            ))}
          </div>

          {/* Participants Count */}
          <div className="flex justify-center mt-8">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: 'rgba(30, 30, 38, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Users className="w-4 h-4 text-[#B3E240]" />
              <span className="text-sm text-gray-300 font-medium">
                {participants.length} na chamada
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div 
        className="h-24 px-6 flex items-center justify-center flex-shrink-0 relative z-10"
        style={{
          background: 'rgba(18, 18, 23, 0.95)',
          backdropFilter: 'blur(30px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Volume */}
          <Button
            size="lg"
            className="rounded-full w-14 h-14 bg-white/10 hover:bg-white/20 text-white"
          >
            <Volume2 className="w-6 h-6" />
          </Button>

          {/* Microphone */}
          <Button
            onClick={() => setIsMuted(!isMuted)}
            size="lg"
            className={`rounded-full w-16 h-16 ${
              isMuted
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-[#B3E240] hover:bg-[#9FCC3A] text-black'
            }`}
          >
            {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </Button>

          {/* End Call */}
          <Button
            onClick={onEndCall}
            size="lg"
            className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600 text-white"
          >
            <Phone className="w-7 h-7 rotate-[135deg]" />
          </Button>

          {/* More Options */}
          <Button
            size="lg"
            className="rounded-full w-14 h-14 bg-white/10 hover:bg-white/20 text-white"
          >
            <MoreVertical className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}