
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useConversationPersistence() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveConversationToDatabase = useCallback(async (
    chatId: string,
    chatName: string,
    messages: any[],
    isPinned: boolean = false
  ) => {
    console.log('💾 Salvando conversa no banco:', {
      chatId,
      chatName,
      messageCount: messages.length,
      isPinned
    });

    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se a conversa já existe
      const { data: existingConversation } = await supabase
        .from('whatsapp_conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('contact_phone', chatId)
        .single();

      const conversationData = {
        user_id: user.id,
        contact_name: chatName,
        contact_phone: chatId,
        messages: messages,
        session_id: `wpp_${chatId}_${Date.now()}`,
        updated_at: new Date().toISOString()
      };

      let conversationId;

      if (existingConversation) {
        // Atualizar conversa existente
        const { data, error } = await supabase
          .from('whatsapp_conversations')
          .update(conversationData)
          .eq('id', existingConversation.id)
          .select('id')
          .single();

        if (error) throw error;
        conversationId = data.id;

        console.log('✅ Conversa atualizada no banco:', existingConversation.id);
      } else {
        // Criar nova conversa
        const { data, error } = await supabase
          .from('whatsapp_conversations')
          .insert(conversationData)
          .select('id')
          .single();

        if (error) throw error;
        conversationId = data.id;

        console.log('✅ Nova conversa salva no banco:', data.id);
      }

      // Salvar mensagens individuais na tabela whatsapp_messages
      const messagesToSave = messages.map(msg => ({
        user_id: user.id,
        conversation_id: conversationId,
        message_text: msg.processedText || msg.body || msg.text || 'Mensagem sem texto',
        sender_type: msg.fromMe ? 'user' : 'contact',
        timestamp: msg.timestamp || new Date().toISOString(),
        ai_generated: false
      }));

      if (messagesToSave.length > 0) {
        // Deletar mensagens antigas desta conversa
        await supabase
          .from('whatsapp_messages')
          .delete()
          .eq('conversation_id', conversationId);

        // Inserir novas mensagens
        const { error: messagesError } = await supabase
          .from('whatsapp_messages')
          .insert(messagesToSave);

        if (messagesError) {
          console.error('❌ Erro ao salvar mensagens:', messagesError);
        } else {
          console.log(`✅ ${messagesToSave.length} mensagens salvas no banco`);
        }
      }

      if (isPinned) {
        toast({
          title: "💾 Conversa fixada salva",
          description: `${messages.length} mensagens persistidas no banco`
        });
      }

      return conversationId;

    } catch (error) {
      console.error('❌ Erro ao salvar conversa:', error);
      
      toast({
        title: "❌ Erro ao salvar conversa",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  const savePinnedConversations = useCallback(async (
    conversations: Array<{ chatId: string; chatName: string; messages: any[] }>
  ) => {
    console.log('📌 Salvando conversas fixadas no banco:', conversations.length);

    const savePromises = conversations.map(conv => 
      saveConversationToDatabase(conv.chatId, conv.chatName, conv.messages, true)
    );

    try {
      await Promise.all(savePromises);
      
      toast({
        title: "✅ Conversas fixadas salvas",
        description: `${conversations.length} conversas persistidas com sucesso`
      });
    } catch (error) {
      console.error('❌ Erro ao salvar conversas fixadas:', error);
    }
  }, [saveConversationToDatabase, toast]);

  const verifyConversationInDatabase = useCallback(async (chatId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const { data, error } = await supabase
        .from('whatsapp_conversations')
        .select('id, messages, updated_at')
        .eq('user_id', user.id)
        .eq('contact_phone', chatId)
        .single();

      if (error || !data) {
        console.log('❌ Conversa não encontrada no banco:', chatId);
        return false;
      }

      console.log('✅ Conversa encontrada no banco:', {
        id: data.id,
        messageCount: Array.isArray(data.messages) ? data.messages.length : 0,
        lastUpdate: data.updated_at
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar conversa no banco:', error);
      return false;
    }
  }, []);

  return {
    saveConversationToDatabase,
    savePinnedConversations,
    verifyConversationInDatabase,
    isSaving
  };
}
