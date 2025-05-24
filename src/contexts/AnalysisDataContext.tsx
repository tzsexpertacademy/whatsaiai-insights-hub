
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface InsightWithAssistant {
  text: string;
  assistantName?: string;
  assistantArea?: string;
}

interface RecommendationWithAssistant {
  text: string;
  assistantName?: string;
  assistantArea?: string;
}

interface AnalysisData {
  // Métricas principais
  psychologicalProfile: string;
  emotionalState: string;
  mainFocus: string;
  relationalAwareness: number;
  
  // Dados dos gráficos
  lifeAreasData: Array<{ subject: string; A: number; fullMark: number }>;
  emotionalData: Array<{ name: string; level: number; emotion: string }>;
  bigFiveData: Array<{ name: string; value: number }>;
  skillsData: Array<{ title: string; value: string; trend: string }>;
  
  // Insights e recomendações originais (para compatibilidade)
  insights: string[];
  recommendations: string[];
  
  // Insights e recomendações com informações do assistente
  insightsWithAssistant: InsightWithAssistant[];
  recommendationsWithAssistant: RecommendationWithAssistant[];
  
  // Última atualização
  lastUpdated: Date | null;
  hasRealData: boolean;
}

const emptyAnalysisData: AnalysisData = {
  psychologicalProfile: '--',
  emotionalState: '--',
  mainFocus: '--',
  relationalAwareness: 0,
  lifeAreasData: [
    { subject: 'Profissional', A: 0, fullMark: 100 },
    { subject: 'Financeiro', A: 0, fullMark: 100 },
    { subject: 'Relacionamentos', A: 0, fullMark: 100 },
    { subject: 'Saúde Física', A: 0, fullMark: 100 },
    { subject: 'Saúde Mental', A: 0, fullMark: 100 },
    { subject: 'Espiritualidade', A: 0, fullMark: 100 },
    { subject: 'Crescimento Pessoal', A: 0, fullMark: 100 },
  ],
  emotionalData: [
    { name: 'Seg', level: 0, emotion: '--' },
    { name: 'Ter', level: 0, emotion: '--' },
    { name: 'Qua', level: 0, emotion: '--' },
    { name: 'Qui', level: 0, emotion: '--' },
    { name: 'Sex', level: 0, emotion: '--' },
    { name: 'Sáb', level: 0, emotion: '--' },
    { name: 'Dom', level: 0, emotion: '--' },
  ],
  bigFiveData: [
    { name: 'Extroversão', value: 0 },
    { name: 'Abertura', value: 0 },
    { name: 'Neuroticismo', value: 0 },
    { name: 'Amabilidade', value: 0 },
    { name: 'Conscienciosidade', value: 0 },
  ],
  skillsData: [
    { title: "Comunicação", value: "0%", trend: "0%" },
    { title: "Inteligência Emocional", value: "0%", trend: "0%" },
    { title: "Capacidade Analítica", value: "0%", trend: "0%" }
  ],
  insights: [],
  recommendations: [],
  insightsWithAssistant: [],
  recommendationsWithAssistant: [],
  lastUpdated: null,
  hasRealData: false
};

interface AnalysisDataContextType {
  data: AnalysisData;
  isLoading: boolean;
  updateData: (newData: Partial<AnalysisData>) => void;
  refreshData: () => Promise<void>;
}

const AnalysisDataContext = createContext<AnalysisDataContextType | undefined>(undefined);

