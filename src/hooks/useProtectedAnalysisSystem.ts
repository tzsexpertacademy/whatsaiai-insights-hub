/**
 * SISTEMA PROTEGIDO DE ANÁLISE IA - VERSÃO 2.0
 * 
 * Este hook implementa um sistema robusto de análise que:
 * 1. Garante que assistentes sempre analisem dados reais
 * 2. Implementa cache inteligente para evitar duplicações
 * 3. Protege contra alterações futuras no sistema
 * 4. Controla custos automaticamente
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCacheManager } from './useCacheManager';

interface ProtectedAnalysisConfig {
  analysisType: string;
  assistants: Array<{
    id: string;
    name: string;
    prompt: string;
    model: string;
    area: string;
  }>;
  openaiConfig: {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
  };
  useCache?: boolean;
  onlyRealData?: boolean;
}

interface AnalysisResult {
  success: boolean;
  fromCache: boolean;
  insights: any[];
  summary: string;
  stats: {
    conversationsAnalyzed: number;
    chatMessagesAnalyzed: number;
    insightsGenerated: number;
    costEstimate: number;
  };
  processingTime: number;
  dataHash: string;
  message: string;
}

export function useProtectedAnalysisSystem() {
  const { user } = useAuth();
  const { 
    checkAnalysisCache, 
    saveAnalysisSummary, 
    generateDataHash 
  } = useCacheManager();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [protectionLevel, setProtectionLevel] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  /**
   * FUNÇÃO PRINCIPAL DE ANÁLISE PROTEGIDA
   * Agora busca conversas marcadas para análise no banco
   */
  const executeProtectedAnalysis = useCallback(async (
    config: ProtectedAnalysisConfig
  ): Promise<AnalysisResult | null> => {
    
    if (!user?.id) {
      console.error('🔒 SISTEMA PROTEGIDO: Usuário não autenticado');
      return null;
    }

    if (!config.openaiConfig.apiKey || !config.openaiConfig.apiKey.startsWith('sk-')) {
      console.error('🔒 SISTEMA PROTEGIDO: Chave OpenAI inválida');
      return null;
    }

    setIsAnalyzing(true);
    console.log('🔒 SISTEMA PROTEGIDO: Iniciando análise segura...');

    try {
      // PASSO 1: Buscar conversas marcadas para análise do banco
      console.log('🔍 SISTEMA PROTEGIDO: Buscando conversas marcadas para análise...');
      
      const { data: markedConversations, error: markedError } = await supabase
        .from('whatsapp_conversations_analysis')
        .select('*')
        .eq('user_id', user.id)
        .eq('marked_for_analysis', true)
        .eq('analysis_status', 'pending');

      if (markedError) {
        console.error('🔒 SISTEMA PROTEGIDO: Erro ao buscar conversas marcadas:', markedError);
      }

      // PASSO 2: Buscar dados reais do banco (incluindo conversas marcadas)
      const realData = await fetchRealUserData(user.id, markedConversations || []);
      
      if (!realData || (realData.conversations.length === 0 && realData.chatHistory.length === 0)) {
        console.warn('🔒 SISTEMA PROTEGIDO: Nenhum dado real encontrado');
        return {
          success: false,
          fromCache: false,
          insights: [],
          summary: 'Nenhum dado real encontrado para análise',
          stats: { conversationsAnalyzed: 0, chatMessagesAnalyzed: 0, insightsGenerated: 0, costEstimate: 0 },
          processingTime: 0,
          dataHash: '',
          message: 'Nenhum dado real encontrado'
        };
      }

      // Verificar se há conversas marcadas especificamente
      const hasMarkedConversations = markedConversations && markedConversations.length > 0;
      if (hasMarkedConversations) {
        console.log(`🎯 SISTEMA PROTEGIDO: ${markedConversations.length} conversas marcadas para análise prioritária`);
      }

      // PASSO 3: Verificar cache se habilitado
      if (config.useCache !== false) {
        console.log('🔒 SISTEMA PROTEGIDO: Verificando cache...');
        const cacheResult = await checkAnalysisCache(
          realData.conversations,
          realData.chatHistory,
          config.analysisType
        );

        if (cacheResult?.cached && !hasMarkedConversations) {
          console.log('🔒 SISTEMA PROTEGIDO: Usando dados do cache');
          return {
            success: true,
            fromCache: true,
            insights: [],
            summary: cacheResult.summary.summary_content,
            stats: {
              conversationsAnalyzed: cacheResult.summary.conversations_analyzed,
              chatMessagesAnalyzed: cacheResult.summary.chat_messages_analyzed,
              insightsGenerated: cacheResult.summary.insights_generated,
              costEstimate: cacheResult.summary.cost_estimate
            },
            processingTime: 0,
            dataHash: cacheResult.summary.data_hash,
            message: cacheResult.message
          };
        }
      }

      // PASSO 4: Executar análise com assistentes reais
      console.log('🔒 SISTEMA PROTEGIDO: Executando nova análise...');
      const startTime = Date.now();
      
      const analysisData = {
        userId: user.id,
        openaiConfig: config.openaiConfig,
        assistants: config.assistants,
        analysisType: config.analysisType,
        conversationsData: realData.conversations,
        chatHistoryData: realData.chatHistory,
        markedConversations: markedConversations || [],
        useCache: config.useCache !== false,
        onlyRealData: config.onlyRealData !== false,
        timestamp: new Date().toISOString()
      };

      // Atualizar status das conversas marcadas para "processing"
      if (hasMarkedConversations) {
        for (const conversation of markedConversations) {
          await supabase
            .from('whatsapp_conversations_analysis')
            .update({ analysis_status: 'processing' })
            .eq('id', conversation.id);
        }
      }

      // Chamar função Edge protegida
      const response = await fetch('/api/analyze-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na análise protegida');
      }

      const result = await response.json();
      const processingTime = Date.now() - startTime;

      // PASSO 5: Atualizar status das conversas analisadas
      if (hasMarkedConversations && result.success) {
        for (const conversation of markedConversations) {
          await supabase
            .from('whatsapp_conversations_analysis')
            .update({ 
              analysis_status: 'completed',
              last_analyzed_at: new Date().toISOString(),
              analysis_results: result.insights || []
            })
            .eq('id', conversation.id);
        }
        console.log('✅ SISTEMA PROTEGIDO: Status das conversas marcadas atualizado');
      }

      console.log('✅ SISTEMA PROTEGIDO: Análise concluída com sucesso');
      
      return {
        success: true,
        fromCache: false,
        insights: result.insights || [],
        summary: result.summary || '',
        stats: {
          conversationsAnalyzed: result.conversationsAnalyzed || 0,
          chatMessagesAnalyzed: result.chatHistoryAnalyzed || 0,
          insightsGenerated: result.insights?.length || 0,
          costEstimate: result.costEstimate || 0
        },
        processingTime,
        dataHash: result.dataHash || '',
        message: hasMarkedConversations 
          ? `Análise realizada com ${markedConversations.length} conversas marcadas prioritariamente`
          : result.message || 'Análise realizada com sucesso'
      };

    } catch (error: any) {
      console.error('🔒 SISTEMA PROTEGIDO: Erro na análise:', error);
      
      // Marcar conversas como failed se houver erro
      if (markedConversations && markedConversations.length > 0) {
        for (const conversation of markedConversations) {
          await supabase
            .from('whatsapp_conversations_analysis')
            .update({ analysis_status: 'failed' })
            .eq('id', conversation.id);
        }
      }
      
      return {
        success: false,
        fromCache: false,
        insights: [],
        summary: '',
        stats: { conversationsAnalyzed: 0, chatMessagesAnalyzed: 0, insightsGenerated: 0, costEstimate: 0 },
        processingTime: 0,
        dataHash: '',
        message: error.message || 'Erro na análise'
      };
    } finally {
      setIsAnalyzing(false);
    }
  }, [user?.id, checkAnalysisCache]);

  /**
   * FUNÇÃO PROTEGIDA PARA BUSCAR DADOS REAIS
   * Agora inclui conversas marcadas para análise
   */
  const fetchRealUserData = useCallback(async (userId: string, markedConversations: any[] = []) => {
    console.log('🔒 SISTEMA PROTEGIDO: Buscando dados reais do usuário...');
    
    try {
      // Buscar conversações do WhatsApp
      const { data: whatsappConversations, error: whatsappError } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (whatsappError) {
        console.warn('🔒 SISTEMA PROTEGIDO: Erro ao buscar WhatsApp:', whatsappError);
      }

      // Buscar conversações comerciais
      const { data: commercialConversations, error: commercialError } = await supabase
        .from('commercial_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (commercialError) {
        console.warn('🔒 SISTEMA PROTEGIDO: Erro ao buscar comercial:', commercialError);
      }

      // Buscar histórico de chat
      const { data: chatHistory, error: chatError } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (chatError) {
        console.warn('🔒 SISTEMA PROTEGIDO: Erro ao buscar chat:', chatError);
      }

      const conversations = [
        ...(whatsappConversations || []),
        ...(commercialConversations || [])
      ];

      // Adicionar informações das conversas marcadas
      if (markedConversations.length > 0) {
        console.log(`🎯 SISTEMA PROTEGIDO: Priorizando ${markedConversations.length} conversas marcadas`);
        conversations.forEach(conv => {
          const marked = markedConversations.find(m => m.chat_id === conv.id);
          if (marked) {
            (conv as any).markedForAnalysis = true;
            (conv as any).analysisPriority = marked.priority;
            (conv as any).markedAt = marked.marked_at;
          }
        });
      }

      console.log(`🔒 SISTEMA PROTEGIDO: Dados reais carregados - ${conversations.length} conversas, ${(chatHistory || []).length} mensagens`);

      return {
        conversations,
        chatHistory: chatHistory || []
      };

    } catch (error) {
      console.error('🔒 SISTEMA PROTEGIDO: Erro ao buscar dados reais:', error);
      return null;
    }
  }, []);

  /**
   * FUNÇÃO PARA VALIDAR CONFIGURAÇÃO
   * Garante que a configuração está correta antes da análise
   */
  const validateAnalysisConfig = useCallback((config: ProtectedAnalysisConfig): boolean => {
    if (!config.analysisType || config.analysisType.length === 0) {
      console.error('🔒 SISTEMA PROTEGIDO: Tipo de análise não definido');
      return false;
    }

    if (!config.assistants || config.assistants.length === 0) {
      console.error('🔒 SISTEMA PROTEGIDO: Nenhum assistente configurado');
      return false;
    }

    if (!config.openaiConfig || !config.openaiConfig.apiKey) {
      console.error('🔒 SISTEMA PROTEGIDO: Configuração OpenAI inválida');
      return false;
    }

    for (const assistant of config.assistants) {
      if (!assistant.id || !assistant.name || !assistant.prompt) {
        console.error('🔒 SISTEMA PROTEGIDO: Assistente inválido:', assistant);
        return false;
      }
    }

    return true;
  }, []);

  /**
   * FUNÇÃO PARA OBTER STATUS DO SISTEMA
   * Retorna informações sobre o estado atual do sistema protegido
   */
  const getSystemStatus = useCallback(() => {
    return {
      isActive: true,
      protectionLevel,
      isAnalyzing,
      version: '2.0',
      features: [
        'Cache inteligente',
        'Dados reais garantidos',
        'Controle de custos',
        'Proteção contra duplicação',
        'Validação robusta'
      ]
    };
  }, [protectionLevel, isAnalyzing]);

  return {
    executeProtectedAnalysis,
    validateAnalysisConfig,
    getSystemStatus,
    isAnalyzing,
    protectionLevel,
    setProtectionLevel
  };
}
