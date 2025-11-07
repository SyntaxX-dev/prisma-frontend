"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreHorizontal, 
  Phone, 
  Video, 
  Search,
  Mic
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Community, CommunityMessage } from "@/types/community";

interface CommunityChatProps {
  community: Community;
  messages: CommunityMessage[];
  onSendMessage: (content: string) => void;
  onStartVideoCall?: () => void;
  onStartVoiceCall?: () => void;
  isLoading?: boolean;
}

export function CommunityChat({
  community,
  messages,
  onSendMessage,
  onStartVideoCall,
  onStartVoiceCall,
  isLoading,
}: CommunityChatProps) {
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput.trim());
      setMessageInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  return (
    <div 
      className="flex-1 flex flex-col h-full rounded-2xl overflow-hidden border border-white/10"
      style={{
        background: 'rgb(14, 14, 14)',
      }}
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgb(26, 26, 26)' }}>
                <Smile className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-500 text-sm">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.isOwn;
              const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
              const showName = showAvatar && !isOwn;
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-8 flex-shrink-0">
                    {showAvatar && !isOwn && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.senderAvatar} />
                        <AvatarFallback 
                          className="text-xs font-medium"
                          style={{
                            background: '#C9FE02',
                            color: '#000',
                          }}
                        >
                          {getInitials(message.senderName)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  <div
                    className={`flex flex-col max-w-[70%] ${
                      isOwn ? "items-end" : "items-start"
                    }`}
                  >
                    {showName && (
                      <span className="text-xs text-gray-500 mb-1 px-1">
                        {message.senderName}
                      </span>
                    )}
                    
                    <div className="group relative">
                      <div
                        className={`px-3 py-2 rounded-lg ${
                          isOwn
                            ? "rounded-tr-sm"
                            : "rounded-tl-sm"
                        }`}
                        style={{
                          background: isOwn ? '#C9FE02' : 'rgb(26, 26, 26)',
                          color: isOwn ? '#000' : '#fff',
                        }}
                      >
                        <p className={`text-[13px] leading-relaxed break-words ${isOwn ? 'text-black' : 'text-white'}`}>
                          {message.content}
                        </p>
                      </div>
                      
                      <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                        <span className="text-[10px] text-gray-600">
                          {formatTime(message.timestamp)}
                        </span>
                        {isOwn && (
                          <span className="text-[10px] text-gray-600">✓✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div 
        className="p-4"
        style={{
          background: 'rgb(30, 30, 30)',
          borderTop: '1px solid rgb(26, 26, 26)',
        }}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-white hover:bg-[#1a1a1a] rounded-lg w-9 h-9 cursor-pointer"
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          <div 
            className="flex-1 relative rounded-lg overflow-hidden"
            style={{
              background: 'rgb(26, 26, 26)',
            }}
          >
            <Input
              placeholder="Your message"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="bg-transparent border-0 text-white placeholder:text-gray-500 focus-visible:ring-0 h-9 text-sm cursor-text"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-white hover:bg-[#1a1a1a] rounded-lg w-9 h-9 cursor-pointer"
          >
            <Smile className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-white hover:bg-[#1a1a1a] rounded-lg w-9 h-9 cursor-pointer"
          >
            <Mic className="w-4 h-4" />
          </Button>

          <Button
            onClick={handleSend}
            disabled={!messageInput.trim() || isLoading}
            size="icon"
            className="rounded-lg w-9 h-9 cursor-pointer"
            style={{
              background: messageInput.trim() ? '#C9FE02' : 'rgb(26, 26, 26)',
              color: messageInput.trim() ? '#000' : '#666',
            }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}