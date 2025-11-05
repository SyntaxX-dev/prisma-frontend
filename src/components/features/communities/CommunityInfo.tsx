"use client";

import { 
  Phone,
  Video,
  Pin,
  Users,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  File
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Community } from "@/types/community";
import { useState } from "react";

interface CommunityInfoProps {
  community: Community;
  onStartVideoCall?: () => void;
  onStartVoiceCall?: () => void;
}

export function CommunityInfo({ community, onStartVideoCall, onStartVoiceCall }: CommunityInfoProps) {
  const [expandedSection, setExpandedSection] = useState<string>("photos");
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? "" : section);
  };

  const mockPhotos = [
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200",
    "https://images.unsplash.com/photo-1506812574058-fc75fa93fead?w=200",
    "https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?w=200",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200",
  ];

  const mockFiles = [
    { name: "Contract for the provision of printing services", type: "pdf" },
    { name: "Changes in the schedule of the department of material...", type: "doc" },
    { name: "Contract for the provision of printing services", type: "pdf" },
  ];

  const mockLinks = [
    { title: "Economic Policy", url: "https://www.fffm.economic-policy" },
    { title: "Microsoft", url: "https://www.microsoft.com/" },
    { title: "Contact information", url: "https://www.fffm.neweconomic-policy" },
    { title: "Official Guide to Government...", url: "https://www.usa.gov" },
  ];

  return (
    <div className="w-[300px] flex flex-col h-full gap-3">
      {/* Quick Actions - Ilha 1 */}
      <div 
        className="p-4 rounded-2xl"
        style={{
          background: 'rgb(30, 30, 30)',
        }}
      >
        <div className="grid grid-cols-4 gap-2">
          <button 
            onClick={onStartVoiceCall}
            className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer"
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: '#C9FE02',
              }}
            >
              <Phone className="w-4 h-4 text-black" />
            </div>
          </button>
          <button 
            onClick={onStartVideoCall}
            className="flex flex-col items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgb(26, 26, 26)' }}>
              <Video className="w-4 h-4 text-gray-400" />
            </div>
          </button>
          <button className="flex flex-col items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgb(26, 26, 26)' }}>
              <Pin className="w-4 h-4 text-gray-400" />
            </div>
          </button>
          <button className="flex flex-col items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgb(26, 26, 26)' }}>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
          </button>
        </div>
      </div>

      {/* Members - Ilha 2 */}
      <div 
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgb(30, 30, 30)',
        }}
      >
        <div className="p-4">
          <h3 className="text-white font-medium text-sm mb-3">Members</h3>
          <div className="space-y-2"
            style={{
              maxHeight: '250px',
              overflowY: 'auto',
            }}
          >
            {[
              { name: "Richard Wilson", role: "Admin", online: true, avatar: "https://i.pravatar.cc/150?img=13" },
              { name: "You", role: "", online: true, avatar: "https://i.pravatar.cc/150?img=68" },
              { name: "Jaden Parker", role: "", online: false, avatar: "https://i.pravatar.cc/150?img=25" },
              { name: "Conner Garcia", role: "", online: true, avatar: "https://i.pravatar.cc/150?img=15" },
              { name: "Lawrence Patterson", role: "", online: true, avatar: "https://i.pravatar.cc/150?img=52" },
            ].map((member, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[rgb(26,26,26)] transition-colors cursor-pointer">
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback 
                      className="text-xs font-medium"
                      style={{
                        background: '#C9FE02',
                        color: '#000',
                      }}
                    >
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  {member.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#C9FE02] rounded-full border-2" style={{ borderColor: 'rgb(30, 30, 30)' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{member.name}</p>
                </div>
                {member.role && (
                  <span className="text-xs text-gray-500">{member.role}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Files - Ilha 3 */}
      <div 
        className="rounded-2xl overflow-hidden flex-1"
        style={{
          background: 'rgb(30, 30, 30)',
        }}
      >
        <div className="p-4 h-full flex flex-col">
          <button
            onClick={() => toggleSection("photos")}
            className="w-full flex items-center justify-between py-2 text-white hover:text-gray-300 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Files</span>
              <span className="text-xs text-gray-500">115</span>
            </div>
            {expandedSection === "photos" ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          {expandedSection === "photos" && (
            <div className="mt-2 flex-1 overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">115 photos</span>
                <button className="text-xs text-gray-500 hover:text-white cursor-pointer">^</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {mockPhotos.map((photo, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg overflow-hidden"
                    style={{ background: 'rgb(26, 26, 26)' }}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}