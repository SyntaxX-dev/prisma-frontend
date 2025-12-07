"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] w-full max-w-full overflow-hidden">
      {/* Messages Skeleton */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-3 md:space-y-4 w-full max-w-full">
        {/* Left side messages (other user) */}
        {[
          { width: '120px' },
          { width: '180px' },
          { width: '150px' },
        ].map((size, i) => (
          <div key={`left-${i}`} className="flex gap-2 md:gap-3 w-full max-w-full">
            <Skeleton className="w-8 h-8 rounded-full bg-[#29292E] shrink-0" />
            <div className="flex flex-col items-start flex-1 min-w-0 max-w-[75%] md:max-w-[70%]">
              <Skeleton 
                className="rounded-2xl px-3 md:px-4 py-2 md:py-2.5 bg-[#29292E] border border-[#323238] w-full max-w-full"
                style={{ 
                  width: `min(${size.width}, calc(100% - 0px))`, 
                  height: '32px' 
                }}
              />
              <Skeleton className="h-3 w-12 md:w-16 mt-1 bg-[#29292E]" />
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
          <div key={`right-${i}`} className="flex gap-2 md:gap-3 flex-row-reverse w-full max-w-full">
            <Skeleton className="w-8 h-8 rounded-full bg-[#29292E] shrink-0" />
            <div className="flex flex-col items-end flex-1 min-w-0 max-w-[75%] md:max-w-[70%]">
              <Skeleton 
                className="rounded-2xl px-3 md:px-4 py-2 md:py-2.5 bg-[#29292E] w-full max-w-full"
                style={{ 
                  width: `min(${size.width}, calc(100% - 0px))`, 
                  height: '32px' 
                }}
              />
              <div className="flex items-center gap-2 mt-1">
                <Skeleton className="h-3 w-12 md:w-16 bg-[#29292E]" />
                <Skeleton className="h-3 w-3 md:w-4 bg-[#29292E]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Skeleton */}
      <div className="flex items-end gap-2 p-2 md:p-4 border-t border-white/10 bg-[#1a1a1a]">
        <Skeleton className="flex-1 h-10 md:h-[44px] rounded-lg bg-[#29292E]" />
        <Skeleton className="w-10 h-10 md:w-[44px] md:h-[44px] rounded-lg bg-[#29292E] shrink-0" />
      </div>
    </div>
  );
}

