
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
    console.log('🔔 Carregando notificações do localStorage...');
    const saved = localStorage.getItem('user-notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const loadedNotifications = parsed.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt)
        }));
        console.log('📋 Notificações carregadas:', loadedNotifications);
        setNotifications(loadedNotifications);
      } catch (error) {
        console.error('❌ Erro ao carregar notificações:', error);
        setNotifications(defaultNotifications);
      }
    } else {
      console.log('📝 Usando notificações padrão');
      setNotifications(defaultNotifications);
    }
  }, []);

  // Salvar notificações no localStorage
  const saveNotifications = useCallback((newNotifications: NotificationConfig[]) => {
    console.log('💾 Salvando notificações:', newNotifications);
    localStorage.setItem('user-notifications', JSON.stringify(newNotifications));
    setNotifications(newNotifications);
  }, []);

  // Solicitar permissão para notificações
  const requestPermission = useCallback(async () => {
    console.log('🔔 Solicitando permissão para notificações...');
    
    if (!('Notification' in window)) {
      console.warn('⚠️ Este navegador não suporta notificações');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      console.log('✅ Resultado da permissão:', result);
      setPermission(result);
      
      if (result === 'granted') {
        // Testar notificação imediatamente no Safari
        console.log('🧪 Testando notificação...');
        const testNotification = new Notification('Notificações Ativadas! 🎉', {
          body: 'Agora você receberá lembretes personalizados',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'permission-granted-test',
          requireInteraction: false
        });
        
        testNotification.onclick = () => {
          console.log('🖱️ Clique na notificação de teste');
          window.focus();
          testNotification.close();
        };
        
        // Auto-fechar após 4 segundos
        setTimeout(() => testNotification.close(), 4000);
      }
      
      return result === 'granted';
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error);
      return false;
    }
  }, []);

  // Verificar permissão atual
  useEffect(() => {
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      console.log('🔍 Permissão atual:', currentPermission);
      setPermission(currentPermission);
    } else {
      console.warn('⚠️ Notificações não suportadas neste navegador');
    }
  }, []);

  // Função para mostrar notificação com redirecionamento
  const showNotification = useCallback((notification: NotificationConfig) => {
    console.log('🔔 Mostrando notificação:', notification);
    
    if (permission === 'granted' && 'Notification' in window) {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: notification.id,
          requireInteraction: false,
          silent: false
        });

        console.log('✅ Notificação do navegador criada');

        // Adicionar handler de clique para redirecionar ao chat
        browserNotification.onclick = () => {
          console.log('🖱️ Clique na notificação - redirecionando para chat');
          window.focus();
          window.location.href = '/dashboard/chat';
          browserNotification.close();
        };

        // Auto-fechar após 8 segundos no Safari para evitar acúmulo
        setTimeout(() => {
          browserNotification.close();
        }, 8000);
      } catch (error) {
        console.error('❌ Erro ao criar notificação do navegador:', error);
      }
    } else {
      console.log('⚠️ Notificação do navegador não disponível. Permissão:', permission);
    }
    
    // Toast com ação para ir ao chat (sempre mostrar)
    console.log('🍞 Mostrando toast');
    toast({
      title: notification.title,
      description: notification.message,
      duration: 8000,
      action: {
        altText: "Ir para o Chat",
        onClick: () => {
          console.log('🖱️ Clique no botão do toast - redirecionando para chat');
          window.location.href = '/dashboard/chat';
        }
      }
    });
  }, [permission]);

  // Verificar e disparar notificações
  const checkNotifications = useCallback(() => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    console.log(`⏰ Verificando notificações para ${currentTime}...`);
    
    const activeNotifications = notifications.filter(n => n.enabled);
    console.log(`📋 ${activeNotifications.length} notificações ativas de ${notifications.length} total`);
    
    activeNotifications.forEach(notification => {
      if (notification.time === currentTime) {
        console.log(`🎯 Disparando notificação: ${notification.title} (${notification.time})`);
        showNotification(notification);
      }
    });
  }, [notifications, showNotification]);

  // Configurar verificação periódica
  useEffect(() => {
    console.log('⏱️ Configurando verificação periódica de notificações');
    const interval = setInterval(checkNotifications, 60000); // Verifica a cada minuto
    
    // Verificar imediatamente também
    checkNotifications();
    
    return () => {
      console.log('🛑 Parando verificação periódica');
      clearInterval(interval);
    };
  }, [checkNotifications]);

  // Funções de gerenciamento
  const addNotification = useCallback((notification: Omit<NotificationConfig, 'id' | 'createdAt'>) => {
    console.log('➕ Adicionando nova notificação:', notification);
    const newNotification: NotificationConfig = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    const updated = [...notifications, newNotification];
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const updateNotification = useCallback((id: string, updates: Partial<NotificationConfig>) => {
    console.log('📝 Atualizando notificação:', id, updates);
    const updated = notifications.map(n => 
      n.id === id ? { ...n, ...updates } : n
    );
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const deleteNotification = useCallback((id: string) => {
    console.log('🗑️ Removendo notificação:', id);
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  }, [notifications, saveNotifications]);

  const toggleNotification = useCallback((id: string) => {
    const notification = notifications.find(n => n.id === id);
    const newState = !notification?.enabled;
    console.log(`🔄 Alternando notificação ${id}: ${newState ? 'ativada' : 'desativada'}`);
    updateNotification(id, { enabled: newState });
  }, [notifications, updateNotification]);

  // Função para testar notificação imediatamente
  const testNotification = useCallback(() => {
    console.log('🧪 Testando notificação manualmente');
    const testConfig: NotificationConfig = {
      id: 'test-notification',
      title: '🧪 Teste de Notificação',
      message: 'Esta é uma notificação de teste para verificar se está funcionando!',
      time: '00:00',
      enabled: true,
      type: 'custom',
      createdAt: new Date()
    };
    showNotification(testConfig);
  }, [showNotification]);

  return {
    notifications,
    permission,
    requestPermission,
    addNotification,
    updateNotification,
    deleteNotification,
    toggleNotification,
    showNotification,
    testNotification
  };
}
