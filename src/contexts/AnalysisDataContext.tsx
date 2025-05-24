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
  // Dados para os gráficos
  emotionalData: Array<{
    name: string;
    level: number;
    emotion: string;
  }>;
  lifeAreasData: Array<{
    subject: string;
    A: number;
  }>;
  bigFiveData: Array<{
    name: string;
    value: number;
  }>;
  skillsData: Array<{
    title: string;
    value: string;
    trend: string;
  }>;
  // Estados derivados
  psychologicalProfile: string;
  emotionalState: string;
  mainFocus: string;
  relationalAwareness: number;
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
    emotionalData: [],
    lifeAreasData: [],
    bigFiveData: [],
    skillsData: [],
    psychologicalProfile: 'Aguardando análise',
    emotionalState: 'Neutro',
    mainFocus: 'Indefinido',
    relationalAwareness: 0,
    hasRealData: false
  });

  // Funções para gerar dados mock
  const generateMockEmotionalData = () => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const emotions = ['Alegria', 'Tranquilidade', 'Energia', 'Reflexão', 'Esperança', 'Gratidão', 'Serenidade'];
    return days.map((day, index) => ({
      name: day,
      level: Math.floor(Math.random() * 40) + 60, // Entre 60-100
      emotion: emotions[index]
    }));
  };

  const generateMockLifeAreasData = () => {
    const areas = ['Carreira', 'Saúde', 'Relacionamentos', 'Finanças', 'Desenvolvimento', 'Lazer'];
    return areas.map(area => ({
      subject: area,
      A: Math.floor(Math.random() * 50) + 50 // Entre 50-100
    }));
  };

  const generateMockBigFiveData = () => {
    return [
      { name: 'Extroversão', value: Math.floor(Math.random() * 40) + 60 },
      { name: 'Amabilidade', value: Math.floor(Math.random() * 40) + 60 },
      { name: 'Conscienciosidade', value: Math.floor(Math.random() * 40) + 60 },
      { name: 'Neuroticismo', value: Math.floor(Math.random() * 40) + 30 },
      { name: 'Abertura', value: Math.floor(Math.random() * 40) + 60 }
    ];
  };

  const generateMockSkillsData = () => {
    return [
      { title: 'Inteligência Emocional', value: '85%', trend: '+12%' },
      { title: 'Autoconhecimento', value: '78%', trend: '+8%' },
      { title: 'Comunicação', value: '92%', trend: '+5%' }
    ];
  };

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

      console.log('✅ Dados carregados:', { 
        insights: insightsData?.length || 0
      });

      const hasRealData = insightsData && insightsData.length > 0;

      if (hasRealData) {
        // Processar insights com informações do assistente
        const processedInsights = insightsData.map(insight => ({
          id: insight.id,
          text: insight.description || insight.title,
          priority: insight.priority,
          created_at: insight.created_at,
          metadata: {} // Usar objeto vazio como fallback já que a coluna metadata não existe
        }));

        const insightsWithAssistant = processedInsights.map(insight => ({
          text: insight.text,
          assistantName: undefined, // Remover referência a metadata que não existe
          assistantArea: undefined
        }));

        // Gerar dados derivados baseados nos insights reais
        const profiles = ['Analítico', 'Criativo', 'Estratégico', 'Empático', 'Focado'];
        const emotions = ['Equilibrado', 'Confiante', 'Reflexivo', 'Determinado'];
        const focuses = ['Crescimento', 'Relacionamentos', 'Carreira', 'Bem-estar'];

        setData({
          insights: processedInsights,
          insightsWithAssistant,
          recommendations: [], // Por enquanto vazio, pois a tabela recommendations não existe
          recommendationsWithAssistant: [],
          emotionalStates: generateMockEmotionalStates(),
          behavioralTraits: generateMockBehavioralTraits(),
          lifeAreas: generateMockLifeAreas(),
          emotionalData: generateMockEmotionalData(),
          lifeAreasData: generateMockLifeAreasData(),
          bigFiveData: generateMockBigFiveData(),
          skillsData: generateMockSkillsData(),
          psychologicalProfile: profiles[Math.floor(Math.random() * profiles.length)],
          emotionalState: emotions[Math.floor(Math.random() * emotions.length)],
          mainFocus: focuses[Math.floor(Math.random() * focuses.length)],
          relationalAwareness: Math.floor(Math.random() * 30) + 70,
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
          emotionalData: generateMockEmotionalData(),
          lifeAreasData: generateMockLifeAreasData(),
          bigFiveData: generateMockBigFiveData(),
          skillsData: generateMockSkillsData(),
          psychologicalProfile: 'Aguardando análise',
          emotionalState: 'Neutro',
          mainFocus: 'Indefinido',
          relationalAwareness: 0,
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
        emotionalData: generateMockEmotionalData(),
        lifeAreasData: generateMockLifeAreasData(),
        bigFiveData: generateMockBigFiveData(),
        skillsData: generateMockSkillsData(),
        psychologicalProfile: 'Aguardando análise',
        emotionalState: 'Neutro',
        mainFocus: 'Indefinido',
        relationalAwareness: 0,
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
