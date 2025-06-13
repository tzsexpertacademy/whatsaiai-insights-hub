
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WPPConnectMessage {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: string;
  fromMe: boolean;
  chatId: string;
  isAudio?: boolean;
  status?: string;
}

interface WPPConnectChat {
  chatId: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isGroup: boolean;
}

interface WPPConnectContact {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

interface SessionStatus {
  isConnected: boolean;
  qrCode: string | null;
  isLoading: boolean;
  phoneNumber: string | null;
}

interface WPPConfig {
  sessionName: string;
  serverUrl: string;
  secretKey: string;
  token: string;
  webhookUrl?: string;
}

export function useWPPConnect() {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isConnected: false,
    qrCode: null,
    isLoading: false,
    phoneNumber: null
  });
  const [chats, setChats] = useState<WPPConnectChat[]>([]);
  const [messages, setMessages] = useState<WPPConnectMessage[]>([]);
  const [contacts, setContacts] = useState<WPPConnectContact[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messageHistoryLimit, setMessageHistoryLimit] = useState(50);
  
  const { toast } = useToast();
  const liveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getWPPConfig = useCallback((): WPPConfig => {
    // Buscar do localStorage SEMPRE atualizado
    const savedConfig = {
      sessionName: localStorage.getItem('wpp_session_name') || 'NERDWHATS_AMERICA',
      serverUrl: localStorage.getItem('wpp_server_url') || 'http://localhost:21465',
      secretKey: localStorage.getItem('wpp_secret_key') || '',
      token: localStorage.getItem('wpp_token') || '',
      webhookUrl: localStorage.getItem('wpp_webhook_url') || ''
    };
    
    console.log('🔧 getWPPConfig - Configurações atuais:', {
      sessionName: savedConfig.sessionName,
      serverUrl: savedConfig.serverUrl,
      hasSecretKey: !!savedConfig.secretKey,
      hasToken: !!savedConfig.token,
      secretKeyLength: savedConfig.secretKey.length,
      tokenLength: savedConfig.token.length
    });
    
    return savedConfig;
  }, []);

  const saveWPPConfig = useCallback((config: Partial<WPPConfig>) => {
    console.log('💾 Salvando configuração WPPConnect:', config);
    
    // Salvar no localStorage
    if (config.sessionName !== undefined) localStorage.setItem('wpp_session_name', config.sessionName);
    if (config.serverUrl !== undefined) localStorage.setItem('wpp_server_url', config.serverUrl);
    if (config.secretKey !== undefined) localStorage.setItem('wpp_secret_key', config.secretKey);
    if (config.token !== undefined) localStorage.setItem('wpp_token', config.token);
    if (config.webhookUrl !== undefined) localStorage.setItem('wpp_webhook_url', config.webhookUrl);
    
    console.log('✅ Configuração salva no localStorage');
  }, []);

  const getConnectionStatus = useCallback(() => {
    if (!sessionStatus.isConnected) return 'disconnected';
    return 'connected';
  }, [sessionStatus.isConnected]);

  const sendMessage = useCallback(async (chatId: string, message: string) => {
    console.log('📤 Enviando mensagem via WPPConnect:', { chatId, message });
    
    try {
      const config = getWPPConfig();
      const isGroup = chats.find(chat => chat.chatId === chatId)?.isGroup || false;
      console.log('📋 Tipo de chat:', { chatId, isGroup });

      const endpoint = `${config.serverUrl}/api/${config.sessionName}/send-message`;
      
      let payload;
      if (isGroup) {
        payload = {
          chatId: chatId,
          message: message
        };
      } else {
        const phone = chatId.replace('@c.us', '');
        payload = {
          phone: phone,
          message: message
        };
      }

      console.log('📦 Payload final:', payload);
      console.log('🔑 Usando token:', config.token ? `***${config.token.slice(-4)}` : 'VAZIO');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Mensagem enviada:', result);

      const newMessage: WPPConnectMessage = {
        id: `sent_${Date.now()}`,
        text: message,
        sender: 'user',
        timestamp: new Date().toISOString(),
        fromMe: true,
        chatId: chatId
      };

      setMessages(prev => [...prev, newMessage]);

      toast({
        title: "✅ Mensagem enviada",
        description: isGroup ? "Mensagem enviada para o grupo" : "Mensagem enviada para o contato"
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      toast({
        title: "❌ Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  }, [chats, toast, getWPPConfig]);

  const generateQRCode = useCallback(async () => {
    setSessionStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log('🔄 Gerando QR Code WPPConnect...');
      const config = getWPPConfig();
      
      console.log('🔧 Configurações para QR Code:', {
        sessionName: config.sessionName,
        serverUrl: config.serverUrl,
        hasSecretKey: !!config.secretKey,
        hasToken: !!config.token
      });

      if (!config.token || !config.secretKey) {
        throw new Error('Token ou Secret Key não configurados');
      }
      
      const endpoint = `${config.serverUrl}/api/${config.sessionName}/start-session`;
      console.log('🎯 Endpoint:', endpoint);
      console.log('🔑 Token sendo usado:', config.token ? `***${config.token.slice(-4)}` : 'VAZIO');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('📱 Resposta start-session:', result);

      if (result.status === 'qrReadSuccess') {
        setSessionStatus({
          isConnected: true,
          qrCode: null,
          isLoading: false,
          phoneNumber: result.session
        });
        toast({
          title: "✅ Conectado!",
          description: "WhatsApp conectado com sucesso"
        });
        return true;
      } else if (result.qrcode) {
        setSessionStatus({
          isConnected: false,
          qrCode: result.qrcode,
          isLoading: false,
          phoneNumber: null
        });
        return result.qrcode;
      } else {
        throw new Error('QR Code não disponível');
      }
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
      setSessionStatus({
        isConnected: false,
        qrCode: null,
        isLoading: false,
        phoneNumber: null
      });
      toast({
        title: "❌ Erro na conexão",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  }, [toast, getWPPConfig]);

  const checkConnectionStatus = useCallback(async () => {
    try {
      console.log('🔍 Verificando status da conexão...');
      const config = getWPPConfig();
      
      if (!config.token || !config.secretKey) {
        console.log('⚠️ Token ou Secret Key não configurados');
        setSessionStatus({
          isConnected: false,
          qrCode: null,
          isLoading: false,
          phoneNumber: null
        });
        return false;
      }

      const endpoint = `${config.serverUrl}/api/${config.sessionName}/check-connection-session`;
      console.log('🎯 Verificando endpoint:', endpoint);
      console.log('🔑 Com token:', config.token ? `***${config.token.slice(-4)}` : 'VAZIO');
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na verificação:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('📊 Status da sessão:', result);

      if (result.status === 'connected') {
        setSessionStatus({
          isConnected: true,
          qrCode: null,
          isLoading: false,
          phoneNumber: result.session || 'Conectado'
        });
        return true;
      } else {
        setSessionStatus({
          isConnected: false,
          qrCode: null,
          isLoading: false,
          phoneNumber: null
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      setSessionStatus({
        isConnected: false,
        qrCode: null,
        isLoading: false,
        phoneNumber: null
      });
      return false;
    }
  }, [getWPPConfig]);

  const loadRealChats = useCallback(async () => {
    if (!sessionStatus.isConnected) return [];
    
    setIsLoadingChats(true);
    try {
      console.log('📱 Carregando chats reais...');
      const config = getWPPConfig();
      
      const endpoint = `${config.serverUrl}/api/${config.sessionName}/list-chats`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const result = await response.json();
      console.log('📋 Chats carregados:', result);

      if (result && Array.isArray(result)) {
        const formattedChats: WPPConnectChat[] = result.map((chat: any) => ({
          chatId: chat.id,
          name: chat.name || chat.id,
          lastMessage: chat.lastMessage?.body || 'Sem mensagens',
          timestamp: chat.lastMessage?.timestamp ? new Date(chat.lastMessage.timestamp * 1000).toISOString() : new Date().toISOString(),
          unreadCount: chat.unreadCount || 0,
          isGroup: chat.isGroup || false
        }));

        setChats(formattedChats);
        
        // Converter chats para contatos para compatibilidade
        const formattedContacts: WPPConnectContact[] = formattedChats.map(chat => ({
          id: chat.chatId,
          name: chat.name,
          phone: chat.chatId.replace('@c.us', ''),
          lastMessage: chat.lastMessage,
          timestamp: chat.timestamp,
          unread: chat.unreadCount
        }));
        
        setContacts(formattedContacts);
        console.log('✅ Chats formatados:', formattedChats.length);
        return formattedChats;
      }
      return [];
    } catch (error) {
      console.error('❌ Erro ao carregar chats:', error);
      toast({
        title: "❌ Erro ao carregar chats",
        description: "Não foi possível carregar as conversas",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoadingChats(false);
    }
  }, [sessionStatus.isConnected, toast, getWPPConfig]);

  const loadRealMessages = useCallback(async (chatId: string) => {
    setIsLoadingMessages(true);
    
    try {
      console.log('💬 Carregando mensagens para:', chatId, 'Limite:', messageHistoryLimit);
      const config = getWPPConfig();
      
      const endpoint = `${config.serverUrl}/api/${config.sessionName}/get-messages/${chatId}?count=${messageHistoryLimit}`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const result = await response.json();
      console.log('📨 Mensagens carregadas:', result);

      if (result && Array.isArray(result)) {
        const formattedMessages: WPPConnectMessage[] = result.map((msg: any) => ({
          id: msg.id || `msg_${Date.now()}_${Math.random()}`,
          text: msg.body || msg.text || 'Mensagem sem texto',
          sender: msg.fromMe ? 'user' : 'contact',
          timestamp: msg.timestamp ? new Date(msg.timestamp * 1000).toISOString() : new Date().toISOString(),
          fromMe: msg.fromMe || false,
          chatId: chatId,
          isAudio: msg.isAudio || false,
          status: msg.status || 'sent'
        }));

        setMessages(prev => {
          const filtered = prev.filter(m => m.chatId !== chatId);
          return [...filtered, ...formattedMessages];
        });

        console.log('✅ Mensagens formatadas:', formattedMessages.length);
        return formattedMessages;
      }
      return [];
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      toast({
        title: "❌ Erro ao carregar mensagens",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoadingMessages(false);
    }
  }, [messageHistoryLimit, toast, getWPPConfig]);

  const startLiveMode = useCallback((chatId: string) => {
    console.log('🔴 Iniciando modo live para:', chatId);
    setIsLiveMode(true);
    setCurrentChatId(chatId);
    
    liveIntervalRef.current = setInterval(() => {
      loadRealMessages(chatId);
    }, 3000);
    
    toast({
      title: "🔴 Modo Live Ativo",
      description: "Mensagens sendo atualizadas automaticamente"
    });
  }, [loadRealMessages, toast]);

  const stopLiveMode = useCallback(() => {
    console.log('⏹️ Parando modo live');
    setIsLiveMode(false);
    setCurrentChatId(null);
    
    if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
      liveIntervalRef.current = null;
    }
    
    toast({
      title: "⏹️ Modo Live Desativado",
      description: "Atualizações automáticas paradas"
    });
  }, [toast]);

  const disconnectWhatsApp = useCallback(async () => {
    try {
      console.log('🔌 Desconectando WhatsApp...');
      const config = getWPPConfig();
      
      const endpoint = `${config.serverUrl}/api/${config.sessionName}/close-session`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      setSessionStatus({
        isConnected: false,
        qrCode: null,
        isLoading: false,
        phoneNumber: null
      });
      
      setChats([]);
      setMessages([]);
      setContacts([]);
      stopLiveMode();
      
      toast({
        title: "🔌 Desconectado",
        description: "WhatsApp desconectado com sucesso"
      });
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
      toast({
        title: "❌ Erro ao desconectar",
        description: "Não foi possível desconectar",
        variant: "destructive"
      });
    }
  }, [stopLiveMode, toast, getWPPConfig]);

  const updateMessageHistoryLimit = useCallback((newLimit: number) => {
    setMessageHistoryLimit(newLimit);
    toast({
      title: "📊 Limite atualizado",
      description: `Agora carregando ${newLimit} mensagens por conversa`
    });
  }, [toast]);

  return {
    sessionStatus,
    chats,
    messages,
    contacts,
    isLoadingMessages,
    isLoadingChats,
    isLiveMode,
    currentChatId,
    messageHistoryLimit,
    generateQRCode,
    checkConnectionStatus,
    getConnectionStatus,
    loadRealChats,
    loadRealMessages,
    sendMessage,
    startLiveMode,
    stopLiveMode,
    disconnectWhatsApp,
    updateMessageHistoryLimit,
    getWPPConfig,
    saveWPPConfig
  };
}
