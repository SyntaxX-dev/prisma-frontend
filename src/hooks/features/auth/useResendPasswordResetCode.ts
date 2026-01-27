import { useState, useEffect } from 'react';
import { resendPasswordResetCode } from '@/api/auth/resend-password-reset-code';
import { ApiError } from '@/api/http/client';

interface UseResendPasswordResetCodeReturn {
  resendCode: (email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  rateLimitActive: boolean;
  retryAfter: number | null;
  countdown: number;
  setCountdown: (seconds: number) => void;
}

export function useResendPasswordResetCode(): UseResendPasswordResetCodeReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitActive, setRateLimitActive] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Countdown para reenvio (60 segundos)
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Countdown para rate limit
  useEffect(() => {
    if (retryAfter !== null && retryAfter > 0) {
      const timer = setInterval(() => {
        setRetryAfter((prev) => {
          if (prev !== null && prev > 0) {
            return prev - 1;
          }
          setRateLimitActive(false);
          return null;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (retryAfter === 0) {
      setRateLimitActive(false);
      setRetryAfter(null);
    }
  }, [retryAfter]);

  const resendCode = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await resendPasswordResetCode({ email });
      // Iniciar countdown de 60 segundos após sucesso
      setCountdown(60);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      
      // Tratar erro 429 (Rate Limit)
      if (apiError.status === 429) {
        const retryAfterSeconds = (apiError.details as any)?.retryAfter || 900;
        setRateLimitActive(true);
        setRetryAfter(retryAfterSeconds);
        
        const errorMessage = `Muitas tentativas. Aguarde ${Math.ceil(retryAfterSeconds / 60)} minutos antes de tentar novamente.`;
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      
      // Tratar outros erros
      const errorMessage = apiError.message || 'Erro ao reenviar código. Tente novamente.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    resendCode,
    isLoading,
    error,
    rateLimitActive,
    retryAfter,
    countdown,
    setCountdown,
  };
}
