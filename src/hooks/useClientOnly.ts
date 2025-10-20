import { useEffect, useState } from 'react';

/**
 * Hook que garante que o componente só renderize no cliente
 * Evita problemas de hidratação com localStorage e outras APIs do navegador
 */
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
