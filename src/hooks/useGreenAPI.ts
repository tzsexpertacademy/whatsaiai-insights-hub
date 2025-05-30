
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useClientConfig } from '@/contexts/ClientConfigContext';

interface GreenAPIState {
  isConnected: boolean;
  phoneNumber: string;
  webhookUrl: string;
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
    webhookUrl: ''
  });
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [selectedAssistant, setSelectedAssistant] = useState('Analista Geral');

  const apiConfig = config?.whatsapp?.greenapi || {};

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
        // Buscar informações da conta
        try {
          const accountResponse = await fetch(
            `https://api.green-api.com/waInstance${instanceId}/getWaSettings/${apiToken}`
          );
          
          if (accountResponse.ok) {
            const accountData = await accountResponse.json();
            const phoneNumber = accountData.wid || `+${instanceId}`;
            
            setGreenAPIState({
              isConnected: true,
              phoneNumber,
              webhookUrl: apiConfig.webhookUrl || ''
            });
            
            return { isConnected: true, phoneNumber };
          }
        } catch (error) {
          console.error('Erro ao buscar dados da conta:', error);
        }
        
        setGreenAPIState({
          isConnected: true,
          phoneNumber: `Instance ${instanceId}`,
          webhookUrl: apiConfig.webhookUrl || ''
        });
        
        return { isConnected: true, phoneNumber: `Instance ${instanceId}` };
      } else {
        setGreenAPIState({
          isConnected: false,
          phoneNumber: '',
          webhookUrl: ''
        });
        
        return { isConnected: false, phoneNumber: '' };
      }
    } catch (error) {
      console.error('❌ Erro ao verificar conexão:', error);
      setGreenAPIState({
        isConnected: false,
        phoneNumber: '',
        webhookUrl: ''
      });
      
      return { isConnected: false, phoneNumber: '' };
    }
  }, [apiConfig.webhookUrl]);

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

      // Adicionar mensagem ao estado local
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
    refreshChats
  };
}
