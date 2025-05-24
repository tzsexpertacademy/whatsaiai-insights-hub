
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAutoRefresh() {
  const navigate = useNavigate();

  const refreshAfterUpdate = useCallback((options?: {
    redirectTo?: string;
    delay?: number;
    forceReload?: boolean;
  }) => {
    const { redirectTo = '/', delay = 1000, forceReload = false } = options || {};

    setTimeout(() => {
      if (forceReload) {
        // Força um reload completo da página
        window.location.href = redirectTo;
      } else {
        // Navegação suave para a rota especificada
        navigate(redirectTo);
        // Força re-render dos componentes
        window.location.reload();
      }
    }, delay);
  }, [navigate]);

  const quickRefresh = useCallback(() => {
    // Refresh rápido sem redirecionamento
    window.location.reload();
  }, []);

  return {
    refreshAfterUpdate,
    quickRefresh
  };
}
