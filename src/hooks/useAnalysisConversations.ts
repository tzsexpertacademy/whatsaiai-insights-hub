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
  analysis_results?: any[];
  marked_for_analysis: boolean;
}

export function useAnalysisConversations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<AnalysisConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAnalysisConversations = useCallback(async () => {
    console.log('🔍 CARREGANDO CONVERSAS MARCADAS...');
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
      console.log('📡 Fazendo query no Supabase...');
      console.log('🎯 Query params:', { 
        table: 'whatsapp_conversations_analysis',
        userId: user.id,
        markedFilter: true 
      });
      
      // QUERY DETALHADA COM LOGS
      const { data, error, count } = await supabase
        .from('whatsapp_conversations_analysis')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('marked_for_analysis', true)
        .order('created_at', { ascending: false })
        .order('marked_at', { ascending: false });

      console.log('📊 Resultado COMPLETO da query:', { 
        data, 
        error, 
        count,
        dataLength: data?.length || 0,
        hasData: !!data,
        isArray: Array.isArray(data)
      });

      if (error) {
        console.error('❌ Erro na query:', error);
        console.error('📋 Detalhes COMPLETOS do erro:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          stack: error.stack
        });
        throw error;
      }
      
      console.log('📈 Raw data DETALHADA:', {
        totalResults: count,
        dataArray: data,
        firstItem: data?.[0],
        dataType: typeof data,
        isArrayCheck: Array.isArray(data)
      });
      
      if (!data || data.length === 0) {
        console.log('⚠️ NENHUMA conversa marcada encontrada!');
        console.log('🔍 Verificando se existem dados SEM filtro...');
        
        // TESTE: buscar TODOS os dados do usuário para debug
        const { data: allUserData, error: allError } = await supabase
          .from('whatsapp_conversations_analysis')
          .select('*')
          .eq('user_id', user.id);
          
        console.log('🔍 TODOS os dados do usuário:', { allUserData, allError });
        
        setConversations([]);
        return;
      }

      console.log('🔄 Convertendo dados...');
      const convertedData: AnalysisConversation[] = data.map((item, index) => {
        console.log(`📋 Convertendo item ${index}:`, {
          id: item.id,
          chatId: item.chat_id,
          contactName: item.contact_name,
          markedForAnalysis: item.marked_for_analysis,
          analysisStatus: item.analysis_status,
          originalItem: item
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
          marked_for_analysis: item.marked_for_analysis
        };
      });
      
      console.log('✅ Conversas FINAIS processadas:', {
        totalProcessed: convertedData.length,
        conversations: convertedData,
        firstConversation: convertedData[0]
      });
      
      setConversations(convertedData);
      
      // LOG FINAL DO ESTADO
      setTimeout(() => {
        console.log('🎯 Estado FINAL setado:', {
          conversationsLength: convertedData.length,
          stateWillBe: convertedData
        });
      }, 100);
      
    } catch (error) {
      console.error('❌ ERRO GERAL ao carregar conversas:', error);
      console.error('📋 Stack trace completo:', error?.stack);
      
      toast({
        title: "Erro ao carregar conversas",
        description: `Erro: ${error.message || 'Não foi possível carregar as conversas'}`,
        variant: "destructive"
      });
      setConversations([]);
    } finally {
      setIsLoading(false);
      console.log('🏁 Finalizando carregamento de conversas');
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
