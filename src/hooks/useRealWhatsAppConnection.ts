
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useClientConfig } from '@/contexts/ClientConfigContext';

export interface WPPConfig {
  serverUrl: string;
  sessionName: string;
  token: string;
}

interface ConnectionState {
  isConnected: boolean;
  phoneNumber: string;
  qrCode: string;
  lastConnected: string;
}

interface Webhooks {
  qrWebhook: string;
  statusWebhook: string;
  sendMessageWebhook: string;
  autoReplyWebhook: string;
}

export function useRealWhatsAppConnection() {
  const { toast } = useToast();
  const { config } = useClientConfig();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messageHistoryLimit, setMessageHistoryLimit] = useState(50);
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    phoneNumber: '',
    qrCode: '',
    lastConnected: ''
  });
  const [webhooks, setWebhooks] = useState<Webhooks>({
    qrWebhook: '',
    statusWebhook: '',
    sendMessageWebhook: '',
    autoReplyWebhook: ''
  });

  // Obter configuração atual do WPPConnect
  const wppConfig: WPPConfig = {
    serverUrl: config?.whatsapp?.wppconnect?.serverUrl || 'http://localhost:21465',
    sessionName: config?.whatsapp?.wppconnect?.sessionName || '',
    token: config?.whatsapp?.wppconnect?.token || config?.whatsapp?.wppconnect?.secretKey || ''
  };

  // Verificar status da conexão
  const getConnectionStatus = useCallback(async () => {
    try {
      if (!wppConfig.serverUrl || !wppConfig.sessionName || !wppConfig.token) {
        console.log('⚠️ Configurações WPPConnect incompletas');
        return { connected: false, phone: '', qr: '' };
      }

      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/status`, {
        headers: {
          'Authorization': `Bearer ${wppConfig.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📱 Status WPPConnect:', data);
        
        const connected = data.status === 'CONNECTED' || data.state === 'CONNECTED';
        
        setConnectionState(prev => ({
          ...prev,
          isConnected: connected,
          phoneNumber: data.phone || prev.phoneNumber
        }));
        
        return {
          connected: connected,
          phone: data.phone || '',
          qr: data.qrcode || ''
        };
      }
      
      return { connected: false, phone: '', qr: '' };
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      return { connected: false, phone: '', qr: '' };
    }
  }, [wppConfig]);

  // Função para gerar QR Code
  const generateQRCode = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/start-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${wppConfig.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.qrcode) {
          setConnectionState(prev => ({
            ...prev,
            qrCode: data.qrcode
          }));
          return data.qrcode;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [wppConfig]);

  // Função para desconectar
  const disconnectWhatsApp = useCallback(async () => {
    try {
      await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/close-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${wppConfig.token}`
        }
      });
      
      setConnectionState({
        isConnected: false,
        phoneNumber: '',
        qrCode: '',
        lastConnected: ''
      });
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
    }
  }, [wppConfig]);

  // Função para verificar status (alias para getConnectionStatus)
  const checkConnectionStatus = getConnectionStatus;

  // Enviar mensagem
  const sendMessage = useCallback(async (to: string, message: string): Promise<boolean> => {
    try {
      console.log(`📤 [SEND] Enviando mensagem para ${to}: ${message}`);
      
      if (!wppConfig.serverUrl || !wppConfig.sessionName || !wppConfig.token) {
        console.error('❌ [SEND] Configurações WPPConnect não estão completas');
        toast({
          title: "Erro de Configuração",
          description: "Configure o WPPConnect nas configurações primeiro",
          variant: "destructive"
        });
        return false;
      }

      // Formatação do número para WPPConnect
      let phoneNumber = to.replace(/\D/g, '');
      if (!phoneNumber.includes('@')) {
        phoneNumber = phoneNumber + '@c.us';
      }

      console.log(`📞 [SEND] Número formatado: ${phoneNumber}`);

      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
        },
        body: JSON.stringify({
          phone: phoneNumber,
          message: message
        })
      });

      console.log(`📡 [SEND] Resposta do servidor: ${response.status}`);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ [SEND] Mensagem enviada com sucesso:', result);
        
        toast({
          title: "Mensagem enviada!",
          description: `Mensagem enviada para ${to}`
        });
        
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ [SEND] Erro na resposta:', errorText);
        
        toast({
          title: "Erro ao enviar mensagem",
          description: `Erro ${response.status}: ${errorText}`,
          variant: "destructive"
        });
        
        return false;
      }
    } catch (error) {
      console.error('❌ [SEND] Erro no envio:', error);
      
      toast({
        title: "Erro no envio",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
      
      return false;
    }
  }, [wppConfig, toast]);

  // Processar webhook de mensagem recebida
  const processWebhookMessage = useCallback(async (webhookData: any) => {
    try {
      console.log('📥 [WEBHOOK] Processando webhook:', webhookData);
      
      toast({
        title: "Mensagem recebida",
        description: "Webhook processado com sucesso"
      });
      
      return true;
    } catch (error) {
      console.error('❌ [WEBHOOK] Erro ao processar:', error);
      return false;
    }
  }, [toast]);

  // Carregar conversas reais
  const loadRealChats = useCallback(async () => {
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/get-chats`, {
        headers: {
          'Authorization': `Bearer ${wppConfig.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return [];
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      return [];
    }
  }, [wppConfig]);

  // Carregar mensagens reais
  const loadRealMessages = useCallback(async (chatId: string) => {
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/get-messages/${chatId}?count=${messageHistoryLimit}`, {
        headers: {
          'Authorization': `Bearer ${wppConfig.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return [];
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      return [];
    }
  }, [wppConfig, messageHistoryLimit]);

  // Funções de webhooks
  const updateWebhooks = useCallback((newWebhooks: Partial<Webhooks>) => {
    setWebhooks(prev => ({ ...prev, ...newWebhooks }));
  }, []);

  // Função para atualizar configuração WPP
  const updateWPPConfig = useCallback((newConfig: Partial<WPPConfig>) => {
    console.log('Updating WPP config:', newConfig);
  }, []);

  // Função para atualizar limite de histórico
  const updateMessageHistoryLimit = useCallback((limit: number) => {
    setMessageHistoryLimit(limit);
  }, []);

  // Funções de conversa (mock implementations)
  const togglePinConversation = useCallback((chatId: string) => {
    console.log('Toggle pin for chat:', chatId);
  }, []);

  const toggleAnalysisConversation = useCallback((chatId: string, priority: 'high' | 'medium' | 'low') => {
    console.log('Toggle analysis for chat:', chatId, 'priority:', priority);
  }, []);

  const isConversationPinned = useCallback((chatId: string) => {
    return false; // Mock implementation
  }, []);

  const isConversationMarkedForAnalysis = useCallback((chatId: string) => {
    return false; // Mock implementation
  }, []);

  const getAnalysisPriority = useCallback((chatId: string): 'high' | 'medium' | 'low' => {
    return 'low'; // Mock implementation
  }, []);

  return {
    wppConfig,
    isConnecting,
    isLoading,
    connectionState,
    webhooks,
    messageHistoryLimit,
    getConnectionStatus,
    generateQRCode,
    disconnectWhatsApp,
    checkConnectionStatus,
    sendMessage,
    processWebhookMessage,
    loadRealChats,
    loadRealMessages,
    updateWebhooks,
    updateWPPConfig,
    updateMessageHistoryLimit,
    togglePinConversation,
    toggleAnalysisConversation,
    isConversationPinned,
    isConversationMarkedForAnalysis,
    getAnalysisPriority
  };
}
