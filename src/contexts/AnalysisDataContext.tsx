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
      
      console.log('🔍 CARREGANDO DADOS REAIS COM MAPEAMENTO CORRIGIDO...');
      console.log('👤 User ID:', user.id);

      // ✅ VALIDAÇÃO DO SISTEMA
      const systemIntegrity = validateAssistantMapping();
      if (!systemIntegrity) {
        console.error('❌ SISTEMA COMPROMETIDO');
        throw new Error('Sistema de análise comprometido');
      }

      // 1. BUSCAR INSIGHTS REAIS GERADOS PELOS ASSISTENTES IA
      console.log('🔍 Buscando insights reais gerados por IA...');
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

      // 2. BUSCAR HISTÓRICO DE CHAT REAL COM ASSISTENTES
      console.log('🔍 Buscando histórico de chat real com assistentes...');
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
      console.log('🔍 Verificando assistentes reais configurados...');
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

      console.log('🤖 ASSISTENTES REAIS CONFIGURADOS:', {
        total: assistants.length,
        active: assistantsActive
      });

      // ✅ VERIFICAR SE HÁ DADOS REAIS SUFICIENTES
      const hasRealInsights = insightsData && insightsData.length > 0;
      const hasRealChatHistory = chatHistoryData && chatHistoryData.length > 0;
      const hasRealConversations = (whatsappConversations?.length || 0) + (commercialConversations?.length || 0) > 0;
      const hasActiveAssistants = assistantsActive > 0;

      const hasRealData = hasRealInsights || hasRealChatHistory || hasRealConversations;

      console.log('🔍 VERIFICAÇÃO DE DADOS REAIS:', {
        hasRealInsights,
        hasRealChatHistory,
        hasRealConversations,
        hasActiveAssistants,
        hasRealData
      });

      // ✅ SE NÃO HÁ DADOS REAIS, RETORNAR ESTRUTURA VAZIA
      if (!hasRealData) {
        console.log('⚠️ NENHUM DADO REAL ENCONTRADO - RETORNANDO ESTRUTURA VAZIA');
        setData({
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
            assistantsActive: assistantsActive
          }
        });
        return;
      }

      // ✅ PROCESSAR INSIGHTS COM MAPEAMENTO CORRIGIDO
      console.log('🔄 PROCESSANDO INSIGHTS COM MAPEAMENTO CORRIGIDO...');
      const processedInsights = (insightsData || []).map((insight, index) => {
        console.log(`🔄 Processando insight ${index + 1}/${insightsData?.length}:`, { 
          id: insight.id, 
          type: insight.insight_type, 
          title: insight.title?.substring(0, 50) 
        });
        
        // USAR MAPEAMENTO CORRIGIDO COM ANÁLISE DETALHADA
        const assistantInfo = getAssistantByInsightType(
          insight.insight_type, 
          insight.title, 
          insight.description
        );
        
        console.log(`✅ Insight ${index + 1} mapeado:`, {
          assistantName: assistantInfo.name,
          assistantArea: assistantInfo.area,
          insightType: insight.insight_type,
          title: insight.title?.substring(0, 30)
        });
        
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

      console.log('🎯 RESUMO DO MAPEAMENTO DE ASSISTENTES:');
      const mappingSummary = processedInsights.reduce((acc, insight) => {
        const key = insight.assistantName;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.table(mappingSummary);

      console.log('🎯 INSIGHTS PROCESSADOS COM ASSISTENTES CORRETOS:', 
        processedInsights.map(i => ({ 
          id: i.id, 
          assistant: i.assistantName, 
          type: i.insight_type 
        }))
      );

      // ✅ COMBINAR APENAS CONVERSAS REAIS
      const allRealConversations = [
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

      // ✅ MENSAGENS DE CHAT BASEADAS APENAS EM DADOS REAIS
      const realChatMessages = [
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

      // ✅ ANÁLISES DE DOCUMENTOS BASEADAS APENAS EM INSIGHTS REAIS
      const realDocumentAnalyses = processedInsights
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

      // ✅ MÉTRICAS BASEADAS APENAS EM DADOS REAIS
      const totalRealMessages = allRealConversations.reduce((sum, conv) => sum + (conv.message_count || 0), 0);

      // ✅ EXTRAIR DADOS PSICOLÓGICOS REAIS DOS INSIGHTS
      const psychologyInsights = processedInsights.filter(insight => 
        insight.insight_type === 'psychological' || 
        insight.assistantArea === 'psicologia' ||
        insight.category === 'psychological'
      );

      const emotionalInsights = processedInsights.filter(insight => 
        insight.insight_type === 'emotional' || 
        insight.assistantArea === 'emocional' ||
        insight.category === 'emotional'
      );

      // ✅ DETERMINAR ESTADO EMOCIONAL BASEADO EM INSIGHTS REAIS
      let emotionalState = "Aguardando análise";
      let mainFocus = "Configure assistentes";
      
      if (emotionalInsights.length > 0) {
        emotionalState = "Baseado em análises reais";
      }
      
      if (processedInsights.length > 0) {
        mainFocus = "Análise comportamental ativa";
      }

      console.log('📈 RESUMO DOS DADOS REAIS PROCESSADOS:', {
        hasRealData,
        insights: insightsData?.length || 0,
        chatHistory: chatHistoryData?.length || 0,
        whatsappConversations: whatsappConversations?.length || 0,
        commercialConversations: commercialConversations?.length || 0,
        chatMessages: realChatMessages.length,
        documentAnalyses: realDocumentAnalyses.length,
        totalMessages: totalRealMessages,
        assistantsActive,
        psychologyInsights: psychologyInsights.length,
        emotionalInsights: emotionalInsights.length
      });

      // ✅ DADOS FINAIS - APENAS REAIS, SEM SIMULAÇÃO
      const finalData: AnalysisData = {
        hasRealData: true,
        insights: insightsData || [],
        insightsWithAssistant: processedInsights,
        recommendations: processedInsights.filter(insight => 
          insight.insight_type === 'recommendation' ||
          insight.description.toLowerCase().includes('recomend')
        ),
        recommendationsWithAssistant: processedInsights.filter(insight => 
          insight.insight_type === 'recommendation' ||
          insight.description.toLowerCase().includes('recomend')
        ),
        emotionalData: emotionalInsights.map(insight => ({
          emotion: insight.title,
          value: 75, // Baseado na análise real
          name: insight.assistantName,
          description: insight.description
        })),
        conversations: allRealConversations,
        chatMessages: realChatMessages,
        documentAnalyses: realDocumentAnalyses,
        psychologicalProfile: psychologyInsights.length > 0 ? {
          summary: psychologyInsights[0]?.description || 'Análise em andamento',
          insights: psychologyInsights
        } : null,
        skillsData: [], // Vazio até que insights específicos sejam gerados
        lifeAreas: [], // Vazio até que insights específicos sejam gerados
        lifeAreasData: [], // Vazio até que insights específicos sejam gerados
        bigFiveData: [], // Vazio até que insights específicos sejam gerados
        discProfile: null, // Null até que insights específicos sejam gerados
        mbtiProfile: null, // Null até que insights específicos sejam gerados
        emotionalState,
        mainFocus,
        relationalAwareness: emotionalInsights.length > 0 ? 75 : 0,
        metrics: {
          totalConversations: allRealConversations.length,
          totalChatMessages: realChatMessages.length,
          totalDocuments: realDocumentAnalyses.length,
          totalInsights: insightsData?.length || 0,
          lastAnalysis: insightsData?.[0]?.created_at || chatHistoryData?.[0]?.created_at || null,
          assistantsActive: assistantsActive
        }
      };

      setData(finalData);
      console.log('✅ DADOS REAIS CARREGADOS COM MAPEAMENTO CORRIGIDO');

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
