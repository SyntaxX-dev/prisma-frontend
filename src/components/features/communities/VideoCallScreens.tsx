"use client";

import { useState } from "react";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  ScreenShare,
  MessageSquare,
  Users,
  MoreVertical,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface VideoCallScreenProps {
  communityName: string;
  participants: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
    isMuted?: boolean;
    isVideoOff?: boolean;
    isSpeaking?: boolean;
  }>;
  onEndCall: () => void;
}

export function VideoCallScreen({
  communityName,
  participants,
  onEndCall,
}: VideoCallScreenProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const mainParticipant = participants[0];
  const otherParticipants = participants.slice(1);

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background: '#000',
      }}
    >
      {/* Header */}
      <div 
        className="h-14 px-5 flex items-center justify-between"
        style={{
          background: '#1a1a1a',
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{
              background: '#c8ff00',
              color: '#000',
            }}
          >
            IG
          </div>
          <span className="text-white font-medium text-sm">{communityName}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-lg w-9 h-9"
          >
            <Users className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-lg w-9 h-9"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-lg w-9 h-9"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-2 gap-4">
        {/* Main Video */}
        <div 
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: '#1a1a1a',
          }}
        >
          {mainParticipant.isVideoOff ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Avatar className="w-24 h-24">
                <AvatarImage src={mainParticipant.avatarUrl} />
                <AvatarFallback 
                  className="text-2xl font-bold"
                  style={{
                    background: '#c8ff00',
                    color: '#000',
                  }}
                >
                  {getInitials(mainParticipant.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
          )}

          <div 
            className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg flex items-center gap-2"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
            }}
          >
            <span className="text-white text-sm">{mainParticipant.name}</span>
            {mainParticipant.isMuted && (
              <MicOff className="w-3.5 h-3.5 text-red-500" />
            )}
          </div>
        </div>

        {/* Other Participants */}
        {otherParticipants.map((participant) => (
          <div
            key={participant.id}
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: '#1a1a1a',
            }}
          >
            {participant.isVideoOff ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={participant.avatarUrl} />
                  <AvatarFallback 
                    className="text-xl font-bold"
                    style={{
                      background: '#c8ff00',
                      color: '#000',
                    }}
                  >
                    {getInitials(participant.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
            )}

            <div 
              className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg flex items-center gap-2"
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
              }}
            >
              <span className="text-white text-sm">{participant.name}</span>
              {participant.isMuted && (
                <MicOff className="w-3.5 h-3.5 text-red-500" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div 
        className="h-20 px-6 flex items-center justify-center gap-3"
        style={{
          background: '#1a1a1a',
        }}
      >
        <Button
          onClick={() => setIsMuted(!isMuted)}
          size="lg"
          className={`rounded-full w-12 h-12 ${
            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-[#2a2a2a] hover:bg-[#333]'
          } text-white`}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>

        <Button
          onClick={() => setIsVideoOff(!isVideoOff)}
          size="lg"
          className={`rounded-full w-12 h-12 ${
            isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-[#2a2a2a] hover:bg-[#333]'
          } text-white`}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </Button>

        <Button
          onClick={() => setIsScreenSharing(!isScreenSharing)}
          size="lg"
          className={`rounded-full w-12 h-12 ${
            isScreenSharing ? 'bg-[#c8ff00] text-black' : 'bg-[#2a2a2a] hover:bg-[#333] text-white'
          }`}
        >
          <ScreenShare className="w-5 h-5" />
        </Button>

        <Button
          onClick={onEndCall}
          size="lg"
          className="rounded-full w-12 h-12 bg-red-500 hover:bg-red-600 text-white"
        >
          <Phone className="w-5 h-5 rotate-[135deg]" />
        </Button>

        <Button
          size="lg"
          className="rounded-full w-12 h-12 bg-[#2a2a2a] hover:bg-[#333] text-white"
        >
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}