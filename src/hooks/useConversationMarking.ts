
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useConversationMarking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isMarking, setIsMarking] = useState(false);

  const markConversationForAnalysis = async (
    chatId: string,
    contactName: string,
    contactPhone: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    console.log('🚀 INÍCIO MARCAÇÃO:', { chatId, contactName, contactPhone, priority });
    console.log('👤 Usuário atual:', { userId: user?.id, userEmail: user?.email });

    if (!user?.id) {
      console.error('❌ ERRO: Usuário não autenticado', { user });
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return false;
    }

    setIsMarking(true);
    console.log('🔄 Iniciando processo de marcação...');

    try {
      console.log('🔍 Verificando se conversa já existe...');
      const { data: existing, error: selectError } = await supabase
        .from('whatsapp_conversations_analysis')
        .select('id, marked_for_analysis, priority')
        .eq('user_id', user.id)
        .eq('chat_id', chatId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('❌ ERRO na consulta:', selectError);
        throw selectError;
      }

      console.log('📊 Resultado da consulta:', { existing, selectError });

      if (existing) {
        console.log('✏️ Atualizando conversa existente...');
        const newStatus = !existing.marked_for_analysis;
        
        const { data: updateData, error: updateError } = await supabase
          .from('whatsapp_conversations_analysis')
          .update({
            marked_for_analysis: newStatus,
            priority,
            contact_name: contactName,
            contact_phone: contactPhone,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select();

        console.log('📝 Resultado da atualização:', { updateData, updateError });

        if (updateError) {
          console.error('❌ ERRO na atualização:', updateError);
          throw updateError;
        }

        toast({
          title: newStatus ? "Conversa marcada" : "Conversa desmarcada",
          description: newStatus 
            ? "Conversa marcada para análise IA" 
            : "Conversa removida da análise IA"
        });

        console.log('✅ Conversa atualizada com sucesso:', newStatus ? 'marcada' : 'desmarcada');
        return newStatus;
      } else {
        console.log('➕ Criando nova conversa marcada...');
        const insertData = {
          user_id: user.id,
          chat_id: chatId,
          contact_name: contactName,
          contact_phone: contactPhone,
          priority,
          marked_for_analysis: true,
          analysis_status: 'pending'
        };
        
        console.log('📋 Dados para inserção:', insertData);

        const { data: insertResult, error: insertError } = await supabase
          .from('whatsapp_conversations_analysis')
          .insert(insertData)
          .select();

        console.log('📝 Resultado da inserção:', { insertResult, insertError });

        if (insertError) {
          console.error('❌ ERRO na inserção:', insertError);
          throw insertError;
        }

        toast({
          title: "Conversa marcada",
          description: "Conversa marcada para análise IA"
        });

        console.log('✅ Nova conversa marcada com sucesso');
        return true;
      }
    } catch (error) {
      console.error('❌ ERRO GERAL ao marcar conversa:', error);
      console.error('📋 Detalhes do erro:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      toast({
        title: "Erro ao marcar conversa",
        description: `Erro: ${error.message || 'Não foi possível marcar a conversa'}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsMarking(false);
      console.log('🏁 Finalizando processo de marcação');
    }
  };

  const updateConversationPriority = async (
    chatId: string,
    priority: 'high' | 'medium' | 'low'
  ) => {
    if (!user?.id) return false;

    console.log('🎯 Atualizando prioridade:', { chatId, priority, userId: user.id });

    try {
      const { error } = await supabase
        .from('whatsapp_conversations_analysis')
        .update({ priority })
        .eq('user_id', user.id)
        .eq('chat_id', chatId);

      if (error) {
        console.error('❌ Erro ao atualizar prioridade:', error);
        throw error;
      }

      toast({
        title: "Prioridade atualizada",
        description: `Prioridade alterada para ${priority}`
      });

      console.log('✅ Prioridade atualizada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar prioridade:', error);
      return false;
    }
  };

  return {
    markConversationForAnalysis,
    updateConversationPriority,
    isMarking
  };
}
