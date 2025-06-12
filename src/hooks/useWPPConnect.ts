import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

interface WPPConfig {
  sessionName: string;
  serverUrl: string;
  secretKey: string;
  token: string;
  webhookUrl?: string;
}

interface SessionStatus {
  isConnected: boolean;
  qrCode: string;
  phoneNumber: string;
  sessionId: string;
  lastConnected: string;
  isLoading?: boolean;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
}

interface Chat {
  chatId: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  lastMessageTimestamp?: number;
}

interface Message {
  id: string;
  chatId: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  isAudio?: boolean;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  lastMessageTimestamp?: number;
}

export function useWPPConnect() {
  const { toast } = useToast();
  
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isConnected: false,
    qrCode: '',
    phoneNumber: '',
    sessionId: '',
    lastConnected: '',
    isLoading: false,
    status: 'disconnected'
  });

  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messageHistoryLimit, setMessageHistoryLimit] = useState(50);

  // Lista de tokens inválidos que devem ser rejeitados
  const INVALID_TOKENS = [
    'THISISMYSECURETOKEN',
    'YOUR_SECRET_KEY_HERE',
    'YOUR_TOKEN_HERE',
    'DEFAULT_TOKEN',
    'CHANGE_ME',
    '',
    undefined,
    null
  ];

  // Carregar estado salvo na inicialização
  useEffect(() => {
    console.log('🔄 Carregando estado salvo do WPPConnect...');
    const saved = localStorage.getItem('wpp_session_status');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessionStatus(parsed);
        console.log('✅ Estado carregado:', parsed);
      } catch (error) {
        console.log('❌ Erro ao carregar estado:', error);
      }
    }
  }, []);

  // Salvar estado quando mudar
  useEffect(() => {
    if (sessionStatus.qrCode || sessionStatus.isConnected) {
      localStorage.setItem('wpp_session_status', JSON.stringify(sessionStatus));
      console.log('💾 Estado salvo:', sessionStatus);
    }
  }, [sessionStatus]);

  const getWPPConfig = (): WPPConfig => {
    try {
      const config = {
        sessionName: localStorage.getItem('wpp_session_name') || 'NERDWHATS_AMERICA',
        serverUrl: localStorage.getItem('wpp_server_url') || 'http://localhost:21465',
        secretKey: localStorage.getItem('wpp_secret_key') || '',
        token: localStorage.getItem('wpp_token') || '',
        webhookUrl: localStorage.getItem('wpp_webhook_url') || ''
      };
      
      console.log('🔧 Config WPPConnect carregado:', {
        ...config,
        secretKey: config.secretKey ? `***${config.secretKey.slice(-4)}***` : 'NOT_SET',
        token: config.token ? `***${config.token.slice(-4)}***` : 'NOT_SET'
      });
      
      return config;
    } catch (error) {
      console.error('❌ Erro ao carregar config WPPConnect:', error);
      return {
        sessionName: 'NERDWHATS_AMERICA',
        serverUrl: 'http://localhost:21465',
        secretKey: '',
        token: '',
        webhookUrl: ''
      };
    }
  };

  const saveWPPConfig = (config: WPPConfig) => {
    try {
      // Validar se os tokens não são valores padrão inválidos
      if (INVALID_TOKENS.includes(config.secretKey)) {
        console.error('❌ Secret Key inválido detectado:', config.secretKey);
        toast({
          title: "❌ Secret Key Inválido",
          description: "O Secret Key não pode ser o valor padrão. Configure um valor real.",
          variant: "destructive"
        });
        return false;
      }

      if (INVALID_TOKENS.includes(config.token)) {
        console.error('❌ Token inválido detectado:', config.token);
        toast({
          title: "❌ Token Inválido", 
          description: "O Token não pode ser o valor padrão. Configure um valor real.",
          variant: "destructive"
        });
        return false;
      }

      localStorage.setItem('wpp_session_name', config.sessionName);
      localStorage.setItem('wpp_server_url', config.serverUrl);
      localStorage.setItem('wpp_secret_key', config.secretKey);
      localStorage.setItem('wpp_token', config.token);
      localStorage.setItem('wpp_webhook_url', config.webhookUrl || '');
      
      console.log('💾 Config WPPConnect salvo com tokens válidos:', {
        sessionName: config.sessionName,
        serverUrl: config.serverUrl,
        secretKey: config.secretKey ? `***${config.secretKey.slice(-4)}***` : 'NOT_SET',
        token: config.token ? `***${config.token.slice(-4)}***` : 'NOT_SET',
        webhookUrl: config.webhookUrl
      });
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar config WPPConnect:', error);
      return false;
    }
  };

  const isTokenValid = () => {
    const config = getWPPConfig();
    
    // Verificar se os valores não são inválidos
    const isSecretKeyValid = !INVALID_TOKENS.includes(config.secretKey) && 
                            config.secretKey && 
                            config.secretKey.length > 10;
    
    const isTokenValid = !INVALID_TOKENS.includes(config.token) && 
                        config.token && 
                        config.token.length > 10;

    console.log('🔍 Validação de tokens:', {
      secretKeyValid: isSecretKeyValid,
      tokenValid: isTokenValid,
      secretKeyLength: config.secretKey?.length || 0,
      tokenLength: config.token?.length || 0,
      secretKeyValue: config.secretKey === 'THISISMYSECURETOKEN' ? 'VALOR_PADRAO_DETECTADO' : 'OK'
    });

    return isSecretKeyValid && isTokenValid;
  };

  const generateQRCode = async (): Promise<string | null> => {
    console.log('🔄 Gerando QR Code WPPConnect...');
    
    // Verificação rigorosa de tokens
    if (!isTokenValid()) {
      const config = getWPPConfig();
      let errorMessage = "Configure Secret Key e Token válidos do WPPConnect primeiro";
      
      if (INVALID_TOKENS.includes(config.secretKey)) {
        errorMessage = "Secret Key ainda está com valor padrão. Configure um valor real na aba WPPConnect.";
      } else if (INVALID_TOKENS.includes(config.token)) {
        errorMessage = "Token ainda está com valor padrão. Configure um valor real na aba WPPConnect.";
      }
      
      toast({
        title: "❌ Configuração incompleta",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }

    const config = getWPPConfig();
    setSessionStatus(prev => ({ ...prev, isLoading: true, status: 'connecting' }));

    try {
      // Primeiro tenta criar a sessão
      console.log('📱 Criando sessão WPPConnect...');
      const createResponse = await fetch(`${config.serverUrl}/api/${config.sessionName}/start-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.secretKey}`,
          'X-Session-Token': config.token
        },
        body: JSON.stringify({
          session: config.sessionName,
          webhook: config.webhookUrl || undefined
        })
      });

      console.log('📊 Resposta de criação de sessão:', {
        status: createResponse.status,
        statusText: createResponse.statusText,
        ok: createResponse.ok
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.log('⚠️ Erro na criação de sessão:', errorText);
        
        if (createResponse.status === 401) {
          // Forçar limpeza de tokens inválidos
          localStorage.removeItem('wpp_secret_key');
          localStorage.removeItem('wpp_token');
          
          throw new Error('Token ou Secret Key inválidos. Por favor, reconfigure na aba WPPConnect com valores reais (não padrão).');
        }
      }

      // Tenta obter o QR Code
      console.log('🔍 Obtendo QR Code...');
      const qrResponse = await fetch(`${config.serverUrl}/api/${config.sessionName}/start-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.secretKey}`,
          'X-Session-Token': config.token
        },
        body: JSON.stringify({
          session: config.sessionName,
          webhook: config.webhookUrl || undefined
        })
      });

      if (!qrResponse.ok) {
        const errorText = await qrResponse.text();
        console.error('❌ Erro HTTP ao obter QR Code:', {
          status: qrResponse.status,
          statusText: qrResponse.statusText,
          error: errorText
        });

        if (qrResponse.status === 401) {
          // Forçar limpeza de tokens inválidos
          localStorage.removeItem('wpp_secret_key');
          localStorage.removeItem('wpp_token');
          
          throw new Error('Erro de autenticação. Reconfigure Secret Key e Token na aba WPPConnect.');
        }
        
        throw new Error(`Erro HTTP: ${qrResponse.status} - ${errorText}`);
      }

      const data = await qrResponse.json();
      console.log('📋 Resposta do servidor:', data);
      
      if (data.qrcode || data.qr) {
        const qrCode = data.qrcode || data.qr;
        setSessionStatus(prev => ({
          ...prev,
          qrCode: qrCode,
          sessionId: config.sessionName,
          isLoading: false,
          status: 'connecting'
        }));
        
        toast({
          title: "✅ QR Code gerado!",
          description: "Escaneie com seu WhatsApp Business"
        });

        // Iniciar verificação de status
        startStatusCheck();
        
        return qrCode;
      }
      
      throw new Error('QR Code não encontrado na resposta');
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
      setSessionStatus(prev => ({ ...prev, isLoading: false, status: 'error' }));
      
      toast({
        title: "❌ Erro ao gerar QR Code",
        description: error instanceof Error ? error.message : "Verifique se o WPPConnect está funcionando e se os tokens estão corretos",
        variant: "destructive"
      });
      
      return null;
    }
  };

  const startStatusCheck = () => {
    let attempts = 0;
    const maxAttempts = 40; // 2 minutos
    
    const checkInterval = setInterval(async () => {
      attempts++;
      console.log(`🔍 Verificando conexão - tentativa ${attempts}/${maxAttempts}`);
      
      if (attempts > maxAttempts) {
        clearInterval(checkInterval);
        setSessionStatus(prev => ({ ...prev, status: 'error' }));
        toast({
          title: "⏰ Timeout",
          description: "QR Code expirado. Gere um novo.",
          variant: "destructive"
        });
        return;
      }

      const isConnected = await checkConnectionStatus();
      if (isConnected) {
        clearInterval(checkInterval);
      }
    }, 3000);
  };

  const checkConnectionStatus = async (): Promise<boolean> => {
    if (!isTokenValid()) {
      return false;
    }

    const config = getWPPConfig();

    try {
      const response = await fetch(`${config.serverUrl}/api/${config.sessionName}/status-session`, {
        headers: {
          'Authorization': `Bearer ${config.secretKey}`,
          'X-Session-Token': config.token
        }
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      console.log('📊 Status da sessão:', data);
      
      if (data.connected || data.status === 'connected' || data.session === 'CONNECTED') {
        setSessionStatus(prev => ({
          ...prev,
          isConnected: true,
          qrCode: '',
          phoneNumber: data.phoneNumber || data.number || data.phone || 'Conectado',
          lastConnected: new Date().toISOString(),
          status: 'connected'
        }));
        
        toast({
          title: "🎉 WhatsApp conectado!",
          description: `Conectado com ${data.phoneNumber || data.number || 'sucesso'}`
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      return false;
    }
  };

  const loadRealChats = async () => {
    if (!isTokenValid()) {
      throw new Error('Secret Key e Token não configurados');
    }

    if (!sessionStatus.isConnected) {
      throw new Error('WhatsApp não conectado');
    }

    const config = getWPPConfig();
    setIsLoadingChats(true);

    try {
      console.log('📞 Carregando conversas reais...');
      const response = await fetch(`${config.serverUrl}/api/${config.sessionName}/all-chats`, {
        headers: {
          'Authorization': `Bearer ${config.secretKey}`,
          'X-Session-Token': config.token
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Formato de dados inválido');
      }

      // Transformar dados da API em formato padronizado
      const formattedChats: Chat[] = data.map((chat: any, index: number) => {
        const chatId = chat.id?._serialized || chat.id || `chat_${index}`;
        const phoneNumber = extractPhoneNumber(chat.id || chat.contact?.id || chat.phone);
        const lastMessageTimestamp = extractTimestamp(chat);
        
        return {
          chatId: String(chatId),
          name: extractContactName(chat),
          lastMessage: String(chat.lastMessage?.body || chat.lastMessage?.text || 'Sem mensagens'),
          timestamp: new Date(lastMessageTimestamp).toISOString(),
          unreadCount: Number(chat.unreadCount || 0),
          lastMessageTimestamp: lastMessageTimestamp
        };
      });

      // Também criar formato Contact para compatibilidade
      const formattedContacts: Contact[] = formattedChats.map(chat => ({
        id: chat.chatId,
        name: chat.name,
        phone: extractPhoneNumber(chat.chatId),
        lastMessage: chat.lastMessage,
        timestamp: chat.timestamp,
        unread: chat.unreadCount,
        lastMessageTimestamp: chat.lastMessageTimestamp
      }));

      setChats(formattedChats);
      setContacts(formattedContacts);
      
      console.log(`✅ ${formattedChats.length} conversas carregadas`);
      return formattedChats;
      
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      throw error;
    } finally {
      setIsLoadingChats(false);
    }
  };

  const loadRealMessages = async (chatId: string) => {
    if (!isTokenValid()) {
      throw new Error('Secret Key e Token não configurados');
    }

    const config = getWPPConfig();
    setIsLoadingMessages(true);

    try {
      console.log('💬 Carregando mensagens para:', chatId);
      
      const response = await fetch(`${config.serverUrl}/api/${config.sessionName}/all-messages-in-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.secretKey}`,
          'X-Session-Token': config.token
        },
        body: JSON.stringify({
          phone: chatId,
          count: messageHistoryLimit
        })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Formato de dados inválido');
      }
      
      // Transformar mensagens da API
      const formattedMessages: Message[] = data.map((msg: any, index: number) => {
        const text = msg.processedText || msg.body || msg.text || msg.content || 'Mensagem sem texto';
        const isAudio = String(text).includes('🎤 [Áudio]');
        
        return {
          id: String(msg.id || `msg_${index}`),
          chatId: String(chatId),
          text: String(text),
          sender: msg.fromMe ? 'user' : 'contact',
          timestamp: msg.timestamp ? new Date(msg.timestamp * 1000).toISOString() : new Date().toISOString(),
          status: msg.ack ? 'delivered' : 'sent',
          isAudio: isAudio
        };
      });

      setMessages(prev => [
        ...prev.filter(m => m.chatId !== chatId),
        ...formattedMessages
      ]);
      
      return formattedMessages;
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      throw error;
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async (chatId: string, message: string): Promise<boolean> => {
    if (!isTokenValid()) {
      throw new Error('Secret Key e Token não configurados');
    }

    const config = getWPPConfig();

    try {
      console.log('📤 Enviando mensagem para:', chatId);
      
      const response = await fetch(`${config.serverUrl}/api/${config.sessionName}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.secretKey}`,
          'X-Session-Token': config.token
        },
        body: JSON.stringify({
          phone: chatId,
          message: message
        })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      // Adicionar mensagem localmente
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        chatId: chatId,
        text: message,
        sender: 'user',
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      setMessages(prev => [...prev, newMessage]);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  };

  const disconnectWhatsApp = async () => {
    const config = getWPPConfig();
    
    if (isTokenValid()) {
      try {
        await fetch(`${config.serverUrl}/api/${config.sessionName}/close-session`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.secretKey}`,
            'X-Session-Token': config.token
          }
        });
      } catch (error) {
        console.log('Erro ao fechar sessão:', error);
      }
    }

    setSessionStatus({
      isConnected: false,
      qrCode: '',
      phoneNumber: '',
      sessionId: '',
      lastConnected: '',
      isLoading: false,
      status: 'disconnected'
    });

    setChats([]);
    setMessages([]);
    setContacts([]);
    setIsLiveMode(false);
    setCurrentChatId(null);
    
    localStorage.removeItem('wpp_session_status');
    
    toast({
      title: "🔌 Desconectado",
      description: "WhatsApp foi desconectado"
    });
  };

  // Funções helper
  const extractPhoneNumber = (phoneData: any): string => {
    if (typeof phoneData === 'string') {
      return phoneData;
    }
    if (phoneData && typeof phoneData === 'object') {
      if (phoneData._serialized) return String(phoneData._serialized);
      if (phoneData.user) return String(phoneData.user);
      if (phoneData.number) return String(phoneData.number);
      if (phoneData.server && phoneData.user) {
        return `${phoneData.user}@${phoneData.server}`;
      }
    }
    return 'Número não disponível';
  };

  const extractContactName = (chat: any): string => {
    if (chat.name) return String(chat.name);
    if (chat.contact?.name) return String(chat.contact.name);
    if (chat.contact?.formattedName) return String(chat.contact.formattedName);
    if (chat.contact?.pushname) return String(chat.contact.pushname);
    if (chat.title) return String(chat.title);
    
    const phoneNumber = extractPhoneNumber(chat.id || chat.contact?.id || chat.phone);
    if (phoneNumber && phoneNumber !== 'Número não disponível') {
      if (phoneNumber.includes('@g.us')) {
        return chat.id ? String(chat.id) : 'Grupo sem nome';
      }
      const cleanNumber = phoneNumber.replace('@c.us', '');
      return `+${cleanNumber}`;
    }
    
    return 'Contato sem nome';
  };

  const extractTimestamp = (chat: any): number => {
    if (chat.lastMessage?.timestamp) {
      return typeof chat.lastMessage.timestamp === 'number' 
        ? chat.lastMessage.timestamp 
        : new Date(chat.lastMessage.timestamp).getTime();
    }
    
    if (chat.timestamp) {
      return typeof chat.timestamp === 'number'
        ? chat.timestamp
        : new Date(chat.timestamp).getTime();
    }
    
    if (chat.t) {
      return chat.t * 1000;
    }
    
    return new Date().getTime();
  };

  const getConnectionStatus = () => {
    if (!sessionStatus.isConnected) return 'disconnected';
    
    const lastConnected = new Date(sessionStatus.lastConnected);
    const now = new Date();
    const minutesDiff = (now.getTime() - lastConnected.getTime()) / (1000 * 60);
    
    if (minutesDiff > 30) return 'idle';
    return 'active';
  };

  // Funções de compatibilidade para análise
  const togglePinConversation = (chatId: string) => {
    console.log('Toggle pin conversation:', chatId);
  };

  const toggleAnalysisConversation = (chatId: string) => {
    console.log('Toggle analysis conversation:', chatId);
  };

  const isConversationPinned = (chatId: string) => {
    return false;
  };

  const isConversationMarkedForAnalysis = (chatId: string) => {
    return false;
  };

  const getAnalysisPriority = (chatId: string): 'high' | 'medium' | 'low' => {
    return 'medium';
  };

  return {
    // Estado principal
    sessionStatus,
    chats,
    messages,
    contacts,
    isLoadingMessages,
    isLoadingChats,
    isLiveMode,
    currentChatId,
    messageHistoryLimit,
    
    // Configuração
    getWPPConfig,
    saveWPPConfig,
    
    // Conexão
    generateQRCode,
    checkConnectionStatus,
    disconnectWhatsApp,
    getConnectionStatus,
    
    // Chat e mensagens
    loadRealChats,
    loadRealMessages,
    sendMessage,
    
    // Compatibilidade
    togglePinConversation,
    toggleAnalysisConversation,
    isConversationPinned,
    isConversationMarkedForAnalysis,
    getAnalysisPriority,
    
    // Estados de compatibilidade
    connectionState: sessionStatus,
    isLoading: sessionStatus.isLoading || false,
    wppConfig: getWPPConfig(),
    
    // Funções de compatibilidade
    updateMessageHistoryLimit: (limit: number) => setMessageHistoryLimit(limit),
    startLiveMode: (chatId: string) => {
      setIsLiveMode(true);
      setCurrentChatId(chatId);
    },
    stopLiveMode: () => {
      setIsLiveMode(false);
      setCurrentChatId(null);
    }
  };
}
