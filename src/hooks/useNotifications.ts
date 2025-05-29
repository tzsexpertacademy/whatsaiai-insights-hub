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

  // Solicitar permissão para notificações com fallback aprimorado
  const requestPermission = useCallback(async () => {
    console.log('🔔 Solicitando permissão para notificações...');
    
    if (!('Notification' in window)) {
      console.warn('⚠️ Este navegador não suporta notificações');
      toast({
        title: "Navegador não suportado",
        description: "Seu navegador não suporta notificações push. Tente usar Chrome, Firefox ou Safari atualizado.",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Primeiro, verificar se já temos permissão
      if (Notification.permission === 'granted') {
        console.log('✅ Permissão já concedida');
        setPermission('granted');
        return true;
      }

      // Se for 'denied', informar que precisa ser feito manualmente
      if (Notification.permission === 'denied') {
        console.log('❌ Permissão negada - precisa habilitar manualmente');
        setPermission('denied');
        toast({
          title: "Permissão bloqueada",
          description: "As notificações foram bloqueadas. Você precisa habilitá-las manualmente nas configurações do navegador.",
          variant: "destructive",
          duration: 10000
        });
        return false;
      }

      // Solicitar permissão
      console.log('🙋 Solicitando permissão...');
      const result = await Notification.requestPermission();
      console.log('📝 Resultado da solicitação:', result);
      setPermission(result);
      
      if (result === 'granted') {
        console.log('🎉 Permissão concedida! Testando notificação...');
        
        // Testar notificação imediatamente
        try {
          const testNotification = new Notification('🎉 Notificações Ativadas!', {
            body: 'Agora você receberá lembretes personalizados. Clique aqui para ir ao chat.',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'permission-granted-test',
            requireInteraction: false,
            silent: false
          });
          
          testNotification.onclick = () => {
            console.log('🖱️ Clique na notificação de teste - redirecionando');
            window.focus();
            window.location.href = '/dashboard/chat';
            testNotification.close();
          };
          
          // Auto-fechar após 5 segundos
          setTimeout(() => {
            testNotification.close();
          }, 5000);
          
          toast({
            title: "Notificações ativadas!",
            description: "Você deveria ter visto uma notificação de teste agora.",
            duration: 5000
          });
          
        } catch (notificationError) {
          console.error('❌ Erro ao criar notificação de teste:', notificationError);
          toast({
            title: "Permissão concedida",
            description: "Permissão concedida, mas houve um problema ao testar. Tente o botão 'Testar' na página.",
            variant: "destructive"
          });
        }
        
        return true;
      } else {
        console.log('❌ Permissão negada pelo usuário');
        toast({
          title: "Permissão negada",
          description: "Você negou a permissão. Para ativar, siga as instruções abaixo para habilitar manualmente.",
          variant: "destructive",
          duration: 8000
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error);
      toast({
        title: "Erro ao solicitar permissão",
        description: "Houve um problema ao solicitar permissão. Tente habilitar manualmente nas configurações.",
        variant: "destructive"
      });
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

  // Função melhorada para mostrar notificação
  const showNotification = useCallback((notification: NotificationConfig) => {
    console.log('🔔 Tentando mostrar notificação:', notification);
    
    // Sempre mostrar toast primeiro
    console.log('🍞 Mostrando toast de notificação');
    toast({
      title: notification.title,
      description: notification.message,
      duration: 12000,
      action: {
        altText: "Ir para o Chat",
        onClick: () => {
          console.log('🖱️ Clique no botão do toast - redirecionando para chat');
          window.location.href = '/dashboard/chat';
        }
      }
    });
    
    // Tentar notificação do navegador se tivermos permissão
    if (permission === 'granted' && 'Notification' in window) {
      try {
        console.log('📱 Criando notificação do navegador');
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: notification.id,
          requireInteraction: false,
          silent: false,
          timestamp: Date.now()
        });

        console.log('✅ Notificação do navegador criada com sucesso');

        // Handler de clique
        browserNotification.onclick = () => {
          console.log('🖱️ Clique na notificação do navegador - redirecionando');
          window.focus();
          window.location.href = '/dashboard/chat';
          browserNotification.close();
        };

        // Auto-fechar após 10 segundos
        setTimeout(() => {
          console.log('⏰ Auto-fechando notificação após timeout');
          browserNotification.close();
        }, 10000);
        
      } catch (error) {
        console.error('❌ Erro ao criar notificação do navegador:', error);
        toast({
          title: "Erro na notificação",
          description: "Não foi possível mostrar a notificação do navegador, mas o toast foi exibido.",
          variant: "destructive"
        });
      }
    } else {
      console.log(`⚠️ Notificação do navegador não disponível. Permissão: ${permission}`);
      if (permission !== 'granted') {
        console.log('ℹ️ Apenas toast será exibido pois não há permissão para notificações do navegador');
      }
    }
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

  // Função para testar notificação com mais logs
  const testNotification = useCallback(() => {
    console.log('🧪 === INICIANDO TESTE DE NOTIFICAÇÃO ===');
    console.log('🔍 Estado atual:', {
      permission,
      notificationSupported: 'Notification' in window,
      currentTime: new Date().toLocaleTimeString()
    });
    
    const testConfig: NotificationConfig = {
      id: 'test-notification-' + Date.now(),
      title: '🧪 Teste de Notificação',
      message: 'Se você está vendo isso, as notificações estão funcionando! Clique para ir ao chat.',
      time: '00:00',
      enabled: true,
      type: 'custom',
      createdAt: new Date()
    };
    
    console.log('📝 Configuração de teste:', testConfig);
    showNotification(testConfig);
    console.log('🧪 === TESTE DE NOTIFICAÇÃO FINALIZADO ===');
  }, [showNotification, permission]);

  // Função para forçar verificação de permissão
  const checkPermissionStatus = useCallback(() => {
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      console.log('🔍 Verificação manual de permissão:', currentPermission);
      setPermission(currentPermission);
      
      toast({
        title: "Status da permissão",
        description: `Permissão atual: ${currentPermission === 'granted' ? 'Concedida' : currentPermission === 'denied' ? 'Negada' : 'Aguardando'}`,
        duration: 3000
      });
      
      return currentPermission;
    }
    return 'default';
  }, []);

  return {
    notifications,
    permission,
    requestPermission,
    addNotification,
    updateNotification,
    deleteNotification,
    toggleNotification,
    showNotification,
    testNotification,
    checkPermissionStatus
  };
}
