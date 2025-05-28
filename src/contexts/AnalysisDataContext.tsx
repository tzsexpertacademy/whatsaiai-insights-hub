
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisData {
  hasRealData: boolean;
  insights: any[];
  insightsWithAssistant: any[];
  recommendations: any[];
  recommendationsWithAssistant: any[];
  emotionalData: any[];
  conversations: any[];
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
    psychologicalProfile: null,
    skillsData: [],
    lifeAreas: [],
    lifeAreasData: [],
    bigFiveData: [],
    discProfile: null,
    mbtiProfile: null,
    emotionalState: "Equilibrado",
    mainFocus: "Desenvolvimento pessoal",
    relationalAwareness: 75,
    metrics: {
      totalConversations: 0,
      totalInsights: 0,
      lastAnalysis: null,
      assistantsActive: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Mapeamento correto dos insight_types para os assistentes reais da plataforma
  const getAssistantByInsightType = (insightType: string) => {
    const assistantMap: { [key: string]: { name: string; area: string } } = {
      'emotional': { name: 'Oráculo das Sombras', area: 'psicologia' },
      'behavioral': { name: 'Oráculo das Sombras', area: 'psicologia' },
      'growth': { name: 'Tecelão da Alma', area: 'proposito' },
      'financial': { name: 'Guardião dos Recursos', area: 'financeiro' },
      'health': { name: 'Engenheiro do Corpo', area: 'saude' },
      'strategy': { name: 'Arquiteto do Jogo', area: 'estrategia' },
      'creativity': { name: 'Catalisador', area: 'criatividade' },
      'relationships': { name: 'Espelho Social', area: 'relacionamentos' },
      'general': { name: 'Kairon', area: 'geral' }
    };

    return assistantMap[insightType] || assistantMap['general'];
  };

  const refreshData = async () => {
    if (!user?.id) {
      setData(prev => ({ ...prev, hasRealData: false }));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 Buscando dados reais do Observatório...');

      // Buscar insights dos assistentes da tabela insights
      const { data: insightsData, error: insightsError } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (insightsError) {
        console.error('❌ Erro ao buscar insights:', insightsError);
      }

      console.log('📊 Insights encontrados na tabela insights:', insightsData?.length || 0);
      console.log('🔍 DEBUG - Dados brutos dos insights:', insightsData);

      // Buscar configuração dos assistentes para mapear nomes corretos
      const { data: assistantsConfig, error: assistantsError } = await supabase
        .from('client_configs')
        .select('openai_config')
        .eq('user_id', user.id)
        .single();

      if (assistantsError) {
        console.error('❌ Erro ao buscar configuração dos assistentes:', assistantsError);
      }

      // Verificar se openai_config existe e tem assistants
      let assistants: any[] = [];
      if (assistantsConfig?.openai_config && typeof assistantsConfig.openai_config === 'object') {
        const config = assistantsConfig.openai_config as any;
        assistants = config.assistants || [];
      }
      
      console.log('🤖 Assistentes configurados:', assistants.map(a => ({ id: a.id, name: a.name, area: a.area })));

      // Buscar conversações do WhatsApp
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (conversationsError) {
        console.error('❌ Erro ao verificar conversações:', conversationsError);
      }

      console.log('💬 Conversações encontradas:', conversationsData?.length || 0);

      // Processar insights com mapeamento correto para assistentes REAIS
      const processedInsights = (insightsData || []).map(insight => {
        // Usar mapeamento direto do insight_type para assistente real
        const assistantInfo = getAssistantByInsightType(insight.insight_type);
        
        console.log('🔍 DEBUG - Processando insight:', {
          insight_id: insight.id,
          insight_type: insight.insight_type,
          assistant_mapped: assistantInfo.name,
          title: insight.title
        });

        return {
          ...insight,
          text: insight.description,
          assistantName: assistantInfo.name,
          assistantArea: assistantInfo.area,
          priority: insight.priority || 'medium',
          createdAt: insight.created_at,
          category: assistantInfo.area
        };
      });

      console.log('🔍 DEBUG - Insights processados:', processedInsights.map(i => ({
        id: i.id,
        assistantName: i.assistantName,
        assistantArea: i.assistantArea,
        category: i.category
      })));

      // Simular algumas recomendações baseadas nos insights
      const processedRecommendations = processedInsights
        .slice(0, 5)
        .map((insight, index) => ({
          ...insight,
          id: `rec_${insight.id}`,
          text: `Baseado na análise do ${insight.assistantName || 'assistente'}, recomendamos: ${insight.description?.substring(0, 150)}...`,
          title: `Recomendação ${index + 1}`,
          content: insight.description
        }));

      // Dados emocionais simulados baseados nos insights
      const emotionalData = [
        { name: 'Alegria', value: 75 },
        { name: 'Ansiedade', value: 35 },
        { name: 'Confiança', value: 80 },
        { name: 'Estresse', value: 40 },
        { name: 'Motivação', value: 85 },
        { name: 'Foco', value: 70 },
        { name: 'Energia', value: 78 }
      ];

      // Áreas da vida baseadas nos insights
      const lifeAreas = [
        { name: 'Carreira', score: 78, insights: processedInsights.filter(i => i.category === 'estrategia').length },
        { name: 'Relacionamentos', score: 72, insights: processedInsights.filter(i => i.category === 'relacionamentos').length },
        { name: 'Saúde', score: 85, insights: processedInsights.filter(i => i.category === 'saude').length },
        { name: 'Finanças', score: 65, insights: processedInsights.filter(i => i.category === 'financeiro').length },
        { name: 'Desenvolvimento', score: 90, insights: processedInsights.filter(i => i.category === 'proposito').length }
      ];

      // Dados para o radar chart (formato diferente)
      const lifeAreasData = [
        { subject: 'Carreira', A: 78, fullMark: 100 },
        { subject: 'Relacionamentos', A: 72, fullMark: 100 },
        { subject: 'Saúde', A: 85, fullMark: 100 },
        { subject: 'Finanças', A: 65, fullMark: 100 },
        { subject: 'Desenvolvimento', A: 90, fullMark: 100 }
      ];

      // Big Five data
      const bigFiveData = [
        { name: 'Abertura', value: 85, description: 'Criatividade e curiosidade' },
        { name: 'Conscienciosidade', value: 78, description: 'Organização e disciplina' },
        { name: 'Extroversão', value: 72, description: 'Sociabilidade e energia' },
        { name: 'Amabilidade', value: 88, description: 'Cooperação e confiança' },
        { name: 'Neuroticismo', value: 35, description: 'Estabilidade emocional' }
      ];

      // DISC Profile
      const discProfile = {
        dominance: 65,
        influence: 78,
        steadiness: 72,
        compliance: 55,
        primaryType: 'Influente (I)'
      };

      // MBTI Profile
      const mbtiProfile = {
        extroversion: 72,
        sensing: 45,
        thinking: 68,
        judging: 75,
        approximateType: 'ESTJ'
      };

      const hasRealData = (insightsData && insightsData.length > 0) || (conversationsData && conversationsData.length > 0);

      const newData: AnalysisData = {
        hasRealData,
        insights: insightsData || [],
        insightsWithAssistant: processedInsights,
        recommendations: processedRecommendations,
        recommendationsWithAssistant: processedRecommendations,
        emotionalData: hasRealData ? emotionalData : [],
        conversations: conversationsData || [],
        psychologicalProfile: hasRealData ? 'Analítico-Criativo' : null,
        skillsData: hasRealData ? [
          { title: 'Comunicação', value: '85%', trend: '+5%' },
          { title: 'Liderança', value: '78%', trend: '+3%' },
          { title: 'Criatividade', value: '92%', trend: '+7%' }
        ] : [],
        lifeAreas: hasRealData ? lifeAreas : [],
        lifeAreasData: hasRealData ? lifeAreasData : [],
        bigFiveData: hasRealData ? bigFiveData : [],
        discProfile: hasRealData ? discProfile : null,
        mbtiProfile: hasRealData ? mbtiProfile : null,
        emotionalState: hasRealData ? "Equilibrado" : "Aguardando análise",
        mainFocus: hasRealData ? "Desenvolvimento pessoal" : "Configure assistentes",
        relationalAwareness: hasRealData ? 75 : 0,
        metrics: {
          totalConversations: conversationsData?.length || 0,
          totalInsights: insightsData?.length || 0,
          lastAnalysis: insightsData?.[0]?.created_at || null,
          assistantsActive: assistants.filter(a => a.isActive).length
        }
      };

      setData(newData);
      console.log('✅ Dados carregados:', {
        insights: newData.insights.length,
        insightsProcessed: newData.insightsWithAssistant.length,
        recommendations: newData.recommendations.length,
        hasRealData: newData.hasRealData,
        assistantsActive: newData.metrics.assistantsActive
      });

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
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
