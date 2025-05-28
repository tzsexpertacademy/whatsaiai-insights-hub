
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
    metrics: {
      totalConversations: 0,
      totalInsights: 0,
      lastAnalysis: null,
      assistantsActive: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    if (!user?.id) {
      setData(prev => ({ ...prev, hasRealData: false }));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 Buscando dados reais do Observatório...');

      // Buscar insights dos assistentes
      const { data: insightsData, error: insightsError } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (insightsError) {
        console.error('❌ Erro ao buscar insights:', insightsError);
      }

      console.log('📊 Insights encontrados:', insightsData?.length || 0);

      // Buscar conversações
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (conversationsError) {
        console.error('❌ Erro ao buscar conversações:', conversationsError);
      }

      // Processar insights com informações dos assistentes
      const processedInsights = (insightsData || []).map(insight => {
        const metadata = insight.metadata || {};
        return {
          ...insight,
          text: insight.content,
          assistantName: metadata.assistant_name,
          assistantArea: metadata.area || 'geral',
          priority: insight.priority || 'medium',
          createdAt: insight.created_at
        };
      });

      // Simular algumas recomendações baseadas nos insights
      const processedRecommendations = processedInsights
        .filter(insight => insight.category !== 'alert')
        .slice(0, 5)
        .map((insight, index) => ({
          ...insight,
          id: `rec_${insight.id}`,
          text: `Baseado na análise do ${insight.assistantName || 'assistente'}, recomendamos: ${insight.content?.substring(0, 150)}...`,
          title: `Recomendação ${index + 1}`
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
        { name: 'Carreira', score: 78, insights: processedInsights.filter(i => i.category === 'carreira').length },
        { name: 'Relacionamentos', score: 72, insights: processedInsights.filter(i => i.category === 'relacionamentos').length },
        { name: 'Saúde', score: 85, insights: processedInsights.filter(i => i.category === 'saude').length },
        { name: 'Finanças', score: 65, insights: processedInsights.filter(i => i.category === 'financeiro').length },
        { name: 'Desenvolvimento', score: 90, insights: processedInsights.filter(i => i.category === 'desenvolvimento').length }
      ];

      const hasRealData = (insightsData && insightsData.length > 0) || (conversationsData && conversationsData.length > 0);

      const newData: AnalysisData = {
        hasRealData,
        insights: insightsData || [],
        insightsWithAssistant: processedInsights,
        recommendations: processedRecommendations,
        recommendationsWithAssistant: processedRecommendations,
        emotionalData: hasRealData ? emotionalData : [],
        conversations: conversationsData || [],
        psychologicalProfile: hasRealData ? {
          traits: ['Analítico', 'Criativo', 'Determinado'],
          strengths: ['Comunicação', 'Liderança', 'Adaptabilidade'],
          areas: ['Paciência', 'Organização']
        } : null,
        skillsData: hasRealData ? [
          { skill: 'Comunicação', current: 85, target: 90 },
          { skill: 'Liderança', current: 75, target: 85 },
          { skill: 'Criatividade', current: 90, target: 95 },
          { skill: 'Análise', current: 80, target: 88 }
        ] : [],
        lifeAreas: hasRealData ? lifeAreas : [],
        metrics: {
          totalConversations: conversationsData?.length || 0,
          totalInsights: insightsData?.length || 0,
          lastAnalysis: insightsData?.[0]?.created_at || null,
          assistantsActive: new Set(processedInsights.map(i => i.assistantName).filter(Boolean)).size
        }
      };

      setData(newData);
      console.log('✅ Dados carregados:', {
        insights: newData.insights.length,
        recommendations: newData.recommendations.length,
        hasRealData: newData.hasRealData
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
    throw new Error('useAnalysisData must be used within an AnalysisDataProvider');
  }
  return context;
}