export function AnalysisDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AnalysisData>(emptyAnalysisData);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const processAssistantAnalysis = (insights: any[]) => {
    const analysisData = { ...emptyAnalysisData };
    
    // Processar insights para extrair dados estruturados
    const assistantData = {
      oracle: null,
      guardian: null,
      engineer: null,
      architect: null,
      weaver: null,
      catalyst: null,
      mirror: null
    };

    // Extrair dados dos insights baseado no conteúdo
    insights.forEach(insight => {
      const description = insight.description.toLowerCase();
      
      // Identificar análises de cada assistente pelos padrões no texto
      if (description.includes('psicolog') || description.includes('sombra') || description.includes('trauma') || description.includes('inconsciente')) {
        assistantData.oracle = insight;
      } else if (description.includes('financeiro') || description.includes('dinheiro') || description.includes('recurso') || description.includes('investimento')) {
        assistantData.guardian = insight;
      } else if (description.includes('saúde') || description.includes('corpo') || description.includes('físic') || description.includes('exercício')) {
        assistantData.engineer = insight;
      } else if (description.includes('estratég') || description.includes('planejamento') || description.includes('meta') || description.includes('decisão')) {
        assistantData.architect = insight;
      } else if (description.includes('propósito') || description.includes('valor') || description.includes('existencial') || description.includes('alma')) {
        assistantData.weaver = insight;
      } else if (description.includes('criativ') || description.includes('inovação') || description.includes('bloqueio') || description.includes('arte')) {
        assistantData.catalyst = insight;
      } else if (description.includes('relacionamento') || description.includes('social') || description.includes('comunicação') || description.includes('vínculo')) {
        assistantData.mirror = insight;
      }
    });

    // Gerar Big Five baseado nos insights dos assistentes
    analysisData.bigFiveData = [
      { 
        name: 'Extroversão', 
        value: assistantData.mirror ? 75 : assistantData.oracle ? 45 : 60 
      },
      { 
        name: 'Abertura', 
        value: assistantData.catalyst ? 85 : assistantData.weaver ? 80 : 70 
      },
      { 
        name: 'Neuroticismo', 
        value: assistantData.oracle ? 40 : assistantData.engineer ? 35 : 50 
      },
      { 
        name: 'Amabilidade', 
        value: assistantData.mirror ? 80 : assistantData.weaver ? 75 : 65 
      },
      { 
        name: 'Conscienciosidade', 
        value: assistantData.architect ? 85 : assistantData.guardian ? 80 : 70 
      }
    ];

    // Gerar áreas da vida baseado nos assistentes
    analysisData.lifeAreasData = [
      { 
        subject: 'Profissional', 
        A: assistantData.architect ? 80 : assistantData.guardian ? 75 : 60, 
        fullMark: 100 
      },
      { 
        subject: 'Financeiro', 
        A: assistantData.guardian ? 85 : 55, 
        fullMark: 100 
      },
      { 
        subject: 'Relacionamentos', 
        A: assistantData.mirror ? 85 : assistantData.oracle ? 65 : 70, 
        fullMark: 100 
      },
      { 
        subject: 'Saúde Física', 
        A: assistantData.engineer ? 80 : 60, 
        fullMark: 100 
      },
      { 
        subject: 'Saúde Mental', 
        A: assistantData.oracle ? 75 : assistantData.engineer ? 70 : 65, 
        fullMark: 100 
      },
      { 
        subject: 'Espiritualidade', 
        A: assistantData.weaver ? 85 : 55, 
        fullMark: 100 
      },
      { 
        subject: 'Crescimento Pessoal', 
        A: assistantData.catalyst ? 90 : assistantData.weaver ? 85 : 75, 
        fullMark: 100 
      }
    ];

    // Gerar dados emocionais semanais
    const emotionalLevel = assistantData.oracle ? 75 : assistantData.mirror ? 80 : 65;
    const primaryEmotion = assistantData.oracle ? 'Reflexivo' : assistantData.mirror ? 'Conectado' : 'Equilibrado';
    
    analysisData.emotionalData = [
      { name: 'Seg', level: emotionalLevel - 5, emotion: primaryEmotion },
      { name: 'Ter', level: emotionalLevel + 5, emotion: primaryEmotion },
      { name: 'Qua', level: emotionalLevel - 2, emotion: primaryEmotion },
      { name: 'Qui', level: emotionalLevel + 8, emotion: primaryEmotion },
      { name: 'Sex', level: emotionalLevel + 10, emotion: primaryEmotion },
      { name: 'Sáb', level: emotionalLevel + 2, emotion: primaryEmotion },
      { name: 'Dom', level: emotionalLevel - 3, emotion: primaryEmotion }
    ];

    // Definir perfis principais
    if (assistantData.oracle) {
      analysisData.psychologicalProfile = 'Explorador Introspectivo';
      analysisData.emotionalState = 'Autoconsciente';
    } else if (assistantData.mirror) {
      analysisData.psychologicalProfile = 'Conector Social';
      analysisData.emotionalState = 'Empático';
    } else if (assistantData.architect) {
      analysisData.psychologicalProfile = 'Estrategista Focado';
      analysisData.emotionalState = 'Determinado';
    } else if (assistantData.catalyst) {
      analysisData.psychologicalProfile = 'Criativo Inovador';
      analysisData.emotionalState = 'Inspirado';
    } else {
      analysisData.psychologicalProfile = 'Equilibrado Versátil';
      analysisData.emotionalState = 'Estável';
    }

    // Definir foco principal
    if (assistantData.weaver) {
      analysisData.mainFocus = 'Propósito e Significado';
    } else if (assistantData.guardian) {
      analysisData.mainFocus = 'Estabilidade Financeira';
    } else if (assistantData.engineer) {
      analysisData.mainFocus = 'Bem-estar Físico';
    } else {
      analysisData.mainFocus = 'Desenvolvimento Pessoal';
    }

    // Calcular consciência relacional
    let relationalScore = 50;
    if (assistantData.mirror) relationalScore += 25;
    if (assistantData.oracle) relationalScore += 15;
    if (assistantData.weaver) relationalScore += 10;
    analysisData.relationalAwareness = Math.min(relationalScore, 95);

    // Gerar skills baseado nos assistentes
    analysisData.skillsData = [
      { 
        title: "Comunicação", 
        value: `${assistantData.mirror ? 85 : 65}%`, 
        trend: "+8%" 
      },
      { 
        title: "Inteligência Emocional", 
        value: `${assistantData.oracle ? 80 : assistantData.mirror ? 85 : 70}%`, 
        trend: "+12%" 
      },
      { 
        title: "Capacidade Analítica", 
        value: `${assistantData.architect ? 90 : assistantData.guardian ? 85 : 75}%`, 
        trend: "+6%" 
      }
    ];

    return analysisData;
  };

  const loadStoredData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      console.log('🔄 Carregando dados de análise do usuário:', user.id);
      
      // Buscar insights mais recentes
      const { data: insights, error: insightsError } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (insightsError) {
        console.error('❌ Erro ao buscar insights:', insightsError);
      }

      // Buscar dados de conversas para análise emocional
      const { data: conversations, error: conversationsError } = await supabase
        .from('whatsapp_conversations')
        .select('emotional_analysis, psychological_profile')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (conversationsError) {
        console.error('❌ Erro ao buscar conversas:', conversationsError);
      }

      console.log('📊 Insights encontrados:', insights?.length || 0);
      console.log('💬 Conversas encontradas:', conversations?.length || 0);

      const hasInsights = insights && insights.length > 0;
      const hasConversations = conversations && conversations.length > 0;
      const hasRealData = hasInsights || hasConversations;

      if (!hasRealData) {
        console.log('📭 Nenhum dado real encontrado, mantendo dados vazios');
        setData({
          ...emptyAnalysisData,
          hasRealData: false
        });
        return;
      }

      console.log('✅ Dados reais encontrados, processando com assistentes');

      // Processar dados com base nos insights dos assistentes
      let updatedData = processAssistantAnalysis(insights);
      updatedData.hasRealData = true;

      if (hasInsights) {
        // Processar insights com informações dos assistentes
        const analysisInsights = insights.map(insight => insight.description);
        const insightsWithAssistant: InsightWithAssistant[] = insights.map(insight => ({
          text: insight.description,
          assistantName: insight.metadata?.assistant_name,
          assistantArea: insight.metadata?.assistant_area
        }));
        
        // Filtrar recomendações
        const analysisRecommendations = insights
          .filter(insight => insight.insight_type === 'recommendation' || insight.description.toLowerCase().includes('recomenda'))
          .map(insight => insight.description);
        
        const recommendationsWithAssistant: RecommendationWithAssistant[] = insights
          .filter(insight => insight.insight_type === 'recommendation' || insight.description.toLowerCase().includes('recomenda'))
          .map(insight => ({
            text: insight.description,
            assistantName: insight.metadata?.assistant_name,
            assistantArea: insight.metadata?.assistant_area
          }));
        
        updatedData.insights = analysisInsights;
        updatedData.recommendations = analysisRecommendations;
        updatedData.insightsWithAssistant = insightsWithAssistant;
        updatedData.recommendationsWithAssistant = recommendationsWithAssistant;
        updatedData.lastUpdated = new Date(insights[0].created_at);
      }

      setData(updatedData);

    } catch (error) {
      console.error('❌ Erro ao carregar dados de análise:', error);
      setData({
        ...emptyAnalysisData,
        hasRealData: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateData = (newData: Partial<AnalysisData>) => {
    setData(prev => ({
      ...prev,
      ...newData,
      lastUpdated: new Date(),
      hasRealData: true
    }));
  };

  const refreshData = async () => {
    await loadStoredData();
  };

  useEffect(() => {
    loadStoredData();
  }, [user?.id]);

  // Escutar evento customizado de análise completa
  useEffect(() => {
    const handleAnalysisComplete = (event: CustomEvent) => {
      console.log('📊 Evento de análise completa recebido:', event.detail);
      refreshData();
    };

    window.addEventListener('ai-analysis-complete', handleAnalysisComplete as EventListener);
    
    return () => {
      window.removeEventListener('ai-analysis-complete', handleAnalysisComplete as EventListener);
    };
  }, []);

  return (
    <AnalysisDataContext.Provider value={{
      data,
      isLoading,
      updateData,
      refreshData
    }}>
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
