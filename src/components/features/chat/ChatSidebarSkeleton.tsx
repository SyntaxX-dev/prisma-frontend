"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Phone, Video, Pin, Users, ImageIcon, ChevronDown } from "lucide-react";

export function ChatSidebarSkeleton() {
  return (
    <div className="w-full lg:w-[300px] flex flex-col h-full gap-2 md:gap-3">
      {/* Quick Actions - Ilha 1 */}
      <div 
        className="p-4 rounded-2xl border border-white/10"
        style={{
          background: 'rgb(14, 14, 14)',
        }}
      >
        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col items-center gap-2 p-2">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#29292E]"
            >
              <Phone className="w-4 h-4 text-gray-600" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 p-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#29292E]">
              <Video className="w-4 h-4 text-gray-600" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 p-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#29292E]">
              <Pin className="w-4 h-4 text-gray-600" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 p-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#29292E]">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Mensagens Fixadas - Ilha 2 */}
      <div 
        className="rounded-2xl overflow-hidden border border-white/10"
        style={{
          background: 'rgb(14, 14, 14)',
        }}
      >
        <div className="p-4">
          <h3 className="text-white font-medium text-sm mb-3">Mensagens Fixadas</h3>
          <div className="space-y-2"
            style={{
              maxHeight: '250px',
              overflowY: 'auto',
            }}
          >
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="flex items-start gap-2 p-2 rounded-lg"
              >
                <Skeleton className="w-8 h-8 rounded-full bg-[#29292E] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="h-4 w-20 md:w-24 bg-[#29292E]" />
                    <Skeleton className="h-3 w-8 bg-[#29292E]" />
                  </div>
                  <Skeleton className="h-3 w-full bg-[#29292E] mb-1" />
                  <Skeleton className="h-3 w-3/4 bg-[#29292E]" />
                </div>
                <Pin className="w-3 h-3 text-gray-600 shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Files - Ilha 3 */}
      <div 
        className="rounded-2xl overflow-hidden flex-1 border border-white/10"
        style={{
          background: 'rgb(14, 14, 14)',
        }}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="w-full flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-white">Files</span>
              <Skeleton className="h-3 w-8 bg-[#29292E]" />
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
          
          <div className="mt-2 flex-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-3 w-20 bg-[#29292E]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className="aspect-square rounded-lg bg-[#29292E]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

