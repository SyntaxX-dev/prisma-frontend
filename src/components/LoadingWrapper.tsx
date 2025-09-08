'use client';

import { useLoading } from "@/contexts/LoadingContext";
import { GlobalPageLoading } from "@/components/GlobalPageLoading";

interface LoadingWrapperProps {
  children: React.ReactNode;
}

export function LoadingWrapper({ children }: LoadingWrapperProps) {
  const { isLoading, loadingMessage } = useLoading();
  
  return (
    <>
      {children}
      <GlobalPageLoading isVisible={isLoading} message={loadingMessage} />
    </>
  );
}
