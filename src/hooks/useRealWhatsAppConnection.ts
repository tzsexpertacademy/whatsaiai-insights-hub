
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

interface RealWhatsAppConnectionState {
  isConnected: boolean;
  qrCode: string;
  phoneNumber: string;
  sessionId: string;
  lastConnected: string;
}

interface WebhooksConfig {
  qrWebhook: string;
  statusWebhook: string;
  sendMessageWebhook: string;
  disconnectWebhook: string;
  autoReplyWebhook: string;
}

export function useRealWhatsAppConnection() {
  const [connectionState, setConnectionState] = useState<RealWhatsAppConnectionState>(() => {
    try {
      const saved = localStorage.getItem('real_whatsapp_connection');
      return saved ? JSON.parse(saved) : {
        isConnected: false,
        qrCode: '',
        phoneNumber: '',
        sessionId: '',
        lastConnected: ''
      };
    } catch {
      return {
        isConnected: false,
        qrCode: '',
        phoneNumber: '',
        sessionId: '',
        lastConnected: ''
      };
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [webhooks, setWebhooks] = useState<WebhooksConfig>(() => ({
    qrWebhook: localStorage.getItem('real_whatsapp_qr_webhook') || '',
    statusWebhook: localStorage.getItem('real_whatsapp_status_webhook') || '',
    sendMessageWebhook: localStorage.getItem('real_whatsapp_send_webhook') || '',
    disconnectWebhook: localStorage.getItem('real_whatsapp_disconnect_webhook') || '',
    autoReplyWebhook: localStorage.getItem('real_whatsapp_autoreply_webhook') || ''
  }));

  const { toast } = useToast();

  const updateWebhooks = useCallback((updates: Partial<WebhooksConfig>) => {
    const newWebhooks = { ...webhooks, ...updates };
    setWebhooks(newWebhooks);
    
    // Salvar no localStorage
    Object.entries(newWebhooks).forEach(([key, value]) => {
      localStorage.setItem(`real_whatsapp_${key.replace('Webhook', '_webhook')}`, value);
    });
  }, [webhooks]);

  const generateQRCode = useCallback(async () => {
    if (!webhooks.qrWebhook) {
      toast({
        title: "Webhook necessário",
        description: "Configure o webhook QR Code primeiro",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const sessionId = `real_session_${Date.now()}`;
      
      const response = await fetch(webhooks.qrWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_qr',
          sessionId: sessionId,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Erro no webhook: ${response.status}`);
      }

      const data = await response.json();
      
      setConnectionState(prev => {
        const newState = {
          ...prev,
          qrCode: data.qrCode || data.qr_code || '',
          sessionId: sessionId
        };
        localStorage.setItem('real_whatsapp_connection', JSON.stringify(newState));
        return newState;
      });

      toast({
        title: "QR Code gerado",
        description: "Escaneie com seu WhatsApp Business"
      });
      
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar QR Code",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [webhooks.qrWebhook, toast]);

  const disconnectWhatsApp = useCallback(async () => {
    if (webhooks.disconnectWebhook && connectionState.sessionId) {
      try {
        await fetch(webhooks.disconnectWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'disconnect',
            sessionId: connectionState.sessionId,
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error('Erro ao desconectar:', error);
      }
    }

    const newState = {
      isConnected: false,
      qrCode: '',
      phoneNumber: '',
      sessionId: '',
      lastConnected: ''
    };

    setConnectionState(newState);
    localStorage.setItem('real_whatsapp_connection', JSON.stringify(newState));
    
    toast({
      title: "Desconectado",
      description: "WhatsApp Business desconectado"
    });
  }, [webhooks.disconnectWebhook, connectionState.sessionId, toast]);

  const getConnectionStatus = useCallback(() => {
    if (!connectionState.isConnected) return 'disconnected';
    
    if (!connectionState.lastConnected) return 'active';
    
    const lastConnected = new Date(connectionState.lastConnected);
    const now = new Date();
    const minutesDiff = (now.getTime() - lastConnected.getTime()) / (1000 * 60);
    
    if (minutesDiff > 30) return 'idle';
    return 'active';
  }, [connectionState]);

  return {
    connectionState,
    isLoading,
    webhooks,
    updateWebhooks,
    generateQRCode,
    disconnectWhatsApp,
    getConnectionStatus
  };
}
