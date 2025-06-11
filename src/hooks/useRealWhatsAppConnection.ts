
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

  // Configuração WPPConnect local REAL - SESSÃO CORRETA
  const wppConfig = {
    serverUrl: 'http://localhost:21465',
    sessionName: 'NERDWHATS_AMERICA', // Sessão real identificada
    secretKey: 'MySecretKeyToGenerateToken' // Token correto da sua API
  };

  const updateWebhooks = useCallback((newWebhooks: Partial<WebhookConfig>) => {
    const updated = { ...webhooks, ...newWebhooks };
    setWebhooks(updated);
    localStorage.setItem('whatsapp_webhooks', JSON.stringify(updated));
  }, [webhooks]);

  const generateQRCode = useCallback(async () => {
    console.log('🚀 Gerando QR Code WPPConnect REAL...');
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
        const errorText = await startResponse.text();
        console.error('❌ Erro start session:', errorText);
        throw new Error(`Erro ao iniciar sessão: ${startResponse.status} - ${errorText}`);
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
        console.log('📱 QR Code recebido:', qrData);
        
        if (qrData.qrcode) {
          setConnectionState(prev => ({
            ...prev,
            qrCode: qrData.qrcode
          }));
          
          toast({
            title: "QR Code gerado! 📱",
            description: "Escaneie com seu WhatsApp para conectar"
          });
          
          // Verificar status a cada 3 segundos
          startStatusPolling();
          return qrData.qrcode;
        }
      } else {
        const errorText = await qrResponse.text();
        console.error('❌ Erro QR:', errorText);
        throw new Error(`Erro ao obter QR Code: ${qrResponse.status}`);
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
        console.log('🔍 Verificando status...');
        const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/status`, {
          headers: {
            'Authorization': `Bearer ${wppConfig.secretKey}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📱 Status atual:', data);
          
          // Verificar se está conectado baseado no status real da API
          const isConnected = data.state === 'CONNECTED' || data.status === 'inChat' || data.connected === true;
          
          if (isConnected) {
            console.log('✅ WhatsApp conectado!');
            
            setConnectionState(prev => ({
              ...prev,
              isConnected: true,
              phoneNumber: data.phone || data.number || data.wid || 'Conectado',
              qrCode: '',
              lastConnected: new Date().toISOString()
            }));
            
            toast({
              title: "🎉 WhatsApp conectado!",
              description: `Conectado com sucesso!`
            });
            
            clearInterval(pollInterval);
          }
        } else {
          console.log('❌ Erro no status:', response.status);
        }
      } catch (error) {
        console.error('❌ Erro no polling:', error);
      }
    }, 3000);
    
    // Parar polling após 2 minutos
    setTimeout(() => {
      clearInterval(pollInterval);
      console.log('⏰ Polling timeout');
    }, 120000);
  }, [toast]);

  const disconnectWhatsApp = useCallback(async () => {
    console.log('🔌 Desconectando WhatsApp...');
    
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${wppConfig.secretKey}`
        }
      });
      
      console.log('📤 Logout response:', response.status);
      
      setConnectionState({
        isConnected: false,
        phoneNumber: '',
        qrCode: '',
        lastConnected: ''
      });
      
      toast({
        title: "🔌 Desconectado",
        description: "WhatsApp desconectado com sucesso"
      });
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
      
      // Mesmo com erro, limpar o estado local
      setConnectionState({
        isConnected: false,
        phoneNumber: '',
        qrCode: '',
        lastConnected: ''
      });
      
      toast({
        title: "⚠️ Desconectado localmente",
        description: "Estado local limpo"
      });
    }
  }, [toast]);

  const sendMessage = useCallback(async (phone: string, message: string) => {
    console.log('📤 Enviando mensagem real via WPPConnect...');
    
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

      console.log('📤 Send message response:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Mensagem enviada:', result);
        
        toast({
          title: "✅ Mensagem enviada!",
          description: "Mensagem enviada via WPPConnect"
        });
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao enviar:', errorText);
        
        toast({
          title: "❌ Erro ao enviar",
          description: `Erro: ${response.status}`,
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      
      toast({
        title: "❌ Erro de conexão",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
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
