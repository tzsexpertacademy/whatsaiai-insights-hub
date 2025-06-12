import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useVoiceTranscription } from './useVoiceTranscription';
import { usePersonalAssistant } from './usePersonalAssistant';

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

interface WPPConfig {
  serverUrl: string;
  sessionName: string;
  secretKey: string;
  token: string;
}

interface PinnedConversation {
  chatId: string;
  pinnedAt: string;
}

interface ConversationForAnalysis {
  chatId: string;
  markedAt: string;
  priority: 'high' | 'medium' | 'low';
}

export function useRealWhatsAppConnection() {
  const { toast } = useToast();
  const { transcribeAudio } = useVoiceTranscription();
  const { processIncomingMessage, config: assistantConfig } = usePersonalAssistant();
  
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    phoneNumber: '',
    qrCode: '',
    lastConnected: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [messageHistoryLimit, setMessageHistoryLimit] = useState(50);
  
  const [webhooks, setWebhooks] = useState<WebhookConfig>(() => {
    const saved = localStorage.getItem('whatsapp_webhooks');
    return saved ? JSON.parse(saved) : {
      qrWebhook: '',
      statusWebhook: '',
      sendMessageWebhook: '',
      autoReplyWebhook: window.location.origin + '/api/whatsapp-webhook'
    };
  });

  const [wppConfig, setWppConfig] = useState<WPPConfig>(() => {
    const saved = localStorage.getItem('wpp_config');
    return saved ? JSON.parse(saved) : {
      serverUrl: 'http://localhost:21465',
      sessionName: 'NERDWHATS_AMERICA',
      secretKey: 'THISISMYSECURETOKEN',
      token: '$2b$10$jKW5P3gzFYntHqLs0ttw2uRsoFGIxfiM6u4GSMWhsej15Kh6_ZyDa'
    };
  });

  // Estados para conversas fixadas e marcadas para análise
  const [pinnedConversations, setPinnedConversations] = useState<PinnedConversation[]>(() => {
    const saved = localStorage.getItem('pinned_conversations');
    return saved ? JSON.parse(saved) : [];
  });

  const [conversationsForAnalysis, setConversationsForAnalysis] = useState<ConversationForAnalysis[]>(() => {
    const saved = localStorage.getItem('conversations_for_analysis');
    return saved ? JSON.parse(saved) : [];
  });

  // Cache para conversas
  const [cachedChats, setCachedChats] = useState(() => {
    const saved = localStorage.getItem('cached_whatsapp_chats');
    return saved ? JSON.parse(saved) : [];
  });

  // Helper function to format phone number for WPPConnect
  const formatPhoneNumber = (phone: string): string => {
    console.log('📞 [WPP] Formatando número original:', phone);
    
    if (phone.includes('@g.us')) {
      return phone;
    }
    
    if (phone.includes('@c.us')) {
      return phone;
    }
    
    let cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone + '@c.us';
    
    console.log('📞 [WPP] Número formatado:', formattedPhone);
    return formattedPhone;
  };

  // Função para configurar webhook automático no WPPConnect
  const configureWebhookOnWPP = useCallback(async () => {
    console.log('🔧 [WPP] Configurando webhook automático no WPPConnect...');
    
    try {
      // URL do webhook que aponta para a edge function do Supabase
      const webhookUrl = `${window.location.origin.includes('localhost') ? 'https://your-project.supabase.co' : window.location.origin}/functions/v1/whatsapp-autoreply`;
      
      console.log('🔧 [WPP] URL do webhook:', webhookUrl);
      console.log('🔧 [WPP] Configurações atuais:', wppConfig);
      
      // Lista de endpoints para tentar (diferentes versões do WPPConnect)
      const webhookEndpoints = [
        {
          url: `${wppConfig.serverUrl}/api/${wppConfig.sessionName}/set-webhook`,
          method: 'POST',
          body: { webhook: webhookUrl, events: ['message'] }
        },
        {
          url: `${wppConfig.serverUrl}/api/${wppConfig.sessionName}/webhook`,
          method: 'POST', 
          body: { url: webhookUrl, enabled: true, events: ['message'] }
        },
        {
          url: `${wppConfig.serverUrl}/webhook/${wppConfig.sessionName}`,
          method: 'POST',
          body: { webhookUrl: webhookUrl }
        },
        {
          url: `${wppConfig.serverUrl}/api/${wppConfig.sessionName}/config-webhook`,
          method: 'PUT',
          body: { webhook: webhookUrl }
        }
      ];

      for (let i = 0; i < webhookEndpoints.length; i++) {
        const endpoint = webhookEndpoints[i];
        console.log(`🔧 [WPP] Tentando endpoint ${i + 1}:`, endpoint.url);
        
        try {
          const response = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${wppConfig.token}`,
              'X-API-KEY': wppConfig.token,
              'token': wppConfig.token
            },
            body: JSON.stringify(endpoint.body)
          });

          console.log(`🔧 [WPP] Resposta endpoint ${i + 1}:`, response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ [WPP] Webhook configurado com sucesso:', result);
            
            toast({
              title: "🔗 Webhook configurado!",
              description: `WPPConnect configurado via endpoint ${i + 1}. Agora as mensagens serão enviadas automaticamente para o assistente.`
            });
            
            return true;
          } else {
            const errorText = await response.text();
            console.log(`❌ [WPP] Endpoint ${i + 1} falhou:`, response.status, errorText);
          }
        } catch (endpointError) {
          console.log(`❌ [WPP] Erro no endpoint ${i + 1}:`, endpointError);
        }
      }
      
      // Se chegou aqui, todos os endpoints falharam
      console.error('❌ [WPP] Todos os endpoints de webhook falharam');
      
      toast({
        title: "❌ Erro no webhook",
        description: "Não foi possível configurar webhook automático. Verifique se o WPPConnect está rodando e configure manualmente via Swagger.",
        variant: "destructive"
      });
      
      return false;
      
    } catch (error) {
      console.error('❌ [WPP] Erro ao configurar webhook:', error);
      
      toast({
        title: "❌ Erro de conexão",
        description: "Falha ao conectar com o WPPConnect. Verifique se está rodando na porta correta.",
        variant: "destructive"
      });
      
      return false;
    }
  }, [wppConfig, toast]);

  // Função para atualizar limite de histórico
  const updateMessageHistoryLimit = useCallback((newLimit: number) => {
    setMessageHistoryLimit(newLimit);
    localStorage.setItem('message_history_limit', newLimit.toString());
    
    toast({
      title: "Limite atualizado! 📊",
      description: `Histórico agora carrega ${newLimit} mensagens`
    });
  }, [toast]);

  // Função para fixar/desfixar conversa
  const togglePinConversation = useCallback((chatId: string) => {
    setPinnedConversations(prev => {
      const isPinned = prev.some(p => p.chatId === chatId);
      let updated;
      
      if (isPinned) {
        updated = prev.filter(p => p.chatId !== chatId);
        toast({
          title: "📌 Conversa desfixada",
          description: "Conversa removida dos fixados"
        });
      } else {
        updated = [...prev, { chatId, pinnedAt: new Date().toISOString() }];
        toast({
          title: "📌 Conversa fixada",
          description: "Conversa adicionada aos fixados"
        });
      }
      
      localStorage.setItem('pinned_conversations', JSON.stringify(updated));
      return updated;
    });
  }, [toast]);

  // Função para marcar/desmarcar conversa para análise
  const toggleAnalysisConversation = useCallback((chatId: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    setConversationsForAnalysis(prev => {
      const isMarked = prev.some(c => c.chatId === chatId);
      let updated;
      
      if (isMarked) {
        updated = prev.filter(c => c.chatId !== chatId);
        toast({
          title: "🤖 Removido da análise IA",
          description: "Conversa não será mais analisada pela IA"
        });
      } else {
        updated = [...prev, { chatId, markedAt: new Date().toISOString(), priority }];
        toast({
          title: "🤖 Marcado para análise IA",
          description: `Conversa será analisada pela IA (prioridade: ${priority})`
        });
      }
      
      localStorage.setItem('conversations_for_analysis', JSON.stringify(updated));
      return updated;
    });
  }, [toast]);

  // Função para verificar se conversa está fixada
  const isConversationPinned = useCallback((chatId: string) => {
    return pinnedConversations.some(p => p.chatId === chatId);
  }, [pinnedConversations]);

  // Função para verificar se conversa está marcada para análise
  const isConversationMarkedForAnalysis = useCallback((chatId: string) => {
    return conversationsForAnalysis.some(c => c.chatId === chatId);
  }, [conversationsForAnalysis]);

  // Função para obter prioridade da análise
  const getAnalysisPriority = useCallback((chatId: string) => {
    const conversation = conversationsForAnalysis.find(c => c.chatId === chatId);
    return conversation?.priority || 'medium';
  }, [conversationsForAnalysis]);

  const updateWPPConfig = useCallback((newConfig: Partial<WPPConfig>) => {
    const updated = { ...wppConfig, ...newConfig };
    setWppConfig(updated);
    localStorage.setItem('wpp_config', JSON.stringify(updated));
    
    toast({
      title: "Configuração salva! ⚙️",
      description: "Configurações do WPPConnect atualizadas"
    });
  }, [wppConfig, toast]);

  const updateWebhooks = useCallback((newWebhooks: Partial<WebhookConfig>) => {
    const updated = { ...webhooks, ...newWebhooks };
    setWebhooks(updated);
    localStorage.setItem('whatsapp_webhooks', JSON.stringify(updated));
  }, [webhooks]);

  const generateQRCode = useCallback(async () => {
    console.log('🚀 Gerando QR Code WPPConnect REAL...');
    setIsLoading(true);
    
    try {
      const startSessionResponse = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/start-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
        },
        body: JSON.stringify({
          webhook: '',
          waitQrCode: true
        })
      });
      
      if (startSessionResponse.ok) {
        const sessionData = await startSessionResponse.json();
        
        if (sessionData.qrcode || sessionData.qr || sessionData.base64) {
          const qrCodeData = sessionData.qrcode || sessionData.qr || sessionData.base64;
          
          setConnectionState(prev => ({
            ...prev,
            qrCode: qrCodeData
          }));
          
          toast({
            title: "QR Code gerado! 📱",
            description: "Escaneie com seu WhatsApp para conectar"
          });
          
          startStatusPolling();
          return qrCodeData;
        }
        
        if (sessionData.status === 'CONNECTED' || sessionData.state === 'CONNECTED') {
          setConnectionState(prev => ({
            ...prev,
            isConnected: true,
            phoneNumber: sessionData.phone || sessionData.number || 'Conectado',
            qrCode: ''
          }));
          
          // Configurar webhook automaticamente quando conectar
          await configureWebhookOnWPP();
          
          toast({
            title: "✅ Já conectado!",
            description: "WhatsApp já está conectado"
          });
          
          return null;
        }
      } else {
        const errorText = await startSessionResponse.text();
        throw new Error(`Erro ao iniciar sessão: ${startSessionResponse.status} - ${errorText}`);
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
  }, [toast, wppConfig, configureWebhookOnWPP]);

  const startStatusPolling = useCallback(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/status-session`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${wppConfig.token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          const isConnected = data.state === 'CONNECTED' || 
                             data.status === 'inChat' || 
                             data.status === 'CONNECTED' ||
                             data.connected === true ||
                             data.accountStatus === 'authenticated' ||
                             (data.session && data.session.state === 'CONNECTED');
          
          if (isConnected) {
            setConnectionState(prev => ({
              ...prev,
              isConnected: true,
              phoneNumber: data.phone || data.number || data.wid || data.session?.phone || 'Conectado',
              qrCode: '',
              lastConnected: new Date().toISOString()
            }));
            
            // Configurar webhook automaticamente quando conectar
            await configureWebhookOnWPP();
            
            toast({
              title: "🎉 WhatsApp conectado!",
              description: `Conectado com sucesso! Webhook configurado automaticamente.`
            });
            
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('❌ Erro no polling:', error);
      }
    }, 3000);
    
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 120000);
  }, [toast, wppConfig, configureWebhookOnWPP]);

  const checkConnectionStatus = useCallback(async () => {
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/status-session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        const isConnected = data.state === 'CONNECTED' || 
                           data.status === 'inChat' || 
                           data.status === 'CONNECTED' ||
                           data.connected === true ||
                           data.accountStatus === 'authenticated' ||
                           (data.session && data.session.state === 'CONNECTED');
        
        if (isConnected) {
          setConnectionState(prev => ({
            ...prev,
            isConnected: true,
            phoneNumber: data.phone || data.number || data.wid || data.session?.phone || 'Conectado',
            qrCode: '',
            lastConnected: new Date().toISOString()
          }));
          
          toast({
            title: "✅ Status atualizado!",
            description: "WhatsApp está conectado"
          });
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      return false;
    }
  }, [wppConfig, toast]);

  const disconnectWhatsApp = useCallback(async () => {
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/logout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
        }
      });
      
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
  }, [toast, wppConfig]);

  // Função para enviar mensagem
  const sendMessage = useCallback(async (phone: string, message: string) => {
    console.log('📤 [WPP] === ENVIANDO MENSAGEM ===');
    console.log('📤 [WPP] Para:', phone);
    console.log('📤 [WPP] Mensagem:', message);
    console.log('📤 [WPP] Config atual:', wppConfig);
    
    try {
      const targetPhone = phone;
      
      // Lista de endpoints para tentar (diferentes versões do WPPConnect)
      const endpoints = [
        {
          url: `${wppConfig.serverUrl}/api/${wppConfig.sessionName}/send-message`,
          data: { phone: targetPhone, message: message, text: message }
        },
        {
          url: `${wppConfig.serverUrl}/api/${wppConfig.sessionName}/send-text`,
          data: { phone: targetPhone, message: message }
        },
        {
          url: `${wppConfig.serverUrl}/api/${wppConfig.sessionName}/sendText`,
          data: { phone: targetPhone, message: message }
        },
        {
          url: `${wppConfig.serverUrl}/sendText`,
          data: { session: wppConfig.sessionName, phone: targetPhone, text: message }
        },
        {
          url: `${wppConfig.serverUrl}/${wppConfig.sessionName}/send-message`,
          data: { phone: targetPhone, message: message }
        }
      ];
      
      for (let i = 0; i < endpoints.length; i++) {
        const endpoint = endpoints[i];
        console.log(`📤 [WPP] Tentando endpoint ${i + 1}:`, endpoint.url);
        console.log(`📤 [WPP] Dados:`, endpoint.data);
        
        try {
          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${wppConfig.token}`,
              'X-API-KEY': wppConfig.token,
              'token': wppConfig.token
            },
            body: JSON.stringify(endpoint.data)
          });

          console.log(`📤 [WPP] Resposta endpoint ${i + 1}:`, response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ [WPP] Mensagem enviada com sucesso:', result);
            
            toast({
              title: "✅ Mensagem enviada!",
              description: `Mensagem enviada via endpoint ${i + 1}`
            });
            
            return true;
          } else {
            const errorText = await response.text();
            console.log(`❌ [WPP] Endpoint ${i + 1} falhou:`, response.status, errorText);
          }
        } catch (endpointError) {
          console.log(`❌ [WPP] Erro no endpoint ${i + 1}:`, endpointError);
        }
      }
      
      // Se chegou aqui, todos os endpoints falharam
      console.error('❌ [WPP] Todos os endpoints falharam');
      
      toast({
        title: "❌ Erro ao enviar mensagem",
        description: "Nenhum endpoint funcionou. Verifique se o WPPConnect está rodando e as configurações estão corretas.",
        variant: "destructive"
      });
      return false;
      
    } catch (error) {
      console.error('❌ [WPP] Erro geral ao enviar mensagem:', error);
      
      toast({
        title: "❌ Erro de conexão",
        description: "Não foi possível conectar com o servidor WPPConnect",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, wppConfig]);

  const loadRealChats = useCallback(async () => {
    console.log('📱 Carregando conversas reais da API WPPConnect...');
    
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/all-chats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        
        let chatsArray = [];
        
        if (Array.isArray(responseData)) {
          chatsArray = responseData;
        } else if (responseData.chats && Array.isArray(responseData.chats)) {
          chatsArray = responseData.chats;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          chatsArray = responseData.data;
        } else if (responseData.response && Array.isArray(responseData.response)) {
          chatsArray = responseData.response;
        } else {
          throw new Error('Formato de dados não suportado');
        }
        
        // Salvar no cache
        setCachedChats(chatsArray);
        localStorage.setItem('cached_whatsapp_chats', JSON.stringify(chatsArray));
        
        return chatsArray;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao carregar conversas:', response.status, errorText);
        
        // Se falhar, tentar usar cache
        if (cachedChats.length > 0) {
          console.log('📋 Usando conversas do cache');
          toast({
            title: "📋 Conversas do cache",
            description: "Carregadas conversas salvas localmente"
          });
          return cachedChats;
        }
        
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erro de conexão ao carregar conversas:', error);
      
      // Tentar usar cache em caso de erro
      if (cachedChats.length > 0) {
        console.log('📋 Usando conversas do cache devido ao erro');
        toast({
          title: "📋 Modo offline",
          description: "Exibindo conversas salvas localmente"
        });
        return cachedChats;
      }
      
      throw error;
    }
  }, [wppConfig, cachedChats, toast]);

  const loadRealMessages = useCallback(async (contactId: string) => {
    console.log('📤 Carregando mensagens reais para:', contactId);
    
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/get-messages/${contactId}?count=${messageHistoryLimit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        
        let messagesArray = [];
        
        if (Array.isArray(responseData)) {
          messagesArray = responseData;
        } else if (responseData.messages && Array.isArray(responseData.messages)) {
          messagesArray = responseData.messages;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          messagesArray = responseData.data;
        } else if (responseData.response && Array.isArray(responseData.response)) {
          messagesArray = responseData.response;
        } else {
          return [];
        }
        
        // Processar mensagens com transcrição de áudio
        const processedMessages = await Promise.all(
          messagesArray.map(async (msg: any) => {
            let text = msg.body || msg.text || msg.content || 'Mensagem sem texto';
            
            // Verificar se é mensagem de áudio
            if (msg.type === 'audio' || msg.type === 'ptt' || (msg.mimetype && msg.mimetype.includes('audio'))) {
              console.log('🎤 Mensagem de áudio detectada:', msg);
              
              if (msg.body && msg.body.startsWith('data:audio')) {
                try {
                  const base64Audio = msg.body.split(',')[1];
                  const transcription = await transcribeAudio(base64Audio);
                  text = transcription ? `🎤 [Áudio]: ${transcription}` : '🎤 [Áudio - transcrição não disponível]';
                } catch (error) {
                  console.error('❌ Erro na transcrição:', error);
                  text = '🎤 [Áudio - erro na transcrição]';
                }
              } else {
                text = '🎤 [Áudio - transcrição não disponível]';
              }
            }
            
            return {
              ...msg,
              processedText: text
            };
          })
        );
        
        return processedMessages;
      } else {
        console.error('❌ Erro ao carregar mensagens:', response.status);
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      throw error;
    }
  }, [wppConfig, transcribeAudio, messageHistoryLimit]);

  const getConnectionStatus = useCallback(() => {
    if (connectionState.isConnected) {
      return 'active';
    }
    return 'disconnected';
  }, [connectionState.isConnected]);

  // Função para processar webhook de mensagem recebida
  const processWebhookMessage = useCallback(async (webhookData: any) => {
    console.log('📨 [WPP] === WEBHOOK RECEBIDO ===');
    console.log('📨 [WPP] Dados completos:', JSON.stringify(webhookData, null, 2));
    
    try {
      // Extrair dados da mensagem do webhook
      const messageData = webhookData.message || webhookData.messages?.[0] || webhookData;
      
      if (!messageData) {
        console.log('❌ [WPP] Dados de mensagem não encontrados no webhook');
        return;
      }

      const fromNumber = messageData.from || messageData.phone || messageData.sender;
      const toNumber = messageData.to || messageData.chatId || connectionState.phoneNumber;
      const messageText = messageData.body || messageData.text || messageData.message || '';

      console.log('📋 [WPP] Dados extraídos:', {
        from: fromNumber,
        to: toNumber,
        text: messageText,
        assistantEnabled: assistantConfig.enabled,
        assistantMaster: assistantConfig.masterNumber
      });

      if (!fromNumber || !messageText.trim()) {
        console.log('❌ [WPP] Dados incompletos na mensagem');
        return;
      }

      // Processar com o assistente pessoal
      console.log('🔄 [WPP] Enviando para o assistente processar...');
      const result = await processIncomingMessage(
        fromNumber,
        toNumber,
        messageText,
        sendMessage // Função para enviar resposta
      );
      
      console.log('📋 [WPP] Resultado do processamento:', result);

    } catch (error) {
      console.error('❌ [WPP] Erro ao processar webhook de mensagem:', error);
    }
  }, [processIncomingMessage, connectionState.phoneNumber, assistantConfig, sendMessage]);

  // Log do estado atual quando o hook é usado
  console.log('🔧 [WPP] Hook inicializado:', {
    connectionState,
    assistantConfig: assistantConfig,
    wppConfig
  });

  return {
    connectionState,
    isLoading,
    webhooks,
    wppConfig,
    pinnedConversations,
    conversationsForAnalysis,
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
    transcribeAudio,
    togglePinConversation,
    toggleAnalysisConversation,
    isConversationPinned,
    isConversationMarkedForAnalysis,
    getAnalysisPriority,
    processWebhookMessage,
    assistantConfig,
    configureWebhookOnWPP
  };
}
