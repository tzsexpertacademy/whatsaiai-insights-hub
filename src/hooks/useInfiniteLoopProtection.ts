
import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoopProtectionConfig {
  maxRenders?: number;
  maxErrors?: number;
  timeWindow?: number; // em milissegundos
  redirectTo?: string;
}

export function useInfiniteLoopProtection(config: LoopProtectionConfig = {}) {
  const {
    maxRenders = 50,
    maxErrors = 10,
    timeWindow = 5000, // 5 segundos
    redirectTo = '/'
  } = config;

  const navigate = useNavigate();
  const renderCountRef = useRef(0);
  const errorCountRef = useRef(0);
  const lastResetRef = useRef(Date.now());
  const hasRedirectedRef = useRef(false);

  const resetCounters = useCallback(() => {
    const now = Date.now();
    if (now - lastResetRef.current > timeWindow) {
      renderCountRef.current = 0;
      errorCountRef.current = 0;
      lastResetRef.current = now;
      hasRedirectedRef.current = false;
    }
  }, [timeWindow]);

  const checkForLoop = useCallback(() => {
    if (hasRedirectedRef.current) return;

    resetCounters();
    renderCountRef.current++;

    if (renderCountRef.current > maxRenders) {
      console.warn('🔄 Loop infinito detectado! Redirecionando para home...');
      hasRedirectedRef.current = true;
      
      // Força limpeza do estado
      localStorage.removeItem('loop-protection-redirect');
      localStorage.setItem('loop-protection-redirect', 'true');
      
      // Redireciona após um pequeno delay
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
        window.location.reload();
      }, 100);
    }
  }, [maxRenders, navigate, redirectTo, resetCounters]);

  const reportError = useCallback(() => {
    if (hasRedirectedRef.current) return;

    resetCounters();
    errorCountRef.current++;

    if (errorCountRef.current > maxErrors) {
      console.warn('❌ Muitos erros detectados! Redirecionando para home...');
      hasRedirectedRef.current = true;
      
      localStorage.setItem('loop-protection-redirect', 'true');
      
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
        window.location.reload();
      }, 100);
    }
  }, [maxErrors, navigate, redirectTo, resetCounters]);

  useEffect(() => {
    checkForLoop();
  });

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('🚨 Erro capturado pelo loop protection:', event.error);
      reportError();
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Promise rejeitada capturada pelo loop protection:', event.reason);
      reportError();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [reportError]);

  return {
    reportError,
    isProtectionActive: hasRedirectedRef.current
  };
}
