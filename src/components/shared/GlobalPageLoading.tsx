'use client';

import { LoadingGrid } from '../ui/loading-grid';

interface GlobalPageLoadingProps {
  isVisible: boolean;
  message?: string;
}

export function GlobalPageLoading({ isVisible, message = "Carregando..." }: GlobalPageLoadingProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingGrid size="80" color="#B3E240" />
          {message && (
            <p className="text-white mt-4 text-lg">{message}</p>
          )}
        </div>
    </div>
  );
}






