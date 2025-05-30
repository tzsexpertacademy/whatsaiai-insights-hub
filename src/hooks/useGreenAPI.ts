
import { useState, useCallback, useEffect, useMemo } from 'react';
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
  assignedAssistant?: string;
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
  qrCode: string;
  isGenerating: boolean;
  lastConnected: string;
}

interface GreenAPIConfig {
  instanceId: string;
  apiToken: string;
  phoneNumber?: string;
  webhookUrl?: string;
}

export function useGreenAPI() {
  const { user } = useAuth();
  const { config, updateConfig, saveConfig } = useClientConfig();
  const { toast } = useToast();

  const [greenAPIState, setGreenAPIState] = useState<GreenAPIState>({
    isConnected: false,
    instanceId: '',
    phoneNumber: '',
    qrCode: '',
    isGenerating: false,
    lastConnected: ''
  });

  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [selectedAssistant, setSelectedAssistant] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Memoizar configuração
  const apiConfig: GreenAPIConfig = useMemo(() => ({
    instanceId: config?.whatsapp?.greenapi?.instanceId || '',
    apiToken: config?.whatsapp?.greenapi?.apiToken || '',
    phoneNumber: config?.whatsapp?.greenapi?.phoneNumber || '',
    webhookUrl: config?.whatsapp?.greenapi?.webhookUrl || ''
  }), [config?.whatsapp?.greenapi]);

  // Verificar conexão quando as credenciais mudarem
  useEffect(() => {
    if (apiConfig.instanceId && apiConfig.apiToken) {
      console.log('🔄 Credenciais GREEN-API detectadas, verificando conexão...');
      checkConnectionStatus();
    } else {
      console.log('❌ Credenciais GREEN-API não configuradas');
      setGreenAPIState(prev => ({
        ...prev,
        isConnected: false,
        phoneNumber: '',
        instanceId: apiConfig.instanceId || ''
      }));
    }
  }, [apiConfig.instanceId, apiConfig.apiToken]);

  const updateAPIConfig = useCallback(async (newConfig: Partial<GreenAPIConfig>) => {
    console.log('🔧 Atualizando configuração GREEN-API:', newConfig);
    
    try {
      const updatedWhatsAppConfig = {
        ...config?.whatsapp,
        greenapi: {
          ...config?.whatsapp?.greenapi,
          ...newConfig
        }
      };

      updateConfig('whatsapp', updatedWhatsAppConfig);
      await saveConfig();

      console.log('✅ Configuração GREEN-API salva');
    } catch (error) {
      console.error('❌ Erro ao salvar configuração:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    }
  }, [config, updateConfig, saveConfig, toast]);

  const checkConnectionStatus = useCallback(async (): Promise<{ isConnected: boolean; phoneNumber?: string }> => {
    if (!apiConfig.instanceId || !apiConfig.apiToken) {
      console.log('❌ Credenciais não configuradas');
      setGreenAPIState(prev => ({
        ...prev,
        isConnected: false,
        phoneNumber: ''
      }));
      return { isConnected: false };
    }

    try {
      console.log('🔍 Verificando status da instância GREEN-API...');
      
      const response = await fetch(
        `https://api.green-api.com/waInstance${apiConfig.instanceId}/getStateInstance/${apiConfig.apiToken}`,
        { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📊 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na API GREEN-API:', response.status, errorText);
        throw new Error(`Erro na API: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📋 Dados da instância:', data);

      const isConnected = data.stateInstance === 'authorized';
      let phoneNumber = '';

      if (isConnected) {
        // Buscar informações da conta para pegar o número
        try {
          const accountResponse = await fetch(
            `https://api.green-api.com/waInstance${apiConfig.instanceId}/getWaSettings/${apiConfig.apiToken}`,
            { method: 'GET' }
          );
          
          if (accountResponse.ok) {
            const accountData = await accountResponse.json();
            console.log('📱 Dados da conta:', accountData);
            phoneNumber = accountData.wid || data.wid || '';
          }
        } catch (error) {
          console.error('⚠️ Erro ao buscar dados da conta:', error);
          phoneNumber = data.wid || '';
        }
      }
      
      const now = new Date().toISOString();
      
      setGreenAPIState(prev => ({
        ...prev,
        isConnected,
        phoneNumber: phoneNumber,
        instanceId: apiConfig.instanceId,
        lastConnected: isConnected ? now : prev.lastConnected
      }));

      // Atualizar configuração
      await updateAPIConfig({
        phoneNumber: phoneNumber
      });

      const updatedWhatsAppConfig = {
        ...config?.whatsapp,
        isConnected,
        authorizedNumber: phoneNumber
      };

      updateConfig('whatsapp', updatedWhatsAppConfig);

      if (isConnected) {
        console.log('✅ WhatsApp conectado:', phoneNumber);
        toast({
          title: "WhatsApp conectado!",
          description: `Conectado ao número: ${phoneNumber}`,
        });
        
        // Carregar chats após confirmar conexão
        setTimeout(() => {
          loadChats();
        }, 1000);
      } else {
        console.log('❌ WhatsApp não conectado. Estado:', data.stateInstance);
        toast({
          title: "WhatsApp não conectado",
          description: `Estado atual: ${data.stateInstance}`,
          variant: "destructive"
        });
      }

      return { isConnected, phoneNumber };

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      
      setGreenAPIState(prev => ({
        ...prev,
        isConnected: false,
        phoneNumber: ''
      }));
      
      toast({
        title: "Erro de conexão",
        description: `Verifique suas credenciais GREEN-API: ${error.message}`,
        variant: "destructive"
      });
      
      return { isConnected: false };
    }
  }, [apiConfig.instanceId, apiConfig.apiToken, config, updateConfig, updateAPIConfig, toast]);

  const loadChats = useCallback(async () => {
    if (!user?.id) {
      console.log('❌ Usuário não autenticado');
      return;
    }

    if (!greenAPIState.isConnected) {
      console.log('❌ GREEN-API não conectado');
      return;
    }

    try {
      console.log('📱 Carregando conversas do banco de dados...');
      
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const { data: conversations, error: dbError } = await supabase
        .from('whatsapp_conversations')
        .select(`
          *,
          whatsapp_messages(
            message_text,
            timestamp,
            sender_type
          )
        `)
        .eq('user_id', user.id)
        .gte('updated_at', threeDaysAgo.toISOString())
        .order('updated_at', { ascending: false })
        .limit(20);

      if (dbError) {
        console.error('❌ Erro ao buscar conversas:', dbError);
        setChats([]);
        return;
      }

      let dbChats: Chat[] = [];
      
      if (conversations && conversations.length > 0) {
        dbChats = conversations.map((conv: any) => {
          const messages = conv.whatsapp_messages || [];
          const lastMessage = messages.length > 0 
            ? messages[messages.length - 1]
            : null;

          return {
            chatId: conv.contact_phone,
            name: conv.contact_name || conv.contact_phone.split('@')[0],
            lastMessage: lastMessage?.message_text || 'Conversa iniciada',
            unreadCount: 0,
            isPinned: false,
            isMonitored: false,
            isGroup: conv.contact_phone.includes('@g.us'),
            assignedAssistant: ''
          };
        });
        
        console.log(`✅ ${dbChats.length} conversas carregadas do banco`);
      } else {
        console.log('📭 Nenhuma conversa encontrada no banco dos últimos 3 dias');
      }

      setChats(dbChats);

    } catch (error) {
      console.error('❌ Erro ao carregar chats:', error);
      setChats([]);
      toast({
        title: "Erro ao carregar chats",
        description: "Não foi possível carregar as conversas",
        variant: "destructive"
      });
    }
  }, [user?.id, greenAPIState.isConnected, toast]);

  const loadChatHistory = useCallback(async (chatId: string) => {
    if (!chatId || !user?.id) {
      console.log('❌ Chat ID ou usuário inválido');
      return;
    }

    try {
      console.log(`📖 Carregando histórico do chat: ${chatId}`);
      
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const { data: dbMessages, error: dbError } = await supabase
        .from('whatsapp_messages')
        .select(`
          *,
          conversation:whatsapp_conversations!inner(contact_phone)
        `)
        .eq('conversation.contact_phone', chatId)
        .eq('conversation.user_id', user.id)
        .gte('timestamp', threeDaysAgo.toISOString())
        .order('timestamp', { ascending: true })
        .limit(50);

      if (!dbError && dbMessages && dbMessages.length > 0) {
        console.log(`📊 ${dbMessages.length} mensagens carregadas do banco`);
        
        const formattedMessages: Message[] = dbMessages.map((msg: any) => ({
          id: msg.id,
          text: msg.message_text,
          sender: msg.sender_type === 'customer' ? 'customer' : 'user',
          timestamp: new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          platform: 'database'
        }));

        setMessages(prev => ({ ...prev, [chatId]: formattedMessages }));
        return;
      }

      console.log('⚠️ Nenhuma mensagem encontrada no banco para este chat');
      setMessages(prev => ({ ...prev, [chatId]: [] }));

    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
      setMessages(prev => ({ ...prev, [chatId]: [] }));
    }
  }, [user?.id]);

  const sendMessage = useCallback(async (chatId: string, message: string): Promise<boolean> => {
    if (!apiConfig.instanceId || !apiConfig.apiToken) {
      toast({
        title: "Erro de configuração",
        description: "GREEN-API não está configurado",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log(`📤 Enviando mensagem para ${chatId}: ${message}`);
      
      const response = await fetch(
        `https://api.green-api.com/waInstance${apiConfig.instanceId}/sendMessage/${apiConfig.apiToken}`,
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
        const errorText = await response.text();
        throw new Error(`Erro ao enviar mensagem: ${response.status} - ${errorText}`);
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

      // Salvar no banco
      try {
        let { data: conversation, error: convError } = await supabase
          .from('whatsapp_conversations')
          .select('*')
          .eq('user_id', user?.id)
          .eq('contact_phone', chatId)
          .maybeSingle();

        if (!conversation && user?.id) {
          const { data: newConv, error: createError } = await supabase
            .from('whatsapp_conversations')
            .insert({
              user_id: user.id,
              contact_phone: chatId,
              contact_name: chatId.split('@')[0],
              messages: []
            })
            .select()
            .single();

          if (!createError) {
            conversation = newConv;
          }
        }

        if (conversation && user?.id) {
          await supabase
            .from('whatsapp_messages')
            .insert({
              user_id: user.id,
              conversation_id: conversation.id,
              message_text: message,
              sender_type: 'user',
              timestamp: new Date().toISOString(),
              ai_generated: false
            });
        }
      } catch (dbError) {
        console.error('❌ Erro ao salvar mensagem no banco:', dbError);
      }

      toast({
        title: "Mensagem enviada",
        description: "Mensagem enviada com sucesso"
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar",
        description: `Não foi possível enviar a mensagem: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  }, [apiConfig, toast, user?.id]);

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

  const assignAssistantToChat = useCallback((chatId: string, assistantId: string) => {
    setChats(prev => prev.map(chat => 
      chat.chatId === chatId 
        ? { ...chat, assignedAssistant: assistantId }
        : chat
    ));
    
    toast({
      title: "Assistente atribuído",
      description: `Assistente configurado para este número`
    });
  }, [toast]);

  const refreshChats = useCallback(async () => {
    console.log('🔄 Atualizando lista de conversas...');
    await checkConnectionStatus();
    if (greenAPIState.isConnected) {
      await loadChats();
    }
  }, [loadChats, checkConnectionStatus, greenAPIState.isConnected]);

  const getQRCode = useCallback(async (): Promise<string> => {
    if (!apiConfig.instanceId || !apiConfig.apiToken) {
      toast({
        title: "Erro de configuração",
        description: "Configure instanceId e apiToken primeiro",
        variant: "destructive"
      });
      return '';
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
        const errorText = await response.text();
        throw new Error(`Erro ao gerar QR Code: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 QR Code response:', data);

      if (data.type === 'qrCode') {
        const qrCode = `data:image/png;base64,${data.message}`;
        
        setGreenAPIState(prev => ({
          ...prev,
          qrCode,
          isGenerating: false
        }));
        
        toast({
          title: "QR Code gerado!",
          description: "Escaneie com seu WhatsApp Business"
        });
        
        return qrCode;
      } else if (data.type === 'alreadyLogged') {
        setGreenAPIState(prev => ({
          ...prev,
          isConnected: true,
          isGenerating: false
        }));
        
        await checkConnectionStatus();
        
        toast({
          title: "Já conectado",
          description: "WhatsApp já está conectado"
        });
        
        return '';
      }
      
      throw new Error(`Tipo de resposta inesperado: ${data.type}`);
      
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code:', error);
      toast({
        title: "Erro ao gerar QR Code",
        description: `Verifique suas credenciais: ${error.message}`,
        variant: "destructive"
      });
      return '';
    } finally {
      setIsLoading(false);
      setGreenAPIState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [apiConfig, toast, checkConnectionStatus]);

  const disconnect = useCallback(async () => {
    try {
      setGreenAPIState({
        isConnected: false,
        instanceId: '',
        phoneNumber: '',
        qrCode: '',
        isGenerating: false,
        lastConnected: ''
      });

      const updatedWhatsAppConfig = {
        ...config?.whatsapp,
        isConnected: false,
        authorizedNumber: ''
      };

      updateConfig('whatsapp', updatedWhatsAppConfig);
      await saveConfig();
      
      toast({
        title: "Desconectado",
        description: "GREEN-API desconectado"
      });
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
    }
  }, [config, updateConfig, saveConfig, toast]);

  return {
    greenAPIState,
    chats,
    messages,
    loadChats,
    loadChatHistory,
    sendMessage,
    togglePinChat,
    toggleMonitorChat,
    assignAssistantToChat,
    selectedAssistant,
    setSelectedAssistant,
    updateAPIConfig,
    refreshChats,
    apiConfig,
    isLoading,
    getQRCode,
    disconnect,
    checkConnectionStatus
  };
}
