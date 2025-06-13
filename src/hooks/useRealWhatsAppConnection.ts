
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useWPPConnect } from './useWPPConnect';
import { useRealConnectionState } from './real-whatsapp/useRealConnectionState';
import { useRealWebhooks } from './real-whatsapp/useRealWebhooks';

interface WPPConfig {
  sessionName: string;
  serverUrl: string;
  secretKey: string;
  token: string;
  webhookUrl?: string;
}

export function useRealWhatsAppConnection() {
  const { toast } = useToast();
  const { getWPPConfig } = useWPPConnect();
  const { connectionState, setConnectionState, isLoading, setIsLoading } = useRealConnectionState();
  const { webhooks, updateWebhooks } = useRealWebhooks();
  
  const [messageHistoryLimit, setMessageHistoryLimit] = useState(50);

  const wppConfig: WPPConfig = {
    ...getWPPConfig(),
    webhookUrl: getWPPConfig().webhookUrl || ''
  };
  
  const isTokenValid = () => {
    return wppConfig.secretKey && 
           wppConfig.secretKey !== 'THISISMYSECURETOKEN' && 
           wppConfig.secretKey.length > 10 &&
           wppConfig.token &&
           wppConfig.token.length > 10;
  };

  const generateQRCode = async (): Promise<string | null> => {
    console.log('🔄 Gerando QR Code Real do WPPConnect...');
    
    if (!isTokenValid()) {
      toast({
        title: "❌ Configuração incompleta",
        description: "Configure Secret Key e Token do WPPConnect primeiro na aba WPPConnect",
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
          'Authorization': `Bearer ${wppConfig.secretKey}`,
          'X-Session-Token': wppConfig.token
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
        description: error instanceof Error ? error.message : "Verifique se o WPPConnect está rodando e as configurações estão corretas",
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
          'Authorization': `Bearer ${wppConfig.secretKey}`,
          'X-Session-Token': wppConfig.token
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

  const disconnectWhatsApp = async () => {
    if (isTokenValid()) {
      try {
        await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/close-session`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${wppConfig.secretKey}`,
            'X-Session-Token': wppConfig.token
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

  const getConnectionStatus = () => {
    if (!connectionState.isConnected) return 'disconnected';
    
    const lastConnected = new Date(connectionState.lastConnected);
    const now = new Date();
    const minutesDiff = (now.getTime() - lastConnected.getTime()) / (1000 * 60);
    
    if (minutesDiff > 30) return 'idle';
    return 'active';
  };

  // Placeholder functions for compatibility
  const loadRealChats = async () => {
    throw new Error('Use WPPConnect hooks for real functionality');
  };

  const loadRealMessages = async (chatId: string) => {
    throw new Error('Use WPPConnect hooks for real functionality');
  };

  const sendMessage = async (phone: string, message: string): Promise<boolean> => {
    throw new Error('Use WPPConnect hooks for real functionality');
  };

  const updateWPPConfig = () => {
    toast({
      title: "Configure na aba WPPConnect",
      description: "Use a aba WPPConnect para alterar as configurações"
    });
  };

  const updateMessageHistoryLimit = (limit: number) => {
    setMessageHistoryLimit(limit);
  };

  const togglePinConversation = (chatId: string) => {
    console.log('Toggle pin conversation:', chatId);
  };

  const toggleAnalysisConversation = (chatId: string) => {
    console.log('Toggle analysis conversation:', chatId);
  };

  const isConversationPinned = (chatId: string) => {
    return false;
  };

  const isConversationMarkedForAnalysis = (chatId: string) => {
    return false;
  };

  const getAnalysisPriority = (chatId: string): 'high' | 'medium' | 'low' => {
    return 'medium';
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
