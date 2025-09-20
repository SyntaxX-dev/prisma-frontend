'use client';

import { useEffect, useState } from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import { useAuth } from './useAuth';

interface UsePageDataLoadOptions {
  waitForData?: boolean;
  dataLoading?: boolean;
  customDelay?: number;
}

export function usePageDataLoad(options: UsePageDataLoadOptions = {}) {
  const { setLoading } = useLoading();
  const { isLoading: isAuthLoading } = useAuth();
  const [isPageReady, setIsPageReady] = useState(false);
  const [isNavbarReady, setIsNavbarReady] = useState(false);
  
  const {
    waitForData = false,
    dataLoading = false,
    customDelay = 0
  } = options;

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
    const isAuthReady = !isAuthLoading;
    const isDataReady = !waitForData || !dataLoading;
    const isPageAndNavbarReady = isPageReady && isNavbarReady;

    if (isPageAndNavbarReady && isAuthReady && isDataReady) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, customDelay);

      return () => clearTimeout(timer);
    }
  }, [isPageReady, isNavbarReady, isAuthLoading, dataLoading, waitForData, customDelay, setLoading]);

  return {
    isPageReady,
    isNavbarReady,
    isAuthLoading,
    isDataLoading: dataLoading,
    isComplete: isPageReady && isNavbarReady && !isAuthLoading && (!waitForData || !dataLoading)
  };
}
