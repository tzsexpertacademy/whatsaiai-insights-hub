import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AnalysisData {
  insights: Array<{
    id: string;
    text: string;
    priority: string;
    created_at: string;
    metadata?: any;
  }>;
  insightsWithAssistant: Array<{
    text: string;
    assistantName?: string;
    assistantArea?: string;
  }>;
  recommendations: Array<{
    id: string;
    text: string;
    priority: string;
    created_at: string;
    metadata?: any;
  }>;
  recommendationsWithAssistant: Array<{
    text: string;
    assistantName?: string;
    assistantArea?: string;
  }>;
  emotionalStates: Array<{
    state: string;
    intensity: number;
    date: string;
  }>;
  behavioralTraits: Array<{
    trait: string;
    score: number;
    description: string;
  }>;
  lifeAreas: Array<{
    area: string;
    score: number;
    insights: string[];
  }>;
  hasRealData: boolean;
}

interface AnalysisDataContextType {
  data: AnalysisData;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const AnalysisDataContext = createContext<AnalysisDataContextType | undefined>(undefined);

export function AnalysisDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalysisData>({
    insights: [],
    insightsWithAssistant: [],
    recommendations: [],
    recommendationsWithAssistant: [],
    emotionalStates: [],
    behavioralTraits: [],
    lifeAreas: [],
    hasRealData: false
  });

  // Funções para gerar dados mock
  const generateMockEmotionalStates = () => {
    const states = ['Alegria', 'Tristeza', 'Raiva', 'Medo', 'Surpresa'];
    return states.map(state => ({
      state,
      intensity: Math.random() * 10,
      date: new Date().toISOString().split('T')[0]
    }));
  };

  const generateMockBehavioralTraits = () => {
    const traits = ['Extroversão', 'Amabilidade', 'Conscienciosidade', 'Neuroticismo', 'Abertura'];
    return traits.map(trait => ({
      trait,
      score: Math.random() * 100,
      description: `Descrição da ${trait}`
    }));
  };

  const generateMockLifeAreas = () => {
    const areas = ['Carreira', 'Relacionamentos', 'Saúde', 'Finanças', 'Desenvolvimento Pessoal'];
    return areas.map(area => ({
      area,
      score: Math.random() * 10,
      insights: [`Insight sobre ${area} 1`, `Insight sobre ${area} 2`]
    }));
  };

  const fetchRealData = async () => {
    if (!user?.id) return;

    try {
      console.log('🔄 Buscando dados reais do Supabase...');

      // Buscar insights
      const { data: insightsData, error: insightsError } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (insightsError) throw insightsError;

      // Buscar recomendações
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (recommendationsError) throw recommendationsError;

      console.log('✅ Dados carregados:', { 
        insights: insightsData?.length || 0, 
        recommendations: recommendationsData?.length || 0 
      });

      const hasRealData = (insightsData && insightsData.length > 0) || 
                         (recommendationsData && recommendationsData.length > 0);

      if (hasRealData) {
        // Processar insights com informações do assistente
        const insightsWithAssistant = (insightsData || []).map(insight => ({
          text: insight.description || insight.title,
          assistantName: insight.metadata?.assistantName,
          assistantArea: insight.metadata?.assistantArea
        }));

        // Processar recomendações com informações do assistente
        const recommendationsWithAssistant = (recommendationsData || []).map(recommendation => ({
          text: recommendation.description || recommendation.title,
          assistantName: recommendation.metadata?.assistantName,
          assistantArea: recommendation.metadata?.assistantArea
        }));

        setData({
          insights: insightsData || [],
          insightsWithAssistant,
          recommendations: recommendationsData || [],
          recommendationsWithAssistant,
          emotionalStates: generateMockEmotionalStates(),
          behavioralTraits: generateMockBehavioralTraits(),
          lifeAreas: generateMockLifeAreas(),
          hasRealData: true
        });
      } else {
        console.log('📝 Nenhum dado real encontrado, usando dados de demonstração');
        setData({
          insights: [],
          insightsWithAssistant: [],
          recommendations: [],
          recommendationsWithAssistant: [],
          emotionalStates: generateMockEmotionalStates(),
          behavioralTraits: generateMockBehavioralTraits(),
          lifeAreas: generateMockLifeAreas(),
          hasRealData: false
        });
      }

    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error);
      // Em caso de erro, usar dados mock
      setData({
        insights: [],
        insightsWithAssistant: [],
        recommendations: [],
        recommendationsWithAssistant: [],
        emotionalStates: generateMockEmotionalStates(),
        behavioralTraits: generateMockBehavioralTraits(),
        lifeAreas: generateMockLifeAreas(),
        hasRealData: false
      });
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchRealData().finally(() => setIsLoading(false));
  }, [user?.id]);

  const refreshData = async () => {
    setIsLoading(true);
    await fetchRealData();
    setIsLoading(false);
  };

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
