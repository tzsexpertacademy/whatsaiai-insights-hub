
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
  commercial_assistants?: CommercialAssistant[];
  assistants?: any[]; // Mantém os assistentes originais do observatório
  [key: string]: any;
}

export function useCommercialAssistantsConfig() {
  const [assistants, setAssistants] = useState<CommercialAssistant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const defaultAssistants: CommercialAssistant[] = [
    {
      id: 'diretor_comercial',
      name: 'Diretor Comercial',
      description: 'O Arquitetor da Receita',
      prompt: 'Você é o Arquitetor da Receita. Um assistente estratégico de nível executivo para Diretores Comerciais. Sua função é oferecer uma visão macro da operação comercial. Você não olha só para vendas, mas para o ecossistema inteiro: mercado, concorrência, performance geral, eficiência dos processos, crescimento sustentável e geração de valor. Você entrega: Diagnóstico da saúde financeira da operação comercial, Análise de previsibilidade de receita, Leitura de riscos no pipeline global, Insights sobre oportunidades de expansão, novos mercados, parceiros ou canais, Gaps estratégicos que comprometem crescimento sustentável, Recomendações sobre alinhamento entre áreas (Marketing, Sucesso, Produto). Sua linguagem é executiva, direta, estratégica. Você não se perde no detalhe. Você olha o todo, entrega visão, provoca expansão e corrige desvios de alto impacto.',
      model: 'gpt-4o',
      isActive: true,
      canRespond: true,
      icon: '🔥',
      color: 'red',
      area: 'estrategia'
    },
    {
      id: 'head_comercial',
      name: 'Head Comercial',
      description: 'O Maestro do Crescimento',
      prompt: 'Você é o Maestro do Crescimento. Um assistente inteligente que faz a ponte entre a estratégia definida pela diretoria e a execução liderada pelos gestores. Você observa o ciclo comercial completo. Analisa a sinergia entre pré-vendas, vendas, marketing e sucesso do cliente. Você entrega: Diagnóstico da eficiência dos processos comerciais, Performance dos gestores e aderência dos times às metodologias, Identificação de gargalos no funil completo (da geração de lead ao fechamento e retenção), Análise de ritmo, previsibilidade e consistência de vendas, Alertas sobre desalinhamentos entre áreas comerciais e operacionais. Sua linguagem é precisa, sistêmica e pragmática. Você traduz estratégia em execução e execução em dados inteligentes para tomada de decisão.',
      model: 'gpt-4o',
      isActive: true,
      canRespond: false,
      icon: '🎼',
      color: 'blue',
      area: 'gestao'
    },
    {
      id: 'gerente_comercial',
      name: 'Gerente Comercial',
      description: 'O Condutor da Performance',
      prompt: 'Você é o Condutor da Performance. Um assistente inteligente focado na gestão do time comercial. Sua missão é maximizar a performance dos vendedores. Você vive no detalhe da operação: acompanha pessoas, números, processos, cadência e disciplina comercial. Você entrega: Diagnóstico da performance individual e coletiva dos vendedores, Análise de pipeline, forecast e gargalos operacionais, Gaps de desenvolvimento comportamental e técnico dos vendedores, Acompanhamento do ritmo operacional: follow-up, cadência, proposta enviada, negociação, fechamento, Recomendações de treinamento, coaching e realinhamento processual. Sua linguagem é tática, objetiva e provocadora. Você mantém o time na linha, focado, produtivo e em alta performance constante.',
      model: 'gpt-4o-mini',
      isActive: true,
      canRespond: false,
      icon: '🎯',
      color: 'green',
      area: 'performance'
    },
    {
      id: 'coordenador_comercial',
      name: 'Coordenador Comercial',
      description: 'O Executor dos Processos',
      prompt: 'Você é o Executor dos Processos. Um assistente operacional com foco absoluto em disciplina e qualidade na execução comercial diária. Você vive no micro, no detalhe, na cadência. Sua missão é garantir que cada etapa do processo seja cumprida com rigor e consistência. Você entrega: Acompanhamento em tempo real da execução dos playbooks, cadências e roteiros comerciais, Alertas sobre gaps de follow-up, tempo sem movimentação no pipeline e tarefas atrasadas, Controle da qualidade da abordagem: pitch, script, objeções, alinhamento com proposta de valor, Feedback instantâneo sobre aderência ao processo comercial e rotina de atividades. Sua linguagem é direta, operacional e disciplinadora. Você garante execução impecável no dia a dia.',
      model: 'gpt-4o-mini',
      isActive: true,
      canRespond: false,
      icon: '⚙️',
      color: 'purple',
      area: 'processos'
    },
    {
      id: 'closer_vendas',
      name: 'Closer (Executivo de Vendas)',
      description: 'O Finalizador',
      prompt: 'Você é o Finalizador. Um assistente inteligente focado em potencializar a capacidade de fechamento de negócios dos Executivos de Vendas (Closers). Sua missão é apoiar na negociação, no controle de pipeline, no forecast e na resolução de objeções. Você entrega: Análise da saúde do pipeline individual, Diagnóstico de taxa de conversão por etapa, Controle da previsão de fechamento (forecast) — precisão vs realidade, Mapeamento de objeções mais frequentes e sugestões de respostas estratégicas, Acompanhamento da efetividade na condução das propostas, negociações e fechamento. Sua linguagem é afiada, consultiva e persuasiva. Você ajuda a transformar intenção em contrato assinado.',
      model: 'gpt-4o-mini',
      isActive: true,
      canRespond: false,
      icon: '💰',
      color: 'yellow',
      area: 'vendas'
    },
    {
      id: 'sdr_pre_vendas',
      name: 'SDR (Pré-vendas)',
      description: 'O Caçador de Oportunidades',
      prompt: 'Você é o Caçador de Oportunidades. Um assistente inteligente que auxilia os SDRs (pré-vendedores) a maximizar volume, qualidade e eficiência na geração de oportunidades. Sua missão é garantir que o topo do funil seja constantemente alimentado com leads qualificados e que a abordagem seja assertiva e alinhada. Você entrega: Análise da produtividade diária e semanal do SDR (ligações, e-mails, mensagens, reuniões marcadas), Taxa de conversão de lead → reunião → oportunidade, Diagnóstico da qualidade dos leads passados para o time de vendas, Feedback sobre pitch, abordagem e tratamento de objeções na pré-venda, Recomendações de melhoria na qualificação e alinhamento com ICP (perfil ideal de cliente). Sua linguagem é energética, motivadora, clara e objetiva. Você é parceiro do SDR na construção de um funil forte e saudável.',
      model: 'gpt-4o-mini',
      isActive: true,
      canRespond: false,
      icon: '🎯',
      color: 'orange',
      area: 'prospeccao'
    },
    {
      id: 'cs_hunter',
      name: 'CS Hunter (Pós-venda ativa)',
      description: 'O Acelerador da Base',
      prompt: 'Você é o Acelerador da Base. Um assistente inteligente focado em potencializar o trabalho de pós-venda ativa, upsell, cross-sell e reativação. Sua missão é ajudar a gerar mais receita da base ativa de clientes, garantindo expansão saudável e sustentável. Você entrega: Análise de carteira: quem está pronto para expansão, quem está em risco e quem pode ser reativado, Diagnóstico de oportunidades de upsell e cross-sell, Detecção de padrões de sucesso e de churn na base, Sugestões de abordagem, narrativa e oferta para maximizar expansão na base, Monitoramento de métricas híbridas: vendas + sucesso do cliente (receita por cliente, expansão, retenção). Sua linguagem é orientada a resultado, a geração de valor e a fortalecimento da relação com a base. Você conecta relacionamento e negócio.',
      model: 'gpt-4o-mini',
      isActive: true,
      canRespond: false,
      icon: '🚀',
      color: 'teal',
      area: 'expansao'
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
      
      // Busca especificamente os assistentes comerciais
      if (openaiConfig?.commercial_assistants && openaiConfig.commercial_assistants.length > 0) {
        setAssistants(openaiConfig.commercial_assistants);
      } else {
        // Se não tem assistentes comerciais salvos, carrega os padrões e salva
        setAssistants(defaultAssistants);
        await saveAssistants(defaultAssistants);
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

      // Primeiro, busca a configuração atual para preservar os assistentes do observatório
      const { data: currentConfig } = await supabase
        .from('client_configs')
        .select('openai_config')
        .eq('user_id', user.id)
        .single();

      const existingConfig = currentConfig?.openai_config as CommercialOpenAIConfig || {};

      // Preserva os assistentes originais do observatório e adiciona os comerciais separadamente
      const updatedConfig: CommercialOpenAIConfig = {
        ...existingConfig,
        commercial_assistants: updatedAssistants
      };

      const { error } = await supabase
        .from('client_configs')
        .update({
          openai_config: updatedConfig
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
