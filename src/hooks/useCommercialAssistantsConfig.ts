
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CommercialAssistant {
  id: string;
  name: string;
  description: string;
  prompt: string;
  model: string;
  isActive: boolean;
  canRespond: boolean;
  icon: string;
  color: string;
  area?: string;
}

interface CommercialOpenAIConfig {
  assistants?: CommercialAssistant[];
  [key: string]: any;
}

export function useCommercialAssistantsConfig() {
  const [assistants, setAssistants] = useState<CommercialAssistant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const defaultAssistants: CommercialAssistant[] = [
    {
      id: 'sales_master',
      name: 'Mestre das Vendas',
      description: 'Especialista em conversão e fechamento',
      prompt: 'Você é o Mestre das Vendas, especializado em análise de funil, conversão e técnicas de fechamento. Analise padrões de vendas, identifique gargalos no funil e sugira melhorias nas abordagens comerciais.',
      model: 'gpt-4o',
      isActive: true,
      canRespond: true,
      icon: '💰',
      color: 'green',
      area: 'vendas'
    },
    {
      id: 'performance_analyzer',
      name: 'Analisador de Performance',
      description: 'Análise de métricas e KPIs comerciais',
      prompt: 'Você é o Analisador de Performance comercial. Analise métricas de vendas, CAC, LTV, tempo de ciclo e performance individual dos vendedores. Identifique tendências e oportunidades de melhoria.',
      model: 'gpt-4o-mini',
      isActive: true,
      canRespond: false,
      icon: '📊',
      color: 'blue',
      area: 'performance'
    },
    {
      id: 'culture_guardian',
      name: 'Guardião da Cultura Comercial',
      description: 'Análise de clima e cultura do time de vendas',
      prompt: 'Você é o Guardião da Cultura Comercial. Analise padrões de comunicação, motivação, burnout e engajamento do time comercial. Detecte sinais de problemas culturais e sugira melhorias.',
      model: 'gpt-4o-mini',
      isActive: true,
      canRespond: false,
      icon: '🤝',
      color: 'purple',
      area: 'cultura'
    },
    {
      id: 'objection_hunter',
      name: 'Caçador de Objeções',
      description: 'Especialista em identificar e superar objeções',
      prompt: 'Você é o Caçador de Objeções. Analise padrões de objeções recorrentes, identifique as mais impactantes e sugira argumentos e estratégias para superá-las.',
      model: 'gpt-4o-mini',
      isActive: true,
      canRespond: false,
      icon: '🎯',
      color: 'red',
      area: 'vendas'
    },
    {
      id: 'strategy_architect',
      name: 'Arquiteto Estratégico',
      description: 'Visão estratégica e planejamento comercial',
      prompt: 'Você é o Arquiteto Estratégico comercial. Analise tendências de mercado, competitividade, posicionamento e estratégias de crescimento. Forneça insights para decisões estratégicas.',
      model: 'gpt-4o',
      isActive: true,
      canRespond: false,
      icon: '🏗️',
      color: 'orange',
      area: 'estrategia'
    },
    {
      id: 'pipeline_doctor',
      name: 'Doutor do Pipeline',
      description: 'Diagnóstico e saúde do pipeline de vendas',
      prompt: 'Você é o Doutor do Pipeline. Analise a saúde do funil de vendas, identifique oportunidades estagnadas, preveja fechamentos e diagnostique problemas no processo comercial.',
      model: 'gpt-4o-mini',
      isActive: true,
      canRespond: false,
      icon: '🔬',
      color: 'teal',
      area: 'performance'
    }
  ];

  const loadAssistants = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      const { data: config } = await supabase
        .from('client_configs')
        .select('openai_config')
        .eq('user_id', user.id)
        .single();

      const openaiConfig = config?.openai_config as CommercialOpenAIConfig | null;
      
      if (openaiConfig?.assistants) {
        setAssistants(openaiConfig.assistants);
      } else {
        setAssistants(defaultAssistants);
      }
    } catch (error) {
      console.error('Erro ao carregar assistentes comerciais:', error);
      setAssistants(defaultAssistants);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAssistants = async (updatedAssistants: CommercialAssistant[]) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      const openaiConfig: CommercialOpenAIConfig = {
        assistants: updatedAssistants
      };

      const { error } = await supabase
        .from('client_configs')
        .update({
          openai_config: openaiConfig
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setAssistants(updatedAssistants);
      
      toast({
        title: "Assistentes comerciais salvos",
        description: "Configurações dos assistentes comerciais atualizadas com sucesso",
      });
    } catch (error) {
      console.error('Erro ao salvar assistentes comerciais:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações dos assistentes comerciais",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssistants();
  }, [user?.id]);

  return {
    assistants,
    setAssistants,
    saveAssistants,
    isLoading,
    defaultAssistants
  };
}
