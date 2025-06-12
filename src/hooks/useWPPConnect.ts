
import { useState } from 'react';
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
}

interface Chat {
  chatId: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

interface Message {
  id: string;
  chatId: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: string;
}

export function useWPPConnect() {
  const { toast } = useToast();
  
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isConnected: false,
    qrCode: '',
    phoneNumber: '',
    sessionId: '',
    lastConnected: '',
    isLoading: false
  });

  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const getWPPConfig = (): WPPConfig => {
    try {
      const config = {
        sessionName: localStorage.getItem('wpp_session_name') || 'NERDWHATS_AMERICA',
        serverUrl: localStorage.getItem('wpp_server_url') || 'http://localhost:21465',
        secretKey: localStorage.getItem('wpp_secret_key') || 'THISISMYSECURETOKEN',
        token: localStorage.getItem('wpp_token') || '',
        webhookUrl: localStorage.getItem('wpp_webhook_url') || ''
      };
      
      console.log('🔧 Config WPPConnect carregado:', {
        ...config,
        secretKey: config.secretKey ? '***HIDDEN***' : 'NOT_SET',
        token: config.token ? '***HIDDEN***' : 'NOT_SET'
      });
      
      return config;
    } catch (error) {
      console.error('❌ Erro ao carregar config WPPConnect:', error);
      return {
        sessionName: 'NERDWHATS_AMERICA',
        serverUrl: 'http://localhost:21465',
        secretKey: 'THISISMYSECURETOKEN',
        token: '',
        webhookUrl: ''
      };
    }
  };

  const saveWPPConfig = (config: WPPConfig) => {
    try {
      localStorage.setItem('wpp_session_name', config.sessionName);
      localStorage.setItem('wpp_server_url', config.serverUrl);
      localStorage.setItem('wpp_secret_key', config.secretKey);
      localStorage.setItem('wpp_token', config.token);
      localStorage.setItem('wpp_webhook_url', config.webhookUrl || '');
      
      console.log('💾 Config WPPConnect salvo:', {
        sessionName: config.sessionName,
        serverUrl: config.serverUrl,
        secretKey: config.secretKey ? '***HIDDEN***' : 'NOT_SET',
        token: config.token ? '***HIDDEN***' : 'NOT_SET',
        webhookUrl: config.webhookUrl
      });
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar config WPPConnect:', error);
      return false;
    }
  };

  const createSession = async (): Promise<string | null> => {
    const config = getWPPConfig();
    
    if (!config.secretKey || config.secretKey === 'THISISMYSECURETOKEN') {
      toast({
        title: "❌ Secret Key não configurado",
        description: "Configure o Secret Key primeiro",
        variant: "destructive"
      });
      return null;
    }

    if (!config.token) {
      toast({
        title: "❌ Token não configurado",
        description: "Configure o Token da sessão primeiro",
        variant: "destructive"
      });
      return null;
    }

    try {
      console.log('🔄 Criando sessão WPPConnect...');
      setSessionStatus(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch(`${config.serverUrl}/api/${config.sessionName}/generate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.secretKey}`,
          'X-Session-Token': config.token
        },
        body: JSON.stringify({
          session: config.sessionName,
          webhookUrl: config.webhookUrl || undefined
        })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.qrcode) {
        setSessionStatus(prev => ({
          ...prev,
          qrCode: data.qrcode,
          sessionId: config.sessionName,
          isLoading: false
        }));
        
        return data.qrcode;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao criar sessão:', error);
      setSessionStatus(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const checkSessionStatus = async (): Promise<boolean> => {
    const config = getWPPConfig();
    
    if (!config.secretKey || !config.token) {
      return false;
    }

    try {
      const response = await fetch(`${config.serverUrl}/api/${config.sessionName}/check-connection-session`, {
        headers: {
          'Authorization': `Bearer ${config.secretKey}`,
          'X-Session-Token': config.token
        }
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      if (data.connected || data.status === 'connected') {
        setSessionStatus(prev => ({
          ...prev,
          isConnected: true,
          phoneNumber: data.phoneNumber || data.number || 'Conectado',
          lastConnected: new Date().toISOString()
        }));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      return false;
    }
  };

  const loadChats = async () => {
    const config = getWPPConfig();
    
    if (!config.secretKey || !config.token) {
      toast({
        title: "❌ Configuração incompleta",
        description: "Configure Secret Key e Token primeiro",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('📞 Carregando conversas...');
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
      
      // Transformar dados da API em formato de chat
      const formattedChats: Chat[] = (data || []).map((chat: any, index: number) => ({
        chatId: chat.id || `chat_${index}`,
        name: chat.name || chat.formattedName || chat.pushname || 'Contato',
        lastMessage: chat.lastMessage?.body || 'Sem mensagens',
        timestamp: chat.lastMessage?.timestamp || new Date().toISOString(),
        unreadCount: chat.unreadCount || 0
      }));

      setChats(formattedChats);
      
      toast({
        title: "✅ Conversas carregadas",
        description: `${formattedChats.length} conversas encontradas`
      });
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      toast({
        title: "❌ Erro ao carregar conversas",
        description: "Verifique se o WPPConnect está funcionando",
        variant: "destructive"
      });
    }
  };

  const loadChatMessages = async (chatId: string) => {
    const config = getWPPConfig();
    
    if (!config.secretKey || !config.token) {
      return;
    }

    try {
      setIsLoadingMessages(true);
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
          count: 50
        })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      // Transformar mensagens da API
      const formattedMessages: Message[] = (data || []).map((msg: any, index: number) => ({
        id: msg.id || `msg_${index}`,
        chatId: chatId,
        text: msg.body || msg.content || 'Mensagem sem texto',
        sender: msg.fromMe ? 'user' : 'contact',
        timestamp: msg.timestamp || new Date().toISOString()
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      toast({
        title: "❌ Erro ao carregar mensagens",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async (chatId: string, message: string): Promise<boolean> => {
    const config = getWPPConfig();
    
    if (!config.secretKey || !config.token) {
      toast({
        title: "❌ Configuração incompleta",
        description: "Configure Secret Key e Token primeiro",
        variant: "destructive"
      });
      return false;
    }

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
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, newMessage]);
      
      toast({
        title: "✅ Mensagem enviada",
        description: "Mensagem enviada com sucesso"
      });
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      toast({
        title: "❌ Erro ao enviar",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
      return false;
    }
  };

  const startLiveMode = (chatId: string) => {
    setIsLiveMode(true);
    setCurrentChatId(chatId);
    console.log('🔴 Modo live iniciado para:', chatId);
    
    toast({
      title: "🔴 Modo Live ativado",
      description: "Mensagens serão atualizadas em tempo real"
    });
  };

  const stopLiveMode = () => {
    setIsLiveMode(false);
    setCurrentChatId(null);
    console.log('⏹️ Modo live parado');
    
    toast({
      title: "⏹️ Modo Live desativado",
      description: "Atualizações em tempo real foram pausadas"
    });
  };

  const disconnect = async () => {
    const config = getWPPConfig();
    
    if (config.secretKey && config.token) {
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
      isLoading: false
    });

    setChats([]);
    setMessages([]);
    setIsLiveMode(false);
    setCurrentChatId(null);
  };

  return {
    sessionStatus,
    chats,
    messages,
    isLoadingMessages,
    isLiveMode,
    currentChatId,
    getWPPConfig,
    saveWPPConfig,
    createSession,
    checkSessionStatus,
    loadChats,
    loadChatMessages,
    sendMessage,
    startLiveMode,
    stopLiveMode,
    disconnect
  };
}
