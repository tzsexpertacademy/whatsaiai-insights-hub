
import { useState } from 'react';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';

export function useAIReportUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { config } = useClientConfig();
  const { user } = useAuth();
  const { toast } = useToast();
  const { assistants } = useAssistantsConfig();

  const updateReport = async () => {
    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para atualizar o relatório",
        variant: "destructive"
      });
      return;
    }

    // Verificação rigorosa da configuração OpenAI
    if (!config.openai?.apiKey || !config.openai.apiKey.startsWith('sk-')) {
      toast({
        title: "OpenAI não configurada",
        description: "Configure uma chave OpenAI válida antes de gerar relatórios",
        variant: "destructive"
      });
      return;
    }

    // Verificação se existem assistentes ativos
    const activeAssistants = assistants.filter(a => a.isActive);
    if (activeAssistants.length === 0) {
      toast({
        title: "Nenhum assistente ativo",
        description: "Configure pelo menos um assistente ativo para gerar relatórios",
        variant: "destructive"
      });
      return;
    }

    // Verificação de modelo válido
    const validModels = ['gpt-4o', 'gpt-4o-mini'];
    const selectedModel = config.openai.model || 'gpt-4o-mini';
    if (!validModels.includes(selectedModel)) {
      toast({
        title: "Modelo inválido",
        description: "Configure um modelo OpenAI válido (gpt-4o ou gpt-4o-mini)",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUpdating(true);
      console.log('🤖 Iniciando análise por IA com assistentes configurados...');
      console.log('📋 Assistentes ativos:', activeAssistants.map(a => a.name));

      // Preparar dados dos assistentes para a edge function
      const assistantsData = activeAssistants.map(assistant => ({
        id: assistant.id,
        name: assistant.name,
        prompt: assistant.prompt,
        model: assistant.model || selectedModel,
        area: assistant.area || 'geral'
      }));

      // Chamar edge function com dados dos assistentes
      const { data, error } = await supabase.functions.invoke('analyze-conversation', {
        body: { 
          userId: user.id,
          openaiConfig: {
            apiKey: config.openai.apiKey,
            model: selectedModel,
            temperature: config.openai.temperature || 0.7,
            maxTokens: config.openai.maxTokens || 1000
          },
          assistants: assistantsData,
          analysisType: 'comprehensive',
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.error('❌ Erro na edge function:', error);
        throw new Error(`Erro na análise: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro desconhecido na análise');
      }

      console.log('✅ Análise concluída:', {
        insightsGenerated: data.insights?.length || 0,
        assistantsUsed: data.assistantsUsed || [],
        processingTime: data.processingTime
      });

      toast({
        title: "✅ Relatório atualizado com sucesso",
        description: `Análise concluída por ${data.assistantsUsed?.length || 0} assistente(s). Atualizando dashboard...`,
        duration: 3000
      });

      // Recarregar após delay para mostrar o toast
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro ao atualizar relatório:', error);
      
      // Erro específico para chave OpenAI inválida
      if (error.message.includes('401') || error.message.includes('API key')) {
        toast({
          title: "Chave OpenAI inválida",
          description: "Verifique sua chave OpenAI nas configurações",
          variant: "destructive"
        });
        return;
      }

      // Erro específico para cota excedida
      if (error.message.includes('quota') || error.message.includes('billing')) {
        toast({
          title: "Cota OpenAI excedida",
          description: "Verifique sua conta OpenAI e billing",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Erro na análise",
        description: error.message || "Não foi possível gerar o relatório",
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
