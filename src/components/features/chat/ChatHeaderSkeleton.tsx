"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Search, Settings } from "lucide-react";

export function ChatHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between gap-2 md:gap-4 w-full max-w-full overflow-hidden">
      {/* Nome do Usuário Skeleton */}
      <Skeleton className="h-6 md:h-8 w-16 md:w-32 bg-[#29292E] shrink-0" />
      
      {/* Search Bar + Actions Skeleton */}
      <div className="flex items-center gap-1.5 md:gap-4 flex-1 lg:flex-initial justify-center lg:justify-end min-w-0 max-w-full">
        {/* Search Bar */}
        <div className="relative flex-1 lg:flex-initial min-w-0 max-w-[120px] md:max-w-xs lg:max-w-none">
          <Search className="absolute left-2 md:left-3 lg:left-4 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-gray-500" />
          <Skeleton className="w-full h-9 md:h-10 lg:h-12 rounded-full bg-[#1e1e1e] max-w-full" />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 md:gap-1.5 md:gap-3 shrink-0">
          <Skeleton className="w-7 h-7 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-[#1e1e1e]" />
          <Skeleton className="w-7 h-7 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-[#1e1e1e]" />
          <Skeleton className="w-7 h-7 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-[#1e1e1e]" />
        </div>
      </div>
    </div>
  );
}

