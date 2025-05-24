
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
        .limit(10);

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
        setData(prev => ({
          ...emptyAnalysisData,
          hasRealData: false
        }));
        return;
      }

      console.log('✅ Dados reais encontrados, atualizando dashboard');

      let updatedData = { ...emptyAnalysisData, hasRealData: true };

      if (hasInsights) {
        const analysisInsights = insights.map(insight => insight.description);
        updatedData.insights = analysisInsights;
        updatedData.lastUpdated = new Date(insights[0].created_at);
      }

      if (hasConversations) {
        const latest = conversations[0];
        
        if (latest.emotional_analysis) {
          const emotional = latest.emotional_analysis as any;
          updatedData.emotionalState = emotional.primary_emotion || '--';
          updatedData.relationalAwareness = emotional.confidence_level || 0;
        }

        if (latest.psychological_profile) {
          const psych = latest.psychological_profile as any;
          updatedData.psychologicalProfile = psych.personality_type || '--';
        }
      }

      setData(updatedData);

    } catch (error) {
      console.error('❌ Erro ao carregar dados de análise:', error);
      setData(prev => ({ ...emptyAnalysisData, hasRealData: false }));
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
