
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
    console.log('🤖 Iniciando análise EXCLUSIVAMENTE de DADOS REAIS por IA...');
    
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
      console.log('🔍 Verificando EXCLUSIVAMENTE DADOS REAIS para análise...');

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

      // ✅ VERIFICAR HISTÓRICO DE CHAT REAL COM ASSISTENTES
      const { data: chatHistory, error: chatHistoryError } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id);

      if (chatHistoryError) {
        throw new Error(`Erro ao buscar histórico de chat: ${chatHistoryError.message}`);
      }

      // ✅ COMBINAR TODAS AS CONVERSAS REAIS
      const allRealConversations = [
        ...(whatsappConversations || []),
        ...(commercialConversations || [])
      ];

      const totalRealConversations = allRealConversations.length;
      const totalChatHistory = chatHistory?.length || 0;
      const totalRealData = totalRealConversations + totalChatHistory;
      
      console.log('📊 DADOS REAIS ENCONTRADOS:', {
        whatsappConversations: whatsappConversations?.length || 0,
        commercialConversations: commercialConversations?.length || 0,
        chatHistory: totalChatHistory,
        totalConversations: totalRealConversations,
        totalDataSources: totalRealData
      });

      // ✅ EXIGIR DADOS REAIS PARA ANÁLISE
      if (totalRealData === 0) {
        toast({
          title: "Nenhum dado real para analisar",
          description: "É necessário ter conversas do WhatsApp, comerciais ou histórico de chat com assistentes antes de executar a análise por IA.",
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

      console.log('📤 Enviando EXCLUSIVAMENTE DADOS REAIS para análise pelos assistentes IA:', {
        userId: user.id,
        assistantsCount: assistantsData.length,
        realConversationsCount: totalRealConversations,
        chatHistoryCount: totalChatHistory,
        totalRealDataSources: totalRealData,
        analysisConfig: finalConfig
      });

      // ✅ CHAMAR EDGE FUNCTION COM APENAS DADOS REAIS
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
          chatHistoryData: chatHistory || [],
          timestamp: new Date().toISOString(),
          onlyRealData: true // Flag para garantir que apenas dados reais sejam processados
        }
      });

      if (error) {
        throw new Error(`Erro na análise: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro desconhecido na análise');
      }

      console.log('✅ ANÁLISE DE DADOS REAIS concluída pelos assistentes IA:', {
        insightsGenerated: data.insights?.length || 0,
        assistantsUsed: data.assistantsUsed || [],
        conversationsAnalyzed: data.conversationsAnalyzed || totalRealConversations,
        chatHistoryAnalyzed: data.chatHistoryAnalyzed || totalChatHistory,
        onlyRealDataProcessed: true
      });

      const analysisTypeNames = {
        'simple': 'SIMPLES',
        'complete': 'COMPLETA', 
        'detailed': 'DETALHADA'
      };

      toast({
        title: "✅ Análise de dados reais concluída",
        description: `Análise ${analysisTypeNames[finalConfig.type]} realizada EXCLUSIVAMENTE com dados reais: ${totalRealData} fontes de dados. ${data.insights?.length || 0} insights gerados pelos assistentes IA.`,
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
