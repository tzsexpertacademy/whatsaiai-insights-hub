
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useVoiceTranscription } from '@/hooks/useVoiceTranscription';

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
  const { transcribeAudio, isTranscribing } = useVoiceTranscription();
  
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    phoneNumber: '',
    qrCode: '',
    lastConnected: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Cache de conversas no localStorage
  const [cachedChats, setCachedChats] = useState<any[]>(() => {
    const saved = localStorage.getItem('whatsapp_cached_chats');
    return saved ? JSON.parse(saved) : [];
  });

  const [webhooks, setWebhooks] = useState<WebhookConfig>(() => {
    const saved = localStorage.getItem('whatsapp_webhooks');
    return saved ? JSON.parse(saved) : {
      qrWebhook: '',
      statusWebhook: '',
      sendMessageWebhook: '',
      autoReplyWebhook: ''
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

  // Helper function to format phone number for WPPConnect
  const formatPhoneNumber = (phone: string): string => {
    console.log('📞 Formatando número original:', phone);
    
    // Para grupos, manter o formato original
    if (phone.includes('@g.us')) {
      console.log('📞 É grupo, mantendo formato:', phone);
      return phone;
    }
    
    // Se já tem @c.us, usar como está
    if (phone.includes('@c.us')) {
      console.log('📞 Já tem @c.us, mantendo:', phone);
      return phone;
    }
    
    // Remove caracteres especiais para limpeza
    let cleanPhone = phone.replace(/\D/g, '');
    console.log('📞 Número limpo:', cleanPhone);
    
    // Se não tem @c.us e não é grupo, adicionar @c.us
    const formattedPhone = cleanPhone + '@c.us';
    console.log('📞 Número formatado final:', formattedPhone);
    
    return formattedPhone;
  };

  // Função para transcrever áudio - agora usa o hook especializado
  const transcribeAudioMessage = useCallback(async (audioBase64: string): Promise<string> => {
    try {
      console.log('🎤 Iniciando transcrição de áudio via hook especializado...');
      
      // Usar o hook especializado para transcrição
      const transcription = await transcribeAudio(audioBase64);
      
      if (transcription) {
        console.log('✅ Áudio transcrito com sucesso:', transcription);
        return transcription;
      } else {
        console.error('❌ Erro: Transcrição retornou nula');
        return '[Áudio - transcrição não disponível]';
      }
    } catch (error) {
      console.error('❌ Erro ao transcrever áudio:', error);
      return '[Áudio - erro na transcrição]';
    }
  }, [transcribeAudio]);

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

  // Função para gerar QR Code
  const generateQRCode = useCallback(async () => {
    console.log('🚀 Gerando QR Code WPPConnect REAL...');
    console.log('📱 Configuração atual:', wppConfig);
    setIsLoading(true);
    
    try {
      console.log('📱 Iniciando sessão para obter QR Code...');
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
      
      console.log('📥 Start Session Response status:', startSessionResponse.status);
      
      if (startSessionResponse.ok) {
        const sessionData = await startSessionResponse.json();
        console.log('📱 Sessão iniciada:', sessionData);
        
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
          
          toast({
            title: "✅ Já conectado!",
            description: "WhatsApp já está conectado"
          });
          
          return null;
        }
      } else {
        const errorText = await startSessionResponse.text();
        console.error('❌ Erro ao iniciar sessão:', errorText);
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
  }, [toast, wppConfig]);

  // Função para iniciar polling de status
  const startStatusPolling = useCallback(() => {
    const pollInterval = setInterval(async () => {
      try {
        console.log('🔍 Verificando status da sessão...');
        const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/status-session`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${wppConfig.token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📱 Status atual:', data);
          
          const isConnected = data.state === 'CONNECTED' || 
                             data.status === 'inChat' || 
                             data.status === 'CONNECTED' ||
                             data.connected === true ||
                             data.accountStatus === 'authenticated' ||
                             (data.session && data.session.state === 'CONNECTED');
          
          if (isConnected) {
            console.log('✅ WhatsApp conectado!');
            
            setConnectionState(prev => ({
              ...prev,
              isConnected: true,
              phoneNumber: data.phone || data.number || data.wid || data.session?.phone || 'Conectado',
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
    
    setTimeout(() => {
      clearInterval(pollInterval);
      console.log('⏰ Polling timeout');
    }, 120000);
  }, [toast, wppConfig]);

  // Função para verificar status manual
  const checkConnectionStatus = useCallback(async () => {
    console.log('🔍 Verificação manual do status...');
    
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
        console.log('📱 Status manual:', data);
        
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

  // Função para desconectar WhatsApp
  const disconnectWhatsApp = useCallback(async () => {
    console.log('🔌 Desconectando WhatsApp...');
    
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/logout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
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

  // Função para enviar mensagem - revisada e aprimorada
  const sendMessage = useCallback(async (phone: string, message: string) => {
    console.log('📤 Enviando mensagem real via WPPConnect...');
    console.log('📞 Telefone recebido:', phone);
    console.log('💬 Mensagem:', message);
    
    try {
      // Formatar o número do telefone se necessário
      const targetPhone = formatPhoneNumber(phone);
      console.log('📞 Telefone formatado para envio:', targetPhone);
      
      // Dados básicos para envio com ambos os formatos possíveis
      const sendData = {
        phone: targetPhone,
        chatId: targetPhone, // Usar ambos para maior compatibilidade
        message: message,
        text: message // Alguns endpoints usam text em vez de message
      };
      
      console.log('📤 Dados de envio:', sendData);
      
      // Primeiro tentamos o endpoint /send-message
      let response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/send-message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
        },
        body: JSON.stringify(sendData)
      });

      console.log('📤 Resposta send-message:', response.status);

      // Se falhar, tentamos outros endpoints conhecidos
      if (!response.ok) {
        // Tentar o endpoint /send-text
        console.log('📤 Tentando endpoint send-text...');
        response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/send-text`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${wppConfig.token}`
          },
          body: JSON.stringify(sendData)
        });
        
        console.log('📤 Resposta send-text:', response.status);
      }

      // Se ainda não funcionou, tentar um terceiro formato
      if (!response.ok) {
        console.log('📤 Tentando com formato alternativo...');
        response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/send-message`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${wppConfig.token}`
          },
          body: JSON.stringify({
            to: targetPhone,
            body: message
          })
        });
        
        console.log('📤 Resposta formato alternativo:', response.status);
      }

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Mensagem enviada com sucesso:', result);
        
        toast({
          title: "✅ Mensagem enviada!",
          description: "Mensagem enviada via WPPConnect"
        });
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Erro ao enviar mensagem:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        toast({
          title: "❌ Erro ao enviar mensagem",
          description: `Erro ${response.status}: Verifique o número ou conexão`,
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Erro de conexão ao enviar mensagem:', error);
      
      toast({
        title: "❌ Erro de conexão",
        description: "Não foi possível conectar com o servidor WPPConnect",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, wppConfig, formatPhoneNumber]);

  // Função para carregar conversas reais
  const loadRealChats = useCallback(async () => {
    console.log('📱 Carregando conversas reais da API WPPConnect...');
    
    try {
      // Primeiro, verificar se existe cache local
      if (cachedChats.length > 0) {
        console.log('🗂️ Usando cache local de conversas:', cachedChats.length);
        // Atualizar em segundo plano sem bloquear UI
        setTimeout(() => refreshChatsInBackground(), 500);
        return cachedChats;
      }
      
      // Se não tiver cache, buscar da API
      const chats = await fetchChatsFromAPI();
      
      // Salvar no cache local
      setCachedChats(chats);
      localStorage.setItem('whatsapp_cached_chats', JSON.stringify(chats));
      
      return chats;
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      toast({
        title: "❌ Erro ao carregar conversas",
        description: "Verifique sua conexão e tente novamente",
        variant: "destructive"
      });
      throw error;
    }
  }, [cachedChats]);

  // Função auxiliar para buscar conversas da API
  const fetchChatsFromAPI = useCallback(async () => {
    const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/all-chats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${wppConfig.token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro ao buscar conversas da API:', response.status, errorText);
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log('✅ Resposta da API de conversas:', responseData);
    
    // Extrair array de chats da resposta
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
      console.warn('⚠️ Formato de resposta não reconhecido:', responseData);
      throw new Error('Formato de dados não suportado. Verifique a resposta da API.');
    }
    
    console.log('📋 Chats encontrados:', chatsArray.length);
    return chatsArray;
  }, [wppConfig]);

  // Função para atualizar chats em segundo plano sem bloquear UI
  const refreshChatsInBackground = useCallback(async () => {
    console.log('🔄 Atualizando conversas em segundo plano...');
    
    try {
      const freshChats = await fetchChatsFromAPI();
      console.log('✅ Conversas atualizadas em segundo plano:', freshChats.length);
      
      setCachedChats(freshChats);
      localStorage.setItem('whatsapp_cached_chats', JSON.stringify(freshChats));
    } catch (error) {
      console.error('❌ Erro ao atualizar conversas em segundo plano:', error);
    }
  }, [fetchChatsFromAPI]);

  // Função para carregar mensagens de uma conversa - com suporte a cache e quantidade maior
  const loadRealMessages = useCallback(async (contactId: string) => {
    console.log('📤 Carregando mensagens para:', contactId);
    
    // Chave do cache
    const cacheKey = `whatsapp_messages_${contactId}`;
    
    try {
      // Verificar primeiro se existe em cache
      const cachedMessages = localStorage.getItem(cacheKey);
      
      if (cachedMessages) {
        const parsed = JSON.parse(cachedMessages);
        console.log('🗂️ Mensagens carregadas do cache:', parsed.length);
        
        // Atualizar em segundo plano
        setTimeout(() => refreshMessagesInBackground(contactId, cacheKey), 500);
        
        return parsed;
      }
      
      // Se não tem cache, buscar da API - aumentamos para 100 mensagens
      const messages = await fetchMessagesFromAPI(contactId);
      
      // Salvar no cache
      localStorage.setItem(cacheKey, JSON.stringify(messages));
      
      return messages;
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      toast({
        title: "❌ Erro ao carregar mensagens",
        description: "Verifique sua conexão e tente novamente",
        variant: "destructive"
      });
      throw error;
    }
  }, []);

  // Função auxiliar para buscar mensagens da API
  const fetchMessagesFromAPI = useCallback(async (contactId: string) => {
    // Aumentamos para 100 mensagens no histórico
    const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/get-messages/${contactId}?count=100`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${wppConfig.token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro ao buscar mensagens da API:', response.status, errorText);
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    
    // Extrair array de mensagens da resposta
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
      console.warn('⚠️ Formato de resposta de mensagens não reconhecido:', responseData);
      return [];
    }
    
    // Processar mensagens com transcrição de áudio
    const processedMessages = await Promise.all(
      messagesArray.map(async (msg: any) => {
        let text = msg.body || msg.text || msg.content || 'Mensagem sem texto';
        
        // Verificar se é mensagem de áudio
        if (msg.type === 'audio' || msg.type === 'ptt' || (msg.mimetype && msg.mimetype.includes('audio'))) {
          console.log('🎤 Mensagem de áudio detectada:', msg.id);
          
          if (msg.body && msg.body.startsWith('data:audio')) {
            // Extrair base64 do áudio
            const base64Audio = msg.body.split(',')[1];
            try {
              const transcription = await transcribeAudioMessage(base64Audio);
              text = `🎤 [Áudio]: ${transcription}`;
            } catch (error) {
              text = '🎤 [Áudio - transcrição não disponível]';
            }
          } else if (msg.mediaData && msg.mediaData.base64) {
            try {
              const transcription = await transcribeAudioMessage(msg.mediaData.base64);
              text = `🎤 [Áudio]: ${transcription}`;
            } catch (error) {
              text = '🎤 [Áudio - transcrição não disponível]';
            }
          } else {
            text = '🎤 [Áudio - dados não disponíveis para transcrição]';
          }
        }
        
        return {
          ...msg,
          processedText: text
        };
      })
    );
    
    console.log('📋 Mensagens processadas:', processedMessages.length);
    return processedMessages;
  }, [wppConfig, transcribeAudioMessage]);

  // Função para atualizar mensagens em segundo plano
  const refreshMessagesInBackground = useCallback(async (contactId: string, cacheKey: string) => {
    console.log('🔄 Atualizando mensagens em segundo plano para:', contactId);
    
    try {
      const freshMessages = await fetchMessagesFromAPI(contactId);
      console.log('✅ Mensagens atualizadas em segundo plano:', freshMessages.length);
      
      localStorage.setItem(cacheKey, JSON.stringify(freshMessages));
    } catch (error) {
      console.error('❌ Erro ao atualizar mensagens em segundo plano:', error);
    }
  }, [fetchMessagesFromAPI]);

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
    wppConfig,
    pinnedConversations,
    conversationsForAnalysis,
    updateWebhooks,
    updateWPPConfig,
    generateQRCode,
    checkConnectionStatus,
    disconnectWhatsApp,
    sendMessage,
    loadRealChats,
    loadRealMessages,
    getConnectionStatus,
    isTranscribing,
    // Funções para fixar e marcar para análise
    togglePinConversation,
    toggleAnalysisConversation,
    isConversationPinned,
    isConversationMarkedForAnalysis,
    getAnalysisPriority
  };
}

