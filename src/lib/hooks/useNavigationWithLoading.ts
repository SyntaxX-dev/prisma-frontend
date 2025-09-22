'use client';

import { useRouter } from 'next/navigation';
import { useLoading } from '@/contexts/LoadingContext';

export function useNavigationWithLoading() {
  const { setLoading } = useLoading();
  const router = useRouter();

  const navigateWithLoading = (href: string, message: string = 'Carregando...') => {
    setLoading(true, message);
    router.push(href);
  };

  return {
    navigateWithLoading
  };
}
