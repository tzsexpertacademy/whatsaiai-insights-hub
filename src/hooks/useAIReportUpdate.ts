
import { useState } from 'react';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useAIReportUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { config } = useClientConfig();
  const { user } = useAuth();
  const { toast } = useToast();

  const updateReport = async () => {
    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para atualizar o relatório",
        variant: "destructive"
      });
      return;
    }

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

      // Chamar edge function para análise por IA
      const { data, error } = await supabase.functions.invoke('analyze-conversation', {
        body: { 
          userId: user.id,
          openaiApiKey: config.openai.apiKey,
          model: config.openai.model,
          temperature: config.openai.temperature,
          maxTokens: config.openai.maxTokens
        }
      });

      if (error) {
        console.error('❌ Erro na edge function:', error);
        throw error;
      }

      console.log('✅ Resposta da IA:', data);

      // Forçar re-render dos componentes de dashboard
      window.dispatchEvent(new CustomEvent('ai-analysis-complete', { 
        detail: data 
      }));

      toast({
        title: "Relatório atualizado",
        description: "Análise por IA concluída com sucesso",
      });

      console.log('✅ Relatório atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar relatório:', error);
      toast({
        title: "Erro na atualização",
        description: "Não foi possível atualizar o relatório. Verifique suas configurações.",
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
