
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

interface ConversationData {
  type: 'whatsapp_conversation';
  contact: string;
  phone: string;
  messages: any[];
  created_at: string;
}

interface ChatData {
  type: 'chat_message';
  assistant_id: string;
  user_message: string;
  assistant_response: string;
  timestamp: string;
}

type CombinedData = ConversationData | ChatData;

interface AnalysisResult {
  assistant: string;
  insights?: any[];
  success: boolean;
  error?: string;
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

    if (!config.openai?.apiKey || !config.openai.apiKey.startsWith('sk-')) {
      console.error('❌ OpenAI não configurada');
      toast({
        title: "OpenAI não configurada",
        description: "Configure uma chave OpenAI válida antes de executar análises",
        variant: "destructive"
      });
      return;
    }

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

      // Buscar conversas reais do WhatsApp
      const { data: whatsappConversations, error: whatsappError } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (whatsappError) {
        throw new Error(`Erro ao buscar conversas WhatsApp: ${whatsappError.message}`);
      }

      // Buscar conversas comerciais reais
      const { data: commercialConversations, error: commercialError } = await supabase
        .from('commercial_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (commercialError) {
        throw new Error(`Erro ao buscar conversas comerciais: ${commercialError.message}`);
      }

      // Buscar histórico de chat real com assistentes
      const { data: chatHistory, error: chatHistoryError } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(60);

      if (chatHistoryError) {
        throw new Error(`Erro ao buscar histórico de chat: ${chatHistoryError.message}`);
      }

      // Unificar conversas reais
      const allConversations = [
        ...(whatsappConversations || []),
        ...(commercialConversations || [])
      ];

      const totalConversations = allConversations.length;
      const totalChatHistory = chatHistory?.length || 0;
      const totalRealData = totalConversations + totalChatHistory;

      console.log('📊 DADOS REAIS ENCONTRADOS:', {
        whatsappConversations: whatsappConversations?.length || 0,
        commercialConversations: commercialConversations?.length || 0,
        chatHistory: totalChatHistory,
        totalConversations,
        totalDataSources: totalRealData
      });

      if (totalRealData === 0) {
        toast({
          title: "Nenhum dado real para analisar",
          description: "É necessário ter conversas do WhatsApp, comerciais ou histórico de chat antes de executar a análise por IA.",
          variant: "destructive"
        });
        return;
      }

      // Preparar dados para análise - igual ao hook de análise individual
      const cleanWhatsapp = (whatsappConversations || []).filter(
        c =>
          c.contact_name &&
          c.contact_phone &&
          Array.isArray(c.messages) &&
          c.messages.length > 0
      ).map(
        c =>
          ({
            type: 'whatsapp_conversation' as const,
            contact: c.contact_name,
            phone: c.contact_phone,
            messages: Array.isArray(c.messages) ? c.messages : [],
            created_at: c.created_at
          } as ConversationData)
      );

      const cleanCommercial = (commercialConversations || []).filter(
        c =>
          c.contact_name &&
          c.contact_phone &&
          Array.isArray(c.messages) &&
          c.messages.length > 0
      ).map(
        c =>
          ({
            type: 'whatsapp_conversation' as const,
            contact: c.contact_name,
            phone: c.contact_phone,
            messages: Array.isArray(c.messages) ? c.messages : [],
            created_at: c.created_at
          } as ConversationData)
      );

      const cleanChat = (chatHistory || []).filter(
        c =>
          c.assistant_id &&
          typeof c.user_message === 'string' &&
          typeof c.assistant_response === 'string'
      ).map(
        c =>
          ({
            type: 'chat_message' as const,
            assistant_id: c.assistant_id,
            user_message: c.user_message,
            assistant_response: c.assistant_response,
            timestamp: c.timestamp
          } as ChatData)
      );

      const combinedData: CombinedData[] = [
        ...cleanWhatsapp,
        ...cleanCommercial,
        ...cleanChat
      ];

      if (combinedData.length === 0) {
        toast({
          title: "Nenhum dado real válido",
          description: "Não encontrei dados válidos para análise.",
          variant: "destructive"
        });
        return;
      }

      // Gerar uma análise por assistente
      const analysesToRun = activeAssistants.map(assistant => ({
        assistant,
        conversations: [...cleanWhatsapp, ...cleanCommercial],
        chatHistory: cleanChat
      }));

