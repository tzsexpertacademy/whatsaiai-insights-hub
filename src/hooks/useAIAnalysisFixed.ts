
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';

interface AnalysisConfig {
  type: 'simple' | 'complete' | 'detailed';
  maxTokens?: number;
  temperature?: number;
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

export function useAIAnalysisFixed() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { user } = useAuth();
  const { config } = useClientConfig();
  const { toast } = useToast();
  const { assistants } = useAssistantsConfig();

  const executeAnalysis = async (analysisConfig?: AnalysisConfig) => {
    console.log('🤖 Iniciando análise geral do sistema...');
    
    if (!user?.id) {
      toast({
        title: "❌ Erro de autenticação",
        description: "Você precisa estar logado para executar análises",
        variant: "destructive"
      });
      return;
    }

    if (!config?.openai?.apiKey || !config.openai.apiKey.startsWith('sk-')) {
      toast({
        title: "❌ OpenAI não configurada",
        description: "Configure uma chave OpenAI válida antes de executar análises",
        variant: "destructive"
      });
      return;
    }

    const activeAssistants = assistants.filter(a => a.isActive);
    if (activeAssistants.length === 0) {
      toast({
        title: "❌ Nenhum assistente ativo",
        description: "Configure pelo menos um assistente ativo para executar análises",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      console.log('🔍 Buscando conversas para análise...');

      // Buscar conversas do WhatsApp
      const { data: whatsappConversations, error: whatsappError } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (whatsappError) {
        console.warn('⚠️ Erro ao buscar conversas WhatsApp:', whatsappError);
      }

      // Buscar histórico de chat
      const { data: chatHistory, error: chatError } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (chatError) {
        console.warn('⚠️ Erro ao buscar histórico de chat:', chatError);
      }

      const totalConversations = (whatsappConversations || []).length;
      const totalChatMessages = (chatHistory || []).length;

      if (totalConversations === 0 && totalChatMessages === 0) {
        toast({
          title: "📭 Nenhum dado para analisar",
          description: "É necessário ter conversas ou histórico de chat para executar a análise",
          variant: "destructive"
        });
        return;
      }

      console.log(`📊 Dados encontrados: ${totalConversations} conversas, ${totalChatMessages} mensagens de chat`);

      // Preparar dados para múltiplas análises
      const analysesToRun = activeAssistants.map(assistant => ({
        assistant,
        conversations: whatsappConversations || [],
        chatHistory: chatHistory || []
      }));

      console.log(`🔄 Executando ${analysesToRun.length} análises com diferentes assistentes...`);

      const analysisPromises = analysesToRun.map(async ({ assistant, conversations, chatHistory }): Promise<AnalysisResult> => {
        try {
          // Preparar dados combinados para análise
          const conversationsClean = (conversations || []).filter(
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

          const chatHistoryClean = (chatHistory || []).filter(
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
            ...conversationsClean,
            ...chatHistoryClean
          ];

          // Proteção:
          if (combinedData.length === 0) {
            throw new Error('Nenhum dado válido a ser enviado para análise.');
          }

          // Preparar prompt de análise baseado no assistente
          const analysisPrompt = `${assistant.prompt}

Você é ${assistant.name}, especializado em ${assistant.area || 'análise geral'}.

Analise os dados abaixo e gere insights práticos e acionáveis:

## DADOS PARA ANÁLISE:
- ${totalConversations} conversas do WhatsApp
- ${totalChatMessages} interações de chat
- Dados coletados em: ${new Date().toLocaleDateString('pt-BR')}

## INSTRUÇÕES:
1. Identifique padrões nos dados
2. Gere insights específicos da sua área de especialização
3. Forneça recomendações práticas
4. Seja objetivo e direto

Foque na sua área de especialização: ${assistant.area || 'análise geral'}`;

          // Simular conversação para análise (pegar uma amostra)
          const sampleData = combinedData.slice(0, 5);
          const conversationText = sampleData.map(item => {
            if (item.type === 'whatsapp_conversation') {
              return `Conversa WhatsApp com ${item.contact}: ${JSON.stringify(item.messages).substring(0, 200)}...`;
            } else {
              return `Chat: Usuário disse "${item.user_message}" e assistente respondeu "${item.assistant_response}"`;
            }
          }).join('\n\n');

          // Identificador sempre presente:
          const conversationId = `general_analysis_${assistant.id}_${Date.now()}`;

          // Preparar corpo enviado à função
          const functionBody = {
            conversation_id: conversationId,
            messages: [{ text: conversationText, fromMe: false, timestamp: Date.now() }],
            analysis_prompt: analysisPrompt,
            analysis_type: analysisConfig?.type || 'complete',
            assistant_id: assistant.id,
            contact_info: {
              name: 'Análise Geral do Sistema',
              phone: 'system_analysis'
            },
            openai_config: {
              apiKey: config.openai.apiKey,
              model: config.openai.model || 'gpt-4o-mini',
              temperature: analysisConfig?.temperature ?? 0.7,
              maxTokens: analysisConfig?.maxTokens ?? 1500
            }
          };

          // LOG - para depuração avançada
          console.log('[AIAnalysisFixed] Payload enviado para Edge Function:', functionBody);

          // Chamar a edge function existente
          const { data: result, error } = await supabase.functions.invoke('analyze-conversation', {
            body: functionBody,
          });

          if (error) {
            // Tratamento detalhado do erro
            const errorMsg = error.message || 'Erro desconhecido no Edge Function';
            const errorDetails = error.details || '';
            console.error(`❌ Erro na análise do assistente ${assistant.name}:`, errorMsg, errorDetails);
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
          // Erro detalhado por toast e log
          return {
            assistant: assistant.name,
            error: error.message,
            success: false
          };
        }
      });

      // Espera todas as promessas
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
          title: "✅ Análise concluída!",
          description: `${successfulAnalyses.length} assistentes geraram ${totalInsights} insights. ${failedAnalyses.length > 0 ? `${failedAnalyses.length} análises falharam.` : ''}`,
          duration: 5000
        });

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        // Agora detalhamos erro de todas as análises.
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

    } catch (error: any) {
      console.error('❌ Erro na análise geral:', error);

      toast({
        title: "❌ Erro na análise",
        description: (typeof error === 'string' ? error : error.message) || "Não foi possível executar a análise. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    executeAnalysis,
    isAnalyzing
  };
}
