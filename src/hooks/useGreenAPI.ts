
import { useEffect } from 'react';
import { useWhatsAppConfig } from './useWhatsAppConfig';
import { useWhatsAppConnection } from './useWhatsAppConnection';
import { useWhatsAppChats } from './useWhatsAppChats';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useGreenAPI() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { whatsappConfig, updateWhatsAppConfig, isSaving } = useWhatsAppConfig();
  const { connectionState, checkConnection } = useWhatsAppConnection();
  const { chats, messages, isLoading, loadChats, loadChatHistory } = useWhatsAppChats();

  // Verificar conexão quando as credenciais mudarem
  useEffect(() => {
    if (whatsappConfig.instanceId && whatsappConfig.apiToken) {
      console.log('🔄 Verificando conexão automaticamente...');
      checkConnection(whatsappConfig.instanceId, whatsappConfig.apiToken)
        .then(({ phoneNumber }) => {
          if (phoneNumber && phoneNumber !== whatsappConfig.phoneNumber) {
            updateWhatsAppConfig({ phoneNumber });
          }
        });
    }
  }, [whatsappConfig.instanceId, whatsappConfig.apiToken]);

  // Carregar chats quando conectado
  useEffect(() => {
    if (connectionState.isConnected && user?.id) {
      loadChats();
    }
  }, [connectionState.isConnected, user?.id, loadChats]);

  const sendMessage = async (chatId: string, message: string): Promise<boolean> => {
    if (!whatsappConfig.instanceId || !whatsappConfig.apiToken) {
      toast({
        title: "Erro de configuração",
        description: "GREEN-API não está configurado",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log(`📤 Enviando mensagem para ${chatId}`);
      
      const response = await fetch(
        `https://api.green-api.com/waInstance${whatsappConfig.instanceId}/sendMessage/${whatsappConfig.apiToken}`,
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
        throw new Error(`Erro ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Mensagem enviada:', result);

      // Salvar no banco
      try {
        let { data: conversation } = await supabase
          .from('whatsapp_conversations')
          .select('*')
          .eq('user_id', user?.id)
          .eq('contact_phone', chatId)
          .maybeSingle();

        if (!conversation && user?.id) {
          const { data: newConv } = await supabase
            .from('whatsapp_conversations')
            .insert({
              user_id: user.id,
              contact_phone: chatId,
              contact_name: chatId.split('@')[0],
              messages: []
            })
            .select()
            .single();

          conversation = newConv;
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
        console.error('❌ Erro ao salvar no banco:', dbError);
      }

      toast({
        title: "Mensagem enviada",
        description: "Mensagem enviada com sucesso"
      });

      return true;
    } catch (error: any) {
      console.error('❌ Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const refreshChats = async () => {
    await loadChats();
  };

  const checkConnectionStatus = () => {
    return checkConnection(whatsappConfig.instanceId, whatsappConfig.apiToken);
  };

  return {
    // Estado
    greenAPIState: {
      isConnected: connectionState.isConnected,
      phoneNumber: connectionState.phoneNumber,
      instanceId: whatsappConfig.instanceId,
      isGenerating: connectionState.isChecking,
      qrCode: '',
      lastConnected: connectionState.lastChecked
    },
    
    // Configuração
    apiConfig: whatsappConfig,
    updateAPIConfig: updateWhatsAppConfig,
    
    // Chats e mensagens
    chats,
    messages,
    loadChats,
    loadChatHistory,
    sendMessage,
    refreshChats,
    
    // Status
    isLoading: isLoading || isSaving,
    checkConnectionStatus,
    
    // Funções de chat (compatibilidade)
    togglePinChat: () => {},
    toggleMonitorChat: () => {},
    assignAssistantToChat: () => {},
    selectedAssistant: '',
    setSelectedAssistant: () => {},
    getQRCode: async () => '',
    disconnect: async () => {}
  };
}
