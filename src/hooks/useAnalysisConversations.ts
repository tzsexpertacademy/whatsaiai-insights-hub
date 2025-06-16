
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

export type AnalysisConversation = Database['public']['Tables']['whatsapp_conversations_analysis']['Row'];

export function useAnalysisConversations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<AnalysisConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAnalysisConversations = useCallback(async () => {
    if (!user?.id) {
      console.log('❌ [ANALYSIS-CONVERSATIONS] Usuário não autenticado');
      return;
    }

    setIsLoading(true);
    console.log('🔄 [ANALYSIS-CONVERSATIONS] Carregando conversas marcadas...');

    try {
      const { data, error } = await supabase
        .from('whatsapp_conversations_analysis')
        .select('*')
        .eq('user_id', user.id)
        .eq('marked_for_analysis', true)
        .order('marked_at', { ascending: false });

      if (error) {
        console.error('❌ [ANALYSIS-CONVERSATIONS] Erro ao carregar:', error);
        throw error;
      }

      console.log(`✅ [ANALYSIS-CONVERSATIONS] ${data?.length || 0} conversas carregadas`);
      setConversations(data || []);

    } catch (error) {
      console.error('❌ [ANALYSIS-CONVERSATIONS] Erro fatal:', error);
      toast({
        title: "Erro ao carregar conversas",
        description: "Não foi possível carregar as conversas marcadas para análise",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  const updateAnalysisStatus = useCallback(async (
    conversationId: string, 
    status: 'pending' | 'processing' | 'completed' | 'failed'
  ) => {
    try {
      const { error } = await supabase
        .from('whatsapp_conversations_analysis')
        .update({ 
          analysis_status: status,
          last_analyzed_at: status === 'completed' ? new Date().toISOString() : undefined
        })
        .eq('id', conversationId);

      if (error) throw error;

      // Atualizar estado local
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              analysis_status: status,
              last_analyzed_at: status === 'completed' ? new Date().toISOString() : conv.last_analyzed_at
            }
          : conv
      ));

    } catch (error) {
      console.error('❌ [ANALYSIS-CONVERSATIONS] Erro ao atualizar status:', error);
    }
  }, []);

  // Auto-carregar na inicialização
  useEffect(() => {
    loadAnalysisConversations();
  }, [loadAnalysisConversations]);

  return {
    conversations,
    isLoading,
    loadAnalysisConversations,
    updateAnalysisStatus
  };
}
