
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
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return false;
    }

    setIsMarking(true);
    console.log('🏷️ Marcando conversa para análise:', { chatId, contactName, contactPhone, priority });

    try {
      // Verificar se já existe
      const { data: existing } = await supabase
        .from('whatsapp_conversations_analysis')
        .select('id, marked_for_analysis')
        .eq('user_id', user.id)
        .eq('chat_id', chatId)
        .single();

      if (existing) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('whatsapp_conversations_analysis')
          .update({
            marked_for_analysis: !existing.marked_for_analysis,
            priority,
            contact_name: contactName,
            contact_phone: contactPhone,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;

        toast({
          title: existing.marked_for_analysis ? "Conversa desmarcada" : "Conversa marcada",
          description: existing.marked_for_analysis 
            ? "Conversa removida da análise IA" 
            : "Conversa marcada para análise IA"
        });

        console.log('✅ Conversa atualizada:', existing.marked_for_analysis ? 'desmarcada' : 'marcada');
        return !existing.marked_for_analysis;
      } else {
        // Criar novo registro
        const { error } = await supabase
          .from('whatsapp_conversations_analysis')
          .insert({
            user_id: user.id,
            chat_id: chatId,
            contact_name: contactName,
            contact_phone: contactPhone,
            priority,
            marked_for_analysis: true,
            analysis_status: 'pending'
          });

        if (error) throw error;

        toast({
          title: "Conversa marcada",
          description: "Conversa marcada para análise IA"
        });

        console.log('✅ Nova conversa marcada para análise');
        return true;
      }
    } catch (error) {
      console.error('❌ Erro ao marcar conversa:', error);
      toast({
        title: "Erro ao marcar conversa",
        description: "Não foi possível marcar a conversa para análise",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsMarking(false);
    }
  };

  const updateConversationPriority = async (
    chatId: string,
    priority: 'high' | 'medium' | 'low'
  ) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('whatsapp_conversations_analysis')
        .update({ priority })
        .eq('user_id', user.id)
        .eq('chat_id', chatId);

      if (error) throw error;

      toast({
        title: "Prioridade atualizada",
        description: `Prioridade alterada para ${priority}`
      });

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
