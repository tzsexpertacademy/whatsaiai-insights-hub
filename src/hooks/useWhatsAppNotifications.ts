import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePersonalAssistant } from './usePersonalAssistant';
import { useWPPConnect } from './useWPPConnect';

interface WhatsAppNotificationConfig {
  enabled: boolean;
  targetNumber: string;
  notificationTypes: {
    morning: boolean;
    midday: boolean;
    afternoon: boolean;
    evening: boolean;
    custom: boolean;
  };
  customMessages: {
    morning: string;
    midday: string;
    afternoon: string;
    evening: string;
  };
  schedules: {
    morning: string;
    midday: string;
    afternoon: string;
    evening: string;
  };
}

export const defaultMessages = {
  morning: '🌅 Bom dia! Como você está se sentindo hoje? Compartilhe seus planos comigo para que eu possa te ajudar melhor!',
  midday: '☀️ Como está sendo sua manhã? Me conte o que você já conseguiu fazer hoje!',
  afternoon: '🌤️ Boa tarde! Como foi sua manhã? Está na hora de fazer uma pausa e me contar como está seu dia.',
  evening: '🌙 Boa noite! Como foi seu dia? Vamos refletir juntos sobre as conquistas de hoje.'
};

const defaultSchedules = {
  morning: '06:00',
  midday: '12:00',
  afternoon: '18:00',
  evening: '21:00'
};

