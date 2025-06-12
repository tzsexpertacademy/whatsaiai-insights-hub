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

  // Função para obter configuração WPP
  const getWPPConfig = useCallback((): WPPConfig => {
    return {
      sessionName: localStorage.getItem('wpp_session_name') || 'NERDWHATS_AMERICA',
      serverUrl: localStorage.getItem('wpp_server_url') || 'http://localhost:21465',
      secretKey: localStorage.getItem('wpp_secret_key') || '',
      token: localStorage.getItem('wpp_token') || '',
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
    
    console.log('🔧 Config atual:', {
      sessionName: config.sessionName,
      serverUrl: config.serverUrl,
      hasSecretKey: !!config.secretKey,
      hasToken: !!config.token
    });

    if (!config.secretKey || !config.token) {
      throw new Error('Token ou Secret Key não configurado. Vá em Configurações → WPPConnect');
    }

    const url = `${config.serverUrl}${endpoint}`;
    console.log(`🌐 WPP Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.secretKey}`,
        'X-API-Key': config.token,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ WPP Request Error (${response.status}):`, errorText);
      
      if (response.status === 401) {
        throw new Error('Token/Secret Key inválido. Verifique as configurações em WPPConnect');
      }
      if (response.status === 404) {
        throw new Error('Endpoint não encontrado. Verifique se o WPPConnect está rodando');
      }
      
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ WPP Response:`, data);
    return data;
  }, [getWPPConfig]);

  // Verificar status da conexão
  const checkConnectionStatus = useCallback(async () => {
    try {
      console.log('🔍 Verificando status da sessão WPP...');
      
      const config = getWPPConfig();
      const data = await makeWPPRequest(`/api/${config.sessionName}/check-connection-session`);
      
      console.log('📊 Status da sessão:', data);
      
      // Verificar diferentes formatos de resposta
      const isConnected = data.status === true || 
                         data.status === 'CONNECTED' || 
                         data.message === 'Connected' ||
                         data.connected === true ||
                         (data.session && data.session.status === 'CONNECTED');
      
      setSessionStatus(prev => ({
        ...prev,
        isConnected,
        phoneNumber: data.phoneNumber || data.wid?.user || data.session?.phoneNumber || prev.phoneNumber,
        error: isConnected ? null : 'Sessão não conectada'
      }));

      // Se conectado, carregar conversas automaticamente
      if (isConnected) {
        console.log('✅ Sessão conectada! Carregando conversas...');
        await loadRealChats();
      }

      return isConnected;
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      setSessionStatus(prev => ({
        ...prev,
        isConnected: false,
        error: error.message
      }));
      return false;
    }
  }, [makeWPPRequest, getWPPConfig]);

  // Gerar QR Code - ENDPOINT CORRETO
  const generateQRCode = useCallback(async () => {
    try {
      setSessionStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      const config = getWPPConfig();
      console.log('🎯 Gerando QR Code para sessão:', config.sessionName);
      
      // ENDPOINT CORRETO para gerar QR Code
      const data = await makeWPPRequest(`/api/${config.sessionName}/start-session`);
      
      if (data.status === 'SUCCESS' && data.qrcode) {
        setSessionStatus(prev => ({
          ...prev,
          qrCode: data.qrcode,
          isLoading: false
        }));
        
        toast({
          title: "QR Code gerado!",
          description: "Escaneie com seu WhatsApp Business"
        });

        // Iniciar verificação periódica do status
        const checkInterval = setInterval(async () => {
          const isConnected = await checkConnectionStatus();
          if (isConnected) {
            clearInterval(checkInterval);
            setSessionStatus(prev => ({ ...prev, qrCode: null }));
          }
        }, 3000);

        // Limpar intervalo após 2 minutos
        setTimeout(() => clearInterval(checkInterval), 120000);
        
      } else {
        throw new Error(data.message || 'Falha ao gerar QR Code');
      }
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
      setSessionStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
      
      toast({
        title: "Erro ao gerar QR Code",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [makeWPPRequest, getWPPConfig, toast, checkConnectionStatus]);

  // Carregar conversas reais - ENDPOINT CORRETO
  const loadRealChats = useCallback(async (): Promise<Chat[]> => {
    try {
      setIsLoadingChats(true);
      console.log('📱 Carregando conversas reais...');
      
      const config = getWPPConfig();
      // ENDPOINT CORRETO para buscar conversas
      const data = await makeWPPRequest(`/api/${config.sessionName}/all-chats`);
      
      console.log('📋 Dados brutos das conversas:', data);
      
      if (Array.isArray(data)) {
        const formattedChats: Chat[] = data.map((chat: any) => ({
          id: String(chat.id?._serialized || chat.id || chat.chatId || `chat-${Math.random()}`),
          chatId: String(chat.id?._serialized || chat.id || chat.chatId || ''),
          name: chat.name || chat.pushname || chat.formattedTitle || chat.contact?.name || 'Sem nome',
          lastMessage: chat.lastMessage?.body || chat.lastMessage?.content || chat.lastMessage || 'Sem mensagens',
          timestamp: chat.t ? new Date(chat.t * 1000).toISOString() : new Date().toISOString(),
          unreadCount: chat.unreadCount || 0,
          unread: chat.unreadCount || 0,
          isGroup: chat.isGroup || false,
          phone: chat.id?._serialized || chat.id || ''
        })).filter(chat => chat.chatId && chat.chatId !== '');

        console.log('📋 Conversas formatadas:', formattedChats);
        setChats(formattedChats);
        
        toast({
          title: "Conversas carregadas! 📱",
          description: `${formattedChats.length} conversas encontradas`
        });

        return formattedChats;
        
      } else {
        console.warn('⚠️ Resposta não é array:', data);
        setChats([]);
        return [];
      }
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      toast({
        title: "Erro ao carregar conversas",
        description: error.message,
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
      console.log('💬 Carregando mensagens para:', chatId);
      
      const config = getWPPConfig();
      const data = await makeWPPRequest(`/api/${config.sessionName}/all-messages-in-chat/${encodeURIComponent(chatId)}`);
      
      if (Array.isArray(data)) {
        const formattedMessages: Message[] = data.map((msg: any, index: number) => ({
          id: msg.id?._serialized || msg.id || `msg-${index}`,
          chatId: chatId,
          text: msg.body || msg.content || '',
          sender: msg.fromMe ? 'user' : 'contact',
          timestamp: msg.t ? new Date(msg.t * 1000).toISOString() : new Date().toISOString(),
          fromMe: msg.fromMe || false,
          isAudio: msg.type === 'ptt' || msg.type === 'audio',
          status: msg.ack ? (msg.ack === 1 ? 'sent' : msg.ack === 2 ? 'delivered' : 'read') : undefined
        }));

        setMessages(prev => [
          ...prev.filter(m => m.chatId !== chatId),
          ...formattedMessages
        ]);
        
      } else {
        console.warn('⚠️ Mensagens não é array:', data);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [makeWPPRequest, getWPPConfig, toast]);

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

      if (data.status === 'SUCCESS') {
        // Recarregar mensagens da conversa
        await loadRealMessages(chatId);
        
        toast({
          title: "Mensagem enviada!",
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
      title: "Modo Live ativado",
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
      title: "Modo Live desativado",
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
        title: "WhatsApp desconectado",
        description: "Sessão encerrada com sucesso"
      });
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
      toast({
        title: "Erro ao desconectar",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [makeWPPRequest, getWPPConfig, stopLiveMode, toast]);

  // Função para obter status da conexão
  const getConnectionStatus = useCallback(() => {
    if (!sessionStatus.isConnected) return 'disconnected';
    
    const lastConnected = sessionStatus.phoneNumber ? new Date() : new Date(0);
    const now = new Date();
    const minutesDiff = (now.getTime() - lastConnected.getTime()) / (1000 * 60);
    
    if (minutesDiff > 30) return 'idle';
    return 'active';
  }, [sessionStatus]);

  // Verificar status ao montar o componente
  useEffect(() => {
    const config = getWPPConfig();
    console.log('🚀 Iniciando verificação de status...');
    
    if (config.secretKey && config.token) {
      console.log('🚀 Config encontrada, verificando status...');
      checkConnectionStatus();
    } else {
      console.log('⚠️ Config WPP não encontrada');
      toast({
        title: "Configuração necessária",
        description: "Configure o WPPConnect em Configurações → WPPConnect",
        variant: "destructive"
      });
    }
  }, [checkConnectionStatus, getWPPConfig, toast]);

  return {
    sessionStatus,
    chats,
    contacts: chats, // Alias para compatibilidade
    messages,
    isLoadingMessages,
    isLoadingChats,
    isLiveMode,
    currentChatId,
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
    getConnectionStatus
  };
}
