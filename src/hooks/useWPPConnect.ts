
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
  chatId: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isGroup: boolean;
}

interface Message {
  id: string;
  chatId: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: string;
  fromMe: boolean;
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
    
    if (!config.secretKey || !config.token) {
      throw new Error('Token ou Secret Key não configurado');
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
      
      // Atualizar estado baseado na resposta
      const isConnected = data.status === true || data.status === 'CONNECTED' || data.message === 'Connected';
      
      setSessionStatus(prev => ({
        ...prev,
        isConnected,
        phoneNumber: data.phoneNumber || data.wid?.user || prev.phoneNumber,
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

  // Gerar QR Code
  const generateQRCode = useCallback(async () => {
    try {
      setSessionStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      const config = getWPPConfig();
      console.log('🎯 Gerando QR Code para sessão:', config.sessionName);
      
      const data = await makeWPPRequest(`/api/${config.sessionName}/generate-token`);
      
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

  // Carregar conversas reais
  const loadRealChats = useCallback(async () => {
    try {
      console.log('📱 Carregando conversas reais...');
      
      const config = getWPPConfig();
      const data = await makeWPPRequest(`/api/${config.sessionName}/all-chats`);
      
      if (Array.isArray(data)) {
        const formattedChats: Chat[] = data.map((chat: any) => ({
          chatId: String(chat.id?._serialized || chat.id || chat.chatId || ''),
          name: chat.name || chat.pushname || chat.formattedTitle || 'Sem nome',
          lastMessage: chat.lastMessage?.body || chat.lastMessage || 'Sem mensagens',
          timestamp: chat.t ? new Date(chat.t * 1000).toISOString() : new Date().toISOString(),
          unreadCount: chat.unreadCount || 0,
          isGroup: chat.isGroup || false
        })).filter(chat => chat.chatId && chat.chatId !== '');

        console.log('📋 Conversas formatadas:', formattedChats);
        setChats(formattedChats);
        
        toast({
          title: "Conversas carregadas!",
          description: `${formattedChats.length} conversas encontradas`
        });
        
      } else {
        console.warn('⚠️ Resposta não é array:', data);
        setChats([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      toast({
        title: "Erro ao carregar conversas",
        description: error.message,
        variant: "destructive"
      });
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
          fromMe: msg.fromMe || false
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
    
    // Atualizar mensagens a cada 3 segundos
    const liveInterval = setInterval(() => {
      loadRealMessages(chatId);
    }, 3000);

    // Salvar referência do intervalo
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

  // Verificar status ao montar o componente
  useEffect(() => {
    const config = getWPPConfig();
    if (config.secretKey && config.token) {
      console.log('🚀 Verificando status inicial...');
      checkConnectionStatus();
    }
  }, [checkConnectionStatus]);

  return {
    sessionStatus,
    chats,
    messages,
    isLoadingMessages,
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
    disconnectWhatsApp
  };
}
