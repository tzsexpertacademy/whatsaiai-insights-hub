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
      secretKey: localStorage.getItem('wpp_secret_key') || 'THISISMYSECURETOKEN',
      token: localStorage.getItem('wpp_token') || '$2b$10$S1aK9kqjlklpoEHjttgnKuaZOw0lTb.c8xSYcQhKjXEUYKnMrH3s2',
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

  // Função centralizada para fazer requisições - CORRIGIDA BASEADA NAS SUAS IMAGENS
  const makeWPPRequest = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const config = getWPPConfig();
    
    console.log('🔧 Config usado:', {
      sessionName: config.sessionName,
      serverUrl: config.serverUrl,
      secretKey: config.secretKey,
      token: config.token ? `***${config.token.slice(-8)}` : 'VAZIO'
    });

    const url = `${config.serverUrl}${endpoint}`;
    console.log(`🌐 WPP Request: ${options.method || 'GET'} ${url}`);

    // HEADERS CORRETOS BASEADOS NAS SUAS IMAGENS
    const headers = {
      'Content-Type': 'application/json',
      'accept': '*/*',
      ...options.headers,
    };

    // Adicionar autenticação baseada no endpoint
    if (endpoint.includes('/start-all')) {
      // Para /start-all usar secretkey
      headers['Authorization'] = `Bearer ${config.secretKey}`;
    } else {
      // Para outros endpoints usar token
      headers['Authorization'] = `Bearer ${config.token}`;
    }

    console.log('📝 Headers enviados:', {
      ...headers,
      'Authorization': `Bearer ***${headers['Authorization'].slice(-8)}`
    });

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
  }, [getWPPConfig]);

  // Verificar status da conexão - ENDPOINT CORRETO
  const checkConnectionStatus = useCallback(async () => {
    try {
      console.log('🔍 Verificando status da sessão...');
      
      const config = getWPPConfig();
      // ENDPOINT CORRETO baseado nas suas imagens
      const data = await makeWPPRequest(`/api/${config.sessionName}/qrcode-session`);
      
      console.log('📊 Status da sessão:', data);
      
      const isConnected = data.status === 'CONNECTED' || 
                         data.connected === true ||
                         (data.session && data.session.status === 'CONNECTED');
      
      setSessionStatus(prev => ({
        ...prev,
        isConnected,
        phoneNumber: data.phoneNumber || data.wid?.user || prev.phoneNumber,
        error: isConnected ? null : 'Sessão não conectada'
      }));

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

  // Gerar QR Code - MÉTODO POST CORRETO
  const generateQRCode = useCallback(async () => {
    try {
      setSessionStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      const config = getWPPConfig();
      console.log('🎯 Gerando QR Code para sessão:', config.sessionName);
      
      // MÉTODO POST CORRETO baseado nas suas imagens
      const data = await makeWPPRequest(`/api/${config.sessionName}/start-session`, {
        method: 'POST',
        body: JSON.stringify({
          "webhook": "",
          "waitQrCode": true
        })
      });
      
      console.log('📱 Resposta start-session:', data);
      
      if (data.status === 'success' && data.qrcode) {
        setSessionStatus(prev => ({
          ...prev,
          qrCode: data.qrcode,
          isLoading: false
        }));
        
        toast({
          title: "✅ QR Code gerado!",
          description: "Escaneie com seu WhatsApp Business"
        });

        // Verificar status periodicamente
        const checkInterval = setInterval(async () => {
          const isConnected = await checkConnectionStatus();
          if (isConnected) {
            clearInterval(checkInterval);
            setSessionStatus(prev => ({ ...prev, qrCode: null }));
          }
        }, 3000);

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
        title: "❌ Erro ao gerar QR Code",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [makeWPPRequest, getWPPConfig, toast, checkConnectionStatus]);

  // Carregar conversas reais - ENDPOINT CORRETO
  const loadRealChats = useCallback(async (): Promise<Chat[]> => {
    try {
      setIsLoadingChats(true);
      console.log('📱 Carregando conversas...');
      
      const config = getWPPConfig();
      
      // USAR O ENDPOINT /start-all COMO NAS SUAS IMAGENS
      const data = await makeWPPRequest(`/api/${config.secretKey}/start-all?session=${config.sessionName}&authorization=authorization`);
      
      console.log('📋 Dados das conversas:', data);
      
      // Se start-all funcionou, agora buscar conversas
      const chatsData = await makeWPPRequest(`/api/${config.sessionName}/all-chats`);
      
      if (Array.isArray(chatsData)) {
        const formattedChats: Chat[] = chatsData.map((chat: any) => ({
          id: String(chat.id?._serialized || chat.id || `chat-${Math.random()}`),
          chatId: String(chat.id?._serialized || chat.id || ''),
          name: chat.name || chat.pushname || chat.formattedTitle || 'Sem nome',
          lastMessage: chat.lastMessage?.body || 'Sem mensagens',
          timestamp: chat.t ? new Date(chat.t * 1000).toISOString() : new Date().toISOString(),
          unreadCount: chat.unreadCount || 0,
          unread: chat.unreadCount || 0,
          isGroup: chat.isGroup || false,
          phone: chat.id?._serialized || chat.id || ''
        })).filter(chat => chat.chatId);

        console.log('📋 Conversas formatadas:', formattedChats);
        setChats(formattedChats);
        
        toast({
          title: "✅ Conversas carregadas!",
          description: `${formattedChats.length} conversas encontradas`
        });

        return formattedChats;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      toast({
        title: "❌ Erro ao carregar conversas",
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
      }
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
    console.log('🚀 Iniciando verificação automática...');
    
    if (config.secretKey && config.token) {
      console.log('🚀 Config encontrada, verificando status...');
      checkConnectionStatus();
    } else {
      console.log('⚠️ Config WPP não encontrada');
      toast({
        title: "⚙️ Configuração necessária",
        description: "Configure o WPPConnect nas configurações",
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
