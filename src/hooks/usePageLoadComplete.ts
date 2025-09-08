'use client';

import { useEffect } from 'react';
import { useLoading } from '@/contexts/LoadingContext';

export function usePageLoadComplete() {
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(false);
  }, [setLoading]);
}
