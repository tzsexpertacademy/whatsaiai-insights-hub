
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Assistant {
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

interface OpenAIConfig {
  assistants?: Assistant[];
  [key: string]: any;
}

export function useAssistantsConfig() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const defaultAssistants: Assistant[] = [
    {
      id: 'kairon',
      name: 'Kairon',
      description: 'Conselheiro Principal - Responde no WhatsApp',
      prompt: 'Você é Kairon, o conselheiro principal. Sua função é fornecer orientações práticas e compassivas baseadas nas análises dos outros assistentes. Mantenha um tom acolhedor mas direto.',
      model: 'gpt-4o',
      isActive: true,
      canRespond: true,
      icon: '🧠',
      color: 'blue',
      area: 'geral'
    },
    {
      id: 'oracle',
      name: 'Oráculo das Sombras',
      description: 'Assistente Terapêutico - Análise apenas',
      prompt: 'Você é o Oráculo das Sombras, especialista em psicologia profunda. Analise padrões inconscientes, traumas não resolvidos e aspectos sombrios da personalidade. Sua análise é usada internamente.',
      model: 'gpt-4o',
      isActive: true,
      canRespond: false,
      icon: '🔮',
      color: 'purple',
      area: 'psicologia'
    },
    {
      id: 'guardian',
      name: 'Guardião dos Recursos',
      description: 'Mentor Financeiro - Análise apenas',
      prompt: 'Você é o Guardião dos Recursos, mentor financeiro especializado. Analise padrões de gastos, decisões financeiras e relacionamento com dinheiro. Identifique oportunidades de crescimento financeiro.',
      model: 'gpt-4o-mini',
      isActive: true,
      canRespond: false,
      icon: '💰',
      color: 'green',
      area: 'financeiro'
    },
    {
      id: 'engineer',
      name: 'Engenheiro do Corpo',
      description: 'Biohacker - Análise apenas',
      prompt: 'Você é o Engenheiro do Corpo, especialista em biohacking e otimização física. Analise padrões de saúde, sono, alimentação e exercícios mencionados nas conversas.',
      model: 'gpt-4o-mini',
      isActive: true,
      canRespond: false,
      icon: '⚡',
      color: 'red',
      area: 'saude'
    },
    {
      id: 'architect',
      name: 'Arquiteto do Jogo',
      description: 'Estratégia de Vida - Análise apenas',
      prompt: 'Você é o Arquiteto do Jogo, estrategista de vida. Analise padrões de tomada de decisão, planejamento e execução de metas. Identifique pontos de melhoria na estratégia de vida.',
      model: 'gpt-4o-mini',
      isActive: true,
      canRespond: false,
      icon: '🎯',
      color: 'orange',
      area: 'estrategia'
    },
    {
      id: 'weaver',
      name: 'Tecelão da Alma',
      description: 'Propósito e Legado - Análise apenas',
      prompt: 'Você é o Tecelão da Alma, especialista em propósito e legado. Analise conexões com propósito de vida, valores fundamentais e direcionamento existencial.',
      model: 'gpt-4o-mini',
      isActive: true,
      canRespond: false,
      icon: '✨',
      color: 'yellow',
      area: 'proposito'
    },
    {
      id: 'catalyst',
      name: 'Catalisador',
      description: 'Criatividade - Análise apenas',
      prompt: 'Você é o Catalisador, especialista em criatividade e inovação. Analise padrões criativos, bloqueios e potencial de inovação nas conversas.',
      model: 'gpt-4o-mini',
      isActive: true,
      canRespond: false,
      icon: '🎨',
      color: 'pink',
      area: 'criatividade'
    },
    {
      id: 'mirror',
      name: 'Espelho Social',
      description: 'Relacionamentos - Análise apenas',
      prompt: 'Você é o Espelho Social, especialista em relacionamentos. Analise padrões de comunicação, vínculos sociais e dinâmicas relacionais mencionadas.',
      model: 'gpt-4o-mini',
      isActive: true,
      canRespond: false,
      icon: '👥',
      color: 'indigo',
      area: 'relacionamentos'
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

      const openaiConfig = config?.openai_config as OpenAIConfig | null;
      
      if (openaiConfig?.assistants) {
        setAssistants(openaiConfig.assistants);
      } else {
        setAssistants(defaultAssistants);
      }
    } catch (error) {
      console.error('Erro ao carregar assistentes:', error);
      setAssistants(defaultAssistants);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAssistants = async (updatedAssistants: Assistant[]) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      const openaiConfig: OpenAIConfig = {
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
        title: "Assistentes salvos",
        description: "Configurações dos assistentes atualizadas com sucesso",
      });
    } catch (error) {
      console.error('Erro ao salvar assistentes:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações dos assistentes",
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
