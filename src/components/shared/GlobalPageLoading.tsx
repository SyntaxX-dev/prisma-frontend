'use client';

import { LoadingGrid } from '../ui/loading-grid';

interface GlobalPageLoadingProps {
  isVisible: boolean;
  message?: string;
}

export function GlobalPageLoading({ isVisible, message = "Carregando..." }: GlobalPageLoadingProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" suppressHydrationWarning>
        <div className="text-center" suppressHydrationWarning>
          <LoadingGrid size="80" color="#bd18b4" />
          {message && (
            <p className="text-white mt-4 text-lg" suppressHydrationWarning>{message}</p>
          )}
        </div>
    </div>
  );
}






