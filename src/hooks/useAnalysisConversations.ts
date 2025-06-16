
import { useState, useCallback, useMemo } from 'react';
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
  analysis_results: any[];
  marked_for_analysis: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function useAnalysisConversations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<AnalysisConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAnalysisConversations = useCallback(async () => {
    console.log('🔍 CARREGANDO CONVERSAS MARCADAS (SEM DADOS DE TESTE)...');
    console.log('👤 Usuário:', { userId: user?.id, userEmail: user?.email });

    if (!user?.id) {
      console.warn('🔒 Usuário não autenticado, limpando conversas');
      setConversations([]);
      return;
    }

    if (isLoading) {
      console.log('⏳ Carregamento já em andamento, ignorando chamada duplicada');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('📡 Fazendo query NO SUPABASE (FILTRANDO DADOS DE TESTE)...');
      
      const { data, error, count } = await supabase
        .from('whatsapp_conversations_analysis')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('marked_for_analysis', true)
        .not('chat_id', 'like', 'TEST_%')
        .not('contact_name', 'like', '%Teste%')
        .not('contact_name', 'like', '%Debug%')
        .order('created_at', { ascending: false })
        .order('marked_at', { ascending: false });

      console.log('📊 Resultado da query (SEM TESTE):', { 
        data, 
        error, 
        count,
        dataLength: data?.length || 0,
        hasRealData: !!data && data.length > 0
      });

      if (error) {
        console.error('❌ Erro na query:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('⚠️ NENHUMA conversa REAL marcada encontrada!');
        console.log('💡 Dica: Vá para o WhatsApp Chat e marque conversas para análise');
        setConversations([]);
        return;
      }

      console.log('🔄 Convertendo conversas REAIS...');
      const convertedData: AnalysisConversation[] = data.map((item, index) => {
        console.log(`📋 Conversa REAL ${index}:`, {
          id: item.id,
          chatId: item.chat_id,
          contactName: item.contact_name,
          phone: item.contact_phone,
          markedForAnalysis: item.marked_for_analysis,
          analysisStatus: item.analysis_status
        });
        
        return {
          id: item.id,
          chat_id: item.chat_id,
          contact_name: item.contact_name,
          contact_phone: item.contact_phone,
          priority: item.priority as 'high' | 'medium' | 'low',
          analysis_status: item.analysis_status as 'pending' | 'processing' | 'completed' | 'failed',
          marked_at: item.marked_at,
          last_analyzed_at: item.last_analyzed_at || undefined,
          analysis_results: Array.isArray(item.analysis_results) ? item.analysis_results : [],
          marked_for_analysis: item.marked_for_analysis,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
          user_id: item.user_id || user.id
        };
      });
      
      console.log('✅ Conversas REAIS processadas:', {
        totalProcessed: convertedData.length,
        conversations: convertedData
      });
      
      setConversations(convertedData);
      
    } catch (error) {
      console.error('❌ ERRO ao carregar conversas REAIS:', error);
      
      toast({
        title: "Erro ao carregar conversas",
        description: `Erro: ${error.message || 'Não foi possível carregar as conversas'}`,
        variant: "destructive"
      });
      setConversations([]);
    } finally {
      setIsLoading(false);
      console.log('🏁 Finalizando carregamento de conversas REAIS');
    }
  }, [user?.id, toast, isLoading]);

  const updateAnalysisStatus = useCallback(async (conversationId: string, status: 'pending' | 'processing' | 'completed' | 'failed') => {
    if (!user?.id) return;

    console.log('🔄 Atualizando status da análise:', { conversationId, status });

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
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { 
                ...conv, 
                analysis_status: status, 
                ...(status === 'completed' && { last_analyzed_at: new Date().toISOString() }) 
              }
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

  const memoizedReturn = useMemo(() => ({
    conversations,
    isLoading,
    loadAnalysisConversations,
    updateAnalysisStatus
  }), [conversations, isLoading, loadAnalysisConversations, updateAnalysisStatus]);

  return memoizedReturn;
}
