
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useWPPConnect } from './useWPPConnect';

interface ConnectionState {
  isConnected: boolean;
  qrCode: string;
  phoneNumber: string;
  lastConnected: string;
  sessionId: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
}

interface Webhooks {
  qrWebhook: string;
  statusWebhook: string;
  sendMessageWebhook: string;
  autoReplyWebhook: string;
}

interface WPPConfig {
  sessionName: string;
  serverUrl: string;
  secretKey: string;
  webhookUrl: string;
}

export function useRealWhatsAppConnection() {
  const { toast } = useToast();
  const { getWPPConfig } = useWPPConnect();
  
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    qrCode: '',
    phoneNumber: '',
    lastConnected: '',
    sessionId: '',
    status: 'disconnected'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [messageHistoryLimit, setMessageHistoryLimit] = useState(50);
  
  // Configurações padrão (podem ser movidas para contexto depois)
  const [webhooks, setWebhooks] = useState<Webhooks>({
    qrWebhook: '',
    statusWebhook: '',
    sendMessageWebhook: '',
    autoReplyWebhook: ''
  });

  // Obter configuração do WPPConnect
  const wppConfig: WPPConfig = getWPPConfig();
  
  // Carregar estado salvo
  useEffect(() => {
    const saved = localStorage.getItem('real_whatsapp_connection');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConnectionState(parsed);
      } catch (error) {
        console.log('Erro ao carregar estado salvo:', error);
      }
    }
  }, []);

  // Salvar estado
  useEffect(() => {
    if (connectionState.isConnected || connectionState.qrCode) {
      localStorage.setItem('real_whatsapp_connection', JSON.stringify(connectionState));
    }
  }, [connectionState]);

  const isTokenValid = () => {
    return wppConfig.secretKey && 
           wppConfig.secretKey !== 'THISISMYSECURETOKEN' && 
           wppConfig.secretKey.length > 10;
  };

  const generateQRCode = async (): Promise<string | null> => {
    console.log('🔄 Gerando QR Code Real do WPPConnect...');
    
    if (!isTokenValid()) {
      toast({
        title: "❌ Token não configurado",
        description: "Configure o token do WPPConnect primeiro na aba WPPConnect",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    setConnectionState(prev => ({ ...prev, status: 'connecting' }));

    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/generate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.secretKey}`
        },
        body: JSON.stringify({
          session: wppConfig.sessionName,
          webhookUrl: wppConfig.webhookUrl || undefined
        })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.qrcode) {
        setConnectionState(prev => ({
          ...prev,
          qrCode: data.qrcode,
          sessionId: wppConfig.sessionName,
          status: 'connecting'
        }));

        toast({
          title: "✅ QR Code gerado!",
          description: "Escaneie com seu WhatsApp Business"
        });

        // Verificar status periodicamente
        startStatusCheck();
        
        return data.qrcode;
      } else {
        throw new Error('QR Code não encontrado na resposta');
      }
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
      
      setConnectionState(prev => ({ ...prev, status: 'error' }));
      
      toast({
        title: "❌ Erro ao gerar QR Code",
        description: error instanceof Error ? error.message : "Verifique se o WPPConnect está rodando",
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const startStatusCheck = () => {
    const checkInterval = setInterval(async () => {
      const isConnected = await checkConnectionStatus();
      if (isConnected) {
        clearInterval(checkInterval);
      }
    }, 3000);

    // Limpar depois de 2 minutos se não conectar
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 120000);
  };

  const checkConnectionStatus = async (): Promise<boolean> => {
    if (!isTokenValid()) {
      return false;
    }

    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/check-connection-session`, {
        headers: {
          'Authorization': `Bearer ${wppConfig.secretKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.connected || data.status === 'connected') {
        setConnectionState(prev => ({
          ...prev,
          isConnected: true,
          qrCode: '',
          phoneNumber: data.phoneNumber || data.number || 'Conectado',
          lastConnected: new Date().toISOString(),
          status: 'connected'
        }));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      return false;
    }
  };

  const loadRealChats = async () => {
    if (!isTokenValid()) {
      throw new Error('Token do WPPConnect não configurado');
    }

    if (!connectionState.isConnected) {
      throw new Error('WhatsApp não conectado');
    }

    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/all-chats`, {
        headers: {
          'Authorization': `Bearer ${wppConfig.secretKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      throw error;
    }
  };

  const loadRealMessages = async (chatId: string) => {
    if (!isTokenValid()) {
      throw new Error('Token do WPPConnect não configurado');
    }

    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/all-messages-in-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.secretKey}`
        },
        body: JSON.stringify({
          phone: chatId,
          count: messageHistoryLimit
        })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      throw error;
    }
  };

  const sendMessage = async (phone: string, message: string): Promise<boolean> => {
    if (!isTokenValid()) {
      throw new Error('Token do WPPConnect não configurado');
    }

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

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  };

  const disconnectWhatsApp = async () => {
    if (isTokenValid()) {
      try {
        await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/close-session`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${wppConfig.secretKey}`
          }
        });
      } catch (error) {
        console.log('Erro ao fechar sessão:', error);
      }
    }

    setConnectionState({
      isConnected: false,
      qrCode: '',
      phoneNumber: '',
      lastConnected: '',
      sessionId: '',
      status: 'disconnected'
    });

    localStorage.removeItem('real_whatsapp_connection');
    
    toast({
      title: "🔌 Desconectado",
      description: "WhatsApp foi desconectado"
    });
  };

  const updateWebhooks = (newWebhooks: Partial<Webhooks>) => {
    setWebhooks(prev => ({ ...prev, ...newWebhooks }));
  };

  const updateWPPConfig = () => {
    // Configuração é gerenciada pelo hook useWPPConnect
    toast({
      title: "Configure na aba WPPConnect",
      description: "Use a aba WPPConnect para alterar as configurações"
    });
  };

  const updateMessageHistoryLimit = (limit: number) => {
    setMessageHistoryLimit(limit);
  };

  const getConnectionStatus = () => {
    if (!connectionState.isConnected) return 'disconnected';
    
    const lastConnected = new Date(connectionState.lastConnected);
    const now = new Date();
    const minutesDiff = (now.getTime() - lastConnected.getTime()) / (1000 * 60);
    
    if (minutesDiff > 30) return 'idle';
    return 'active';
  };

  // Funcionalidades de análise de conversas (placeholder)
  const togglePinConversation = (chatId: string) => {
    console.log('Toggle pin conversation:', chatId);
  };

  const toggleAnalysisConversation = (chatId: string) => {
    console.log('Toggle analysis conversation:', chatId);
  };

  const isConversationPinned = (chatId: string) => {
    return false; // Placeholder
  };

  const isConversationMarkedForAnalysis = (chatId: string) => {
    return false; // Placeholder
  };

  const getAnalysisPriority = (chatId: string): 'high' | 'medium' | 'low' => {
    return 'medium'; // Placeholder
  };

  return {
    connectionState,
    isLoading,
    webhooks,
    wppConfig,
    messageHistoryLimit,
    updateWebhooks,
    updateWPPConfig,
    updateMessageHistoryLimit,
    generateQRCode,
    checkConnectionStatus,
    disconnectWhatsApp,
    sendMessage,
    loadRealChats,
    loadRealMessages,
    getConnectionStatus,
    togglePinConversation,
    toggleAnalysisConversation,
    isConversationPinned,
    isConversationMarkedForAnalysis,
    getAnalysisPriority
  };
}
