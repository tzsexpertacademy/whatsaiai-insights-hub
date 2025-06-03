
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ConnectionState {
  isConnected: boolean;
  phoneNumber: string;
  qrCode: string;
  lastConnected: string;
}

interface WebhookConfig {
  qrWebhook: string;
  statusWebhook: string;
  sendMessageWebhook: string;
  autoReplyWebhook: string;
}

export function useRealWhatsAppConnection() {
  const { toast } = useToast();
  
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    phoneNumber: '',
    qrCode: '',
    lastConnected: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  const [webhooks, setWebhooks] = useState<WebhookConfig>(() => {
    const saved = localStorage.getItem('whatsapp_webhooks');
    return saved ? JSON.parse(saved) : {
      qrWebhook: '',
      statusWebhook: '',
      sendMessageWebhook: '',
      autoReplyWebhook: ''
    };
  });

  // Configuração WPPConnect local
  const wppConfig = {
    serverUrl: 'http://localhost:21465',
    sessionName: 'MySecretKeyToGenerateToken', // Usando como session name
    secretKey: 'MySecretKeyToGenerateToken'
  };

  const updateWebhooks = useCallback((newWebhooks: Partial<WebhookConfig>) => {
    const updated = { ...webhooks, ...newWebhooks };
    setWebhooks(updated);
    localStorage.setItem('whatsapp_webhooks', JSON.stringify(updated));
  }, [webhooks]);

  const generateQRCode = useCallback(async () => {
    console.log('🚀 Gerando QR Code WPPConnect...');
    setIsLoading(true);
    
    try {
      // 1. Primeiro, criar/iniciar a sessão
      console.log('📡 Criando sessão WPPConnect...');
      const startResponse = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/start-session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.secretKey}`
        },
        body: JSON.stringify({
          webhook: '',
          waitQrCode: true
        })
      });

      console.log('📥 Start session response:', startResponse.status);

      if (!startResponse.ok) {
        throw new Error(`Erro ao iniciar sessão: ${startResponse.status}`);
      }

      // 2. Aguardar um pouco e obter o QR Code
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('📱 Obtendo QR Code...');
      const qrResponse = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/qr-code`, {
        headers: {
          'Authorization': `Bearer ${wppConfig.secretKey}`
        }
      });
      
      console.log('📥 QR Response status:', qrResponse.status);
      
      if (qrResponse.ok) {
        const qrData = await qrResponse.json();
        console.log('📱 QR Code recebido:', !!qrData.qrcode);
        
        if (qrData.qrcode) {
          setConnectionState(prev => ({
            ...prev,
            qrCode: qrData.qrcode
          }));
          
          toast({
            title: "QR Code gerado! 📱",
            description: "Escaneie com seu WhatsApp para conectar"
          });
          
          // Verificar status periodicamente
          startStatusPolling();
          return qrData.qrcode;
        }
      }
      
      throw new Error('QR Code não foi gerado');
      
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
      toast({
        title: "Erro ao gerar QR Code",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const startStatusPolling = useCallback(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/status`, {
          headers: {
            'Authorization': `Bearer ${wppConfig.secretKey}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📱 Status polling:', data);
          
          const isConnected = data.state === 'CONNECTED' || data.status === 'inChat';
          
          if (isConnected) {
            setConnectionState(prev => ({
              ...prev,
              isConnected: true,
              phoneNumber: data.phone || data.number || 'Conectado',
              qrCode: '',
              lastConnected: new Date().toISOString()
            }));
            
            toast({
              title: "WhatsApp conectado! ✅",
              description: `Número: ${data.phone || data.number || 'Conectado'}`
            });
            
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('❌ Erro no polling:', error);
      }
    }, 3000);
    
    // Parar polling após 2 minutos
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 120000);
  }, [toast]);

  const disconnectWhatsApp = useCallback(async () => {
    try {
      await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${wppConfig.secretKey}`
        }
      });
      
      setConnectionState({
        isConnected: false,
        phoneNumber: '',
        qrCode: '',
        lastConnected: ''
      });
      
      toast({
        title: "Desconectado",
        description: "WhatsApp desconectado com sucesso"
      });
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
    }
  }, [toast]);

  const sendMessage = useCallback(async (phone: string, message: string) => {
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/send-message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.secretKey}`
        },
        body: JSON.stringify({
          phone: phone,
          message: message
        })
      });

      if (response.ok) {
        toast({
          title: "Mensagem enviada! ✅",
          description: "Mensagem enviada via WPPConnect"
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return false;
    }
  }, [toast]);

  const getConnectionStatus = useCallback(() => {
    if (connectionState.isConnected) {
      return 'active';
    }
    return 'disconnected';
  }, [connectionState.isConnected]);

  return {
    connectionState,
    isLoading,
    webhooks,
    updateWebhooks,
    generateQRCode,
    disconnectWhatsApp,
    sendMessage,
    getConnectionStatus
  };
}