      const analysisPromises = analysesToRun.map(async ({ assistant, conversations, chatHistory }): Promise<AnalysisResult> => {
        try {
          // Preparar prompt de análise
          const analysisPrompt = `${assistant.prompt}
Você é ${assistant.name}, especializado em ${assistant.area || 'análise geral'}.

Analise exclusivamente DADOS REAIS abaixo e gere insights práticos:

## DADOS REAIS PARA ANÁLISE:
- ${conversations.length} conversas (WhatsApp/Comerciais)
- ${chatHistory.length} interações de chat
- Coletados em: ${new Date().toLocaleDateString('pt-BR')}

## INSTRUÇÕES:
1. Identifique padrões
2. Gere insights sobre as conversas reais
3. Forneça recomendações práticas
4. Seja objetivo

Foque na sua área de especialização: ${assistant.area || 'análise geral'}`;

          const sampleData = [
            ...conversations.slice(0, 3),
            ...chatHistory.slice(0, 3)
          ];
          const conversationText = sampleData.map(item => {
            if (item.type === 'whatsapp_conversation') {
              return `Conversa real com ${item.contact}: ${JSON.stringify(item.messages).substring(0, 180)}...`;
            } else {
              return `Chat: Usuário disse "${item.user_message}" e assistente respondeu "${item.assistant_response}"`;
            }
          }).join('\n\n');

          const conversationId = `real_macro_analysis_${assistant.id}_${Date.now()}`;
          const functionBody = {
            conversation_id: conversationId,
            messages: [{ text: conversationText, fromMe: false, timestamp: Date.now() }],
            analysis_prompt: analysisPrompt,
            analysis_type: finalConfig.type,
            assistant_id: assistant.id,
            contact_info: {
              name: 'Análise DADOS REAIS',
              phone: 'real_data_analysis'
            },
            openai_config: {
              apiKey: config.openai.apiKey,
              model: config.openai.model || 'gpt-4o-mini',
              temperature: finalConfig.temperature,
              maxTokens: finalConfig.maxTokens
            }
          };

          console.log('[AIReportUpdate] Payload para Edge Function:', functionBody);

          const { data: result, error } = await supabase.functions.invoke('analyze-conversation', {
            body: functionBody,
          });

          if (error) {
            const errorMsg = error.message || 'Erro desconhecido no Edge Function';
            const errorDetails = error.details || '';
            console.error(`❌ Erro - análise de ${assistant.name}:`, errorMsg, errorDetails);
            throw new Error(`${errorMsg}${errorDetails ? ' | Details: ' + errorDetails : ''}`);
          }

          if (!result?.success) {
            const detailMsg = typeof result?.error === 'string' ? result.error : JSON.stringify(result?.error || '');
            console.error(`❌ Análise falhou para ${assistant.name}:`, detailMsg);
            throw new Error(detailMsg || 'Análise falhou');
          }

          console.log(`✅ Análise concluída para assistente ${assistant.name}`);
          return {
            assistant: assistant.name,
            insights: result.insights || [],
            success: true
          };
        } catch (error: any) {
          return {
            assistant: assistant.name,
            error: error.message,
            success: false
          };
        }
      });

      const results = await Promise.allSettled(analysisPromises);

      const successfulAnalyses = results
        .filter((result): result is PromiseFulfilledResult<AnalysisResult> =>
          result.status === 'fulfilled' && result.value.success
        )
        .map(result => result.value);

      const failedAnalyses = results
        .filter((result): result is PromiseRejectedResult | PromiseFulfilledResult<AnalysisResult> =>
          result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
        );

      console.log(`📊 Resultado: ${successfulAnalyses.length} análises bem-sucedidas, ${failedAnalyses.length} falharam`);

      if (successfulAnalyses.length > 0) {
        const totalInsights = successfulAnalyses.reduce((sum, analysis) => sum + (analysis.insights?.length || 0), 0);

        toast({
          title: "✅ Análise de dados reais concluída!",
          description: `${successfulAnalyses.length} assistentes geraram ${totalInsights} insights. ${failedAnalyses.length > 0 ? `${failedAnalyses.length} análises falharam.` : ''}`,
          duration: 5000
        });

        setTimeout(() => {
          window.location.reload();
        }, 2500);
      } else {
        let errorDetails = '';
        if (failedAnalyses.length > 0) {
          errorDetails = failedAnalyses
            .map(f =>
              f.status === 'fulfilled'
                ? `Assistente: ${f.value.assistant} | Erro: ${f.value.error}`
                : (f as any)?.reason || '[rejection]'
            ).join('\n');
        }
        throw new Error(`Todas as análises falharam. Detalhes:\n${errorDetails}`);
      }

    } catch (error) {
      console.error('❌ Erro na análise de dados reais (macro):', error);

      toast({
        title: "Erro na análise",
        description: (typeof error === 'string' ? error : error.message) || "Não foi possível analisar os dados reais.",
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
