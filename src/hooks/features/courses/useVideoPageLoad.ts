'use client';

import { useEffect, useState } from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import { useAuth } from '../auth/useAuth';

interface UseVideoPageLoadOptions {
  waitForVideo?: boolean;
  videoLoading?: boolean;
  customDelay?: number;
}

export function useVideoPageLoad(options: UseVideoPageLoadOptions = {}) {
  const { setLoading } = useLoading();
  const { isLoading: isAuthLoading } = useAuth();
  const [isPageReady, setIsPageReady] = useState(false);
  const [isNavbarReady, setIsNavbarReady] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  const {
    waitForVideo = false,
    videoLoading = false,
    customDelay = 0
  } = options;

  useEffect(() => {
    // Aguarda o DOM estar completamente carregado
    const handlePageLoad = () => {
      setIsPageReady(true);
    };

    // Aguarda a navbar estar renderizada
    const checkNavbarReady = () => {
      const navbar = document.querySelector('[data-navbar]');
      if (navbar) {
        setIsNavbarReady(true);
      } else {
        setTimeout(checkNavbarReady, 100);
      }
    };

    // Aguarda o iframe do vídeo estar carregado
    const checkVideoReady = () => {
      const iframe = document.querySelector('iframe[data-video-iframe]');
      if (iframe) {
        iframe.addEventListener('load', () => {
          setIsVideoReady(true);
        });
        // Fallback: se não conseguir detectar o load do iframe, aguarda 2 segundos
        setTimeout(() => {
          setIsVideoReady(true);
        }, 2000);
      } else {
        // Se não há vídeo, considera pronto
        setIsVideoReady(true);
      }
    };

    // Verifica se a página já está carregada
    if (document.readyState === 'complete') {
      handlePageLoad();
    } else {
      window.addEventListener('load', handlePageLoad);
    }

    // Verifica se a navbar está pronta
    checkNavbarReady();

    // Verifica se o vídeo está pronto
    if (waitForVideo) {
      checkVideoReady();
    } else {
      setIsVideoReady(true);
    }

    return () => {
      window.removeEventListener('load', handlePageLoad);
    };
  }, [waitForVideo]);

  useEffect(() => {
    // Condições para remover o loading
    const isAuthReady = !isAuthLoading;
    const isVideoDataReady = !waitForVideo || !videoLoading;
    const isPageAndNavbarReady = isPageReady && isNavbarReady;
    const isVideoElementReady = !waitForVideo || isVideoReady;

    if (isPageAndNavbarReady && isAuthReady && isVideoDataReady && isVideoElementReady) {
      // Delay para garantir que tudo está renderizado
      const timer = setTimeout(() => {
        setLoading(false);
      }, customDelay);

      return () => clearTimeout(timer);
    }
  }, [isPageReady, isNavbarReady, isAuthLoading, videoLoading, isVideoReady, waitForVideo, customDelay, setLoading]);

  return {
    isPageReady,
    isNavbarReady,
    isAuthLoading,
    isVideoLoading: videoLoading,
    isVideoReady,
    isComplete: isPageReady && isNavbarReady && !isAuthLoading && (!waitForVideo || (!videoLoading && isVideoReady))
  };
}
