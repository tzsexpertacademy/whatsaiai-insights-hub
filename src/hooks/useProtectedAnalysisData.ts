
/**
 * HOOK BLINDADO PARA DADOS DE ANÁLISE
 * 
 * Este hook garante que os dados de análise sempre sejam processados
 * de forma consistente, independente de outras alterações no sistema.
 * 
 * ATUALIZADO: Removidos completamente os dados simulados
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getAssistantByInsightType, validateAssistantMapping, ANALYSIS_SYSTEM_CONFIG } from '@/constants/assistantMapping';

interface ProtectedInsight {
  id: string;
  title: string;
  description: string;
  insight_type: string;
  created_at: string;
  assistantName: string;
  assistantArea: string;
  priority: string;
  isValidated: boolean;
}

export function useProtectedAnalysisData() {
  const [insights, setInsights] = useState<ProtectedInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [systemIntegrity, setSystemIntegrity] = useState(false);
  const { user } = useAuth();

  // Validação inicial do sistema
  useEffect(() => {
    const integrity = validateAssistantMapping();
    setSystemIntegrity(integrity);
    
    if (!integrity) {
      console.error('❌ SISTEMA DE ANÁLISE COMPROMETIDO - Verifique o mapeamento de assistentes');
    }
  }, []);

  const loadProtectedInsights = async () => {
    if (!user?.id || !systemIntegrity) {
      console.warn('⚠️ Carregamento bloqueado - usuário não autenticado ou sistema comprometido');
      setInsights([]);
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔒 Carregando insights com proteção ativa...');
      
      const { data: rawInsights, error } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Processamento protegido dos insights - APENAS dados reais
      const protectedInsights: ProtectedInsight[] = (rawInsights || []).map(insight => {
        // Validação de campos obrigatórios
        const hasRequiredFields = ANALYSIS_SYSTEM_CONFIG.REQUIRED_INSIGHT_FIELDS.every(
          field => insight[field] !== null && insight[field] !== undefined
        );

        if (!hasRequiredFields) {
          console.warn(`⚠️ Insight ${insight.id} não possui todos os campos obrigatórios`);
        }

        // Mapeamento protegido para assistente
        const assistantInfo = getAssistantByInsightType(insight.insight_type);
        
        // Validação de conteúdo
        const isValidContent = insight.description &&
          insight.description.length >= ANALYSIS_SYSTEM_CONFIG.MIN_INSIGHT_LENGTH &&
          insight.description.length <= ANALYSIS_SYSTEM_CONFIG.MAX_INSIGHT_LENGTH;

        return {
          id: insight.id,
          title: insight.title || 'Insight sem título',
          description: insight.description || 'Descrição não disponível',
          insight_type: insight.insight_type,
          created_at: insight.created_at,
          assistantName: assistantInfo.name,
          assistantArea: assistantInfo.area,
          priority: insight.priority || 'medium',
          isValidated: hasRequiredFields && isValidContent
        };
      });

      // Filtrar apenas insights validados
      const validInsights = protectedInsights.filter(insight => insight.isValidated);
      
      console.log(`✅ ${validInsights.length} insights validados carregados de ${protectedInsights.length} total`);
      
      setInsights(validInsights);

    } catch (error) {
      console.error('❌ Erro no carregamento protegido:', error);
      setInsights([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (systemIntegrity) {
      loadProtectedInsights();
    } else {
      setIsLoading(false);
    }
  }, [user?.id, systemIntegrity]);

  // Função para revalidar o sistema
  const revalidateSystem = async () => {
    const integrity = validateAssistantMapping();
    setSystemIntegrity(integrity);
    
    if (integrity) {
      await loadProtectedInsights();
    }
    
    return integrity;
  };

  // Estatísticas protegidas - APENAS dados reais
  const getProtectedStats = () => {
    const assistantCounts = insights.reduce((acc, insight) => {
      acc[insight.assistantName] = (acc[insight.assistantName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalInsights: insights.length,
      assistantCounts,
      lastAnalysis: insights[0]?.created_at || null,
      systemIntegrity,
      assistantsActive: Object.keys(assistantCounts).length,
      hasRealData: insights.length > 0
    };
  };

  return {
    insights,
    isLoading,
    systemIntegrity,
    protectedStats: getProtectedStats(),
    revalidateSystem,
    refreshData: loadProtectedInsights
  };
}
