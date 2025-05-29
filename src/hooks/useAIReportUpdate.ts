
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
    console.log('🤖 Iniciando atualização do relatório por IA...');
    
    if (!user?.id) {
      console.error('❌ Usuário não autenticado');
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para atualizar o relatório",
        variant: "destructive"
      });
      return;
    }

    // Verificação rigorosa da configuração OpenAI
    if (!config.openai?.apiKey || !config.openai.apiKey.startsWith('sk-')) {
      console.error('❌ OpenAI não configurada:', config.openai);
      toast({
        title: "OpenAI não configurada",
        description: "Configure uma chave OpenAI válida antes de gerar relatórios",
        variant: "destructive"
      });
      return;
    }

    // Verificação se existem assistentes ativos
    const activeAssistants = assistants.filter(a => a.isActive);
    console.log('📋 Assistentes disponíveis:', assistants.length);
    console.log('📋 Assistentes ativos:', activeAssistants.length, activeAssistants.map(a => a.name));
    
    if (activeAssistants.length === 0) {
      console.error('❌ Nenhum assistente ativo encontrado');
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
      console.error('❌ Modelo inválido:', selectedModel);
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

      // Verificar se existem conversas do WhatsApp para analisar
      const { data: conversations, error: conversationsError } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (conversationsError) {
        console.error('❌ Erro ao buscar conversas do WhatsApp:', conversationsError);
        throw new Error(`Erro ao buscar conversas: ${conversationsError.message}`);
      }

      const conversationsCount = conversations?.length || 0;
      console.log('💬 Conversas encontradas:', conversationsCount);

      // SEMPRE EXIGIR CONVERSAS REAIS
      if (conversationsCount === 0) {
        toast({
          title: "Nenhuma conversa para analisar",
          description: "Importe conversas do WhatsApp primeiro antes de executar a análise por IA.",
          variant: "destructive"
        });
        return;
      }

      // Preparar dados dos assistentes para a edge function
      const assistantsData = activeAssistants.map(assistant => ({
        id: assistant.id,
        name: assistant.name,
        prompt: assistant.prompt,
        model: assistant.model || selectedModel,
        area: assistant.area || 'geral'
      }));

      console.log('📊 Enviando dados para análise:', {
        userId: user.id,
        assistantsCount: assistantsData.length,
        model: selectedModel,
        conversationsCount,
        assistants: assistantsData.map(a => ({ name: a.name, area: a.area }))
      });

      // Chamar edge function com configuração otimizada para análises simples
      const { data, error } = await supabase.functions.invoke('analyze-conversation', {
        body: { 
          userId: user.id,
          openaiConfig: {
            apiKey: config.openai.apiKey,
            model: selectedModel,
            temperature: 0.5, // Menos criativo, mais preciso
            maxTokens: 300 // REDUZIDO para análises mais simples e econômicas
          },
          assistants: assistantsData,
          analysisType: 'simple', // Tipo de análise mais simples
          conversationsData: conversations,
          timestamp: new Date().toISOString()
        }
      });

      console.log('📊 Resposta da edge function:', { data, error });

      if (error) {
        console.error('❌ Erro na edge function:', error);
        throw new Error(`Erro na análise: ${error.message}`);
      }

      if (!data?.success) {
        console.error('❌ Análise falhou:', data);
        throw new Error(data?.error || 'Erro desconhecido na análise');
      }

      console.log('✅ Análise concluída:', {
        insightsGenerated: data.insights?.length || 0,
        assistantsUsed: data.assistantsUsed || [],
        processingTime: data.processingTime,
        conversationsAnalyzed: data.conversationsAnalyzed
      });

      toast({
        title: "✅ Relatório atualizado com sucesso",
        description: `Análise SIMPLES concluída por ${data.assistantsUsed?.length || 0} assistente(s). ${data.insights?.length || 0} insights econômicos gerados (300 tokens).`,
        duration: 5000
      });

      // Recarregar após delay para mostrar o toast
      setTimeout(() => {
        console.log('🔄 Recarregando página para exibir novos dados...');
        window.location.reload();
      }, 3000);
      
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

      // Erro geral
      toast({
        title: "Erro na análise",
        description: error.message || "Não foi possível gerar o relatório. Verifique as configurações e tente novamente.",
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
