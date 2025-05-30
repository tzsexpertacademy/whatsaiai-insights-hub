import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useClientConfig } from '@/contexts/ClientConfigContext';

interface GreenAPIState {
  isConnected: boolean;
  phoneNumber: string;
  webhookUrl: string;
  qrCode: string;
  isGenerating: boolean;
  lastConnected: string;
}

interface Chat {
  chatId: string;
  name: string;
  lastMessage: string;
  unreadCount: number;
  isPinned: boolean;
  isMonitored: boolean;
  isGroup: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

export function useGreenAPI() {
  const { config, updateConfig } = useClientConfig();
  const { toast } = useToast();
  
  const [greenAPIState, setGreenAPIState] = useState<GreenAPIState>({
    isConnected: false,
    phoneNumber: '',
    webhookUrl: '',
    qrCode: '',
    isGenerating: false,
    lastConnected: ''
  });
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [selectedAssistant, setSelectedAssistant] = useState('Analista Geral');
  const [isLoading, setIsLoading] = useState(false);

  // Configuração da GREEN-API
  const apiConfig = config?.whatsapp?.greenapi || { instanceId: '', apiToken: '', webhookUrl: '' };

  const updateAPIConfig = useCallback((newConfig: any) => {
    updateConfig({
      whatsapp: {
        ...config?.whatsapp,
        greenapi: {
          ...apiConfig,
          ...newConfig
        }
      }
    });
  }, [config, apiConfig, updateConfig]);

  const checkConnection = useCallback(async (instanceId: string, apiToken: string) => {
    if (!instanceId || !apiToken) {
      return { isConnected: false, phoneNumber: '' };
    }

    try {
      console.log('🔍 Verificando conexão GREEN-API...');
      
      const response = await fetch(
        `https://api.green-api.com/waInstance${instanceId}/getStateInstance/${apiToken}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Estado da instância:', data);

      const isConnected = data.stateInstance === 'authorized';
      
      if (isConnected) {
        try {
          const accountResponse = await fetch(
            `https://api.green-api.com/waInstance${instanceId}/getWaSettings/${apiToken}`
          );
          
          if (accountResponse.ok) {
            const accountData = await accountResponse.json();
            const phoneNumber = accountData.wid || `+${instanceId}`;
            
            setGreenAPIState(prev => ({
              ...prev,
              isConnected: true,
              phoneNumber,
              lastConnected: new Date().toISOString()
            }));
            
            return { isConnected: true, phoneNumber };
          }
        } catch (error) {
          console.error('Erro ao buscar dados da conta:', error);
        }
        
        setGreenAPIState(prev => ({
          ...prev,
          isConnected: true,
          phoneNumber: `Instance ${instanceId}`,
          lastConnected: new Date().toISOString()
        }));
        
        return { isConnected: true, phoneNumber: `Instance ${instanceId}` };
      } else {
        setGreenAPIState(prev => ({
          ...prev,
          isConnected: false,
          phoneNumber: '',
          lastConnected: ''
        }));
        
        return { isConnected: false, phoneNumber: '' };
      }
    } catch (error) {
      console.error('❌ Erro ao verificar conexão:', error);
      setGreenAPIState(prev => ({
        ...prev,
        isConnected: false,
        phoneNumber: '',
        lastConnected: ''
      }));
      
      return { isConnected: false, phoneNumber: '' };
    }
  }, []);

  const getQRCode = useCallback(async () => {
    if (!apiConfig.instanceId || !apiConfig.apiToken) {
      toast({
        title: "Configuração incompleta",
        description: "Configure instanceId e apiToken primeiro",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setGreenAPIState(prev => ({ ...prev, isGenerating: true }));

    try {
      console.log('📱 Gerando QR Code GREEN-API...');
      
      const response = await fetch(
        `https://api.green-api.com/waInstance${apiConfig.instanceId}/qr/${apiConfig.apiToken}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`Erro ao gerar QR Code: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ QR Code recebido:', data);

      if (data.type === 'qrCode' && data.message) {
        setGreenAPIState(prev => ({
          ...prev,
          qrCode: data.message,
          isGenerating: false
        }));

        toast({
          title: "QR Code gerado!",
          description: "Escaneie com seu WhatsApp Business"
        });
      } else {
        throw new Error('QR Code não disponível ou WhatsApp já conectado');
      }

    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
      setGreenAPIState(prev => ({ ...prev, isGenerating: false }));
      toast({
        title: "Erro ao gerar QR Code",
        description: `${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiConfig.instanceId, apiConfig.apiToken, toast]);

  const disconnect = useCallback(async () => {
    if (!apiConfig.instanceId || !apiConfig.apiToken) return;

    try {
      console.log('🔌 Desconectando GREEN-API...');
      
      const response = await fetch(
        `https://api.green-api.com/waInstance${apiConfig.instanceId}/logout/${apiConfig.apiToken}`,
        { method: 'GET' }
      );

      if (response.ok) {
        setGreenAPIState({
          isConnected: false,
          phoneNumber: '',
          webhookUrl: '',
          qrCode: '',
          isGenerating: false,
          lastConnected: ''
        });

        toast({
          title: "Desconectado",
          description: "WhatsApp Business desconectado com sucesso"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
    }
  }, [apiConfig.instanceId, apiConfig.apiToken, toast]);

  const checkConnectionStatus = useCallback(async () => {
    if (!apiConfig.instanceId || !apiConfig.apiToken) {
      return { isConnected: false, phoneNumber: '' };
    }

    return await checkConnection(apiConfig.instanceId, apiConfig.apiToken);
  }, [apiConfig.instanceId, apiConfig.apiToken, checkConnection]);

  const loadChats = useCallback(async () => {
    if (!apiConfig.instanceId || !apiConfig.apiToken) {
      console.log('⚠️ Credenciais GREEN-API não configuradas');
      return;
    }

    try {
      console.log('📱 Carregando conversas GREEN-API...');
      
      const response = await fetch(
        `https://api.green-api.com/waInstance${apiConfig.instanceId}/getChats/${apiConfig.apiToken}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 Conversas recebidas:', data);

      if (data && Array.isArray(data)) {
        const formattedChats: Chat[] = data.slice(0, 50).map((chat: any) => ({
          chatId: chat.id || chat.chatId,
          name: chat.name || chat.id || 'Contato',
          lastMessage: chat.lastMessage?.body || 'Sem mensagens',
          unreadCount: chat.unreadCount || 0,
          isPinned: false,
          isMonitored: false,
          isGroup: chat.id?.includes('@g.us') || false
        }));

        setChats(formattedChats);
        console.log('✅ Conversas carregadas:', formattedChats.length);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      toast({
        title: "Erro ao carregar conversas",
        description: "Verifique suas credenciais GREEN-API",
        variant: "destructive"
      });
    }
  }, [apiConfig.instanceId, apiConfig.apiToken, toast]);

  const loadChatHistory = useCallback(async (chatId: string) => {
    if (!apiConfig.instanceId || !apiConfig.apiToken || !chatId) {
      return;
    }

    try {
      console.log('📜 Carregando histórico do chat:', chatId);
      
      const response = await fetch(
        `https://api.green-api.com/waInstance${apiConfig.instanceId}/getChatHistory/${apiConfig.apiToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: chatId,
            count: 100
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('📨 Mensagens recebidas:', data);

      if (data && Array.isArray(data)) {
        const formattedMessages: Message[] = data.map((msg: any) => ({
          id: msg.idMessage || Math.random().toString(),
          text: msg.textMessage || msg.body || '[Mídia]',
          sender: msg.type === 'outgoing' ? 'assistant' : 'user',
          timestamp: new Date(msg.timestamp * 1000).toLocaleTimeString()
        }));

        setMessages(prev => ({
          ...prev,
          [chatId]: formattedMessages
        }));

        console.log('✅ Histórico carregado:', formattedMessages.length, 'mensagens');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
    }
  }, [apiConfig.instanceId, apiConfig.apiToken]);

  const sendMessage = useCallback(async (chatId: string, text: string) => {
    if (!apiConfig.instanceId || !apiConfig.apiToken || !chatId || !text.trim()) {
      return false;
    }

    try {
      console.log('📤 Enviando mensagem via GREEN-API...');
      
      const response = await fetch(
        `https://api.green-api.com/waInstance${apiConfig.instanceId}/sendMessage/${apiConfig.apiToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: chatId,
            message: text
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Mensagem enviada:', data);

      const newMessage: Message = {
        id: data.idMessage || Math.random().toString(),
        text: text,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), newMessage]
      }));

      toast({
        title: "Mensagem enviada",
        description: "Mensagem enviada com sucesso"
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
      return false;
    }
  }, [apiConfig.instanceId, apiConfig.apiToken, toast]);

  const togglePinChat = useCallback((chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.chatId === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
    ));
  }, []);

  const toggleMonitorChat = useCallback((chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.chatId === chatId ? { ...chat, isMonitored: !chat.isMonitored } : chat
    ));
  }, []);

  const refreshChats = useCallback(async () => {
    await loadChats();
  }, [loadChats]);

  // Verificar conexão quando as credenciais mudarem
  useEffect(() => {
    if (apiConfig.instanceId && apiConfig.apiToken) {
      checkConnection(apiConfig.instanceId, apiConfig.apiToken);
    }
  }, [apiConfig.instanceId, apiConfig.apiToken, checkConnection]);

  return {
    greenAPIState,
    apiConfig,
    chats,
    messages,
    selectedAssistant,
    setSelectedAssistant,
    updateAPIConfig,
    checkConnection,
    loadChats,
    loadChatHistory,
    sendMessage,
    togglePinChat,
    toggleMonitorChat,
    refreshChats,
    isLoading,
    getQRCode,
    disconnect,
    checkConnectionStatus
  };
}
