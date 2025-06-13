import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WPPConnectMessage {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: string;
  fromMe: boolean;
  chatId: string;
}

interface WPPConnectChat {
  chatId: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isGroup: boolean;
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
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messageHistoryLimit, setMessageHistoryLimit] = useState(50);
  
  const { toast } = useToast();
  const liveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getWPPConfig = useCallback((): WPPConfig => {
    return {
      sessionName: 'default',
      serverUrl: 'http://localhost:21465',
      secretKey: 'YOUR_TOKEN_HERE',
      token: 'YOUR_TOKEN_HERE',
      webhookUrl: ''
    };
  }, []);

  const saveWPPConfig = useCallback((config: Partial<WPPConfig>) => {
    console.log('💾 Salvando configuração WPPConnect:', config);
    // Implementar salvamento se necessário
  }, []);

  const sendMessage = useCallback(async (chatId: string, message: string) => {
    console.log('📤 Enviando mensagem via WPPConnect:', { chatId, message });
    
    try {
      const isGroup = chats.find(chat => chat.chatId === chatId)?.isGroup || false;
      console.log('📋 Tipo de chat:', { chatId, isGroup });

      const endpoint = 'http://localhost:21465/api/default/send-message';
      
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

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_TOKEN_HERE'
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
  }, [chats, toast]);

  const generateQRCode = useCallback(async () => {
    setSessionStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log('🔄 Gerando QR Code WPPConnect...');
      
      const response = await fetch('http://localhost:21465/api/default/start-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_TOKEN_HERE'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
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
      } else if (result.qrcode) {
        setSessionStatus({
          isConnected: false,
          qrCode: result.qrcode,
          isLoading: false,
          phoneNumber: null
        });
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
        description: "Não foi possível conectar ao WPPConnect",
        variant: "destructive"
      });
    }
  }, [toast]);

  const checkConnectionStatus = useCallback(async () => {
    try {
      console.log('🔍 Verificando status da conexão...');
      
      const response = await fetch('http://localhost:21465/api/default/check-connection-session', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
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
      } else {
        setSessionStatus({
          isConnected: false,
          qrCode: null,
          isLoading: false,
          phoneNumber: null
        });
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      setSessionStatus({
        isConnected: false,
        qrCode: null,
        isLoading: false,
        phoneNumber: null
      });
    }
  }, []);

  const loadRealChats = useCallback(async () => {
    if (!sessionStatus.isConnected) return;
    
    try {
      console.log('📱 Carregando chats reais...');
      
      const response = await fetch('http://localhost:21465/api/default/list-chats', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE'
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
        console.log('✅ Chats formatados:', formattedChats.length);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar chats:', error);
      toast({
        title: "❌ Erro ao carregar chats",
        description: "Não foi possível carregar as conversas",
        variant: "destructive"
      });
    }
  }, [sessionStatus.isConnected, toast]);

  const loadRealMessages = useCallback(async (chatId: string) => {
    setIsLoadingMessages(true);
    
    try {
      console.log('💬 Carregando mensagens para:', chatId, 'Limite:', messageHistoryLimit);
      
      const response = await fetch(`http://localhost:21465/api/default/get-messages/${chatId}?count=${messageHistoryLimit}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE'
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
          chatId: chatId
        }));

        setMessages(prev => {
          const filtered = prev.filter(m => m.chatId !== chatId);
          return [...filtered, ...formattedMessages];
        });

        console.log('✅ Mensagens formatadas:', formattedMessages.length);
      }
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
  }, [messageHistoryLimit, toast]);

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
      
      const response = await fetch('http://localhost:21465/api/default/close-session', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_TOKEN_HERE'
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
  }, [stopLiveMode, toast]);

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
    isLoadingMessages,
    isLiveMode,
    currentChatId,
    messageHistoryLimit,
    generateQRCode,
    checkConnectionStatus,
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
