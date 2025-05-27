
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CommercialMessage {
  sender: string;
  text: string;
  timestamp: string;
  ai_generated: boolean;
  sender_type: string;
}

interface CommercialAnalysisData {
  conversations: Array<{
    id: string;
    contact_name: string;
    contact_phone: string;
    messages: CommercialMessage[];
    lead_status: string;
    sales_stage: string;
    created_at: string;
  }>;
  insights: Array<{
    id: string;
    title: string;
    description: string;
    insight_type: string;
    sales_impact: string;
    priority: string;
    created_at: string;
  }>;
  salesMetrics: {
    leads_generated: number;
    qualified_leads: number;
    conversions: number;
    conversion_rate: number;
    revenue_generated: number;
    sales_cycle_days: number;
  } | null;
  funnelData: Array<{
    stage_name: string;
    leads_count: number;
    conversion_rate: number;
    stage_order: number;
  }>;
  hasRealData: boolean;
}

interface CommercialAnalysisDataContextType {
  data: CommercialAnalysisData;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const CommercialAnalysisDataContext = createContext<CommercialAnalysisDataContextType | undefined>(undefined);

export function CommercialAnalysisDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<CommercialAnalysisData>({
    conversations: [],
    insights: [],
    salesMetrics: null,
    funnelData: [],
    hasRealData: false
  });

  const fetchRealData = async () => {
    if (!user?.id) return;

    try {
      console.log('🔄 Buscando dados comerciais reais...');

      // Buscar conversas comerciais
      const { data: conversationsData, error: convError } = await supabase
        .from('commercial_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Buscar insights comerciais
      const { data: insightsData, error: insightsError } = await supabase
        .from('commercial_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Buscar métricas de vendas
      const { data: metricsData, error: metricsError } = await supabase
        .from('sales_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      // Buscar dados do funil
      const { data: funnelData, error: funnelError } = await supabase
        .from('sales_funnel_data')
        .select('*')
        .eq('user_id', user.id)
        .order('stage_order', { ascending: true });

      if (convError) throw convError;
      if (insightsError) throw insightsError;
      if (metricsError) throw metricsError;
      if (funnelError) throw funnelError;

      console.log('✅ Dados comerciais carregados:', {
        conversas: conversationsData?.length || 0,
        insights: insightsData?.length || 0,
        metricas: metricsData?.length || 0,
        funil: funnelData?.length || 0
      });

      const hasRealData = (conversationsData && conversationsData.length > 0) ||
                         (insightsData && insightsData.length > 0) ||
                         (metricsData && metricsData.length > 0);

      // Processar conversas para garantir que messages seja um array válido
      const processedConversations = conversationsData?.map(conv => {
        let processedMessages: CommercialMessage[] = [];
        
        // Verificar se messages existe e é um array
        if (conv.messages && Array.isArray(conv.messages)) {
          processedMessages = conv.messages.map((msg: any) => ({
            sender: msg.sender || '',
            text: msg.text || msg.message_text || '',
            timestamp: msg.timestamp || new Date().toISOString(),
            ai_generated: msg.ai_generated || false,
            sender_type: msg.sender_type || 'customer'
          }));
        }

        return {
          id: conv.id,
          contact_name: conv.contact_name,
          contact_phone: conv.contact_phone,
          messages: processedMessages,
          lead_status: conv.lead_status || 'new',
          sales_stage: conv.sales_stage || 'prospecting',
          created_at: conv.created_at
        };
      }) || [];

      setData({
        conversations: processedConversations,
        insights: insightsData || [],
        salesMetrics: metricsData?.[0] || null,
        funnelData: funnelData || [],
        hasRealData
      });

    } catch (error) {
      console.error('❌ Erro ao buscar dados comerciais:', error);
      setData({
        conversations: [],
        insights: [],
        salesMetrics: null,
        funnelData: [],
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
    <CommercialAnalysisDataContext.Provider value={{ data, isLoading, refreshData }}>
      {children}
    </CommercialAnalysisDataContext.Provider>
  );
}

export function useCommercialAnalysisData() {
  const context = useContext(CommercialAnalysisDataContext);
  if (context === undefined) {
    throw new Error('useCommercialAnalysisData deve ser usado dentro de um CommercialAnalysisDataProvider');
  }
  return context;
}
