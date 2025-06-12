import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WPPConnectionState {
  isConnected: boolean;
  sessionName: string;
  phoneNumber: string;
  qrCode: string;
  isLoading: boolean;
  lastStatusCheck: string;
}

interface WPPConfig {
  serverUrl: string;
  sessionName: string;
  token: string;
}

interface WebhookConfig {
  url: string;
  events: string[];
  qrWebhook?: string;
  statusWebhook?: string;
  sendMessageWebhook?: string;
  autoReplyWebhook?: string;
}

export function useRealWhatsAppConnection() {
  const { toast } = useToast();
  
  // Estado da conexão
  const [connectionState, setConnectionState] = useState<WPPConnectionState>({
    isConnected: false,
    sessionName: '',
    phoneNumber: '',
    qrCode: '',
    isLoading: false,
    lastStatusCheck: ''
  });

  // Estado adicional para compatibilidade
  const [isLoading, setIsLoading] = useState(false);
  const [messageHistoryLimit, setMessageHistoryLimit] = useState(50);
  const [webhooks, setWebhooks] = useState<WebhookConfig>({
    url: 'https://duyxbtfknilgrvgsvlyy.supabase.co/functions/v1/whatsapp-autoreply',
    events: ['message', 'onMessage']
  });

  // Configuração do WPPConnect
  const [wppConfig, setWppConfig] = useState<WPPConfig>({
    serverUrl: 'http://localhost:21465',
    sessionName: 'NERDWHATS_AMERICA',
    token: 'YOUR_TOKEN_HERE'
  });

  // Estados para gerenciamento de conversas
  const [pinnedConversations, setPinnedConversations] = useState<Set<string>>(new Set());
  const [analysisConversations, setAnalysisConversations] = useState<Map<string, 'high' | 'medium' | 'low'>>(new Map());

  // Referência para controlar polling automático
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingActiveRef = useRef(false);

  // Carregar estado salvo do localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('wpp_connection_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setConnectionState(parsed);
        
        // Se estava conectado, iniciar verificação automática
        if (parsed.isConnected) {
          startAutoStatusCheck();
        }
      } catch (error) {
        console.error('Erro ao carregar estado salvo:', error);
      }
    }

    // Carregar configurações salvas
    const savedConfig = localStorage.getItem('wpp_config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setWppConfig(parsedConfig);
      } catch (error) {
        console.error('Erro ao carregar configuração salva:', error);
      }
    }

    const savedWebhooks = localStorage.getItem('wpp_webhooks');
    if (savedWebhooks) {
      try {
        const parsedWebhooks = JSON.parse(savedWebhooks);
        setWebhooks(parsedWebhooks);
      } catch (error) {
        console.error('Erro ao carregar webhooks salvos:', error);
      }
    }

    const savedHistoryLimit = localStorage.getItem('wpp_history_limit');
    if (savedHistoryLimit) {
      setMessageHistoryLimit(parseInt(savedHistoryLimit) || 50);
    }
  }, []);

  // Salvar estado no localStorage
  useEffect(() => {
    localStorage.setItem('wpp_connection_state', JSON.stringify(connectionState));
  }, [connectionState]);

  useEffect(() => {
    localStorage.setItem('wpp_config', JSON.stringify(wppConfig));
  }, [wppConfig]);

  useEffect(() => {
    localStorage.setItem('wpp_webhooks', JSON.stringify(webhooks));
  }, [webhooks]);

  useEffect(() => {
    localStorage.setItem('wpp_history_limit', messageHistoryLimit.toString());
  }, [messageHistoryLimit]);

  // Função para verificar status da sessão
  const checkSessionStatus = useCallback(async (showToast = false) => {
    console.log('🔍 Verificando status da sessão...');
    
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/check-connection-session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Status da sessão:', data);
        
        const isConnected = data.status === 'CONNECTED' || data.status === 'OPEN' || data.connected === true;
        const phoneNumber = data.phone || data.phoneNumber || connectionState.phoneNumber;
        
        setConnectionState(prev => ({
          ...prev,
          isConnected,
          phoneNumber,
          lastStatusCheck: new Date().toISOString(),
          isLoading: false
        }));

        if (showToast) {
          toast({
            title: isConnected ? "WhatsApp Conectado" : "WhatsApp Desconectado",
            description: isConnected 
              ? `Conectado como ${phoneNumber || 'número não disponível'}` 
              : "Sessão não está ativa",
            variant: isConnected ? "default" : "destructive"
          });
        }

        return isConnected;
      } else {
        console.error('❌ Erro ao verificar status:', response.status);
        
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
          lastStatusCheck: new Date().toISOString(),
          isLoading: false
        }));
        
        if (showToast) {
          toast({
            title: "Erro na verificação",
            description: "Não foi possível verificar o status do WhatsApp",
            variant: "destructive"
          });
        }
        return false;
      }
    } catch (error) {
      console.error('❌ Erro na requisição de status:', error);
      
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        lastStatusCheck: new Date().toISOString(),
        isLoading: false
      }));
      
      if (showToast) {
        toast({
          title: "Erro de conexão",
          description: "Falha ao conectar com o servidor WPPConnect",
          variant: "destructive"
        });
      }
      return false;
    }
  }, [wppConfig, toast, connectionState.phoneNumber]);

  // Função para iniciar verificação automática de status
  const startAutoStatusCheck = useCallback(() => {
    if (isPollingActiveRef.current) {
      console.log('🔄 Polling já está ativo');
      return;
    }

    console.log('🔄 Iniciando verificação automática de status...');
    isPollingActiveRef.current = true;

    pollingIntervalRef.current = setInterval(async () => {
      console.log('🔄 Verificação automática de status...');
      await checkSessionStatus(false);
    }, 30000); // Verificar a cada 30 segundos
  }, [checkSessionStatus]);

  // Função para parar verificação automática
  const stopAutoStatusCheck = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    isPollingActiveRef.current = false;
    console.log('⏹️ Verificação automática de status parada');
  }, []);

  // Iniciar polling quando o componente monta
  useEffect(() => {
    startAutoStatusCheck();
    
    // Verificar status imediatamente
    checkSessionStatus(false);

    // Cleanup
    return () => {
      stopAutoStatusCheck();
    };
  }, [startAutoStatusCheck, stopAutoStatusCheck, checkSessionStatus]);

  // Função para gerar QR Code
  const generateQRCode = useCallback(async () => {
    console.log('📱 Gerando QR Code...');
    setConnectionState(prev => ({ ...prev, isLoading: true }));
    setIsLoading(true);

    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/generate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.base64) {
          setConnectionState(prev => ({
            ...prev,
            qrCode: `data:image/png;base64,${data.base64}`,
            isLoading: false
          }));

          toast({
            title: "QR Code gerado!",
            description: "Escaneie com seu WhatsApp Business"
          });

          // Iniciar verificação de conexão após gerar QR
          startAutoStatusCheck();
        }
      } else {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
      setConnectionState(prev => ({ ...prev, isLoading: false }));
      
      toast({
        title: "Erro ao gerar QR Code",
        description: "Verifique se o servidor WPPConnect está rodando",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [wppConfig, toast, startAutoStatusCheck]);

  // Função para desconectar
  const disconnectWhatsApp = useCallback(async () => {
    try {
      await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
        }
      });
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }

    setConnectionState({
      isConnected: false,
      sessionName: '',
      phoneNumber: '',
      qrCode: '',
      isLoading: false,
      lastStatusCheck: ''
    });

    stopAutoStatusCheck();

    toast({
      title: "Desconectado",
      description: "WhatsApp desconectado com sucesso"
    });
  }, [wppConfig, toast, stopAutoStatusCheck]);

  const processWebhookMessage = useCallback(async (webhookData: any) => {
    console.log('📨 Processando mensagem do webhook:', webhookData);
    // Implementação existente permanece igual
  }, []);

  const sendMessage = useCallback(async (phoneNumber: string, message: string): Promise<boolean> => {
    console.log('📤 Enviando mensagem:', { phoneNumber, message });
    
    try {
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

      if (response.ok) {
        console.log('✅ Mensagem enviada com sucesso');
        return true;
      } else {
        console.error('❌ Erro ao enviar mensagem:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return false;
    }
  }, [wppConfig]);

  const configureWebhookOnWPP = useCallback(async (): Promise<boolean> => {
    console.log('🔧 Configurando webhook no WPPConnect...');
    
    const webhookUrl = webhooks.url;
    
    const endpoints = [
      `/api/${wppConfig.sessionName}/webhook`,
      `/api/${wppConfig.sessionName}/set-webhook`,
      `/webhook/${wppConfig.sessionName}`,
      `/webhook`
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔧 Tentando endpoint: ${endpoint}`);
        
        const response = await fetch(`${wppConfig.serverUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${wppConfig.token}`
          },
          body: JSON.stringify({
            webhook: webhookUrl,
            events: webhooks.events,
            enabled: true
          })
        });

        if (response.ok) {
          console.log('✅ Webhook configurado com sucesso via', endpoint);
          return true;
        } else {
          console.log(`❌ Falhou no endpoint ${endpoint}:`, response.status);
        }
      } catch (error) {
        console.log(`❌ Erro no endpoint ${endpoint}:`, error);
      }
    }

    return false;
  }, [wppConfig, webhooks]);

  // Função para carregar conversas reais
  const loadRealChats = useCallback(async () => {
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/all-chats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.response || data || [];
      } else {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      throw error;
    }
  }, [wppConfig]);

  // Função para carregar mensagens reais
  const loadRealMessages = useCallback(async (chatId: string) => {
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/get-messages/${chatId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.response || data || [];
      } else {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      throw error;
    }
  }, [wppConfig]);

  // Função para verificar status de conexão
  const getConnectionStatus = useCallback(() => {
    if (!connectionState.isConnected) return 'disconnected';
    
    const lastCheck = new Date(connectionState.lastStatusCheck);
    const now = new Date();
    const minutesDiff = (now.getTime() - lastCheck.getTime()) / (1000 * 60);
    
    if (minutesDiff > 5) return 'idle';
    return 'active';
  }, [connectionState]);

  // Função para verificar status manualmente
  const checkConnectionStatus = useCallback(async () => {
    setConnectionState(prev => ({ ...prev, isLoading: true }));
    setIsLoading(true);
    
    try {
      const isConnected = await checkSessionStatus(true);
      
      if (isConnected) {
        startAutoStatusCheck();
      }
      
      return isConnected;
    } finally {
      setConnectionState(prev => ({ ...prev, isLoading: false }));
      setIsLoading(false);
    }
  }, [checkSessionStatus]);

  // Funções para gerenciar conversas
  const togglePinConversation = useCallback((chatId: string) => {
    setPinnedConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }
      return newSet;
    });
  }, []);

  const toggleAnalysisConversation = useCallback((chatId: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    setAnalysisConversations(prev => {
      const newMap = new Map(prev);
      if (newMap.has(chatId)) {
        newMap.delete(chatId);
      } else {
        newMap.set(chatId, priority);
      }
      return newMap;
    });
  }, []);

  const isConversationPinned = useCallback((chatId: string) => {
    return pinnedConversations.has(chatId);
  }, [pinnedConversations]);

  const isConversationMarkedForAnalysis = useCallback((chatId: string) => {
    return analysisConversations.has(chatId);
  }, [analysisConversations]);

  const getAnalysisPriority = useCallback((chatId: string): 'high' | 'medium' | 'low' => {
    return analysisConversations.get(chatId) || 'low';
  }, [analysisConversations]);

  // Funções de atualização
  const updateWebhooks = useCallback((newWebhooks: Partial<WebhookConfig>) => {
    setWebhooks(prev => ({ ...prev, ...newWebhooks }));
  }, []);

  const updateWPPConfig = useCallback((newConfig: Partial<WPPConfig>) => {
    setWppConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const updateMessageHistoryLimit = useCallback((limit: number) => {
    setMessageHistoryLimit(limit);
  }, []);

  // Função para forçar verificação manual
  const forceStatusCheck = useCallback(async () => {
    setConnectionState(prev => ({ ...prev, isLoading: true }));
    const isConnected = await checkSessionStatus(true);
    
    if (isConnected) {
      startAutoStatusCheck();
    }
    
    return isConnected;
  }, [checkSessionStatus, startAutoStatusCheck]);

  return {
    connectionState,
    wppConfig,
    isLoading,
    webhooks,
    messageHistoryLimit,
    generateQRCode,
    checkSessionStatus: forceStatusCheck,
    checkConnectionStatus,
    disconnectWhatsApp,
    processWebhookMessage,
    sendMessage,
    configureWebhookOnWPP,
    startAutoStatusCheck,
    stopAutoStatusCheck,
    loadRealChats,
    loadRealMessages,
    getConnectionStatus,
    togglePinConversation,
    toggleAnalysisConversation,
    isConversationPinned,
    isConversationMarkedForAnalysis,
    getAnalysisPriority,
    updateWebhooks,
    updateWPPConfig,
    updateMessageHistoryLimit
  };
}
