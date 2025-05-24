
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Insights e recomendações
  insights: string[];
  recommendations: string[];
  
  // Última atualização
  lastUpdated: Date | null;
}

const defaultAnalysisData: AnalysisData = {
  psychologicalProfile: 'ENFP',
  emotionalState: 'Confiante',
  mainFocus: 'Crescimento',
  relationalAwareness: 72,
  lifeAreasData: [
    { subject: 'Profissional', A: 80, fullMark: 100 },
    { subject: 'Financeiro', A: 65, fullMark: 100 },
    { subject: 'Relacionamentos', A: 70, fullMark: 100 },
    { subject: 'Saúde Física', A: 55, fullMark: 100 },
    { subject: 'Saúde Mental', A: 75, fullMark: 100 },
    { subject: 'Espiritualidade', A: 60, fullMark: 100 },
    { subject: 'Crescimento Pessoal', A: 85, fullMark: 100 },
  ],
  emotionalData: [
    { name: 'Seg', level: 75, emotion: 'Confiante' },
    { name: 'Ter', level: 62, emotion: 'Reflexivo' },
    { name: 'Qua', level: 48, emotion: 'Ansioso' },
    { name: 'Qui', level: 70, emotion: 'Motivado' },
    { name: 'Sex', level: 85, emotion: 'Entusiasmado' },
    { name: 'Sáb', level: 78, emotion: 'Tranquilo' },
    { name: 'Dom', level: 65, emotion: 'Contemplativo' },
  ],
  bigFiveData: [
    { name: 'Extroversão', value: 65 },
    { name: 'Abertura', value: 85 },
    { name: 'Neuroticismo', value: 45 },
    { name: 'Amabilidade', value: 70 },
    { name: 'Conscienciosidade', value: 75 },
  ],
  skillsData: [
    { title: "Comunicação", value: "82%", trend: "+6%" },
    { title: "Inteligência Emocional", value: "75%", trend: "+12%" },
    { title: "Capacidade Analítica", value: "88%", trend: "+4%" }
  ],
  insights: [
    "Aumento na reflexão sobre propósito nas últimas 2 semanas",
    "Padrão de procrastinação detectado na área financeira",
    "Maior ansiedade em conversas sobre relacionamentos recentemente",
    "Queda na atenção à saúde física nos últimos 30 dias"
  ],
  recommendations: [
    "Desenvolver Autocompaixão",
    "Praticar Journaling Diário",
    "Revisitar Metas Financeiras"
  ],
  lastUpdated: null
};

interface AnalysisDataContextType {
  data: AnalysisData;
  isLoading: boolean;
  updateData: (newData: Partial<AnalysisData>) => void;
  refreshData: () => Promise<void>;
}

const AnalysisDataContext = createContext<AnalysisDataContextType | undefined>(undefined);

export function AnalysisDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AnalysisData>(defaultAnalysisData);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const loadStoredData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      // Buscar insights mais recentes
      const { data: insights } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (insights && insights.length > 0) {
        const analysisInsights = insights.map(insight => insight.description);
        
        setData(prev => ({
          ...prev,
          insights: analysisInsights,
          lastUpdated: new Date(insights[0].created_at)
        }));
      }

      // Buscar dados de conversas para análise emocional
      const { data: conversations } = await supabase
        .from('whatsapp_conversations')
        .select('emotional_analysis, psychological_profile')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (conversations && conversations.length > 0) {
        const latest = conversations[0];
        
        if (latest.emotional_analysis) {
          const emotional = latest.emotional_analysis as any;
          setData(prev => ({
            ...prev,
            emotionalState: emotional.primary_emotion || prev.emotionalState,
            relationalAwareness: emotional.confidence_level || prev.relationalAwareness
          }));
        }

        if (latest.psychological_profile) {
          const psych = latest.psychological_profile as any;
          setData(prev => ({
            ...prev,
            psychologicalProfile: psych.personality_type || prev.psychologicalProfile
          }));
        }
      }

    } catch (error) {
      console.error('Erro ao carregar dados de análise:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateData = (newData: Partial<AnalysisData>) => {
    setData(prev => ({
      ...prev,
      ...newData,
      lastUpdated: new Date()
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
      console.log('📊 Dados de análise atualizados:', event.detail);
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
