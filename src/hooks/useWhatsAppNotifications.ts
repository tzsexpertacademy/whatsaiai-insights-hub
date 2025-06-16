
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

const defaultMessages = {
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

  const [activeIntervals, setActiveIntervals] = useState<Set<NodeJS.Timeout>>(new Set());

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
    console.log('📱 [WA-NOTIFICATION] Enviando notificação WhatsApp:', { type, targetNumber: config.targetNumber });

    if (!config.enabled) {
      console.log('🔇 [WA-NOTIFICATION] Notificações WhatsApp desabilitadas');
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
      console.log('📤 [WA-NOTIFICATION] Enviando mensagem:', message);
      const success = await sendMessage(config.targetNumber, message);
      
      if (success) {
        console.log('✅ [WA-NOTIFICATION] Notificação enviada com sucesso');
        
        toast({
          title: "Notificação enviada! 📱",
          description: `Lembrete enviado para ${config.targetNumber}`,
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

  const scheduleNotification = useCallback((
    time: string,
    type: keyof typeof config.customMessages
  ) => {
    const [hours, minutes] = time.split(':').map(Number);
    
    console.log(`⏰ [WA-NOTIFICATION] Agendando notificação ${type} para ${time}`);
    
    // Função para calcular próximo horário
    const getNextScheduledTime = () => {
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      // Se já passou do horário hoje, agendar para amanhã
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      return scheduledTime;
    };
    
    const scheduleNext = () => {
      const nextTime = getNextScheduledTime();
      const timeUntilNotification = nextTime.getTime() - Date.now();
      
      console.log(`⏰ [WA-NOTIFICATION] Próxima notificação ${type} em ${Math.round(timeUntilNotification / 1000)} segundos`);
      
      const timeout = setTimeout(() => {
        if (config.enabled && config.notificationTypes[type]) {
          console.log(`🔔 [WA-NOTIFICATION] Disparando notificação ${type} agendada para ${time}`);
          sendWhatsAppNotification(type);
        }
        
        // Reagendar para o próximo dia
        scheduleNext();
      }, timeUntilNotification);
      
      setActiveIntervals(prev => new Set(prev).add(timeout));
      
      return timeout;
    };
    
    return scheduleNext();
  }, [config, sendWhatsAppNotification]);

  const clearAllIntervals = useCallback(() => {
    console.log('🛑 [WA-NOTIFICATION] Limpando todos os agendamentos');
    activeIntervals.forEach(interval => clearTimeout(interval));
    setActiveIntervals(new Set());
  }, [activeIntervals]);

  const startScheduledNotifications = useCallback(() => {
    if (!config.enabled) {
      console.log('🔇 [WA-NOTIFICATION] Agendamento desabilitado');
      return;
    }

    console.log('🚀 [WA-NOTIFICATION] Iniciando agendamento de notificações');
    
    // Limpar agendamentos anteriores
    clearAllIntervals();

    // Agendar notificações nos horários configurados
    const schedules = [
      { time: config.schedules.morning, type: 'morning' as const },
      { time: config.schedules.midday, type: 'midday' as const },
      { time: config.schedules.afternoon, type: 'afternoon' as const },
      { time: config.schedules.evening, type: 'evening' as const }
    ];

    schedules.forEach(({ time, type }) => {
      if (config.notificationTypes[type]) {
        scheduleNotification(time, type);
      }
    });

    toast({
      title: "Notificações agendadas! ⏰",
      description: "Você receberá lembretes automáticos no WhatsApp nos horários configurados",
      duration: 5000
    });
  }, [config, scheduleNotification, clearAllIntervals, toast]);

  // Limpar intervalos quando o componente for desmontado
  useEffect(() => {
    return () => {
      clearAllIntervals();
    };
  }, [clearAllIntervals]);

  // Reagendar quando a configuração mudar
  useEffect(() => {
    if (config.enabled) {
      startScheduledNotifications();
    } else {
      clearAllIntervals();
    }
  }, [config.enabled, config.schedules, config.notificationTypes]);

  return {
    config,
    updateConfig,
    sendWhatsAppNotification,
    testWhatsAppNotification,
    startScheduledNotifications,
    clearAllIntervals,
    defaultMessages
  };
}
