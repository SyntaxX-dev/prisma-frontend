'use client';

import { Loading } from '../../ui/loading';

interface GlobalPageLoadingProps {
  isVisible: boolean;
  message?: string;
}

export function GlobalPageLoading({ isVisible, message = "Carregando..." }: GlobalPageLoadingProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <Loading type="page" size="lg" className="text-white" />
    </div>
  );
}