export function useWhatsAppNotifications() {
  const { toast } = useToast();
  const { config: assistantConfig } = usePersonalAssistant();
  const { sendMessage } = useWPPConnect();

  const [config, setConfig] = useState<WhatsAppNotificationConfig>(() => {
    const saved = localStorage.getItem('whatsapp_notifications_config');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      targetNumber: assistantConfig.masterNumber || '',
      notificationTypes: {
        morning: true,
        midday: true,
        afternoon: true,
        evening: true,
        custom: false
      },
      customMessages: defaultMessages,
      schedules: defaultSchedules
    };
  });

  const [activeTimeouts, setActiveTimeouts] = useState<Map<string, NodeJS.Timeout>>(new Map());

  const saveConfig = useCallback((newConfig: WhatsAppNotificationConfig) => {
    setConfig(newConfig);
    localStorage.setItem('whatsapp_notifications_config', JSON.stringify(newConfig));
  }, []);

  const updateConfig = useCallback((updates: Partial<WhatsAppNotificationConfig>) => {
    const newConfig = { ...config, ...updates };
    saveConfig(newConfig);
    
    toast({
      title: "Configuração atualizada! 📱",
      description: "Suas preferências de notificação WhatsApp foram salvas"
    });
  }, [config, saveConfig, toast]);

  const sendWhatsAppNotification = useCallback(async (
    type: keyof typeof config.customMessages,
    customMessage?: string
  ): Promise<boolean> => {
    console.log('📱 [WA-NOTIFICATION] Enviando notificação WhatsApp:', { 
      type, 
      targetNumber: config.targetNumber,
      enabled: config.enabled,
      typeEnabled: config.notificationTypes[type]
    });

    if (!config.enabled) {
      console.log('🔇 [WA-NOTIFICATION] Notificações WhatsApp desabilitadas globalmente');
      return false;
    }

    if (!config.targetNumber) {
      console.log('❌ [WA-NOTIFICATION] Número de destino não configurado');
      toast({
        title: "Erro nas notificações",
        description: "Configure o número do WhatsApp para receber notificações",
        variant: "destructive"
      });
      return false;
    }

    if (!config.notificationTypes[type]) {
      console.log(`🔇 [WA-NOTIFICATION] Tipo de notificação ${type} desabilitado`);
      return false;
    }

    const message = customMessage || config.customMessages[type];
    
    try {
      console.log('📤 [WA-NOTIFICATION] Enviando mensagem:', { message, number: config.targetNumber });
      const success = await sendMessage(config.targetNumber, message);
      
      if (success) {
        console.log('✅ [WA-NOTIFICATION] Notificação enviada com sucesso');
        
        toast({
          title: "Notificação enviada! 📱",
          description: `Lembrete ${type} enviado para ${config.targetNumber}`,
          duration: 5000
        });
        
        return true;
      } else {
        throw new Error('Falha no envio da mensagem');
      }
    } catch (error) {
      console.error('❌ [WA-NOTIFICATION] Erro ao enviar notificação:', error);
      
      toast({
        title: "Erro ao enviar notificação",
        description: "Verifique se o WhatsApp está conectado",
        variant: "destructive"
      });
      
      return false;
    }
  }, [config, sendMessage, toast]);

  const testWhatsAppNotification = useCallback(async () => {
    console.log('🧪 [WA-NOTIFICATION] Testando notificação WhatsApp');
    
    const testMessage = `🧪 Teste de notificação WhatsApp\n\nSe você está recebendo esta mensagem, as notificações automáticas estão funcionando!\n\n⏰ Horário: ${new Date().toLocaleTimeString('pt-BR')}`;
    
    return await sendWhatsAppNotification('morning', testMessage);
  }, [sendWhatsAppNotification]);

  const calculateNextScheduledTime = useCallback((timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    // Se já passou do horário hoje, agendar para amanhã
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    return scheduledTime;
  }, []);

  const scheduleNotification = useCallback((
    type: keyof typeof config.customMessages,
    timeString: string
  ) => {
    console.log(`⏰ [WA-NOTIFICATION] Agendando notificação ${type} para ${timeString}`);
    
    const scheduleNext = () => {
      const nextTime = calculateNextScheduledTime(timeString);
      const timeUntilNotification = nextTime.getTime() - Date.now();
      
      console.log(`⏰ [WA-NOTIFICATION] Próxima notificação ${type} em ${Math.round(timeUntilNotification / 1000)}s (${nextTime.toLocaleString('pt-BR')})`);
      
      const timeout = setTimeout(async () => {
        // Verificar se ainda está habilitado no momento da execução
        const currentConfig = JSON.parse(localStorage.getItem('whatsapp_notifications_config') || '{}');
        
        if (currentConfig.enabled && currentConfig.notificationTypes?.[type]) {
          console.log(`🔔 [WA-NOTIFICATION] Disparando notificação ${type} agendada para ${timeString}`);
          await sendWhatsAppNotification(type);
        } else {
          console.log(`🔇 [WA-NOTIFICATION] Notificação ${type} cancelada - desabilitada`);
        }
        
        // Reagendar para o próximo dia
        scheduleNext();
      }, timeUntilNotification);
      
      // Armazenar o timeout para poder cancelar depois
      setActiveTimeouts(prev => {
        const newMap = new Map(prev);
        const oldTimeout = newMap.get(type);
        if (oldTimeout) {
          clearTimeout(oldTimeout);
        }
        newMap.set(type, timeout);
        return newMap;
      });
      
      return timeout;
    };
    
    return scheduleNext();
  }, [calculateNextScheduledTime, sendWhatsAppNotification]);

  const clearAllTimeouts = useCallback(() => {
    console.log('🛑 [WA-NOTIFICATION] Limpando todos os agendamentos');
    activeTimeouts.forEach(timeout => clearTimeout(timeout));
    setActiveTimeouts(new Map());
  }, [activeTimeouts]);

  const startScheduledNotifications = useCallback(() => {
    if (!config.enabled) {
      console.log('🔇 [WA-NOTIFICATION] Agendamento desabilitado');
      clearAllTimeouts();
      return;
    }

    console.log('🚀 [WA-NOTIFICATION] Iniciando agendamento de notificações');
    
    // Limpar agendamentos anteriores
    clearAllTimeouts();

    // Agendar notificações nos horários configurados
    const schedules = [
      { time: config.schedules.morning, type: 'morning' as const },
      { time: config.schedules.midday, type: 'midday' as const },
      { time: config.schedules.afternoon, type: 'afternoon' as const },
      { time: config.schedules.evening, type: 'evening' as const }
    ];

    let scheduledCount = 0;
    
    schedules.forEach(({ time, type }) => {
      if (config.notificationTypes[type] && time) {
        scheduleNotification(type, time);
        scheduledCount++;
        console.log(`✅ [WA-NOTIFICATION] ${type} agendado para ${time}`);
      } else {
        console.log(`⏭️ [WA-NOTIFICATION] ${type} pulado - desabilitado ou sem horário`);
      }
    });

    if (scheduledCount > 0) {
      toast({
        title: "Notificações agendadas! ⏰",
        description: `${scheduledCount} lembretes configurados nos horários definidos`,
        duration: 5000
      });
    }
  }, [config, scheduleNotification, clearAllTimeouts, toast]);

  // Limpar timeouts quando o componente for desmontado
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  // Reagendar quando a configuração mudar
  useEffect(() => {
    console.log('🔄 [WA-NOTIFICATION] Configuração alterada, reagendando...');
    if (config.enabled) {
      startScheduledNotifications();
    } else {
      clearAllTimeouts();
    }
  }, [config.enabled, config.schedules, config.notificationTypes, startScheduledNotifications, clearAllTimeouts]);

  return {
    config,
    updateConfig,
    sendWhatsAppNotification,
    testWhatsAppNotification,
    startScheduledNotifications,
    clearAllTimeouts,
    defaultMessages,
    activeTimeouts: activeTimeouts.size
  };
}
