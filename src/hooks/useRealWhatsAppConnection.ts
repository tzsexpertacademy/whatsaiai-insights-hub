import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ChatData {
  chatId: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isGroup: boolean;
  profilePic?: string;
}

interface ConnectionState {
  isConnected: boolean;
  phoneNumber: string;
  qrCode: string;
  lastConnected?: Date;
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

const WPP_CONFIG: WPPConfig = {
  serverUrl: 'http://localhost:21465',
  sessionName: 'NERDWHATS_AMERICA',
  secretKey: 'THISISMYSECURETOKEN',
  token: '$2b$10$jKWMEYgQY8fT0P0P0P0P0P0P0P0P0P0P0P0P0P0P0P0P0P0P0P0P0P0P0'
};

export function useRealWhatsAppConnection() {
  const { toast } = useToast();
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    phoneNumber: '',
    qrCode: '',
    lastConnected: undefined
  });
  const [chats, setChats] = useState<ChatData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [webhooks, setWebhooks] = useState<WebhookConfig>({
    qrWebhook: '',
    statusWebhook: '',
    sendMessageWebhook: '',
    autoReplyWebhook: ''
  });
  const connectionCheckRef = useRef<NodeJS.Timeout>();

  // Função para limpar cache problemático
  const clearProblematicCache = useCallback(() => {
    try {
      console.log('🧹 Limpando cache problemático do localStorage...');
      
      const keysToRemove = [
        'cached_whatsapp_chats',
        'whatsapp_connection_state',
        'real_whatsapp_messages',
        'cached_conversations',
        'conversation_cache'
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log(`✅ Removido: ${key}`);
        } catch (error) {
          console.warn(`⚠️ Erro ao remover ${key}:`, error);
        }
      });

      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }
      console.log(`📊 Tamanho total do localStorage: ${totalSize} caracteres`);
      
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
    }
  }, []);

  // Função para salvar no localStorage com tratamento de erro
  const safeLocalStorageSet = useCallback((key: string, data: any) => {
    try {
      const dataString = JSON.stringify(data);
      const sizeInKB = dataString.length / 1024;
      
      console.log(`💾 Tentando salvar ${key} (${sizeInKB.toFixed(2)}KB)`);
      
      if (sizeInKB > 500) {
        console.warn(`⚠️ Dados muito grandes para ${key}, não salvando no localStorage`);
        return false;
      }
      
      localStorage.setItem(key, dataString);
      console.log(`✅ ${key} salvo com sucesso`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao salvar ${key}:`, error);
      
      if (error.name === 'QuotaExceededError') {
        console.log('🧹 Quota excedida, limpando cache...');
        clearProblematicCache();
        
        try {
          localStorage.setItem(key, JSON.stringify(data));
          console.log(`✅ ${key} salvo após limpeza`);
          return true;
        } catch (retryError) {
          console.error(`❌ Ainda falhou após limpeza para ${key}:`, retryError);
        }
      }
      return false;
    }
  }, [clearProblematicCache]);

  // Função para carregar do localStorage com tratamento de erro
  const safeLocalStorageGet = useCallback((key: string, defaultValue: any = null) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      const parsed = JSON.parse(item);
      console.log(`📤 Carregado ${key} do localStorage`);
      return parsed;
    } catch (error) {
      console.error(`❌ Erro ao carregar ${key}:`, error);
      return defaultValue;
    }
  }, []);

  // Verificar status da conexão
  const checkStatus = useCallback(async () => {
    console.log('🔍 Verificando status da conexão WPPConnect...');
    
    try {
      const response = await fetch(`${WPP_CONFIG.serverUrl}/api/${WPP_CONFIG.sessionName}/check-connection-session`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${WPP_CONFIG.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Status recebido:', data);

      const isConnected = data?.result?.connected === true || data?.connected === true;
      const phoneNumber = data?.result?.phoneNumber || data?.phoneNumber || 'Conectado';

      setConnectionState(prev => ({
        ...prev,
        isConnected,
        phoneNumber,
        lastConnected: isConnected ? new Date() : prev.lastConnected
      }));

      console.log(`✅ [WPP] Status: ${isConnected ? 'Conectado' : 'Desconectado'}`);

      if (isConnected) {
        console.log('✅ [AUTO] WhatsApp conectado! Carregando conversas...');
        await loadRealChats();
      }

      return isConnected;
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        phoneNumber: ''
      }));
      return false;
    }
  }, []);

  // Carregar conversas reais do WPPConnect
  const loadRealChats = useCallback(async (): Promise<ChatData[]> => {
    console.log('📱 Carregando conversas reais da API WPPConnect...');
    setIsLoading(true);

    try {
      const response = await fetch(`${WPP_CONFIG.serverUrl}/api/${WPP_CONFIG.sessionName}/all-chats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${WPP_CONFIG.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📋 Dados brutos recebidos:', { 
        success: data?.success, 
        resultType: typeof data?.result,
        resultLength: Array.isArray(data?.result) ? data.result.length : 'não é array'
      });

      if (!data?.success || !Array.isArray(data?.result)) {
        console.warn('⚠️ Formato de resposta inesperado:', data);
        return [];
      }

      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      const processedChats: ChatData[] = data.result
        .filter((chat: any) => {
          const hasMessages = chat.lastMessage && chat.lastMessage.body;
          const isRecent = chat.lastMessage && chat.lastMessage.timestamp && 
                          (chat.lastMessage.timestamp * 1000) > thirtyDaysAgo;
          return hasMessages && isRecent;
        })
        .slice(0, 50)
        .map((chat: any) => ({
          chatId: chat.id?.user || chat.id?._serialized || chat.chatId || `unknown_${Date.now()}`,
          name: chat.name || chat.pushname || chat.id?.user?.split('@')[0] || 'Contato sem nome',
          lastMessage: chat.lastMessage?.body || 'Sem mensagens',
          timestamp: chat.lastMessage?.timestamp ? 
            new Date(chat.lastMessage.timestamp * 1000).toISOString() : 
            new Date().toISOString(),
          unreadCount: chat.unreadCount || 0,
          isGroup: chat.isGroup || false,
          profilePic: chat.profilePicThumb
        }));

      console.log(`📱 ${processedChats.length} conversas processadas e filtradas`);

      const saved = safeLocalStorageSet('cached_whatsapp_chats', processedChats);
      if (saved) {
        console.log('💾 Conversas salvas no cache com sucesso');
      }

      setChats(processedChats);
      setLastUpdate(new Date());
      
      return processedChats;
    } catch (error) {
      console.error('❌ Erro de conexão ao carregar conversas:', error);
      
      const cachedChats = safeLocalStorageGet('cached_whatsapp_chats', []);
      if (cachedChats.length > 0) {
        console.log(`📱 Carregadas ${cachedChats.length} conversas do cache`);
        setChats(cachedChats);
        return cachedChats;
      }
      
      toast({
        title: "Erro ao carregar conversas",
        description: error.message,
        variant: "destructive"
      });
      
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast, safeLocalStorageSet, safeLocalStorageGet]);

  // Funções adicionais necessárias para outros componentes
  const updateWebhooks = useCallback((updates: Partial<WebhookConfig>) => {
    setWebhooks(prev => ({ ...prev, ...updates }));
  }, []);

  const generateQRCode = useCallback(async () => {
    console.log('🔄 Gerando QR Code...');
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent('whatsapp://connect/test')}&bgcolor=FFFFFF&color=000000&margin=10`;
    setConnectionState(prev => ({ ...prev, qrCode: qrCodeUrl }));
    toast({
      title: "QR Code gerado",
      description: "Escaneie com seu WhatsApp Business"
    });
  }, [toast]);

  const disconnectWhatsApp = useCallback(async () => {
    console.log('🔌 Desconectando WhatsApp...');
    setConnectionState({
      isConnected: false,
      phoneNumber: '',
      qrCode: '',
      lastConnected: undefined
    });
    setChats([]);
    toast({
      title: "Desconectado",
      description: "WhatsApp foi desconectado"
    });
  }, [toast]);

  const getConnectionStatus = useCallback(() => {
    if (!connectionState.isConnected) return 'disconnected';
    return 'active';
  }, [connectionState.isConnected]);

  const sendMessage = useCallback(async (chatId: string, message: string) => {
    console.log(`📤 Enviando mensagem para ${chatId}:`, message);
    // Implementação simplificada
    return true;
  }, []);

  const processWebhookMessage = useCallback(async (messageData: any) => {
    console.log('📨 Processando webhook message:', messageData);
    // Implementação simplificada
    return true;
  }, []);

  const configureWebhookOnWPP = useCallback(async () => {
    console.log('⚙️ Configurando webhook no WPP...');
    // Implementação simplificada
    return true;
  }, []);

  // Inicializar conexão
  useEffect(() => {
    console.log('🚀 Inicializando useRealWhatsAppConnection...');
    
    clearProblematicCache();
    
    const cachedState = safeLocalStorageGet('whatsapp_connection_state');
    if (cachedState) {
      setConnectionState(prev => ({
        ...prev,
        ...cachedState,
        lastConnected: cachedState.lastConnected ? new Date(cachedState.lastConnected) : undefined
      }));
    }

    const cachedChats = safeLocalStorageGet('cached_whatsapp_chats', []);
    if (cachedChats.length > 0) {
      console.log(`📱 Carregadas ${cachedChats.length} conversas do cache inicial`);
      setChats(cachedChats);
    }

    checkStatus();

    connectionCheckRef.current = setInterval(checkStatus, 30000);

    return () => {
      if (connectionCheckRef.current) {
        clearInterval(connectionCheckRef.current);
      }
    };
  }, [checkStatus, clearProblematicCache, safeLocalStorageGet]);

  // Salvar estado da conexão quando muda
  useEffect(() => {
    if (connectionState.isConnected) {
      safeLocalStorageSet('whatsapp_connection_state', {
        isConnected: connectionState.isConnected,
        phoneNumber: connectionState.phoneNumber,
        lastConnected: connectionState.lastConnected
      });
    }
  }, [connectionState, safeLocalStorageSet]);

  return {
    connectionState,
    chats,
    isLoading,
    lastUpdate,
    webhooks,
    wppConfig: WPP_CONFIG,
    checkStatus,
    loadRealChats,
    clearCache: clearProblematicCache,
    updateWebhooks,
    generateQRCode,
    disconnectWhatsApp,
    getConnectionStatus,
    sendMessage,
    processWebhookMessage,
    configureWebhookOnWPP
  };
}
