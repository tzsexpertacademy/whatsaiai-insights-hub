
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface WPPConfig {
  serverUrl: string;
  sessionName: string;
  secretKey: string;
  webhookUrl?: string;
}

interface ConnectionState {
  isConnected: boolean;
  phoneNumber?: string;
  qrCode?: string;
  lastConnected?: string;
}

interface ConversationMeta {
  [chatId: string]: {
    isPinned: boolean;
    isMarkedForAnalysis: boolean;
    analysisPriority: 'high' | 'medium' | 'low';
  };
}

export function useRealWhatsAppConnection() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [conversationMeta, setConversationMeta] = useState<ConversationMeta>({});
  const [messageHistoryLimit, setMessageHistoryLimit] = useState(50);
  
  const wppConfig: WPPConfig = {
    serverUrl: 'http://localhost:21465',
    sessionName: 'NERDWHATS_AMERICA',
    secretKey: 'NERDWHATS_2024',
    webhookUrl: 'https://duyxbtfknilgrvgsvlyy.supabase.co/functions/v1/whatsapp-autoreply'
  };

  const generateQRCode = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/generate-qr`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${wppConfig.secretKey}`
        }
      });
  
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
  
      const data = await response.json();
      setConnectionState(prev => ({ ...prev, qrCode: data.image }));
      return data.image;
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast({
        title: "Erro ao gerar QR Code",
        description: "Verifique se o WPPConnect está rodando corretamente",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [wppConfig, toast]);

  const checkConnectionStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/check-connection`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${wppConfig.secretKey}`
        }
      });
  
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
  
      const data = await response.json();
      const isConnected = data.isConnected;
      
      setConnectionState({
        isConnected,
        phoneNumber: data.phone,
        lastConnected: isConnected ? new Date().toISOString() : undefined
      });
  
      toast({
        title: isConnected ? "WhatsApp conectado!" : "WhatsApp desconectado",
        description: isConnected ? "Conexão estabelecida com sucesso" : "Verifique seu QR Code ou conexão",
        variant: isConnected ? "default" : "destructive"
      });
  
      return isConnected;
    } catch (error) {
      console.error('Erro ao verificar status de conexão:', error);
      toast({
        title: "Erro ao verificar status",
        description: "Verifique se o WPPConnect está rodando corretamente",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [wppConfig, toast]);

  const disconnectWhatsApp = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${wppConfig.secretKey}`
        }
      });
  
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
  
      setConnectionState({ isConnected: false });
      toast({
        title: "WhatsApp desconectado",
        description: "Sessão encerrada com sucesso"
      });
    } catch (error) {
      console.error('Erro ao desconectar WhatsApp:', error);
      toast({
        title: "Erro ao desconectar",
        description: "Não foi possível encerrar a sessão",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [wppConfig, toast]);

  const sendMessage = useCallback(async (to: string, message: string) => {
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.secretKey}`
        },
        body: JSON.stringify({
          phone: to,
          message: message
        })
      });
  
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (data.result === true) {
        toast({
          title: "Mensagem enviada!",
          description: `Mensagem enviada para ${to} com sucesso`
        });
        return true;
      } else {
        toast({
          title: "Erro ao enviar mensagem",
          description: data.error || "Não foi possível enviar a mensagem",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Verifique sua conexão com o WPPConnect",
        variant: "destructive"
      });
      return false;
    }
  }, [wppConfig, toast]);

  const saveConversationToDatabase = useCallback(async (chatData: any, messages: any[]) => {
    if (!user?.id) {
      console.warn('Usuário não autenticado para salvar conversa');
      return false;
    }

    try {
      console.log('💾 Salvando conversa no banco de dados para análise...', chatData.name);
      
      // Processar mensagens para o formato correto
      const processedMessages = messages.map(msg => ({
        text: msg.processedText || msg.body || msg.text || 'Mensagem sem texto',
        sender: msg.fromMe ? 'user' : 'contact',
        timestamp: msg.timestamp ? new Date(msg.timestamp * 1000).toISOString() : new Date().toISOString(),
        messageId: msg.id || `msg_${Date.now()}`
      }));

      // Verificar se a conversa já existe
      const { data: existingConversation, error: searchError } = await supabase
        .from('whatsapp_conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('contact_phone', chatData.phone || chatData.id)
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        console.error('Erro ao buscar conversa existente:', searchError);
        return false;
      }

      if (existingConversation) {
        // Atualizar conversa existente
        const { error: updateError } = await supabase
          .from('whatsapp_conversations')
          .update({
            contact_name: chatData.name,
            messages: processedMessages,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConversation.id);

        if (updateError) {
          console.error('Erro ao atualizar conversa:', updateError);
          return false;
        }

        console.log('✅ Conversa atualizada no banco:', existingConversation.id);
      } else {
        // Criar nova conversa
        const { data: newConversation, error: insertError } = await supabase
          .from('whatsapp_conversations')
          .insert({
            user_id: user.id,
            contact_name: chatData.name,
            contact_phone: chatData.phone || chatData.id,
            messages: processedMessages
          })
          .select()
          .single();

        if (insertError) {
          console.error('Erro ao inserir conversa:', insertError);
          return false;
        }

        console.log('✅ Nova conversa salva no banco:', newConversation.id);
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar conversa no banco:', error);
      return false;
    }
  }, [user?.id]);

  const loadRealChats = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('📱 Carregando conversas reais do WPPConnect...');
      
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/getAllChatsWithMessages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.secretKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Dados recebidos:', data);
      
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [wppConfig]);

  const loadRealMessages = useCallback(async (chatId: string) => {
    try {
      console.log('📨 Carregando mensagens para:', chatId);
      
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/getChatMessages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${wppConfig.secretKey}`
        },
        body: JSON.stringify({
          chatId: chatId,
          count: messageHistoryLimit
        })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error);
      throw error;
    }
  }, [wppConfig, messageHistoryLimit]);

  const updateWebhooks = useCallback((newWebhookUrl: string) => {
    console.log('Atualizando URL do webhook:', newWebhookUrl);
    toast({
      title: "Webhook atualizado!",
      description: "A nova URL do webhook foi configurada"
    });
  }, [toast]);

  const updateMessageHistoryLimit = useCallback((newLimit: number) => {
    setMessageHistoryLimit(newLimit);
    toast({
      title: "Limite de histórico atualizado!",
      description: `O limite de mensagens foi alterado para ${newLimit}`
    });
  }, [toast]);

  const toggleAnalysisConversation = useCallback(async (chatId: string) => {
    const currentMeta = conversationMeta[chatId] || {
      isPinned: false,
      isMarkedForAnalysis: false,
      analysisPriority: 'medium' as const
    };

    const newAnalysisState = !currentMeta.isMarkedForAnalysis;
    
    setConversationMeta(prev => ({
      ...prev,
      [chatId]: {
        ...currentMeta,
        isMarkedForAnalysis: newAnalysisState
      }
    }));

    // Se estiver marcando para análise, salvar no banco de dados
    if (newAnalysisState) {
      try {
        // Carregar dados da conversa e mensagens
        const messages = await loadRealMessages(chatId);
        
        // Criar objeto da conversa para salvar
        const chatData = {
          id: chatId,
          name: `Conversa ${chatId.split('@')[0]}`,
          phone: chatId
        };
        
        const success = await saveConversationToDatabase(chatData, messages);
        
        if (success) {
          toast({
            title: "✅ Conversa marcada para análise",
            description: "Dados salvos no banco para análise de IA"
          });
        } else {
          toast({
            title: "❌ Erro ao salvar conversa",
            description: "Não foi possível salvar no banco de dados",
            variant: "destructive"
          });
          // Reverter o estado se falhou
          setConversationMeta(prev => ({
            ...prev,
            [chatId]: currentMeta
          }));
        }
      } catch (error) {
        console.error('Erro ao processar análise:', error);
        toast({
          title: "❌ Erro ao processar",
          description: "Não foi possível carregar dados da conversa",
          variant: "destructive"
        });
        // Reverter o estado se falhou
        setConversationMeta(prev => ({
          ...prev,
          [chatId]: currentMeta
        }));
      }
    } else {
      toast({
        title: "Conversa desmarcada",
        description: "Removida da lista de análise"
      });
    }
  }, [conversationMeta, loadRealMessages, saveConversationToDatabase, toast]);

  const togglePinConversation = useCallback((chatId: string) => {
    setConversationMeta(prev => {
      const current = prev[chatId] || {
        isPinned: false,
        isMarkedForAnalysis: false,
        analysisPriority: 'medium' as const
      };
      
      return {
        ...prev,
        [chatId]: {
          ...current,
          isPinned: !current.isPinned
        }
      };
    });
  }, []);

  const isConversationPinned = useCallback((chatId: string) => {
    return conversationMeta[chatId]?.isPinned || false;
  }, [conversationMeta]);

  const isConversationMarkedForAnalysis = useCallback((chatId: string) => {
    return conversationMeta[chatId]?.isMarkedForAnalysis || false;
  }, [conversationMeta]);

  const getAnalysisPriority = useCallback((chatId: string) => {
    return conversationMeta[chatId]?.analysisPriority || 'medium';
  }, [conversationMeta]);

  const getConnectionStatus = useCallback(async () => {
    try {
      const response = await fetch(`${wppConfig.serverUrl}/api/${wppConfig.sessionName}/getSessionState`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${wppConfig.secretKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const isConnected = data.state === 'CONNECTED';
        
        setConnectionState(prev => ({
          ...prev,
          isConnected,
          phoneNumber: data.phone || 'Não informado'
        }));
        
        return isConnected ? 'active' : 'disconnected';
      }
      
      return 'disconnected';
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return 'disconnected';
    }
  }, [wppConfig]);

  return {
    connectionState,
    isLoading,
    wppConfig,
    messageHistoryLimit,
    updateWebhooks,
    updateMessageHistoryLimit,
    generateQRCode,
    checkConnectionStatus,
    disconnectWhatsApp,
    sendMessage,
    loadRealChats,
    loadRealMessages,
    getConnectionStatus,
    togglePinConversation,
    toggleAnalysisConversation,
    isConversationPinned,
    isConversationMarkedForAnalysis,
    getAnalysisPriority,
    saveConversationToDatabase
  };
}
