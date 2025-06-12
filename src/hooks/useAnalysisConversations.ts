
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalysisConversation {
  id: string;
  chat_id: string;
  contact_name: string;
  contact_phone: string;
  priority: 'high' | 'medium' | 'low';
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed';
  marked_at: string;
  last_analyzed_at?: string;
  analysis_results?: any[];
  marked_for_analysis: boolean;
}

export function useAnalysisConversations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<AnalysisConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAnalysisConversations = useCallback(async () => {
    if (!user?.id) {
      console.warn('🔒 useAnalysisConversations: Usuário não autenticado');
      return;
    }

    setIsLoading(true);
    console.log('🔍 Carregando conversas marcadas para análise...');
    
    try {
      // Buscar TODAS as conversas marcadas para análise
      const { data, error } = await supabase
        .from('whatsapp_conversations_analysis')
        .select('*')
        .eq('user_id', user.id)
        .eq('marked_for_analysis', true)
        .order('marked_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar conversas marcadas:', error);
        throw error;
      }
      
      console.log('📊 Conversas marcadas encontradas:', data);
      
      if (!data || data.length === 0) {
        console.log('⚠️ Nenhuma conversa marcada encontrada');
        setConversations([]);
        return;
      }

      // Converter os dados para o tipo esperado
      const convertedData: AnalysisConversation[] = data.map(item => ({
        id: item.id,
        chat_id: item.chat_id,
        contact_name: item.contact_name,
        contact_phone: item.contact_phone,
        priority: item.priority as 'high' | 'medium' | 'low',
        analysis_status: item.analysis_status as 'pending' | 'processing' | 'completed' | 'failed',
        marked_at: item.marked_at,
        last_analyzed_at: item.last_analyzed_at || undefined,
        analysis_results: item.analysis_results || [],
        marked_for_analysis: item.marked_for_analysis
      }));
      
      console.log('✅ Conversas processadas:', convertedData);
      console.log(`📈 Total de conversas carregadas: ${convertedData.length}`);
      setConversations(convertedData);
      
    } catch (error) {
      console.error('❌ Erro ao carregar conversas para análise:', error);
      toast({
        title: "Erro ao carregar conversas",
        description: "Não foi possível carregar as conversas marcadas para análise",
        variant: "destructive"
      });
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  const updateAnalysisStatus = useCallback(async (conversationId: string, status: 'pending' | 'processing' | 'completed' | 'failed') => {
    if (!user?.id) return;

    try {
      const updateData: any = { analysis_status: status };
      
      if (status === 'completed') {
        updateData.last_analyzed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('whatsapp_conversations_analysis')
        .update(updateData)
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Atualizar o estado local
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, analysis_status: status, ...(status === 'completed' && { last_analyzed_at: new Date().toISOString() }) }
            : conv
        )
      );
      
      console.log(`✅ Status da conversa ${conversationId} atualizado para: ${status}`);
    } catch (error) {
      console.error('❌ Erro ao atualizar status da análise:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da análise",
        variant: "destructive"
      });
    }
  }, [user?.id, toast]);

  return {
    conversations,
    isLoading,
    loadAnalysisConversations,
    updateAnalysisStatus
  };
}
