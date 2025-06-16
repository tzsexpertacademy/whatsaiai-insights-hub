
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalysisHistoryEntry {
  id: string;
  conversation_analysis_id: string;
  user_id: string;
  analysis_type: string;
  assistant_id: string;
  assistant_name?: string;
  analysis_results: any[];
  analysis_prompt?: string;
  analysis_status: string;
  messages_analyzed: number;
  tokens_used: number;
  cost_estimate: number;
  processing_time_ms: number;
  created_at: string;
  updated_at: string;
}

export function useAnalysisHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAnalysisHistory = useCallback(async (conversationAnalysisId?: string) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      let query = supabase
        .from('conversation_analysis_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (conversationAnalysisId) {
        query = query.eq('conversation_analysis_id', conversationAnalysisId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setAnalysisHistory(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico de análises:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico de análises",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  const saveAnalysisToHistory = useCallback(async (analysisData: {
    conversation_analysis_id: string;
    analysis_type: string;
    assistant_id: string;
    assistant_name?: string;
    analysis_results: any[];
    analysis_prompt?: string;
    messages_analyzed?: number;
    tokens_used?: number;
    cost_estimate?: number;
    processing_time_ms?: number;
  }) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('conversation_analysis_history')
        .insert({
          user_id: user.id,
          ...analysisData,
          analysis_status: 'completed',
          messages_analyzed: analysisData.messages_analyzed || 0,
          tokens_used: analysisData.tokens_used || 0,
          cost_estimate: analysisData.cost_estimate || 0,
          processing_time_ms: analysisData.processing_time_ms || 0
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar o state local
      setAnalysisHistory(prev => [data, ...prev]);

      return data;
    } catch (error) {
      console.error('Erro ao salvar análise no histórico:', error);
      toast({
        title: "Erro ao salvar histórico",
        description: "Não foi possível salvar a análise no histórico",
        variant: "destructive"
      });
      return null;
    }
  }, [user?.id, toast]);

  const deleteAnalysisFromHistory = useCallback(async (historyId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('conversation_analysis_history')
        .delete()
        .eq('id', historyId)
        .eq('user_id', user.id);

      if (error) throw error;

      setAnalysisHistory(prev => prev.filter(entry => entry.id !== historyId));

      toast({
        title: "Análise removida",
        description: "Entrada do histórico foi removida com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar análise do histórico:', error);
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível remover a análise do histórico",
        variant: "destructive"
      });
    }
  }, [user?.id, toast]);

  const getAnalysisStats = useCallback(() => {
    const totalAnalyses = analysisHistory.length;
    const totalCost = analysisHistory.reduce((sum, entry) => sum + (entry.cost_estimate || 0), 0);
    const totalTokens = analysisHistory.reduce((sum, entry) => sum + (entry.tokens_used || 0), 0);
    const avgProcessingTime = totalAnalyses > 0 
      ? analysisHistory.reduce((sum, entry) => sum + (entry.processing_time_ms || 0), 0) / totalAnalyses 
      : 0;

    const analysisTypeStats = analysisHistory.reduce((acc, entry) => {
      acc[entry.analysis_type] = (acc[entry.analysis_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const assistantStats = analysisHistory.reduce((acc, entry) => {
      const assistant = entry.assistant_name || entry.assistant_id;
      acc[assistant] = (acc[assistant] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAnalyses,
      totalCost,
      totalTokens,
      avgProcessingTime,
      analysisTypeStats,
      assistantStats
    };
  }, [analysisHistory]);

  return {
    analysisHistory,
    isLoading,
    loadAnalysisHistory,
    saveAnalysisToHistory,
    deleteAnalysisFromHistory,
    getAnalysisStats
  };
}
