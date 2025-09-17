'use client';

import { useEffect, useState } from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import { useAuth } from './useAuth';

export function useCompletePageLoad() {
  const { setLoading } = useLoading();
  const { isLoading: isAuthLoading } = useAuth();
  const [isPageReady, setIsPageReady] = useState(false);
  const [isNavbarReady, setIsNavbarReady] = useState(false);

  useEffect(() => {
    const handlePageLoad = () => {
      setIsPageReady(true);
    };

    const checkNavbarReady = () => {
      const navbar = document.querySelector('[data-navbar]');
      if (navbar) {
        setIsNavbarReady(true);
      } else {
        setTimeout(checkNavbarReady, 100);
      }
    };

    if (document.readyState === 'complete') {
      handlePageLoad();
    } else {
      window.addEventListener('load', handlePageLoad);
    }

    checkNavbarReady();

    return () => {
      window.removeEventListener('load', handlePageLoad);
    };
  }, []);

  useEffect(() => {
    if (isPageReady && isNavbarReady && !isAuthLoading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isPageReady, isNavbarReady, isAuthLoading, setLoading]);

  return {
    isPageReady,
    isNavbarReady,
    isAuthLoading,
    isComplete: isPageReady && isNavbarReady && !isAuthLoading
  };
}
