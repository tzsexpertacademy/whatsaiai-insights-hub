
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getAssistantByInsightType, validateAssistantMapping } from '@/constants/assistantMapping';

interface AnalysisData {
  hasRealData: boolean;
  insights: any[];
  insightsWithAssistant: any[];
  recommendations: any[];
  recommendationsWithAssistant: any[];
  emotionalData: any[];
  conversations: any[];
  chatMessages: any[];
  documentAnalyses: any[];
  psychologicalProfile: any;
  skillsData: any[];
  lifeAreas: any[];
  lifeAreasData: any[];
  bigFiveData: any[];
  discProfile: any;
  mbtiProfile: any;
  emotionalState: string;
  mainFocus: string;
  relationalAwareness: number;
  metrics: {
    totalConversations: number;
    totalChatMessages: number;
    totalDocuments: number;
    totalInsights: number;
    lastAnalysis: string | null;
    assistantsActive: number;
  };
}

interface AnalysisDataContextType {
  data: AnalysisData;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const AnalysisDataContext = createContext<AnalysisDataContextType | undefined>(undefined);

export function AnalysisDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<AnalysisData>({
    hasRealData: false,
    insights: [],
    insightsWithAssistant: [],
    recommendations: [],
    recommendationsWithAssistant: [],
    emotionalData: [],
    conversations: [],
    chatMessages: [],
    documentAnalyses: [],
    psychologicalProfile: null,
    skillsData: [],
    lifeAreas: [],
    lifeAreasData: [],
    bigFiveData: [],
    discProfile: null,
    mbtiProfile: null,
    emotionalState: "Aguardando análise",
    mainFocus: "Configure assistentes para começar",
    relationalAwareness: 0,
    metrics: {
      totalConversations: 0,
      totalChatMessages: 0,
      totalDocuments: 0,
      totalInsights: 0,
      lastAnalysis: null,
      assistantsActive: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    if (!user?.id) {
      console.log('❌ Usuário não autenticado');
      setData(prev => ({ ...prev, hasRealData: false }));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      console.log('🔍 CARREGANDO DADOS REAIS DO BANCO DE DADOS...');
      console.log('👤 User ID:', user.id);

      // ✅ VALIDAÇÃO DO SISTEMA
      const systemIntegrity = validateAssistantMapping();
      if (!systemIntegrity) {
        console.error('❌ SISTEMA COMPROMETIDO');
        throw new Error('Sistema de análise comprometido');
      }

      // 1. BUSCAR INSIGHTS REAIS
      console.log('🔍 Buscando insights reais...');
      const { data: insightsData, error: insightsError } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (insightsError) {
        console.error('❌ Erro ao buscar insights:', insightsError);
        throw insightsError;
      }

      console.log('📊 INSIGHTS REAIS encontrados:', insightsData?.length || 0);

      // 2. BUSCAR HISTÓRICO DE CHAT REAIS
      console.log('🔍 Buscando histórico de chat reais...');
      const { data: chatHistoryData, error: chatHistoryError } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (chatHistoryError) {
        console.error('❌ Erro ao buscar histórico de chat:', chatHistoryError);
        throw chatHistoryError;
      }

      console.log('💬 HISTÓRICO DE CHAT REAL:', chatHistoryData?.length || 0);

      // 3. BUSCAR CONVERSAS WHATSAPP REAIS
      console.log('🔍 Buscando conversas WhatsApp reais...');
      const { data: whatsappConversations, error: whatsappError } = await supabase
        .from('whatsapp_conversations')
        .select(`
          *,
          whatsapp_messages (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (whatsappError) {
        console.error('❌ Erro ao buscar conversas WhatsApp:', whatsappError);
        throw whatsappError;
      }

      console.log('📱 CONVERSAS WHATSAPP REAIS:', whatsappConversations?.length || 0);

      // 4. BUSCAR CONVERSAS COMERCIAIS REAIS
      console.log('🔍 Buscando conversas comerciais reais...');
      const { data: commercialConversations, error: commercialError } = await supabase
        .from('commercial_conversations')
        .select(`
          *,
          commercial_messages (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (commercialError) {
        console.error('❌ Erro ao buscar conversas comerciais:', commercialError);
        throw commercialError;
      }

      console.log('💼 CONVERSAS COMERCIAIS REAIS:', commercialConversations?.length || 0);

      // 5. BUSCAR CONFIGURAÇÃO DOS ASSISTENTES REAIS
      console.log('🔍 Verificando assistentes reais...');
      const { data: assistantsConfig, error: assistantsError } = await supabase
        .from('client_configs')
        .select('openai_config')
        .eq('user_id', user.id)
        .single();

      let assistants: any[] = [];
      let assistantsActive = 0;
      
      if (assistantsConfig?.openai_config && typeof assistantsConfig.openai_config === 'object') {
        const config = assistantsConfig.openai_config as any;
        assistants = config.assistants || [];
        assistantsActive = assistants.filter(a => a.isActive).length;
      }

      console.log('🤖 ASSISTENTES REAIS:', {
        total: assistants.length,
        active: assistantsActive
      });

      // ✅ PROCESSAR APENAS DADOS REAIS
      const processedInsights = (insightsData || []).map(insight => {
        const assistantInfo = getAssistantByInsightType(insight.insight_type);
        
        return {
          ...insight,
          text: insight.description,
          assistantName: assistantInfo.name,
          assistantArea: assistantInfo.area,
          priority: insight.priority || 'medium',
          createdAt: insight.created_at,
          category: assistantInfo.area,
          source: 'assistant_analysis'
        };
      });

      // ✅ COMBINAR CONVERSAS REAIS
      const allConversations = [
        ...(whatsappConversations || []).map(conv => ({
          ...conv,
          source: 'whatsapp',
          message_count: conv.whatsapp_messages?.length || 0
        })),
        ...(commercialConversations || []).map(conv => ({
          ...conv,
          source: 'commercial',
          message_count: conv.commercial_messages?.length || 0
        }))
      ];

      // ✅ MENSAGENS DE CHAT BASEADAS EM DADOS REAIS
      const chatMessages = [
        // Insights processados como mensagens de chat
        ...processedInsights.map(insight => ({
          id: `chat_insight_${insight.id}`,
          user_message: `Análise: ${insight.title}`,
          assistant_response: insight.description,
          timestamp: insight.created_at,
          assistant_type: insight.insight_type,
          source: 'insight'
        })),
        // Histórico de chat real dos assistentes
        ...(chatHistoryData || []).map(chat => ({
          id: `chat_history_${chat.id}`,
          user_message: chat.user_message,
          assistant_response: chat.assistant_response,
          timestamp: chat.created_at,
          assistant_id: chat.assistant_id,
          source: 'chat_history'
        }))
      ];

      // ✅ ANÁLISES DE DOCUMENTOS BASEADAS EM INSIGHTS REAIS
      const documentAnalyses = processedInsights
        .filter(insight => {
          const metadata = insight.metadata as any;
          return metadata && typeof metadata === 'object' && 
                 (metadata.source === 'document' || insight.category === 'document');
        })
        .map(insight => {
          const metadata = insight.metadata as any;
          return {
            id: `doc_${insight.id}`,
            document_name: (metadata && metadata.document_name) || 'Documento Analisado',
            analysis_summary: insight.description,
            created_at: insight.created_at,
            insights_count: 1
          };
        });

      // ✅ DETERMINAR SE HÁ DADOS REAIS
      const hasRealData = (
        (insightsData && insightsData.length > 0) || 
        (chatHistoryData && chatHistoryData.length > 0) ||
        (allConversations.length > 0) ||
        (assistantsActive > 0)
      );

      // ✅ MÉTRICAS BASEADAS APENAS EM DADOS REAIS
      const totalMessages = allConversations.reduce((sum, conv) => sum + (conv.message_count || 0), 0);

      console.log('📈 RESUMO DOS DADOS REAIS:', {
        hasRealData,
        insights: insightsData?.length || 0,
        chatHistory: chatHistoryData?.length || 0,
        whatsappConversations: whatsappConversations?.length || 0,
        commercialConversations: commercialConversations?.length || 0,
        chatMessages: chatMessages.length,
        documentAnalyses: documentAnalyses.length,
        totalMessages,
        assistantsActive
      });

      // ✅ DADOS FINAIS - APENAS REAIS, SEM SIMULAÇÃO
      const newData: AnalysisData = {
        hasRealData,
        insights: insightsData || [],
        insightsWithAssistant: processedInsights,
        recommendations: processedInsights.slice(0, 5), // Apenas top 5 insights reais
        recommendationsWithAssistant: processedInsights.slice(0, 5),
        emotionalData: [], // Vazio se não há dados reais
        conversations: allConversations,
        chatMessages: chatMessages,
        documentAnalyses: documentAnalyses,
        psychologicalProfile: hasRealData ? 'Baseado em análises reais' : null,
        skillsData: [], // Vazio se não há dados reais
        lifeAreas: [], // Vazio se não há dados reais
        lifeAreasData: [], // Vazio se não há dados reais
        bigFiveData: [], // Vazio se não há dados reais
        discProfile: null, // Null se não há dados reais
        mbtiProfile: null, // Null se não há dados reais
        emotionalState: hasRealData ? "Baseado em análises" : "Aguardando dados",
        mainFocus: hasRealData ? "Análise comportamental" : "Configure assistentes",
        relationalAwareness: 0, // Zero se não há dados reais de consciência
        metrics: {
          totalConversations: allConversations.length,
          totalChatMessages: chatMessages.length,
          totalDocuments: documentAnalyses.length,
          totalInsights: insightsData?.length || 0,
          lastAnalysis: insightsData?.[0]?.created_at || chatHistoryData?.[0]?.created_at || null,
          assistantsActive: assistantsActive
        }
      };

      setData(newData);

      if (!hasRealData) {
        console.log('⚠️ NENHUM DADO REAL ENCONTRADO');
        console.log('💡 Para gerar relatórios, você precisa de:');
        console.log('   1. Insights gerados por IA');
        console.log('   2. Conversas do WhatsApp ou comerciais');
        console.log('   3. Conversas com assistentes');
        console.log('   4. Assistentes configurados e ativos');
      } else {
        console.log('✅ DADOS REAIS CARREGADOS COM SUCESSO');
      }

    } catch (error) {
      console.error('❌ ERRO AO CARREGAR DADOS REAIS:', error);
      setData(prev => ({ ...prev, hasRealData: false }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user?.id]);

  return (
    <AnalysisDataContext.Provider value={{ data, isLoading, refreshData }}>
      {children}
    </AnalysisDataContext.Provider>
  );
}

export function useAnalysisData() {
  const context = useContext(AnalysisDataContext);
  if (context === undefined) {
    throw new Error('useAnalysisData deve ser usado dentro de um AnalysisDataProvider');
  }
  return context;
}
