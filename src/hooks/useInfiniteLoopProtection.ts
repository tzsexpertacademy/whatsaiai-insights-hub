
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
    maxRenders = 30, // Reduzindo para detectar mais cedo
    maxErrors = 5,
    timeWindow = 3000,
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
      console.log('🔄 Loop Protection - Resetando contadores');
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
    
    console.log(`🔍 Loop Protection - Render ${renderCountRef.current}/${maxRenders}`);

    if (renderCountRef.current > maxRenders) {
      console.warn('🚨 LOOP INFINITO DETECTADO! Redirecionando para home...');
      hasRedirectedRef.current = true;
      
      // Força limpeza do estado
      localStorage.removeItem('loop-protection-redirect');
      localStorage.setItem('loop-protection-redirect', 'true');
      
      // Redireciona após um pequeno delay
      setTimeout(() => {
        console.log('🏠 Executando redirecionamento para:', redirectTo);
        navigate(redirectTo, { replace: true });
        window.location.reload();
      }, 100);
    }
  }, [maxRenders, navigate, redirectTo, resetCounters]);

  const reportError = useCallback(() => {
    if (hasRedirectedRef.current) return;

    resetCounters();
    errorCountRef.current++;
    
    console.log(`❌ Loop Protection - Erro ${errorCountRef.current}/${maxErrors}`);

    if (errorCountRef.current > maxErrors) {
      console.warn('🚨 MUITOS ERROS DETECTADOS! Redirecionando para home...');
      hasRedirectedRef.current = true;
      
      localStorage.setItem('loop-protection-redirect', 'true');
      
      setTimeout(() => {
        console.log('🏠 Executando redirecionamento por erros para:', redirectTo);
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
