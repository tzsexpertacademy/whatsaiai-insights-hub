
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

interface WhatsAppConnectionState {
  isConnected: boolean;
  qrCode: string;
  phoneNumber: string;
  sessionId: string;
  lastConnected: string;
}

interface MakeConfig {
  qrWebhook: string;
  statusWebhook: string;
  sendMessageWebhook: string;
  disconnectWebhook: string;
}

export function useWhatsAppConnection() {
  const [connectionState, setConnectionState] = useState<WhatsAppConnectionState>({
    isConnected: false,
    qrCode: '',
    phoneNumber: '',
    sessionId: '',
    lastConnected: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [makeConfig, setMakeConfig] = useState<MakeConfig>({
    qrWebhook: localStorage.getItem('make_qr_webhook') || '',
    statusWebhook: localStorage.getItem('make_status_webhook') || '',
    sendMessageWebhook: localStorage.getItem('make_send_webhook') || '',
    disconnectWebhook: localStorage.getItem('make_disconnect_webhook') || ''
  });
  const { toast } = useToast();

  // Carregar estado do localStorage ao inicializar
  useEffect(() => {
    const savedState = localStorage.getItem('whatsapp_connection');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      setConnectionState(parsed);
      
      // Verificar se a sessão ainda é válida
      if (parsed.isConnected && parsed.sessionId) {
        checkConnectionStatus(parsed.sessionId);
      }
    }
  }, []);

  // Salvar estado no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('whatsapp_connection', JSON.stringify(connectionState));
  }, [connectionState]);

  const updateMakeConfig = (config: Partial<MakeConfig>) => {
    const newConfig = { ...makeConfig, ...config };
    setMakeConfig(newConfig);
    
    // Salvar no localStorage
    Object.entries(newConfig).forEach(([key, value]) => {
      localStorage.setItem(`make_${key.replace('Webhook', '_webhook')}`, value);
    });
  };

  const checkConnectionStatus = async (sessionId: string) => {
    if (!makeConfig.statusWebhook) return;

    try {
      const response = await fetch(makeConfig.statusWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'check_status',
          sessionId: sessionId,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isConnected === false) {
          disconnectWhatsApp();
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status via Make.com:', error);
    }
  };

  const generateQRCode = async (): Promise<string> => {
    if (!makeConfig.qrWebhook) {
      toast({
        title: "Configuração Necessária",
        description: "Configure o webhook do Make.com primeiro",
        variant: "destructive"
      });
      return '';
    }

    setIsLoading(true);
    
    try {
      const sessionId = `session_${Date.now()}`;
      
      const response = await fetch(makeConfig.qrWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_qr',
          sessionId: sessionId,
          timestamp: new Date().toISOString(),
          clientUrl: window.location.origin
        })
      });

      if (!response.ok) {
        throw new Error(`Erro no webhook: ${response.status}`);
      }

      const data = await response.json();
      
      // Atualizar estado com novo QR
      setConnectionState(prev => ({
        ...prev,
        qrCode: data.qrCode || data.qr_code || '',
        sessionId: sessionId
      }));

      // Iniciar polling para verificar conexão
      startConnectionPolling(sessionId);
      
      toast({
        title: "QR Code solicitado",
        description: "Aguardando resposta do Make.com...",
      });
      
      return data.qrCode || data.qr_code || '';
      
    } catch (error) {
      console.error('Erro ao gerar QR Code via Make.com:', error);
      toast({
        title: "Erro no Make.com",
        description: "Verifique se o webhook está configurado corretamente",
        variant: "destructive"
      });
      return '';
    } finally {
      setIsLoading(false);
    }
  };

  const startConnectionPolling = (sessionId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutos
    
    const pollInterval = setInterval(async () => {
      attempts++;
      
      if (attempts > maxAttempts) {
        clearInterval(pollInterval);
        toast({
          title: "Timeout",
          description: "QR Code expirado. Gere um novo.",
          variant: "destructive"
        });
        return;
      }

      try {
        const response = await fetch(makeConfig.statusWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'check_connection',
            sessionId: sessionId,
            timestamp: new Date().toISOString()
          })
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.isConnected) {
            clearInterval(pollInterval);
            connectWhatsApp(sessionId, data.phoneNumber || data.phone_number);
          }
        }
      } catch (error) {
        console.error('Erro no polling de conexão:', error);
      }
    }, 5000); // Verificar a cada 5 segundos
  };

  const connectWhatsApp = (sessionId: string, phoneNumber?: string) => {
    const phone = phoneNumber || `+55 11 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`;
    
    setConnectionState(prev => ({
      ...prev,
      isConnected: true,
      phoneNumber: phone,
      sessionId: sessionId,
      lastConnected: new Date().toISOString()
    }));
    
    toast({
      title: "WhatsApp Conectado via Make.com!",
      description: `Conectado ao número ${phone}`,
    });
  };

  const disconnectWhatsApp = async () => {
    if (makeConfig.disconnectWebhook && connectionState.sessionId) {
      try {
        await fetch(makeConfig.disconnectWebhook, {
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
        console.error('Erro ao desconectar via Make.com:', error);
      }
    }

    setConnectionState({
      isConnected: false,
      qrCode: '',
      phoneNumber: '',
      sessionId: '',
      lastConnected: ''
    });
    
    localStorage.removeItem('whatsapp_connection');
    
    toast({
      title: "Desconectado",
      description: "WhatsApp Business desconectado",
    });
  };

  const sendMessage = async (phoneNumber: string, message: string) => {
    if (!makeConfig.sendMessageWebhook) {
      toast({
        title: "Webhook não configurado",
        description: "Configure o webhook de envio no Make.com",
        variant: "destructive"
      });
      return false;
    }

    try {
      const response = await fetch(makeConfig.sendMessageWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_message',
          sessionId: connectionState.sessionId,
          phoneNumber: phoneNumber,
          message: message,
          timestamp: new Date().toISOString()
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao enviar mensagem via Make.com:', error);
      return false;
    }
  };

  const getConnectionStatus = () => {
    if (!connectionState.isConnected) return 'disconnected';
    
    const lastConnected = new Date(connectionState.lastConnected);
    const now = new Date();
    const minutesDiff = (now.getTime() - lastConnected.getTime()) / (1000 * 60);
    
    if (minutesDiff > 5) return 'idle';
    return 'active';
  };

  return {
    connectionState,
    isLoading,
    makeConfig,
    updateMakeConfig,
    generateQRCode,
    disconnectWhatsApp,
    sendMessage,
    getConnectionStatus
  };
}
