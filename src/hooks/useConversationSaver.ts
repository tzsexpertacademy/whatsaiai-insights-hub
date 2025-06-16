
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConversationMessage {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: string;
  fromMe: boolean;
}

export function useConversationSaver() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const saveMarkedConversationToDatabase = async (
    chatId: string,
    contactName: string,
    contactPhone: string,
    messages: ConversationMessage[]
  ) => {
    console.log('💾 SALVANDO conversa marcada no banco:', { 
      chatId, 
      contactName, 
      totalMessages: messages.length,
      audioMessages: messages.filter(m => m.text.includes('[Transcrição:')).length
    });
    
    if (!user?.id) {
      console.error('❌ Usuário não autenticado para salvar conversa');
      return false;
    }

    if (!messages || messages.length === 0) {
      console.log('⚠️ Nenhuma mensagem para salvar');
      return false;
    }

    setIsSaving(true);

    try {
      // Verificar se já existe no banco
      const { data: existing, error: selectError } = await supabase
        .from('whatsapp_conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('contact_phone', contactPhone)
        .eq('contact_name', contactName)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar conversa existente:', selectError);
        throw selectError;
      }

      // Preparar dados das mensagens para o banco (incluindo transcrições)
      const messagesForDB = messages.map(msg => ({
        id: msg.id,
        text: msg.text, // Já inclui transcrições no formato "[Transcrição: ...]"
        sender: msg.sender,
        timestamp: msg.timestamp,
        fromMe: msg.fromMe
      }));

      console.log('📝 Mensagens preparadas para análise:', {
        totalMessages: messagesForDB.length,
        withTranscriptions: messagesForDB.filter(m => m.text.includes('[Transcrição:')).length,
        sampleMessage: messagesForDB[0]?.text.substring(0, 100) + '...'
      });

      const conversationData = {
        user_id: user.id,
        contact_name: contactName,
        contact_phone: contactPhone,
        session_id: chatId,
        messages: messagesForDB,
        emotional_analysis: null,
        psychological_profile: null
      };

      if (existing) {
        // Atualizar conversa existente
        console.log('🔄 Atualizando conversa existente no banco...');
        const { error: updateError } = await supabase
          .from('whatsapp_conversations')
          .update({
            messages: messagesForDB,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error('❌ Erro ao atualizar conversa:', updateError);
          throw updateError;
        }

        console.log('✅ Conversa atualizada no banco com sucesso');
      } else {
        // Criar nova conversa
        console.log('➕ Criando nova conversa no banco...');
        const { error: insertError } = await supabase
          .from('whatsapp_conversations')
          .insert(conversationData);

        if (insertError) {
          console.error('❌ Erro ao criar conversa:', insertError);
          throw insertError;
        }

        console.log('✅ Nova conversa salva no banco com sucesso');
      }

      const audioCount = messages.filter(m => m.text.includes('[Transcrição:')).length;
      
      toast({
        title: "💾 Conversa salva",
        description: `${messages.length} mensagens salvas (${audioCount} áudios transcritos) para análise comportamental`
      });

      return true;

    } catch (error: any) {
      console.error('❌ ERRO ao salvar conversa no banco:', error);
      toast({
        title: "❌ Erro ao salvar conversa",
        description: `Erro: ${error.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveMarkedConversationToDatabase,
    isSaving
  };
}
