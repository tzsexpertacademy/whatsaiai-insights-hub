import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useVoiceTranscription } from './useVoiceTranscription';
import { useConversationPersistence } from './useConversationPersistence';

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
  const { saveConversationToDatabase, verifyConversationInDatabase } = useConversationPersistence();
  
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    phoneNumber: '',
    qrCode: '',
    lastConnected: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [messageHistoryLimit, setMessageHistoryLimit] = useState(50); // Nova configuração
  
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

  // Cache para conversas
  const [cachedChats, setCachedChats] = useState(() => {
    const saved = localStorage.getItem('cached_whatsapp_chats');
    return saved ? JSON.parse(saved) : [];
  });

  // Helper function to format phone number for WPPConnect
  const formatPhoneNumber = (phone: string): string => {
    console.log('📞 Formatando número original:', phone);
    
    if (phone.includes('@g.us')) {
      return phone;
    }
    
    if (phone.includes('@c.us')) {
      return phone;
    }
    
    let cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone + '@c.us';
    
    return formattedPhone;
  };

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
  const togglePinConversation = useCallback(async (chatId: string) => {
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
        
        // Salvar conversa fixada no banco
        if (cachedChats.length > 0) {
          const chatToPin = cachedChats.find(chat => 
            chat.id?.includes(chatId) || chat.contact?.includes(chatId)
          );
          
          if (chatToPin) {
            console.log('💾 Salvando conversa fixada no banco...', chatId);
            
            // Carregar mensagens da conversa fixada
            loadRealMessages(chatId).then(messages => {
              if (messages && messages.length > 0) {
                saveConversationToDatabase(
                  chatId,
                  chatToPin.name || chatToPin.contact || 'Contato',
                  messages,
                  true
                ).then(() => {
                  console.log('✅ Conversa fixada salva no banco:', chatId);
                }).catch(error => {
                  console.error('❌ Erro ao salvar conversa fixada:', error);
                });
              }
            }).catch(error => {
              console.error('❌ Erro ao carregar mensagens para salvar:', error);
            });
          }
        }
        
        toast({
          title: "📌 Conversa fixada",
          description: "Conversa adicionada aos fixados e salva no banco"
        });
      }
      
      localStorage.setItem('pinned_conversations', JSON.stringify(updated));
      return updated;
    });
  }, [toast, saveConversationToDatabase, cachedChats, loadRealMessages]);

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
  }, [toast, wppConfig]);

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
            
            toast({
              title: "🎉 WhatsApp conectado!",
              description: `Conectado com sucesso!`
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
  }, [toast, wppConfig]);

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
    console.log('📤 Enviando mensagem real via WPPConnect...');
    
    try {
      const targetPhone = phone;
      const sendData = {
        phone: targetPhone,
        message: message,
        text: message
      };
      
      let endpoint = `${wppConfig.serverUrl}/api/${wppConfig.sessionName}/send-message`;
      
      let response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.token}`
        },
        body: JSON.stringify(sendData)
      });

      if (!response.ok) {
        endpoint = `${wppConfig.serverUrl}/api/${wppConfig.sessionName}/send-text`;
        
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${wppConfig.token}`
          },
          body: JSON.stringify({
            phone: targetPhone,
            message: message
          })
        });
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
        console.error('❌ Erro ao enviar mensagem:', errorText);
        
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
  }, [toast, wppConfig]);

  // Função para carregar conversas reais
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

  // Função para carregar mensagens de uma conversa
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
        
        // Verificar se conversa fixada está no banco
        const isPinned = pinnedConversations.some(p => p.chatId === contactId);
        if (isPinned) {
          console.log('🔍 Verificando se conversa fixada está no banco...', contactId);
          const isInDatabase = await verifyConversationInDatabase(contactId);
          
          if (!isInDatabase && processedMessages.length > 0) {
            console.log('💾 Conversa fixada não encontrada no banco, salvando...', contactId);
            const chatData = cachedChats.find(chat => 
              chat.id?.includes(contactId) || chat.contact?.includes(contactId)
            );
            
            if (chatData) {
              await saveConversationToDatabase(
                contactId,
                chatData.name || chatData.contact || 'Contato',
                processedMessages,
                true
              );
            }
          }
        }
        
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
  }, [wppConfig, transcribeAudio, messageHistoryLimit, verifyConversationInDatabase, saveConversationToDatabase, pinnedConversations, cachedChats]);

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
    getAnalysisPriority
  };
}
