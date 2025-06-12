import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WPPConfig {
  sessionName: string;
  serverUrl: string;
  secretKey: string;
  token: string;
  webhookUrl: string;
}

interface SessionStatus {
  isConnected: boolean;
  isLoading: boolean;
  qrCode: string | null;
  phoneNumber: string | null;
  error: string | null;
}

interface Chat {
  id: string;
  chatId: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isGroup: boolean;
  phone: string;
  unread: number;
}

interface Message {
  id: string;
  chatId: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: string;
  fromMe: boolean;
  isAudio?: boolean;
  status?: string;
}

export function useWPPConnect() {
  const { toast } = useToast();
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isConnected: false,
    isLoading: false,
    qrCode: null,
    phoneNumber: null,
    error: null
  });

  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messageHistoryLimit, setMessageHistoryLimit] = useState(50); // Novo estado para controle de mensagens

  // Função para obter configuração WPP
  const getWPPConfig = useCallback((): WPPConfig => {
    return {
      sessionName: localStorage.getItem('wpp_session_name') || 'NERDWHATS_AMERICA',
      serverUrl: localStorage.getItem('wpp_server_url') || 'http://localhost:21465',
      secretKey: localStorage.getItem('wpp_secret_key') || 'THISISMYSECURETOKEN',
      token: localStorage.getItem('wpp_token') || '$2b$10$S1aK9qjlklpoEHjttgnKuaZOw0lTb.c8xSYcQhKjXEUYKnMrH3s2',
      webhookUrl: localStorage.getItem('wpp_webhook_url') || ''
    };
  }, []);

  // Função para salvar configuração WPP
  const saveWPPConfig = useCallback((config: Partial<WPPConfig>): boolean => {
    try {
      if (config.sessionName !== undefined) {
        localStorage.setItem('wpp_session_name', config.sessionName);
      }
      if (config.serverUrl !== undefined) {
        localStorage.setItem('wpp_server_url', config.serverUrl);
      }
      if (config.secretKey !== undefined) {
        localStorage.setItem('wpp_secret_key', config.secretKey);
      }
      if (config.token !== undefined) {
        localStorage.setItem('wpp_token', config.token);
      }
      if (config.webhookUrl !== undefined) {
        localStorage.setItem('wpp_webhook_url', config.webhookUrl);
      }
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar config WPP:', error);
      return false;
    }
  }, []);

  // Função centralizada para fazer requisições
  const makeWPPRequest = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const config = getWPPConfig();
    
    console.log('🔧 Config usado:', {
      sessionName: config.sessionName,
      serverUrl: config.serverUrl,
      secretKey: config.secretKey ? `***${config.secretKey.slice(-8)}` : 'VAZIO',
      token: config.token ? `***${config.token.slice(-8)}` : 'VAZIO'
    });

    const url = `${config.serverUrl}${endpoint}`;
    console.log(`🌐 WPP Request: ${options.method || 'GET'} ${url}`);

    const headers = {
      'Content-Type': 'application/json',
      'accept': '*/*',
      'Authorization': `Bearer ${config.token}`,
      ...options.headers,
    };

    console.log('📝 Headers enviados:', {
      ...headers,
      'Authorization': `Bearer ***${config.token.slice(-8)}`
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`📊 Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ WPP Request Error (${response.status}):`, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ WPP Response:`, data);
      return data;
    } catch (error) {
      console.error('❌ Erro na requisição WPP:', error);
      throw error;
    }
  }, [getWPPConfig]);

  // Verificar status da conexão com melhor detecção
  const checkConnectionStatus = useCallback(async () => {
    try {
      console.log('🔍 Verificando status da sessão...');
      
      const config = getWPPConfig();
      const data = await makeWPPRequest(`/api/${config.sessionName}/status-session`);
      
      console.log('📊 Status da sessão completo:', JSON.stringify(data, null, 2));
      
      // Detectar se está sincronizando
      const isSyncing = data.status === 'INITIALIZING' || 
                       data.state === 'INITIALIZING' ||
                       data.status === 'SYNCING' ||
                       data.state === 'SYNCING' ||
                       data.status === 'STARTING' ||
                       data.state === 'STARTING';
      
      // Detectar se está conectado
      const isConnected = data.status === 'CONNECTED' || 
                         data.connected === true ||
                         data.state === 'CONNECTED' ||
                         data.session?.status === 'CONNECTED' ||
                         data.session?.state === 'CONNECTED';
      
      // Melhor extração do número de telefone
      const phoneNumber = data.phoneNumber || 
                         data.wid?.user || 
                         data.session?.phoneNumber ||
                         data.session?.wid?.user ||
                         data.me?.user ||
                         sessionStatus.phoneNumber;
      
      console.log('🔍 Estado detectado:', { isConnected, isSyncing, phoneNumber });
      
      if (isSyncing) {
        setSessionStatus(prev => ({
          ...prev,
          isConnected: false,
          isLoading: true,
          phoneNumber,
          error: 'Sincronizando WhatsApp...'
        }));
        
        console.log('🔄 WhatsApp sincronizando, aguardando...');
        
        // Verificar novamente em 3 segundos se estiver sincronizando
        setTimeout(() => {
          checkConnectionStatus();
        }, 3000);
        
        return false;
      }
      
      setSessionStatus(prev => ({
        ...prev,
        isConnected,
        isLoading: false,
        phoneNumber,
        error: isConnected ? null : 'Sessão não conectada'
      }));

      if (isConnected) {
        console.log('✅ Sessão conectada! Tentando carregar conversas...');
        // Aguardar um pouco para garantir que a sessão está estável
        setTimeout(() => {
          loadRealChats();
        }, 2000);
      }

      return isConnected;
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      setSessionStatus(prev => ({
        ...prev,
        isConnected: false,
        isLoading: false,
        error: error.message
      }));
      return false;
    }
  }, [makeWPPRequest, getWPPConfig]);

  // Gerar QR Code
  const generateQRCode = useCallback(async () => {
    try {
      setSessionStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      const config = getWPPConfig();
      console.log('🎯 Gerando QR Code para sessão:', config.sessionName);
      
      // Primeiro tentar verificar se já está conectado
      const statusData = await makeWPPRequest(`/api/${config.sessionName}/status-session`);
      console.log('📱 Status antes de gerar QR:', statusData);
      
      if (statusData.status === 'CONNECTED' || statusData.connected === true) {
        console.log('✅ Já conectado, não precisa de QR Code');
        setSessionStatus(prev => ({
          ...prev,
          isConnected: true,
          isLoading: false,
          phoneNumber: statusData.phoneNumber || statusData.wid?.user || statusData.session?.phoneNumber,
          qrCode: null
        }));
        
        toast({
          title: "✅ WhatsApp já conectado!",
          description: "Sua sessão já está ativa, carregando conversas..."
        });
        
        await loadRealChats();
        return;
      }
      
      // Se não está conectado, gerar QR Code
      const qrData = await makeWPPRequest(`/api/${config.sessionName}/start-session`, {
        method: 'POST',
        body: JSON.stringify({
          "webhook": config.webhookUrl || "",
          "waitQrCode": true
        })
      });
      
      console.log('📱 Resposta start-session:', qrData);
      
      // Verificar se retornou QR Code ou se já está conectado
      if (qrData.status === 'CONNECTED' || qrData.connected === true) {
        console.log('✅ Conectou durante a geração do QR Code');
        setSessionStatus(prev => ({
          ...prev,
          isConnected: true,
          isLoading: false,
          phoneNumber: qrData.phoneNumber || qrData.wid?.user,
          qrCode: null
        }));
        
        toast({
          title: "✅ WhatsApp conectado!",
          description: "Conexão estabelecida com sucesso"
        });
        
        await loadRealChats();
        return;
      }
      
      if (qrData.qrcode || qrData.qr) {
        const qrCodeData = qrData.qrcode || qrData.qr;
        setSessionStatus(prev => ({
          ...prev,
          qrCode: qrCodeData,
          isLoading: false
        }));
        
        toast({
          title: "✅ QR Code gerado!",
          description: "Escaneie com seu WhatsApp Business"
        });

        // Verificar status periodicamente com intervalo mais frequente
        const checkInterval = setInterval(async () => {
          const isConnected = await checkConnectionStatus();
          if (isConnected) {
            clearInterval(checkInterval);
            setSessionStatus(prev => ({ ...prev, qrCode: null }));
            toast({
              title: "🎉 WhatsApp conectado!",
              description: "Carregando suas conversas..."
            });
          }
        }, 2000); // Verificar a cada 2 segundos

        setTimeout(() => {
          clearInterval(checkInterval);
          console.log('⏱️ Timeout na verificação do QR Code');
        }, 120000);
        
      } else {
        throw new Error('QR Code não encontrado na resposta da API');
      }
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
      setSessionStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
      
      toast({
        title: "❌ Erro ao gerar QR Code",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [makeWPPRequest, getWPPConfig, toast, checkConnectionStatus]);

  // Carregar conversas reais com melhor tratamento de erros
  const loadRealChats = useCallback(async (): Promise<Chat[]> => {
    try {
      setIsLoadingChats(true);
      console.log('📱 Carregando conversas...');
      
      const config = getWPPConfig();
      
      // Use only the all-chats endpoint that we know works
      console.log(`🔍 Carregando de: /api/${config.sessionName}/all-chats`);
      const response = await makeWPPRequest(`/api/${config.sessionName}/all-chats`);
      
      console.log('✅ Resposta completa da API:', response);
      
      // Handle the API response structure
      let chatsData;
      if (response && response.response && Array.isArray(response.response)) {
        chatsData = response.response;
      } else if (response && Array.isArray(response)) {
        chatsData = response;
      } else {
        console.error('❌ Formato inesperado da resposta:', response);
        throw new Error('Formato de resposta inválido da API');
      }
      
      console.log('📋 Dados das conversas processados:', chatsData);
      
      if (chatsData.length === 0) {
        console.log('📭 Nenhuma conversa encontrada (array vazio)');
        setChats([]);
        toast({
          title: "📭 Nenhuma conversa",
          description: "Não há conversas no momento. Inicie uma conversa no WhatsApp!"
        });
        return [];
      }
      
      const formattedChats: Chat[] = chatsData.map((chat: any, index: number) => ({
        id: String(chat.id?._serialized || chat.id || `chat-${index}`),
        chatId: String(chat.id?._serialized || chat.id || ''),
        name: chat.name || chat.pushname || chat.formattedTitle || chat.contact?.name || 'Sem nome',
        lastMessage: chat.lastMessage?.body || chat.lastMessage?.content || 'Sem mensagens',
        timestamp: chat.t ? new Date(chat.t * 1000).toISOString() : 
                   chat.lastMessage?.t ? new Date(chat.lastMessage.t * 1000).toISOString() :
                   new Date().toISOString(),
        unreadCount: chat.unreadCount || 0,
        unread: chat.unreadCount || 0,
        isGroup: chat.isGroup || false,
        phone: chat.id?._serialized || chat.id || ''
      })).filter(chat => chat.chatId);

      console.log(`📋 ${formattedChats.length} conversas formatadas:`, formattedChats);
      setChats(formattedChats);
      
      toast({
        title: "🎉 Conversas carregadas!",
        description: `${formattedChats.length} conversas encontradas`
      });

      return formattedChats;
      
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      toast({
        title: "❌ Erro ao carregar conversas",
        description: `${error.message}. Verifique se o WPPConnect está funcionando.`,
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoadingChats(false);
    }
  }, [makeWPPRequest, getWPPConfig, toast]);

  // Carregar mensagens de uma conversa
  const loadRealMessages = useCallback(async (chatId: string) => {
    try {
      setIsLoadingMessages(true);
      console.log('💬 Carregando mensagens para:', chatId, 'com limite:', messageHistoryLimit);
      
      const config = getWPPConfig();
      
      // Tentar diferentes endpoints para mensagens
      let messagesData;
      const endpoints = [
        `/api/${config.sessionName}/all-messages-in-chat/${encodeURIComponent(chatId)}`,
        `/api/${config.sessionName}/get-messages/${encodeURIComponent(chatId)}`,
        `/api/${config.sessionName}/chat-messages/${encodeURIComponent(chatId)}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Tentando carregar mensagens de: ${endpoint}`);
          
          // Para alguns endpoints, precisamos enviar dados no body
          if (endpoint.includes('get-messages') || endpoint.includes('chat-messages')) {
            messagesData = await makeWPPRequest(endpoint, {
              method: 'POST',
              body: JSON.stringify({
                chatId: chatId,
                count: messageHistoryLimit,
                page: 1
              })
            });
          } else {
            // Para o endpoint all-messages-in-chat, usar GET com query params
            const urlWithParams = `${endpoint}?count=${messageHistoryLimit}`;
            messagesData = await makeWPPRequest(urlWithParams);
          }
          
          console.log(`✅ Resposta de mensagens de ${endpoint}:`, messagesData);
          
          // Verificar se obtivemos dados válidos
          if (messagesData) {
            // Extrair array de mensagens da resposta
            if (Array.isArray(messagesData)) {
              break;
            } else if (messagesData.messages && Array.isArray(messagesData.messages)) {
              messagesData = messagesData.messages;
              break;
            } else if (messagesData.data && Array.isArray(messagesData.data)) {
              messagesData = messagesData.data;
              break;
            } else if (messagesData.response && Array.isArray(messagesData.response)) {
              messagesData = messagesData.response;
              break;
            }
          }
          
        } catch (error) {
          console.log(`❌ Falhou endpoint de mensagens ${endpoint}:`, error.message);
          if (endpoint === endpoints[endpoints.length - 1]) {
            throw new Error(`Falha ao carregar mensagens. Último erro: ${error.message}`);
          }
        }
      }
      
      if (!Array.isArray(messagesData)) {
        console.error('❌ Nenhum endpoint de mensagens funcionou:', messagesData);
        throw new Error('Não foi possível carregar as mensagens desta conversa');
      }

      console.log(`📬 ${messagesData.length} mensagens encontradas para ${chatId}`);

      if (messagesData.length === 0) {
        console.log('📭 Nenhuma mensagem encontrada para esta conversa');
        setMessages(prev => prev.filter(m => m.chatId !== chatId));
        
        toast({
          title: "📭 Conversa vazia",
          description: "Esta conversa não possui mensagens ainda"
        });
        return;
      }

      const formattedMessages: Message[] = messagesData.map((msg: any, index: number) => ({
        id: msg.id?._serialized || msg.id || `msg-${chatId}-${index}`,
        chatId: chatId,
        text: msg.body || msg.content || msg.text || msg.message || 'Mensagem sem texto',
        sender: msg.fromMe ? 'user' : 'contact',
        timestamp: msg.t ? new Date(msg.t * 1000).toISOString() : 
                   msg.timestamp ? new Date(msg.timestamp * 1000).toISOString() :
                   msg.date ? new Date(msg.date).toISOString() :
                   new Date().toISOString(),
        fromMe: msg.fromMe || false,
        isAudio: msg.type === 'ptt' || msg.type === 'audio',
        status: msg.ack ? (msg.ack === 1 ? 'sent' : msg.ack === 2 ? 'delivered' : 'read') : undefined
      }));

      // Ordenar mensagens por timestamp
      formattedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      console.log(`📋 ${formattedMessages.length} mensagens formatadas para ${chatId}:`, formattedMessages.slice(0, 3));

      setMessages(prev => [
        ...prev.filter(m => m.chatId !== chatId),
        ...formattedMessages
      ]);

      toast({
        title: "✅ Mensagens carregadas!",
        description: `${formattedMessages.length} mensagens carregadas`
      });

    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      toast({
        title: "❌ Erro ao carregar mensagens",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [makeWPPRequest, getWPPConfig, toast, messageHistoryLimit]);

  // Enviar mensagem
  const sendMessage = useCallback(async (chatId: string, message: string) => {
    try {
      console.log('📤 Enviando mensagem:', { chatId, message });
      
      const config = getWPPConfig();
      const data = await makeWPPRequest(`/api/${config.sessionName}/send-message`, {
        method: 'POST',
        body: JSON.stringify({
          chatId: chatId,
          message: message
        })
      });

      if (data.status === 'success' || data.success) {
        await loadRealMessages(chatId);
        toast({
          title: "✅ Mensagem enviada!",
          description: "A mensagem foi enviada com sucesso"
        });
      } else {
        throw new Error(data.message || 'Falha ao enviar mensagem');
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }, [makeWPPRequest, getWPPConfig, loadRealMessages, toast]);

  // Iniciar modo live
  const startLiveMode = useCallback((chatId: string) => {
    setIsLiveMode(true);
    setCurrentChatId(chatId);
    
    const liveInterval = setInterval(() => {
      loadRealMessages(chatId);
    }, 3000);

    (window as any).wppLiveInterval = liveInterval;
    
    toast({
      title: "🔴 Modo Live ativado",
      description: "Mensagens serão atualizadas automaticamente"
    });
  }, [loadRealMessages, toast]);

  // Parar modo live
  const stopLiveMode = useCallback(() => {
    setIsLiveMode(false);
    setCurrentChatId(null);
    
    if ((window as any).wppLiveInterval) {
      clearInterval((window as any).wppLiveInterval);
      (window as any).wppLiveInterval = null;
    }
    
    toast({
      title: "⏹️ Modo Live desativado",
      description: "Atualizações automáticas pausadas"
    });
  }, [toast]);

  // Desconectar WhatsApp
  const disconnectWhatsApp = useCallback(async () => {
    try {
      const config = getWPPConfig();
      await makeWPPRequest(`/api/${config.sessionName}/logout-session`, {
        method: 'POST'
      });
      
      setSessionStatus({
        isConnected: false,
        isLoading: false,
        qrCode: null,
        phoneNumber: null,
        error: null
      });
      
      setChats([]);
      setMessages([]);
      stopLiveMode();
      
      toast({
        title: "📱 WhatsApp desconectado",
        description: "Sessão encerrada com sucesso"
      });
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
      toast({
        title: "❌ Erro ao desconectar",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [makeWPPRequest, getWPPConfig, stopLiveMode, toast]);

  // Função para obter status da conexão
  const getConnectionStatus = useCallback(() => {
    if (sessionStatus.isLoading) return 'syncing';
    if (!sessionStatus.isConnected) return 'disconnected';
    
    const lastConnected = sessionStatus.phoneNumber ? new Date() : new Date(0);
    const now = new Date();
    const minutesDiff = (now.getTime() - lastConnected.getTime()) / (1000 * 60);
    
    if (minutesDiff > 30) return 'idle';
    return 'active';
  }, [sessionStatus]);

  // Verificação automática melhorada ao montar o componente
  useEffect(() => {
    const config = getWPPConfig();
    console.log('🚀 Iniciando verificação automática melhorada...');
    
    if (config.secretKey && config.token) {
      console.log('🚀 Config encontrada, verificando status em 1 segundo...');
      // Aguardar um pouco para o componente terminar de montar
      const timer = setTimeout(() => {
        checkConnectionStatus();
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      console.log('⚠️ Config WPP não encontrada');
    }
  }, [checkConnectionStatus, getWPPConfig]);

  // Função para atualizar limite de mensagens
  const updateMessageHistoryLimit = useCallback((newLimit: number) => {
    console.log('📊 Atualizando limite de mensagens para:', newLimit);
    setMessageHistoryLimit(newLimit);
    
    // Se há uma conversa selecionada, recarregar mensagens com novo limite
    if (currentChatId) {
      console.log('🔄 Recarregando mensagens da conversa atual com novo limite');
      setTimeout(() => {
        loadRealMessages(currentChatId);
      }, 500);
    }
    
    toast({
      title: "📊 Limite atualizado",
      description: `Agora carregando ${newLimit} mensagens por conversa`
    });
  }, [currentChatId, loadRealMessages, toast]);

  return {
    sessionStatus,
    chats,
    contacts: chats, // Alias para compatibilidade
    messages,
    isLoadingMessages,
    isLoadingChats,
    isLiveMode,
    currentChatId,
    messageHistoryLimit, // Novo retorno
    getWPPConfig,
    saveWPPConfig,
    generateQRCode,
    checkConnectionStatus,
    loadRealChats,
    loadRealMessages,
    sendMessage,
    startLiveMode,
    stopLiveMode,
    disconnectWhatsApp,
    getConnectionStatus,
    updateMessageHistoryLimit // Nova função
  };
}
