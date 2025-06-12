
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ConnectionState {
  isConnected: boolean;
  phoneNumber: string;
  qrCode: string;
  isLoading: boolean;
  sessionName: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'qr' | 'error';
}

interface WPPConfig {
  sessionName: string;
  serverUrl: string;
  token?: string;
}

interface WebhookConfig {
  enabled: boolean;
  url: string;
  events: string[];
}

export function useRealWhatsAppConnection() {
  const { toast } = useToast();
  
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    phoneNumber: '',
    qrCode: '',
    isLoading: false,
    sessionName: 'NERDWHATS_AMERICA',
    status: 'disconnected'
  });

  const [wppConfig] = useState<WPPConfig>({
    sessionName: 'NERDWHATS_AMERICA',
    serverUrl: 'http://localhost:21465',
    token: undefined
  });

  const [webhooks] = useState<WebhookConfig>({
    enabled: false,
    url: '',
    events: []
  });

  const [messageHistoryLimit] = useState(50);
  const isCheckingStatus = useRef(false);

  const updateWebhooks = useCallback((config: Partial<WebhookConfig>) => {
    console.log('Webhooks config would be updated:', config);
  }, []);

  const updateWPPConfig = useCallback((config: Partial<WPPConfig>) => {
    console.log('WPP config would be updated:', config);
  }, []);

  const updateMessageHistoryLimit = useCallback((limit: number) => {
    console.log('Message history limit would be updated:', limit);
  }, []);

  const generateQRCode = useCallback(async () => {
    console.log('🔄 Gerando QR Code...');
    setConnectionState(prev => ({ ...prev, isLoading: true, status: 'connecting' }));

    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/generate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 Resposta do servidor:', data);

      if (data.status === 'qrcode' && data.qrcode) {
        setConnectionState(prev => ({
          ...prev,
          qrCode: data.qrcode,
          isLoading: false,
          status: 'qr'
        }));
        return data.qrcode;
      } else if (data.status === 'CONNECTED' || data.status === 'OPENING') {
        setConnectionState(prev => ({
          ...prev,
          isConnected: true,
          isLoading: false,
          status: 'connected',
          phoneNumber: data.session || wppConfig.sessionName
        }));
        toast({
          title: "✅ WhatsApp já conectado!",
          description: "Sessão já está ativa"
        });
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
      setConnectionState(prev => ({ 
        ...prev, 
        isLoading: false, 
        status: 'error' 
      }));
      
      toast({
        title: "Erro ao gerar QR Code",
        description: "Verifique se o WPPConnect está rodando na porta 21465",
        variant: "destructive"
      });
    }

    return null;
  }, [wppConfig, toast]);

  const checkConnectionStatus = useCallback(async () => {
    if (isCheckingStatus.current) return false;
    
    isCheckingStatus.current = true;
    console.log('🔍 Verificando status da conexão...');

    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/check-connection-session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Status da sessão:', data);

      const isConnected = data.status === 'CONNECTED' || data.status === 'OPENING';
      
      setConnectionState(prev => ({
        ...prev,
        isConnected,
        status: isConnected ? 'connected' : 'disconnected',
        phoneNumber: isConnected ? (data.session || wppConfig.sessionName) : ''
      }));

      return isConnected;
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        status: 'error'
      }));
      return false;
    } finally {
      isCheckingStatus.current = false;
    }
  }, [wppConfig]);

  const disconnectWhatsApp = useCallback(async () => {
    try {
      await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/logout-session`, {
        method: 'POST'
      });
      
      setConnectionState({
        isConnected: false,
        phoneNumber: '',
        qrCode: '',
        isLoading: false,
        sessionName: wppConfig.sessionName,
        status: 'disconnected'
      });
      
      toast({
        title: "WhatsApp desconectado",
        description: "Sessão finalizada com sucesso"
      });
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
    }
  }, [wppConfig, toast]);

  const sendMessage = useCallback(async (phone: string, message: string) => {
    console.log('📤 Tentando enviar mensagem para:', phone);
    console.log('💬 Mensagem:', message);

    if (!connectionState.isConnected) {
      toast({
        title: "WhatsApp não conectado",
        description: "Conecte seu WhatsApp primeiro",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Limpar e formatar o número de telefone
      let cleanPhone = phone.replace(/\D/g, '');
      
      // Garantir que tem o código do país
      if (!cleanPhone.startsWith('55') && cleanPhone.length >= 10) {
        cleanPhone = '55' + cleanPhone;
      }
      
      // Formato final para WPPConnect
      const formattedPhone = cleanPhone + '@c.us';
      
      console.log('📞 Número formatado:', formattedPhone);

      const payload = {
        phone: formattedPhone,
        message: message
      };

      console.log('📋 Payload da requisição:', payload);

      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('📥 Status da resposta:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Resposta do envio:', result);

      if (result.status === 'success' || result.status === true) {
        toast({
          title: "✅ Mensagem enviada!",
          description: `Mensagem enviada para ${phone}`
        });
        return true;
      } else {
        throw new Error(result.message || 'Falha no envio');
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      
      toast({
        title: "❌ Erro ao enviar mensagem",
        description: error instanceof Error ? error.message : "Verifique se o WPPConnect está rodando e conectado",
        variant: "destructive"
      });
      
      return false;
    }
  }, [connectionState.isConnected, wppConfig, toast]);

  const loadRealChats = useCallback(async () => {
    if (!connectionState.isConnected) {
      throw new Error('WhatsApp não conectado');
    }

    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/all-chats`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data.response || [];
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      throw error;
    }
  }, [connectionState.isConnected, wppConfig]);

  const loadRealMessages = useCallback(async (chatId: string) => {
    if (!connectionState.isConnected) {
      throw new Error('WhatsApp não conectado');
    }

    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/get-messages/${chatId}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data.response || [];
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      throw error;
    }
  }, [connectionState.isConnected, wppConfig]);

  const isConversationPinned = useCallback((chatId: string) => {
    return false; // Implementar lógica de fixação se necessário
  }, []);

  const isConversationMarkedForAnalysis = useCallback((chatId: string) => {
    return false; // Implementar lógica de análise se necessário
  }, []);

  const getAnalysisPriority = useCallback((chatId: string) => {
    return 'low' as const; // Implementar lógica de prioridade se necessário
  }, []);

  const togglePinConversation = useCallback((chatId: string) => {
    console.log('Toggle pin conversation:', chatId);
  }, []);

  const toggleAnalysisConversation = useCallback((chatId: string) => {
    console.log('Toggle analysis conversation:', chatId);
  }, []);

  return {
    connectionState,
    isLoading: connectionState.isLoading,
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
    isConversationPinned,
    isConversationMarkedForAnalysis,
    getAnalysisPriority,
    togglePinConversation,
    toggleAnalysisConversation
  };
}
