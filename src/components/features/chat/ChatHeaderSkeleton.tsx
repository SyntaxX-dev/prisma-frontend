"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Search, Settings } from "lucide-react";

export function ChatHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Nome do Usuário Skeleton */}
      <Skeleton className="h-8 w-32 bg-[#29292E]" />
      
      {/* Search Bar + Actions Skeleton */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative" style={{ width: '280px' }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Skeleton className="w-full h-12 rounded-full bg-[#1e1e1e]" />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full bg-[#1e1e1e]" />
          <Skeleton className="w-12 h-12 rounded-full bg-[#1e1e1e]" />
          <Skeleton className="w-12 h-12 rounded-full bg-[#1e1e1e]" />
        </div>
      </div>
    </div>
  );
}

