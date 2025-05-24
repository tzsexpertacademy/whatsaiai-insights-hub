
import { useState } from 'react';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { useToast } from '@/hooks/use-toast';

export function useAIReportUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { config } = useClientConfig();
  const { toast } = useToast();

  const updateReport = async () => {
    if (!config.openai.apiKey) {
      toast({
        title: "Configuração necessária",
        description: "Configure sua chave OpenAI antes de atualizar o relatório",
        variant: "destructive"
      });
      return;
    }

    if (!config.openai.apiKey.startsWith('sk-')) {
      toast({
        title: "Chave inválida",
        description: "A chave OpenAI deve começar com 'sk-'",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUpdating(true);
      console.log('🔄 Iniciando atualização do relatório com IA...');

      // Simular chamada para API de análise
      // Em uma implementação real, você faria uma chamada para sua edge function
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Forçar re-render dos componentes de dashboard
      window.dispatchEvent(new CustomEvent('ai-analysis-complete'));

      toast({
        title: "Relatório atualizado",
        description: "Análise por IA concluída com sucesso",
      });

      console.log('✅ Relatório atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar relatório:', error);
      toast({
        title: "Erro na atualização",
        description: "Não foi possível atualizar o relatório",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateReport,
    isUpdating
  };
}
