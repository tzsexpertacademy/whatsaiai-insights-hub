
import { useState } from 'react';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';

interface AnalysisConfig {
  type: string;
  maxTokens: number;
  temperature: number;
}

export function useAIReportUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { config } = useClientConfig();
  const { user } = useAuth();
  const { toast } = useToast();
  const { assistants } = useAssistantsConfig();

  const updateReport = async (analysisConfig?: AnalysisConfig) => {
    console.log('🤖 Iniciando análise de DADOS REAIS por IA...');
    
    const defaultConfig: AnalysisConfig = {
      type: 'simple',
      maxTokens: 250,
      temperature: 0.5
    };
    
    const finalConfig = analysisConfig || defaultConfig;
    
    if (!user?.id) {
      console.error('❌ Usuário não autenticado');
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para executar análises",
        variant: "destructive"
      });
      return;
    }

    // Verificação da configuração OpenAI
    if (!config.openai?.apiKey || !config.openai.apiKey.startsWith('sk-')) {
      console.error('❌ OpenAI não configurada');
      toast({
        title: "OpenAI não configurada",
        description: "Configure uma chave OpenAI válida antes de executar análises",
        variant: "destructive"
      });
      return;
    }

    // Verificação de assistentes ativos
    const activeAssistants = assistants.filter(a => a.isActive);
    if (activeAssistants.length === 0) {
      console.error('❌ Nenhum assistente ativo');
      toast({
        title: "Nenhum assistente ativo",
        description: "Configure pelo menos um assistente ativo para executar análises",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUpdating(true);
      console.log('🔍 Verificando DADOS REAIS disponíveis para análise...');

      // ✅ VERIFICAR CONVERSAS WHATSAPP REAIS
      const { data: whatsappConversations, error: whatsappError } = await supabase
        .from('whatsapp_conversations')
        .select(`
          *,
          whatsapp_messages (*)
        `)
        .eq('user_id', user.id);

      if (whatsappError) {
        throw new Error(`Erro ao buscar conversas WhatsApp: ${whatsappError.message}`);
      }

      // ✅ VERIFICAR CONVERSAS COMERCIAIS REAIS
      const { data: commercialConversations, error: commercialError } = await supabase
        .from('commercial_conversations')
        .select(`
          *,
          commercial_messages (*)
        `)
        .eq('user_id', user.id);

      if (commercialError) {
        throw new Error(`Erro ao buscar conversas comerciais: ${commercialError.message}`);
      }

      // ✅ COMBINAR TODAS AS CONVERSAS REAIS
      const allRealConversations = [
        ...(whatsappConversations || []),
        ...(commercialConversations || [])
      ];

      const totalRealConversations = allRealConversations.length;
      console.log('📊 DADOS REAIS encontrados:', {
        whatsappConversations: whatsappConversations?.length || 0,
        commercialConversations: commercialConversations?.length || 0,
        totalConversations: totalRealConversations
      });

      // ✅ EXIGIR DADOS REAIS PARA ANÁLISE
      if (totalRealConversations === 0) {
        toast({
          title: "Nenhum dado real para analisar",
          description: "Importe conversas do WhatsApp ou registre conversas comerciais antes de executar a análise por IA.",
          variant: "destructive"
        });
        return;
      }

      // ✅ PREPARAR ASSISTENTES PARA ANÁLISE
      const assistantsData = activeAssistants.map(assistant => ({
        id: assistant.id,
        name: assistant.name,
        prompt: assistant.prompt,
        model: assistant.model || config.openai.model || 'gpt-4o-mini',
        area: assistant.area || 'geral'
      }));

      console.log('📤 Enviando DADOS REAIS para análise:', {
        userId: user.id,
        assistantsCount: assistantsData.length,
        realConversationsCount: totalRealConversations,
        analysisConfig: finalConfig
      });

      // ✅ CHAMAR EDGE FUNCTION COM DADOS REAIS
      const { data, error } = await supabase.functions.invoke('analyze-conversation', {
        body: { 
          userId: user.id,
          openaiConfig: {
            apiKey: config.openai.apiKey,
            model: config.openai.model || 'gpt-4o-mini',
            temperature: finalConfig.temperature,
            maxTokens: finalConfig.maxTokens
          },
          assistants: assistantsData,
          analysisType: finalConfig.type,
          conversationsData: allRealConversations,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        throw new Error(`Erro na análise: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro desconhecido na análise');
      }

      console.log('✅ ANÁLISE DE DADOS REAIS concluída:', {
        insightsGenerated: data.insights?.length || 0,
        assistantsUsed: data.assistantsUsed || [],
        conversationsAnalyzed: data.conversationsAnalyzed || totalRealConversations
      });

      const analysisTypeNames = {
        'simple': 'SIMPLES',
        'complete': 'COMPLETA', 
        'detailed': 'DETALHADA'
      };

      toast({
        title: "✅ Análise de dados reais concluída",
        description: `Análise ${analysisTypeNames[finalConfig.type]} realizada com ${totalRealConversations} conversas reais. ${data.insights?.length || 0} insights gerados.`,
        duration: 5000
      });

      // Recarregar após análise
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
    } catch (error) {
      console.error('❌ Erro na análise de dados reais:', error);
      
      toast({
        title: "Erro na análise",
        description: error.message || "Não foi possível analisar os dados reais. Verifique as configurações.",
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
