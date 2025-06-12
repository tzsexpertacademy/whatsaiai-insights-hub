
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConversationData {
  chatId: string;
  contactName: string;
  contactPhone: string;
  messages: any[];
  isGroup: boolean;
}

export function useConversationDatabase() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const saveConversationToDatabase = async (conversationData: ConversationData) => {
    console.log('💾 INICIANDO SALVAMENTO NO BANCO:', {
      chatId: conversationData.chatId,
      contactName: conversationData.contactName,
      messagesCount: conversationData.messages.length,
      userId: user?.id
    });

    if (!user?.id) {
      console.error('❌ Usuário não autenticado');
      toast({
        title: "Erro de autenticação",
        description: "Usuário não está logado",
        variant: "destructive"
      });
      return false;
    }

    setIsSaving(true);

    try {
      // 1. Verificar se a conversa já existe na tabela principal
      console.log('🔍 Verificando se conversa já existe no banco...');
      const { data: existingConversation, error: selectError } = await supabase
        .from('whatsapp_conversations')
        .select('id, messages')
        .eq('user_id', user.id)
        .eq('contact_phone', conversationData.chatId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar conversa existente:', selectError);
        throw selectError;
      }

      console.log('📊 Conversa existente encontrada:', !!existingConversation);

      // 2. Preparar dados para salvar
      const conversationPayload = {
        user_id: user.id,
        contact_name: conversationData.contactName,
        contact_phone: conversationData.chatId,
        session_id: `wpp_${Date.now()}`,
        messages: conversationData.messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          timestamp: msg.timestamp,
          fromMe: msg.fromMe,
          sender: msg.sender,
          isAudio: msg.isAudio || false,
          status: msg.status
        }))
      };

      if (existingConversation) {
        // 3a. Atualizar conversa existente
        console.log('✏️ Atualizando conversa existente...');
        
        // Mesclar mensagens antigas com novas (evitar duplicatas)
        const existingMessages = existingConversation.messages || [];
        const existingMessageIds = new Set(existingMessages.map((msg: any) => msg.id));
        const newMessages = conversationPayload.messages.filter(msg => !existingMessageIds.has(msg.id));
        
        const updatedMessages = [...existingMessages, ...newMessages];
        
        const { data: updateData, error: updateError } = await supabase
          .from('whatsapp_conversations')
          .update({
            messages: updatedMessages,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConversation.id)
          .select();

        if (updateError) {
          console.error('❌ Erro ao atualizar conversa:', updateError);
          throw updateError;
        }

        console.log('✅ Conversa atualizada no banco:', {
          id: existingConversation.id,
          newMessagesAdded: newMessages.length,
          totalMessages: updatedMessages.length
        });

        toast({
          title: "💾 Conversa atualizada",
          description: `${newMessages.length} novas mensagens adicionadas ao banco de dados`
        });

      } else {
        // 3b. Criar nova conversa
        console.log('➕ Criando nova conversa no banco...');
        
        const { data: insertData, error: insertError } = await supabase
          .from('whatsapp_conversations')
          .insert(conversationPayload)
          .select();

        if (insertError) {
          console.error('❌ Erro ao inserir nova conversa:', insertError);
          throw insertError;
        }

        console.log('✅ Nova conversa salva no banco:', {
          id: insertData[0].id,
          messagesCount: conversationPayload.messages.length
        });

        toast({
          title: "💾 Conversa salva",
          description: `Conversa salva no banco com ${conversationPayload.messages.length} mensagens`
        });
      }

      return true;

    } catch (error) {
      console.error('❌ ERRO GERAL ao salvar conversa no banco:', error);
      console.error('📋 Detalhes do erro:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      
      toast({
        title: "Erro ao salvar conversa",
        description: `Erro: ${error.message || 'Não foi possível salvar no banco de dados'}`,
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsSaving(false);
      console.log('🏁 Finalizando processo de salvamento no banco');
    }
  };

  return {
    saveConversationToDatabase,
    isSaving
  };
}
