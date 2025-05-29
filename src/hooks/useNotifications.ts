
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface NotificationConfig {
  id: string;
  title: string;
  message: string;
  time: string; // formato HH:MM
  enabled: boolean;
  type: 'daily' | 'custom';
  createdAt: Date;
}

const defaultNotifications: NotificationConfig[] = [
  {
    id: 'morning-planning',
    title: '🌅 Bom dia! Hora de planejar',
    message: 'Que tal compartilhar sua programação do dia com seu assistente? Isso me ajuda a te apoiar melhor!',
    time: '06:00',
    enabled: true,
    type: 'daily',
    createdAt: new Date()
  },
  {
    id: 'midday-checkin',
    title: '☀️ Como foi sua manhã?',
    message: 'Já passou da metade do dia! Como foi sua manhã? Compartilhe comigo para eu te ajudar a otimizar sua tarde.',
    time: '12:00',
    enabled: true,
    type: 'daily',
    createdAt: new Date()
  },
  {
    id: 'afternoon-review',
    title: '🌤️ Revisão da tarde',
    message: 'Como foi sua tarde e seu dia até agora? Me conte para eu poder te dar insights personalizados!',
    time: '18:00',
    enabled: true,
    type: 'daily',
    createdAt: new Date()
  },
  {
    id: 'goodnight',
    title: '🌙 Boa noite!',
    message: 'Finalizando o dia... Se quiser compartilhar mais alguma coisa ou refletir sobre hoje, estou aqui para te ajudar!',
    time: '21:00',
    enabled: true,
    type: 'daily',
    createdAt: new Date()
  }
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationConfig[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Carregar notificações do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('user-notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        })));
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
        setNotifications(defaultNotifications);
      }
    } else {
      setNotifications(defaultNotifications);
    }
  }, []);

  // Salvar notificações no localStorage
  const saveNotifications = useCallback((newNotifications: NotificationConfig[]) => {
    localStorage.setItem('user-notifications', JSON.stringify(newNotifications));
    setNotifications(newNotifications);
  }, []);

  // Solicitar permissão para notificações
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  }, []);

  // Verificar permissão atual
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Função para mostrar notificação
  const showNotification = useCallback((notification: NotificationConfig) => {
    if (permission === 'granted' && 'Notification' in window) {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: false,
        silent: false
      });
    }
    
    // Sempre mostrar toast como fallback
    toast({
      title: notification.title,
      description: notification.message,
      duration: 5000,
    });
  }, [permission]);

  // Verificar e disparar notificações
  const checkNotifications = useCallback(() => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    notifications.forEach(notification => {
      if (notification.enabled && notification.time === currentTime) {
        showNotification(notification);
      }
    });
  }, [notifications, showNotification]);

  // Configurar verificação periódica
  useEffect(() => {
    const interval = setInterval(checkNotifications, 60000); // Verifica a cada minuto
    return () => clearInterval(interval);
  }, [checkNotifications]);

  // Funções de gerenciamento
  const addNotification = useCallback((notification: Omit<NotificationConfig, 'id' | 'createdAt'>) => {
    const newNotification: NotificationConfig = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    const updated = [...notifications, newNotification];
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const updateNotification = useCallback((id: string, updates: Partial<NotificationConfig>) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, ...updates } : n
    );
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const deleteNotification = useCallback((id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const toggleNotification = useCallback((id: string) => {
    updateNotification(id, { enabled: !notifications.find(n => n.id === id)?.enabled });
  }, [notifications, updateNotification]);

  return {
    notifications,
    permission,
    requestPermission,
    addNotification,
    updateNotification,
    deleteNotification,
    toggleNotification,
    showNotification
  };
}
