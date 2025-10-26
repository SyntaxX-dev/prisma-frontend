'use client';

import { useClientOnly } from '@/hooks/shared';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente que garante que o conteúdo só seja renderizado no cliente
 * Evita problemas de hidratação com localStorage e outras APIs do navegador
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isClient = useClientOnly();

  if (!isClient) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
