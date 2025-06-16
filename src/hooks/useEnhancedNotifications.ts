
import { useCallback } from 'react';
import { useNotifications } from './useNotifications';
import { useWhatsAppNotifications } from './useWhatsAppNotifications';
import { useToast } from '@/hooks/use-toast';

export function useEnhancedNotifications() {
  const { toast } = useToast();
  const {
    notifications: browserNotifications,
    permission,
    requestPermission,
    addNotification,
    updateNotification,
    deleteNotification,
    toggleNotification,
    showNotification,
    testNotification,
    checkPermissionStatus,
    isInTrialPeriod,
    trialDaysRemaining
  } = useNotifications();

  const {
    config: whatsAppConfig,
    updateConfig: updateWhatsAppConfig,
    sendWhatsAppNotification,
    testWhatsAppNotification,
    startScheduledNotifications
  } = useWhatsAppNotifications();

  const initializeNotifications = useCallback(async () => {
    console.log('🚀 [ENHANCED-NOTIFICATIONS] Inicializando sistema completo...');
    
    try {
      // Solicitar permissão para notificações do navegador
      const browserPermission = await requestPermission();
      
      // Iniciar agendamento WhatsApp se configurado
      if (whatsAppConfig.enabled && whatsAppConfig.targetNumber) {
        startScheduledNotifications();
      }
      
      toast({
        title: "Sistema de Notificações Ativo! 🔔",
        description: `Notificações ${browserPermission ? 'do navegador' : 'via toast'} e ${whatsAppConfig.enabled ? 'WhatsApp' : 'sem WhatsApp'} configuradas`,
        duration: 5000
      });
      
      return true;
    } catch (error) {
      console.error('❌ [ENHANCED-NOTIFICATIONS] Erro na inicialização:', error);
      
      toast({
        title: "Erro na inicialização",
        description: "Houve um problema ao configurar as notificações",
        variant: "destructive"
      });
      
      return false;
    }
  }, [requestPermission, whatsAppConfig, startScheduledNotifications, toast]);

  const sendDualNotification = useCallback(async (
    title: string,
    message: string,
    type: 'morning' | 'midday' | 'afternoon' | 'evening' = 'morning'
  ) => {
    console.log('📬 [ENHANCED-NOTIFICATIONS] Enviando notificação dupla:', { title, message, type });
    
    let browserSent = false;
    let whatsAppSent = false;
    
    try {
      // Enviar notificação do navegador
      if (permission === 'granted') {
        showNotification({
          id: `dual-${Date.now()}`,
          title,
          message,
          time: new Date().toTimeString().slice(0, 5),
          enabled: true,
          type: 'custom',
          createdAt: new Date()
        });
        browserSent = true;
      }
      
      // Enviar notificação WhatsApp
      if (whatsAppConfig.enabled && whatsAppConfig.targetNumber) {
        whatsAppSent = await sendWhatsAppNotification(type, message);
      }
      
      const status = [];
      if (browserSent) status.push('navegador');
      if (whatsAppSent) status.push('WhatsApp');
      
      if (status.length > 0) {
        toast({
          title: "Notificação enviada! 📱",
          description: `Enviada via: ${status.join(' e ')}`,
          duration: 3000
        });
      }
      
      return { browserSent, whatsAppSent };
    } catch (error) {
      console.error('❌ [ENHANCED-NOTIFICATIONS] Erro ao enviar notificação dupla:', error);
      return { browserSent: false, whatsAppSent: false };
    }
  }, [permission, whatsAppConfig, showNotification, sendWhatsAppNotification, toast]);

  const testAllNotifications = useCallback(async () => {
    console.log('🧪 [ENHANCED-NOTIFICATIONS] Testando todos os sistemas...');
    
    const results = {
      browser: false,
      whatsApp: false
    };
    
    try {
      // Testar notificação do navegador
      testNotification();
      results.browser = permission === 'granted';
      
      // Testar notificação WhatsApp
      if (whatsAppConfig.enabled && whatsAppConfig.targetNumber) {
        results.whatsApp = await testWhatsAppNotification();
      }
      
      const working = [];
      if (results.browser) working.push('Navegador');
      if (results.whatsApp) working.push('WhatsApp');
      
      toast({
        title: "Teste de Notificações",
        description: working.length > 0 
          ? `Funcionando: ${working.join(' e ')}`
          : "Nenhum sistema está funcionando. Verifique as configurações.",
        variant: working.length > 0 ? "default" : "destructive",
        duration: 8000
      });
      
      return results;
    } catch (error) {
      console.error('❌ [ENHANCED-NOTIFICATIONS] Erro no teste:', error);
      return { browser: false, whatsApp: false };
    }
  }, [testNotification, testWhatsAppNotification, permission, whatsAppConfig, toast]);

  return {
    // Notificações do navegador
    browserNotifications,
    permission,
    requestPermission,
    addNotification,
    updateNotification,
    deleteNotification,
    toggleNotification,
    showNotification,
    testNotification,
    checkPermissionStatus,
    isInTrialPeriod,
    trialDaysRemaining,
    
    // Notificações WhatsApp
    whatsAppConfig,
    updateWhatsAppConfig,
    sendWhatsAppNotification,
    testWhatsAppNotification,
    startScheduledNotifications,
    
    // Sistema combinado
    initializeNotifications,
    sendDualNotification,
    testAllNotifications
  };
}
