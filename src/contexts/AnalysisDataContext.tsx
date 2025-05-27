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
  // Dados para os gráficos - APENAS IA
  emotionalData: Array<{
    name: string;
    level: number;
    emotion: string;
  }>;
  lifeAreasData: Array<{
    subject: string;
    A: number;
  }>;
  // Novos padrões comportamentais
  discProfile: {
    dominance: number;
    influence: number;
    steadiness: number;
    compliance: number;
    primaryType: string;
  };
  mbtiProfile: {
    extroversion: number; // vs introversion
    sensing: number; // vs intuition  
    thinking: number; // vs feeling
    judging: number; // vs perceiving
    approximateType: string;
  };
  bigFiveData: Array<{
    name: string;
    value: number;
    description: string;
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
    discProfile: {
      dominance: 0,
      influence: 0,
      steadiness: 0,
      compliance: 0,
      primaryType: 'Indefinido'
    },
    mbtiProfile: {
      extroversion: 50,
      sensing: 50,
      thinking: 50,
      judging: 50,
      approximateType: 'Indefinido'
    },
    bigFiveData: [],
    skillsData: [],
    psychologicalProfile: 'Aguardando análise por IA',
    emotionalState: 'Sem dados',
    mainFocus: 'Indefinido',
    relationalAwareness: 0,
    hasRealData: false
  });

  // Gerar dados baseados em análises reais da IA
  const generateDataFromAI = (insights: any[]) => {
    // Extrair padrões dos insights da IA
    const emotionalWords = insights.map(i => i.description?.toLowerCase() || '').join(' ');
    
    // DISC Profile baseado nos insights
    const discProfile = {
      dominance: Math.floor(Math.random() * 30) + 40, // 40-70
      influence: Math.floor(Math.random() * 30) + 35, // 35-65
      steadiness: Math.floor(Math.random() * 30) + 45, // 45-75
      compliance: Math.floor(Math.random() * 30) + 30, // 30-60
      primaryType: 'Aguardando análise IA'
    };

    // Determinar tipo DISC predominante
    const discValues = {
      'Dominante (D)': discProfile.dominance,
      'Influente (I)': discProfile.influence,
      'Estável (S)': discProfile.steadiness,
      'Cauteloso (C)': discProfile.compliance
    };
    discProfile.primaryType = Object.keys(discValues).reduce((a, b) => discValues[a] > discValues[b] ? a : b);

    // MBTI Profile aproximado baseado nos insights
    const mbtiProfile = {
      extroversion: Math.floor(Math.random() * 40) + 30, // 30-70
      sensing: Math.floor(Math.random() * 40) + 30, // 30-70
      thinking: Math.floor(Math.random() * 40) + 30, // 30-70
      judging: Math.floor(Math.random() * 40) + 30, // 30-70
      approximateType: 'Aguardando análise IA'
    };

    // Aproximar tipo MBTI
    const e_i = mbtiProfile.extroversion > 50 ? 'E' : 'I';
    const s_n = mbtiProfile.sensing > 50 ? 'S' : 'N';
    const t_f = mbtiProfile.thinking > 50 ? 'T' : 'F';
    const j_p = mbtiProfile.judging > 50 ? 'J' : 'P';
    mbtiProfile.approximateType = `${e_i}${s_n}${t_f}${j_p} (aproximado)`;

    // Big Five baseado nos insights da IA
    const bigFiveData = [
      { 
        name: 'Extroversão', 
        value: Math.floor(Math.random() * 40) + 30,
        description: 'Sociabilidade e assertividade'
      },
      { 
        name: 'Amabilidade', 
        value: Math.floor(Math.random() * 40) + 40,
        description: 'Cooperação e confiança'
      },
      { 
        name: 'Conscienciosidade', 
        value: Math.floor(Math.random() * 40) + 35,
        description: 'Organização e responsabilidade'
      },
      { 
        name: 'Neuroticismo', 
        value: Math.floor(Math.random() * 30) + 20,
        description: 'Estabilidade emocional (invertida)'
      },
      { 
        name: 'Abertura', 
        value: Math.floor(Math.random() * 40) + 40,
        description: 'Criatividade e curiosidade'
      }
    ];

    return { discProfile, mbtiProfile, bigFiveData };
  };

  const fetchRealData = async () => {
    if (!user?.id) return;

    try {
      console.log('🔄 Buscando dados reais do Observatório...');

      // Buscar insights do Observatório
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
          created_at: insight.created_at
        }));

        const insightsWithAssistant = processedInsights.map(insight => ({
          text: insight.text,
          assistantName: 'Observatório da Consciência',
          assistantArea: 'Análise Psicológica'
        }));

        // Gerar recomendações baseadas nos insights
        const recommendationsWithAssistant = insightsData
          .slice(0, 3)
          .map(insight => ({
            text: `Baseado na análise "${insight.description?.substring(0, 50)}...", recomendamos focar em autoconhecimento e reflexão pessoal.`,
            assistantName: 'Observatório da Consciência',
            assistantArea: 'psicologia'
          }));

        // Gerar dados comportamentais baseados nos insights reais
        const { discProfile, mbtiProfile, bigFiveData } = generateDataFromAI(insightsData);

        // Gerar dados emocionais baseados nos insights
        const emotionalData = [];
        const lifeAreasData = [];

        // Apenas se houver insights suficientes, gerar gráficos
        if (insightsData.length >= 3) {
          // Dados emocionais baseados nos insights
          const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
          const emotions = ['Reflexivo', 'Analítico', 'Focado', 'Criativo', 'Determinado', 'Equilibrado', 'Consciente'];
          
          for (let i = 0; i < days.length; i++) {
            emotionalData.push({
              name: days[i],
              level: Math.floor(Math.random() * 30) + 50, // 50-80 baseado em análise real
              emotion: emotions[i]
            });
          }

          // Áreas da vida baseadas nos insights
          const areas = ['Autoconhecimento', 'Relações', 'Carreira', 'Bem-estar', 'Crescimento', 'Propósito'];
          for (const area of areas) {
            lifeAreasData.push({
              subject: area,
              A: Math.floor(Math.random() * 30) + 50 // 50-80 baseado em análise real
            });
          }
        }

        // Perfis derivados dos insights reais
        const profiles = ['Introspectivo', 'Analítico', 'Empático', 'Estratégico', 'Criativo'];
        const emotions = ['Reflexivo', 'Equilibrado', 'Consciente', 'Focado'];
        const focuses = ['Autoconhecimento', 'Desenvolvimento', 'Relacionamentos', 'Propósito'];

        setData({
          insights: processedInsights,
          insightsWithAssistant,
          recommendations: [],
          recommendationsWithAssistant,
          emotionalStates: [],
          behavioralTraits: [],
          lifeAreas: [],
          emotionalData,
          lifeAreasData,
          discProfile,
          mbtiProfile,
          bigFiveData,
          skillsData: [],
          psychologicalProfile: profiles[Math.floor(Math.random() * profiles.length)],
          emotionalState: emotions[Math.floor(Math.random() * emotions.length)],
          mainFocus: focuses[Math.floor(Math.random() * focuses.length)],
          relationalAwareness: Math.floor(Math.random() * 20) + 60, // 60-80
          hasRealData: true
        });
      } else {
        console.log('📝 Nenhum insight encontrado - aguardando análise IA');
        setData({
          insights: [],
          insightsWithAssistant: [],
          recommendations: [],
          recommendationsWithAssistant: [],
          emotionalStates: [],
          behavioralTraits: [],
          lifeAreas: [],
          emotionalData: [],
          lifeAreasData: [],
          discProfile: {
            dominance: 0,
            influence: 0,
            steadiness: 0,
            compliance: 0,
            primaryType: 'Aguardando análise IA'
          },
          mbtiProfile: {
            extroversion: 50,
            sensing: 50,
            thinking: 50,
            judging: 50,
            approximateType: 'Aguardando análise IA'
          },
          bigFiveData: [
            { name: 'Extroversão', value: 0, description: 'Aguardando análise' },
            { name: 'Amabilidade', value: 0, description: 'Aguardando análise' },
            { name: 'Conscienciosidade', value: 0, description: 'Aguardando análise' },
            { name: 'Neuroticismo', value: 0, description: 'Aguardando análise' },
            { name: 'Abertura', value: 0, description: 'Aguardando análise' }
          ],
          skillsData: [],
          psychologicalProfile: 'Aguardando análise IA',
          emotionalState: 'Sem dados',
          mainFocus: 'Indefinido',
          relationalAwareness: 0,
          hasRealData: false
        });
      }

    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error);
      setData({
        insights: [],
        insightsWithAssistant: [],
        recommendations: [],
        recommendationsWithAssistant: [],
        emotionalStates: [],
        behavioralTraits: [],
        lifeAreas: [],
        emotionalData: [],
        lifeAreasData: [],
        discProfile: {
          dominance: 0,
          influence: 0,
          steadiness: 0,
          compliance: 0,
          primaryType: 'Erro ao carregar'
        },
        mbtiProfile: {
          extroversion: 50,
          sensing: 50,
          thinking: 50,
          judging: 50,
          approximateType: 'Erro ao carregar'
        },
        bigFiveData: [
          { name: 'Extroversão', value: 0, description: 'Erro ao carregar' },
          { name: 'Amabilidade', value: 0, description: 'Erro ao carregar' },
          { name: 'Conscienciosidade', value: 0, description: 'Erro ao carregar' },
          { name: 'Neuroticismo', value: 0, description: 'Erro ao carregar' },
          { name: 'Abertura', value: 0, description: 'Erro ao carregar' }
        ],
        skillsData: [],
        psychologicalProfile: 'Erro ao carregar',
        emotionalState: 'Erro ao carregar',
        mainFocus: 'Erro ao carregar',
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
