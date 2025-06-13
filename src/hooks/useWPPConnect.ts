import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Chat {
  chatId: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  isGroup: boolean;
  unreadCount: number;
}

interface Message {
  id: string;
  chatId: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: string;
  isAudio?: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

interface SessionStatus {
  isConnected: boolean;
  isLoading: boolean;
  qrCode: string | null;
  phoneNumber: string | null;
}

interface WPPConfig {
  serverUrl: string;
  sessionName: string;
  secretKey: string;
  token: string;
  webhookUrl: string;
}

export function useWPPConnect() {
  const { toast } = useToast();
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    isConnected: false,
    isLoading: false,
    qrCode: null,
    phoneNumber: null
  });
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messageHistoryLimit, setMessageHistoryLimit] = useState(50);
  
  const liveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const BASE_URL = 'http://localhost:21465';

  // Get WPP Config from localStorage
  const getWPPConfig = useCallback((): WPPConfig => {
    return {
      serverUrl: localStorage.getItem('wpp_server_url') || 'http://localhost:21465',
      sessionName: localStorage.getItem('wpp_session_name') || 'NERDWHATS_AMERICA',
      secretKey: localStorage.getItem('wpp_secret_key') || '',
      token: localStorage.getItem('wpp_token') || '',
      webhookUrl: localStorage.getItem('wpp_webhook_url') || ''
    };
  }, []);

  // Save WPP Config to localStorage
  const saveWPPConfig = useCallback((config: WPPConfig): boolean => {
    try {
      localStorage.setItem('wpp_server_url', config.serverUrl);
      localStorage.setItem('wpp_session_name', config.sessionName);
      localStorage.setItem('wpp_secret_key', config.secretKey);
      localStorage.setItem('wpp_token', config.token);
      localStorage.setItem('wpp_webhook_url', config.webhookUrl);
      return true;
    } catch (error) {
      console.error('Erro ao salvar config WPP:', error);
      return false;
    }
  }, []);

  const checkConnectionStatus = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/connection-state`, {
        headers: {
          'Authorization': 'Bearer your-token-here'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Status da conexão:', data);
        
        setSessionStatus(prev => ({
          ...prev,
          isConnected: data.instance?.instance_key ? true : false,
          phoneNumber: data.instance?.phone_number || null,
          qrCode: null
        }));
        
        if (data.instance?.instance_key) {
          console.log('✅ WPPConnect conectado!');
          loadRealChats();
        }
      } else {
        console.warn('⚠️ Não foi possível verificar status da conexão');
        setSessionStatus(prev => ({ ...prev, isConnected: false }));
      }
    } catch (error) {
      console.warn('⚠️ Erro ao verificar status:', error);
      setSessionStatus(prev => ({ ...prev, isConnected: false }));
    }
  }, []);

  const getConnectionStatus = useCallback(() => {
    return checkConnectionStatus();
  }, [checkConnectionStatus]);

  const generateQRCode = useCallback(async () => {
    setSessionStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log('🔄 Gerando QR Code...');
      const response = await fetch(`${BASE_URL}/api/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your-token-here'
        },
        body: JSON.stringify({
          session: 'session-1',
          webhook: null
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📱 QR Code gerado:', data);
        
        if (data.qrcode) {
          setSessionStatus(prev => ({
            ...prev,
            qrCode: data.qrcode,
            isLoading: false
          }));
          
          // Verificar conexão periodicamente
          const checkInterval = setInterval(async () => {
            await checkConnectionStatus();
            if (sessionStatus.isConnected) {
              clearInterval(checkInterval);
            }
          }, 3000);
          
          setTimeout(() => clearInterval(checkInterval), 120000);
        }
      } else {
        throw new Error('Falha ao gerar QR Code');
      }
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
      setSessionStatus(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Erro ao gerar QR Code",
        description: "Verifique se o WPPConnect está rodando",
        variant: "destructive"
      });
    }
  }, [toast, sessionStatus.isConnected]);

  const loadRealChats = useCallback(async () => {
    if (!sessionStatus.isConnected) {
      console.warn('⚠️ Não conectado para carregar chats');
      return;
    }

    setIsLoadingChats(true);
    try {
      console.log('📱 Carregando chats reais...');
      const response = await fetch(`${BASE_URL}/api/list-chats`, {
        headers: {
          'Authorization': 'Bearer your-token-here'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Chats carregados:', data);
        
        if (data.response && Array.isArray(data.response)) {
          const formattedChats: Chat[] = data.response.map((chat: any) => ({
            chatId: chat.id._serialized || chat.id,
            name: chat.name || chat.formattedTitle || chat.id._serialized || 'Sem nome',
            lastMessage: chat.lastMessage?.body || 'Sem mensagens',
            timestamp: new Date().toISOString(),
            isGroup: chat.isGroup || false,
            unreadCount: chat.unreadCount || 0
          }));
          
          setChats(formattedChats);
          console.log(`✅ ${formattedChats.length} chats carregados`);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar chats:', error);
    } finally {
      setIsLoadingChats(false);
    }
  }, [sessionStatus.isConnected]);

  const loadRealMessages = useCallback(async (chatId: string) => {
    if (!sessionStatus.isConnected) {
      console.warn('⚠️ Não conectado para carregar mensagens');
      return;
    }

    setIsLoadingMessages(true);
    setCurrentChatId(chatId);
    
    try {
      console.log(`📨 Carregando ${messageHistoryLimit} mensagens de:`, chatId);
      
      const response = await fetch(`${BASE_URL}/api/get-messages/${encodeURIComponent(chatId)}?count=${messageHistoryLimit}`, {
        headers: {
          'Authorization': 'Bearer your-token-here'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Mensagens carregadas:', data);
        
        if (data.response && Array.isArray(data.response)) {
          const formattedMessages: Message[] = data.response.map((msg: any, index: number) => ({
            id: msg.id || `msg-${index}-${Date.now()}`,
            chatId: chatId,
            text: msg.body || msg.content || 'Mensagem sem texto',
            sender: msg.fromMe ? 'user' : 'contact',
            timestamp: msg.timestamp ? new Date(msg.timestamp * 1000).toISOString() : new Date().toISOString(),
            isAudio: msg.type === 'audio' || false,
            status: msg.ack ? (msg.ack === 3 ? 'read' : msg.ack === 2 ? 'delivered' : 'sent') : 'sent'
          }));
          
          // Filtrar mensagens existentes do mesmo chat e adicionar novas
          setMessages(prev => [
            ...prev.filter(m => m.chatId !== chatId),
            ...formattedMessages
          ]);
          
          console.log(`✅ ${formattedMessages.length} mensagens carregadas para ${chatId}`);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [sessionStatus.isConnected, messageHistoryLimit, toast]);

  const sendMessage = useCallback(async (chatId: string, messageText: string) => {
    if (!sessionStatus.isConnected) {
      throw new Error('Não conectado ao WhatsApp');
    }

    if (!messageText.trim()) {
      throw new Error('Mensagem não pode estar vazia');
    }

    console.log('📤 Enviando mensagem:', { chatId, messageText });

    try {
      // Endpoint principal para envio
      const sendData = {
        phone: chatId,
        message: messageText
      };

      let response = await fetch(`${BASE_URL}/api/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your-token-here'
        },
        body: JSON.stringify(sendData)
      });

      // Se falhar, tentar endpoint alternativo para grupos
      if (!response.ok) {
        console.log('⚠️ Tentando endpoint alternativo para grupos...');
        
        const groupData = {
          chatId: chatId,
          message: messageText
        };

        response = await fetch(`${BASE_URL}/api/send-text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer your-token-here'
          },
          body: JSON.stringify(groupData)
        });
      }

      const data = await response.json();
      console.log('📊 Resposta do envio:', data);

      // Verificar se foi enviado com sucesso
      const isSuccess = response.ok && (
        data.status === 'success' ||
        data.success === true ||
        data.result === 'success' ||
        data.sent === true ||
        (data.response && data.response.id) ||
        data.id
      );

      if (isSuccess) {
        console.log('✅ Mensagem enviada com sucesso');
        
        // Adicionar mensagem enviada à lista
        const newMessage: Message = {
          id: `sent-${Date.now()}`,
          chatId: chatId,
          text: messageText,
          sender: 'user',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        toast({
          title: "Mensagem enviada",
          description: "Sua mensagem foi enviada com sucesso"
        });
        
        // Recarregar mensagens após um breve delay
        setTimeout(() => {
          loadRealMessages(chatId);
        }, 1000);
        
      } else {
        throw new Error(data.message || data.error || 'Falha no envio');
      }

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }, [sessionStatus.isConnected, toast, loadRealMessages]);

  const startLiveMode = useCallback((chatId: string) => {
    if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
    }
    
    setIsLiveMode(true);
    setCurrentChatId(chatId);
    
    // Atualizar mensagens a cada 3 segundos
    liveIntervalRef.current = setInterval(() => {
      loadRealMessages(chatId);
    }, 3000);
    
    console.log(`🔴 Modo ao vivo ativado para: ${chatId}`);
    toast({
      title: "Modo ao vivo ativado",
      description: "Mensagens serão atualizadas automaticamente"
    });
  }, [loadRealMessages, toast]);

  const stopLiveMode = useCallback(() => {
    if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
      liveIntervalRef.current = null;
    }
    
    setIsLiveMode(false);
    setCurrentChatId(null);
    
    console.log('⏹️ Modo ao vivo desativado');
    toast({
      title: "Modo ao vivo desativado",
      description: "Atualizações automáticas foram pausadas"
    });
  }, [toast]);

  const disconnectWhatsApp = useCallback(async () => {
    try {
      console.log('🔌 Desconectando WhatsApp...');
      
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
        liveIntervalRef.current = null;
      }
      
      const response = await fetch(`${BASE_URL}/api/close-session`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer your-token-here'
        }
      });
      
      setSessionStatus({
        isConnected: false,
        isLoading: false,
        qrCode: null,
        phoneNumber: null
      });
      
      setChats([]);
      setMessages([]);
      setIsLiveMode(false);
      setCurrentChatId(null);
      
      console.log('✅ WhatsApp desconectado');
      toast({
        title: "WhatsApp desconectado",
        description: "Sessão encerrada com sucesso"
      });
      
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
      toast({
        title: "Erro ao desconectar",
        description: "Ocorreu um erro ao encerrar a sessão",
        variant: "destructive"
      });
    }
  }, [toast]);

  const updateMessageHistoryLimit = useCallback((newLimit: number) => {
    setMessageHistoryLimit(newLimit);
    console.log(`📊 Limite de mensagens atualizado para: ${newLimit}`);
  }, []);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
      }
    };
  }, []);

  return {
    sessionStatus,
    chats,
    contacts,
    messages,
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
