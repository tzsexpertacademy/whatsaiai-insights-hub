
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CacheEntry {
  id: string;
  conversation_id: string;
  conversation_type: string;
  content_hash: string;
  last_analysis_date: string;
  analysis_results: any;
  message_count: number;
  processed_by_assistants: string[];
}

interface AnalysisSummary {
  id: string;
  analysis_type: string;
  summary_content: string;
  data_hash: string;
  conversations_analyzed: number;
  chat_messages_analyzed: number;
  insights_generated: number;
  cost_estimate: number;
  created_at: string;
}

export function useCacheManager() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Gerar hash simples dos dados para comparação
  const generateDataHash = useCallback((data: any): string => {
    const content = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }, []);

  // Verificar se os dados já foram analisados
  const checkAnalysisCache = useCallback(async (
    conversationsData: any[],
    chatHistoryData: any[],
    analysisType: string
  ) => {
    if (!user?.id) return null;

    try {
      const allData = { conversations: conversationsData, chatHistory: chatHistoryData };
      const dataHash = generateDataHash(allData);

      // Verificar se já existe uma análise com este hash
      const { data: existingSummary, error } = await supabase
        .from('analysis_summaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('analysis_type', analysisType)
        .eq('data_hash', dataHash)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar cache:', error);
        return null;
      }

      if (existingSummary) {
        console.log('✅ Análise encontrada no cache:', existingSummary.created_at);
        
        // Atualizar estatísticas de cache hit
        await updateCostControl(user.id, { cache_hits: 1 });
        
        return {
          cached: true,
          summary: existingSummary,
          message: `Análise já realizada em ${new Date(existingSummary.created_at).toLocaleString('pt-BR')}`
        };
      }

      return {
        cached: false,
        dataHash,
        message: 'Dados novos detectados - prosseguindo com análise'
      };

    } catch (error) {
      console.error('Erro no cache manager:', error);
      return null;
    }
  }, [user?.id, generateDataHash]);

  // Salvar resumo da análise
  const saveAnalysisSummary = useCallback(async (
    analysisType: string,
    dataHash: string,
    summaryContent: string,
    stats: {
      conversationsAnalyzed: number;
      chatMessagesAnalyzed: number;
      insightsGenerated: number;
      costEstimate: number;
    }
  ) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('analysis_summaries')
        .insert({
          user_id: user.id,
          analysis_type: analysisType,
          summary_content: summaryContent,
          data_hash: dataHash,
          conversations_analyzed: stats.conversationsAnalyzed,
          chat_messages_analyzed: stats.chatMessagesAnalyzed,
          insights_generated: stats.insightsGenerated,
          cost_estimate: stats.costEstimate
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar resumo:', error);
        return null;
      }

      // Atualizar estatísticas de cache miss
      await updateCostControl(user.id, { 
        cache_miss: 1,
        total_analyses: 1,
        total_cost_estimate: stats.costEstimate,
        conversations_processed: stats.conversationsAnalyzed,
        insights_generated: stats.insightsGenerated
      });

      console.log('✅ Resumo da análise salvo:', data.id);
      return data;

    } catch (error) {
      console.error('Erro ao salvar resumo:', error);
      return null;
    }
  }, [user?.id]);

  // Atualizar controle de custos
  const updateCostControl = useCallback(async (userId: string, stats: {
    cache_hits?: number;
    cache_miss?: number;
    total_analyses?: number;
    total_cost_estimate?: number;
    conversations_processed?: number;
    insights_generated?: number;
  }) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Verificar se já existe registro para hoje
      const { data: existing, error: selectError } = await supabase
        .from('analysis_cost_control')
        .select('*')
        .eq('user_id', userId)
        .eq('analysis_date', today)
        .maybeSingle();

      if (selectError) {
        console.error('Erro ao buscar controle de custos:', selectError);
        return;
      }

      if (existing) {
        // Atualizar registro existente
        const updates = {
          total_analyses: (existing.total_analyses || 0) + (stats.total_analyses || 0),
          total_cost_estimate: parseFloat(existing.total_cost_estimate || '0') + (stats.total_cost_estimate || 0),
          conversations_processed: (existing.conversations_processed || 0) + (stats.conversations_processed || 0),
          insights_generated: (existing.insights_generated || 0) + (stats.insights_generated || 0),
          cache_hits: (existing.cache_hits || 0) + (stats.cache_hits || 0),
          cache_miss: (existing.cache_miss || 0) + (stats.cache_miss || 0)
        };

        const { error: updateError } = await supabase
          .from('analysis_cost_control')
          .update(updates)
          .eq('id', existing.id);

        if (updateError) {
          console.error('Erro ao atualizar controle de custos:', updateError);
        }
      } else {
        // Criar novo registro
        const { error: insertError } = await supabase
          .from('analysis_cost_control')
          .insert({
            user_id: userId,
            analysis_date: today,
            ...stats
          });

        if (insertError) {
          console.error('Erro ao criar controle de custos:', insertError);
        }
      }
    } catch (error) {
      console.error('Erro no controle de custos:', error);
    }
  }, []);

  // Buscar histórico de análises
  const getAnalysisHistory = useCallback(async (limit: number = 10) => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('analysis_summaries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar histórico:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  }, [user?.id]);

  // Buscar estatísticas de custos
  const getCostStats = useCallback(async (days: number = 30) => {
    if (!user?.id) return null;

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('analysis_cost_control')
        .select('*')
        .eq('user_id', user.id)
        .gte('analysis_date', startDateStr)
        .order('analysis_date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return null;
      }

      // Calcular totais
      const totals = (data || []).reduce((acc, day) => ({
        totalAnalyses: acc.totalAnalyses + (day.total_analyses || 0),
        totalCost: acc.totalCost + parseFloat(day.total_cost_estimate || '0'),
        totalConversations: acc.totalConversations + (day.conversations_processed || 0),
        totalInsights: acc.totalInsights + (day.insights_generated || 0),
        cacheHits: acc.cacheHits + (day.cache_hits || 0),
        cacheMiss: acc.cacheMiss + (day.cache_miss || 0)
      }), {
        totalAnalyses: 0,
        totalCost: 0,
        totalConversations: 0,
        totalInsights: 0,
        cacheHits: 0,
        cacheMiss: 0
      });

      const cacheEfficiency = totals.cacheHits + totals.cacheMiss > 0 
        ? (totals.cacheHits / (totals.cacheHits + totals.cacheMiss)) * 100 
        : 0;

      return {
        ...totals,
        cacheEfficiency: Math.round(cacheEfficiency),
        dailyData: data,
        period: days
      };

    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return null;
    }
  }, [user?.id]);

  return {
    isLoading,
    checkAnalysisCache,
    saveAnalysisSummary,
    getAnalysisHistory,
    getCostStats,
    generateDataHash
  };
}
