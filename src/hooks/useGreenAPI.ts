
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  sender: 'user' | 'customer';
  timestamp: string;
  platform?: string;
}

interface GreenAPIState {
  isConnected: boolean;
  instanceId: string;
  phoneNumber: string;
}

export function useGreenAPI() {
  const { user } = useAuth();
  const { config } = useClientConfig();
  const { toast } = useToast();

  const [greenAPIState, setGreenAPIState] = useState<GreenAPIState>({
    isConnected: false,
    instanceId: '',
    phoneNumber: ''
  });

  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [selectedAssistant, setSelectedAssistant] = useState('');

  const updateAPIConfig = useCallback((newConfig: any) => {
    console.log('🔧 Atualizando configuração GREEN-API:', newConfig);
    
    if (newConfig.instanceId && newConfig.apiToken) {
      setGreenAPIState(prev => ({
        ...prev,
        isConnected: true,
        instanceId: newConfig.instanceId,
        phoneNumber: newConfig.phoneNumber || prev.phoneNumber
      }));
    }
  }, []);

  const loadChats = useCallback(async () => {
    if (!greenAPIState.isConnected || !config.greenapi?.instanceId) {
      console.log('❌ GREEN-API não conectado para carregar chats');
      return;
    }

    try {
      console.log('📱 Carregando chats do GREEN-API...');
      
      const response = await fetch(
        `https://api.green-api.com/waInstance${config.greenapi.instanceId}/getChats/${config.greenapi.apiToken}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`Erro ao carregar chats: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Chats carregados do GREEN-API:', data);

      if (data && Array.isArray(data)) {
        const formattedChats: Chat[] = data.map((chat: any) => ({
          chatId: chat.id || chat.chatId,
          name: chat.name || chat.chatId,
          lastMessage: chat.lastMessage?.body || 'Sem mensagens',
          unreadCount: chat.unreadCount || 0,
          isPinned: false,
          isMonitored: false,
          isGroup: chat.id?.includes('@g.us') || false
        }));

        setChats(formattedChats);
        console.log('✅ Chats formatados e salvos:', formattedChats.length);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar chats:', error);
    }
  }, [greenAPIState.isConnected, config.greenapi]);

  const loadChatHistory = useCallback(async (chatId: string) => {
    if (!chatId || !greenAPIState.isConnected) {
      console.log('❌ Chat ID inválido ou GREEN-API não conectado');
      return;
    }

    try {
      console.log(`📖 Carregando histórico do chat: ${chatId}`);
      
      // Primeiro, tentar carregar do banco de dados
      if (user?.id) {
        const { data: dbMessages, error: dbError } = await supabase
          .from('whatsapp_messages')
          .select(`
            *,
            conversation:whatsapp_conversations(*)
          `)
          .eq('conversation.contact_phone', chatId)
          .order('timestamp', { ascending: true });

        if (!dbError && dbMessages && dbMessages.length > 0) {
          console.log('📊 Mensagens carregadas do banco:', dbMessages.length);
          
          const formattedMessages: Message[] = dbMessages.map((msg: any) => ({
            id: msg.id,
            text: msg.message_text,
            sender: msg.sender_type === 'customer' ? 'customer' : 'user',
            timestamp: new Date(msg.timestamp).toLocaleTimeString(),
            platform: 'database'
          }));

          setMessages(prev => ({ ...prev, [chatId]: formattedMessages }));
          return;
        }
      }

      // Se não tiver no banco, carregar do GREEN-API
      const response = await fetch(
        `https://api.green-api.com/waInstance${config.greenapi?.instanceId}/getChatHistory/${config.greenapi?.apiToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            chatId: chatId,
            count: 50 
          })
        }
      );

      if (!response.ok) {
        console.log(`⚠️ Não foi possível carregar histórico do GREEN-API para ${chatId}`);
        setMessages(prev => ({ ...prev, [chatId]: [] }));
        return;
      }

      const data = await response.json();
      console.log('📊 Histórico carregado do GREEN-API:', data);

      if (data && Array.isArray(data)) {
        const formattedMessages: Message[] = data.map((msg: any) => ({
          id: msg.idMessage || Math.random().toString(),
          text: msg.textMessage || msg.extendedTextMessage?.text || '[Mídia]',
          sender: msg.type === 'outgoing' ? 'user' : 'customer',
          timestamp: new Date(msg.timestamp * 1000).toLocaleTimeString(),
          platform: 'greenapi'
        }));

        setMessages(prev => ({ ...prev, [chatId]: formattedMessages }));
        console.log('✅ Histórico formatado e salvo:', formattedMessages.length);
      } else {
        setMessages(prev => ({ ...prev, [chatId]: [] }));
      }

    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
      setMessages(prev => ({ ...prev, [chatId]: [] }));
    }
  }, [greenAPIState.isConnected, config.greenapi, user?.id]);

  const sendMessage = useCallback(async (chatId: string, message: string): Promise<boolean> => {
    if (!greenAPIState.isConnected || !config.greenapi?.instanceId) {
      toast({
        title: "Erro de conexão",
        description: "GREEN-API não está conectado",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log(`📤 Enviando mensagem para ${chatId}: ${message}`);
      
      const response = await fetch(
        `https://api.green-api.com/waInstance${config.greenapi.instanceId}/sendMessage/${config.greenapi.apiToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: chatId,
            message: message
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao enviar mensagem: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Mensagem enviada:', result);

      // Adicionar mensagem localmente
      const newMessage: Message = {
        id: result.idMessage || Math.random().toString(),
        text: message,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString(),
        platform: 'greenapi'
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
  }, [greenAPIState.isConnected, config.greenapi, toast]);

  const togglePinChat = useCallback((chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.chatId === chatId 
        ? { ...chat, isPinned: !chat.isPinned }
        : chat
    ));
  }, []);

  const toggleMonitorChat = useCallback((chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.chatId === chatId 
        ? { ...chat, isMonitored: !chat.isMonitored }
        : chat
    ));
  }, []);

  const refreshChats = useCallback(async () => {
    console.log('🔄 Atualizando lista de conversas...');
    await loadChats();
  }, [loadChats]);

  return {
    greenAPIState,
    chats,
    messages,
    loadChats,
    loadChatHistory,
    sendMessage,
    togglePinChat,
    toggleMonitorChat,
    selectedAssistant,
    setSelectedAssistant,
    updateAPIConfig,
    refreshChats
  };
}
