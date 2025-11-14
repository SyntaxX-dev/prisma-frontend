"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Messages Skeleton */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Left side messages (other user) */}
        {[
          { width: '120px' },
          { width: '180px' },
          { width: '150px' },
        ].map((size, i) => (
          <div key={`left-${i}`} className="flex gap-3">
            <Skeleton className="w-8 h-8 rounded-full bg-[#29292E] shrink-0" />
            <div className="flex flex-col items-start max-w-[70%]">
              <Skeleton 
                className="rounded-2xl px-4 py-2.5 bg-[#29292E] border border-[#323238]"
                style={{ width: size.width, height: '32px' }}
              />
              <Skeleton className="h-3 w-16 mt-1 bg-[#29292E]" />
            </div>
          </div>
        ))}

        {/* Right side messages (own) */}
        {[
          { width: '100px' },
          { width: '160px' },
          { width: '140px' },
          { width: '120px' },
        ].map((size, i) => (
          <div key={`right-${i}`} className="flex gap-3 flex-row-reverse">
            <Skeleton className="w-8 h-8 rounded-full bg-[#29292E] shrink-0" />
            <div className="flex flex-col items-end max-w-[70%]">
              <Skeleton 
                className="rounded-2xl px-4 py-2.5 bg-[#29292E]"
                style={{ width: size.width, height: '32px' }}
              />
              <div className="flex items-center gap-2 mt-1">
                <Skeleton className="h-3 w-16 bg-[#29292E]" />
                <Skeleton className="h-3 w-4 bg-[#29292E]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Skeleton */}
      <div className="flex items-end gap-2 p-4 border-t border-white/10 bg-[#1a1a1a]">
        <Skeleton className="flex-1 h-[44px] rounded-lg bg-[#29292E]" />
        <Skeleton className="w-[44px] h-[44px] rounded-lg bg-[#29292E] shrink-0" />
      </div>
    </div>
  );
}

