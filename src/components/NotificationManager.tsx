
import { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationManager() {
  const { requestPermission } = useNotifications();

  useEffect(() => {
    // Solicita permissão automaticamente após 3 segundos do carregamento da página
    const timer = setTimeout(() => {
      if ('Notification' in window && Notification.permission === 'default') {
        requestPermission();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [requestPermission]);

  return null; // Componente invisível
}
