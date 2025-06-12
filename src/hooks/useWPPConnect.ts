import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useClientConfig } from '@/contexts/ClientConfigContext';

interface WPPConnectConfig {
  serverUrl: string;
  sessionName: string;
  secretKey: string;
  webhookUrl?: string;
}

interface SessionStatus {
  isConnected: boolean;
  phoneNumber: string;
  qrCode: string;
  isLoading: boolean;
  sessionName: string;
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
  text: string;
  sender: 'user' | 'contact';
  timestamp: string;
  chatId: string;
}

export function useWPPConnect() {
  const { config, updateConfig } = useClientConfig();
  const { toast } = useToast();

  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isConnected: false,
    phoneNumber: '',
    qrCode: '',
    isLoading: false,
    sessionName: ''
  });

  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // FORÇAR LOCALHOST - função para garantir que sempre use localhost
  const forceLocalhost = useCallback((url: string): string => {
    console.log('🔧 URL original:', url);
    
    // Se contém IP local (192.168.x.x), força localhost
    if (url.includes('192.168.')) {
      const localhostUrl = 'http://localhost:21465';
      console.log('🔄 Convertendo IP local para localhost:', localhostUrl);
      return localhostUrl;
    }
    
    // Se não é localhost, força localhost
    if (!url.includes('localhost')) {
      const localhostUrl = 'http://localhost:21465';
      console.log('🔄 Forçando localhost:', localhostUrl);
      return localhostUrl;
    }
    
    console.log('✅ URL já é localhost:', url);
    return url;
  }, []);

  // Obter configuração do WPPConnect
  const getWPPConfig = useCallback((): WPPConnectConfig => {
    const defaultConfig = { 
      serverUrl: 'http://localhost:21465', 
      sessionName: 'NERDWHATS_AMERICA',
      secretKey: 'THISISMYSECURETOKEN',
      webhookUrl: ''
    };
    
    console.log('📋 Config atual:', config?.whatsapp?.wppconnect);
    
    if (!config?.whatsapp?.wppconnect) {
      console.log('⚠️ Usando config padrão');
      return defaultConfig;
    }
    
    const rawConfig = {
      serverUrl: config.whatsapp.wppconnect.serverUrl || 'http://localhost:21465',
      sessionName: config.whatsapp.wppconnect.sessionName || 'NERDWHATS_AMERICA',
      secretKey: config.whatsapp.wppconnect.secretKey || 'THISISMYSECURETOKEN',
      webhookUrl: config.whatsapp.wppconnect.webhookUrl || ''
    };
    
    // SEMPRE força localhost na serverUrl
    const finalConfig = {
      ...rawConfig,
      serverUrl: forceLocalhost(rawConfig.serverUrl)
    };
    
    console.log('🎯 Config final (forçado localhost):', finalConfig);
    return finalConfig;
  }, [config, forceLocalhost]);

  // Salvar configuração do WPPConnect
  const saveWPPConfig = useCallback((newConfig: Partial<WPPConnectConfig>) => {
    console.log('💾 Salvando config:', newConfig);
    
    if (!config?.whatsapp) return;
    
    const currentWhatsapp = config.whatsapp;
    const currentWPP = currentWhatsapp.wppconnect || { 
      serverUrl: 'http://localhost:21465', 
      sessionName: 'NERDWHATS_AMERICA',
      secretKey: 'THISISMYSECURETOKEN',
      webhookUrl: ''
    };
    
    // SEMPRE força localhost antes de salvar
    const configToSave = {
      ...currentWPP,
      ...newConfig
    };
    
    if (configToSave.serverUrl) {
      configToSave.serverUrl = forceLocalhost(configToSave.serverUrl);
    }
    
    console.log('💾 Config que será salvo (localhost forçado):', configToSave);
    
    updateConfig('whatsapp', {
      ...currentWhatsapp,
      wppconnect: configToSave
    });
  }, [config, updateConfig, forceLocalhost]);

  // Fazer requisição com tratamento de erro melhorado
  const makeRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    const wppConfig = getWPPConfig();
    
    console.log('📡 Fazendo requisição para:', url);
    console.log('🔑 Usando token:', wppConfig.secretKey);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.secretKey}`,
          ...options.headers
        }
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta:', errorText);
        
        // Tentar parsear como JSON para ver se tem mais detalhes
        try {
          const errorJson = JSON.parse(errorText);
          console.error('❌ Erro JSON:', errorJson);
          throw new Error(`Erro ${response.status}: ${errorJson.message || errorText}`);
        } catch {
          throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Resposta recebida:', data);
      return data;
    } catch (error) {
      console.error('❌ ERRO COMPLETO na requisição:', error);
      throw error;
    }
  }, [getWPPConfig]);

  // Criar nova sessão
  const createSession = useCallback(async () => {
    const wppConfig = getWPPConfig();
    console.log('🚀 Criando sessão com config:', wppConfig);
    
    try {
      setSessionStatus(prev => ({ ...prev, isLoading: true }));
      
      const endpoint = `${wppConfig.serverUrl}/api/${wppConfig.sessionName}/start-session`;
      
      await makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          webhook: '',
          waitQrCode: true
        })
      });
      
      // Aguardar QR Code aparecer
      setTimeout(() => {
        getQRCode();
      }, 2000);
      
    } catch (error) {
      console.error('❌ ERRO ao criar sessão:', error);
      setSessionStatus(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Erro ao criar sessão",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    }
  }, [getWPPConfig, makeRequest, toast]);

  // Obter QR Code
  const getQRCode = useCallback(async () => {
    const wppConfig = getWPPConfig();
    console.log('📱 Obtendo QR Code com config:', wppConfig);
    
    try {
      const endpoint = `${wppConfig.serverUrl}/api/${wppConfig.sessionName}/qr-code`;
      
      const data = await makeRequest(endpoint);
      
      if (data.qrcode || data.qr) {
        setSessionStatus(prev => ({
          ...prev,
          qrCode: data.qrcode || data.qr,
          sessionName: wppConfig.sessionName,
          isLoading: false
        }));
        
        toast({
          title: "QR Code gerado!",
          description: "Escaneie com seu WhatsApp para conectar"
        });
        
        // Verificar status da sessão periodicamente
        startStatusPolling();
      }
    } catch (error) {
      console.error('❌ ERRO ao obter QR Code:', error);
      setSessionStatus(prev => ({ ...prev, isLoading: false }));
    }
  }, [getWPPConfig, makeRequest, toast]);

  // Polling para verificar status
  const startStatusPolling = useCallback(() => {
    const pollInterval = setInterval(async () => {
      const isConnected = await checkSessionStatus();
      if (isConnected) {
        clearInterval(pollInterval);
      }
    }, 3000);
    
    // Parar polling após 2 minutos
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 120000);
  }, []);

  // Verificar status da sessão
  const checkSessionStatus = useCallback(async () => {
    const wppConfig = getWPPConfig();
    
    try {
      const endpoint = `${wppConfig.serverUrl}/api/${wppConfig.sessionName}/status`;
      console.log('📡 Status endpoint:', endpoint);
      
      const data = await makeRequest(endpoint);
      console.log('📱 Status da sessão:', data);
      
      const isConnected = data.state === 'CONNECTED' || data.status === 'inChat';
      
      setSessionStatus(prev => ({
        ...prev,
        isConnected,
        phoneNumber: data.phone || data.number || '',
        qrCode: isConnected ? '' : prev.qrCode,
        sessionName: wppConfig.sessionName
      }));
      
      if (isConnected) {
        toast({
          title: "WhatsApp conectado!",
          description: `Número: ${data.phone || data.number || 'Conectado'}`
        });
        
        // Carregar chats após conectar
        loadChats();
      }
      
      return isConnected;
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      return false;
    }
  }, [getWPPConfig, makeRequest, toast]);

  // Carregar conversas
  const loadChats = useCallback(async () => {
    const wppConfig = getWPPConfig();
    
    console.log('💬 Carregando conversas...');
    
    try {
      const endpoint = `${wppConfig.serverUrl}/api/${wppConfig.sessionName}/all-chats`;
      const data = await makeRequest(endpoint);
      
      // Para WPPConnect v2.8.6, os dados podem estar em data.result ou direto em data
      const chatsData = data.result || data;
      
      if (Array.isArray(chatsData)) {
        const formattedChats: Chat[] = chatsData.map((chat: any) => ({
          chatId: chat.id._serialized || chat.id,
          name: chat.name || chat.contact?.name || chat.id.split('@')[0],
          lastMessage: chat.lastMessage?.body || 'Sem mensagens',
          timestamp: new Date(chat.lastMessage?.timestamp * 1000 || Date.now()).toISOString(),
          unreadCount: chat.unreadCount || 0,
          isGroup: chat.isGroup || false
        }));

        setChats(formattedChats);
        console.log(`✅ ${formattedChats.length} conversas carregadas`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      toast({
        title: "Erro ao carregar conversas",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    }
  }, [getWPPConfig, makeRequest, toast]);

  // Carregar mensagens de uma conversa
  const loadChatMessages = useCallback(async (chatId: string, limit: number = 50) => {
    const wppConfig = getWPPConfig();
    
    console.log(`📨 Carregando mensagens do chat: ${chatId}`);
    setIsLoadingMessages(true);
    
    try {
      const endpoint = `${wppConfig.serverUrl}/api/${wppConfig.sessionName}/get-messages/${chatId}?limit=${limit}`;
      const data = await makeRequest(endpoint);
      
      // Para WPPConnect v2.8.6, os dados podem estar em data.result ou direto em data
      const messagesData = data.result || data;
      
      if (Array.isArray(messagesData)) {
        const formattedMessages: Message[] = messagesData.map((msg: any) => ({
          id: msg.id._serialized || Math.random().toString(),
          text: msg.body || '[Mídia]',
          sender: msg.fromMe ? 'user' : 'contact' as 'user' | 'contact',
          timestamp: new Date(msg.timestamp * 1000).toISOString(),
          chatId: chatId
        }));

        setMessages(prev => [
          ...prev.filter(m => m.chatId !== chatId),
          ...formattedMessages
        ]);
        
        console.log(`✅ ${formattedMessages.length} mensagens carregadas`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [getWPPConfig, makeRequest, toast]);

  // Enviar mensagem
  const sendMessage = useCallback(async (chatId: string, text: string) => {
    const wppConfig = getWPPConfig();
    
    console.log(`📤 Enviando mensagem para: ${chatId}`);
    
    try {
      const endpoint = `${wppConfig.serverUrl}/api/${wppConfig.sessionName}/send-message`;
      const data = await makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          phone: chatId,
          message: text
        })
      });

      console.log('✅ Mensagem enviada:', data);
      
      // Adicionar mensagem ao estado local
      const newMessage: Message = {
        id: data.id?._serialized || Math.random().toString(),
        text: text,
        sender: 'user',
        timestamp: new Date().toISOString(),
        chatId: chatId
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      toast({
        title: "Mensagem enviada",
        description: "Mensagem enviada com sucesso"
      });
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
      return false;
    }
  }, [getWPPConfig, makeRequest, toast]);

  // Desconectar sessão
  const disconnect = useCallback(async () => {
    const wppConfig = getWPPConfig();
    
    try {
      const endpoint = `${wppConfig.serverUrl}/api/${wppConfig.sessionName}/logout`;
      await makeRequest(endpoint, { method: 'POST' });
      
      setSessionStatus({
        isConnected: false,
        phoneNumber: '',
        qrCode: '',
        isLoading: false,
        sessionName: ''
      });
      
      setChats([]);
      setMessages([]);
      stopLiveMode();
      
      toast({
        title: "Desconectado",
        description: "WhatsApp desconectado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  }, [getWPPConfig, makeRequest, toast]);

  // Modo ao vivo - verificar novas mensagens
  const checkNewMessages = useCallback(async () => {
    if (!currentChatId) return;
    
    const wppConfig = getWPPConfig();
    
    try {
      const endpoint = `${wppConfig.serverUrl}/api/${wppConfig.sessionName}/get-messages/${currentChatId}?limit=5`;
      const data = await makeRequest(endpoint);
      
      const messagesData = data.result || data;
      
      if (Array.isArray(messagesData) && messagesData.length > 0) {
        const existingIds = new Set(messages.map(m => m.id));
        const newMessages = messagesData
          .filter((msg: any) => !existingIds.has(msg.id._serialized))
          .map((msg: any) => ({
            id: msg.id._serialized,
            text: msg.body || '[Mídia]',
            sender: msg.fromMe ? 'user' : 'contact' as 'user' | 'contact',
            timestamp: new Date(msg.timestamp * 1000).toISOString(),
            chatId: currentChatId
          }));
        
        if (newMessages.length > 0) {
          setMessages(prev => [...prev, ...newMessages]);
          
          const newIncoming = newMessages.filter(m => m.sender === 'contact');
          if (newIncoming.length > 0) {
            toast({
              title: "Nova mensagem!",
              description: `${newIncoming.length} nova(s) mensagem(ns)`
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar novas mensagens:', error);
    }
  }, [currentChatId, getWPPConfig, makeRequest, messages, toast]);

  // Iniciar modo ao vivo
  const startLiveMode = useCallback((chatId: string) => {
    console.log('🔴 Iniciando modo ao vivo para:', chatId);
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    setIsLiveMode(true);
    setCurrentChatId(chatId);
    
    pollingIntervalRef.current = setInterval(checkNewMessages, 3000);
    
    toast({
      title: "Modo ao vivo ativado",
      description: "Mensagens serão atualizadas automaticamente"
    });
  }, [checkNewMessages, toast]);

  // Parar modo ao vivo
  const stopLiveMode = useCallback(() => {
    console.log('🔴 Parando modo ao vivo');
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    setIsLiveMode(false);
    setCurrentChatId('');
    
    toast({
      title: "Modo ao vivo desativado",
      description: "Atualizações automáticas interrompidas"
    });
  }, [toast]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return {
    // Estado
    sessionStatus,
    chats,
    messages,
    isLoadingMessages,
    isLiveMode,
    currentChatId,
    
    // Configuração
    getWPPConfig,
    saveWPPConfig,
    
    // Ações
    createSession,
    checkSessionStatus,
    loadChats,
    loadChatMessages,
    sendMessage,
    disconnect,
    startLiveMode,
    stopLiveMode
  };
}
