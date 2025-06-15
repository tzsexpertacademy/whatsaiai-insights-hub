
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useClientConfig } from '@/contexts/ClientConfigContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAssistantsConfig } from '@/hooks/useAssistantsConfig';

export function useCommercialAIAnalysisFixed2() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { user } = useAuth();
  const { config } = useClientConfig();
  const { toast } = useToast();
  const { assistants } = useAssistantsConfig();

  const triggerCommercialAnalysis = async () => {
    console.log('💼 Iniciando análise comercial corrigida...');
    
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
      console.log('🔍 Buscando dados para análise comercial...');

      // Buscar conversas comerciais existentes
      const { data: commercialConversations, error: commercialError } = await supabase
        .from('commercial_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Buscar conversas do WhatsApp (podem ter valor comercial)
      const { data: whatsappConversations, error: whatsappError } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (commercialError) console.warn('⚠️ Erro ao buscar conversas comerciais:', commercialError);
      if (whatsappError) console.warn('⚠️ Erro ao buscar conversas WhatsApp:', whatsappError);

      const totalCommercialConversations = (commercialConversations || []).length;
      const totalWhatsAppConversations = (whatsappConversations || []).length;
      const totalConversations = totalCommercialConversations + totalWhatsAppConversations;

      console.log(`📊 Dados encontrados: ${totalCommercialConversations} conversas comerciais, ${totalWhatsAppConversations} conversas WhatsApp`);

      if (totalConversations === 0) {
        // Se não há dados reais, criar dados simulados para demonstração
        console.log('📝 Criando dados comerciais simulados para demonstração...');
        
        await generateSimulatedCommercialData(user.id);
        
        toast({
          title: "📊 Análise comercial simulada criada",
          description: "Dados de demonstração foram gerados. Em um ambiente real, isso analisaria suas conversas comerciais.",
          duration: 4000
        });
      } else {
        // Executar análise real das conversas
        console.log(`🤖 Executando análise comercial real de ${totalConversations} conversas...`);

        // Preparar dados para análise
        const conversationText = [
          ...(commercialConversations || []).map(conv => 
            `Conversa comercial com ${conv.contact_name} (${conv.contact_phone}): Status: ${conv.lead_status}, Estágio: ${conv.sales_stage}`
          ),
          ...(whatsappConversations || []).map(conv => 
            `Conversa WhatsApp com ${conv.contact_name} (${conv.contact_phone}): ${JSON.stringify(conv.messages).substring(0, 100)}...`
          )
        ].join('\n\n');

        const commercialPrompt = `Você é um analista comercial especializado em vendas e geração de leads.

Analise as conversas abaixo sob uma perspectiva comercial:

## INSTRUÇÕES PARA ANÁLISE COMERCIAL:
1. **Perfil dos Leads**: Identifique tipos de clientes, poder de compra, urgência
2. **Intenção de Compra**: Sinais de interesse, momentos de decisão
3. **Objeções**: Principais barreiras identificadas
4. **Oportunidades**: Momentos ideais para abordagem comercial
5. **Estratégia Recomendada**: Próximos passos, argumentos, ofertas específicas

## DADOS DAS CONVERSAS:
${conversationText}

Gere insights comerciais práticos e acionáveis.`;

        // Chamar edge function para análise
        const { data: result, error } = await supabase.functions.invoke('analyze-conversation', {
          body: {
            conversation_id: `commercial_analysis_${Date.now()}`,
            messages: [{ text: conversationText, fromMe: false, timestamp: Date.now() }],
            analysis_prompt: commercialPrompt,
            analysis_type: 'commercial',
            assistant_id: 'commercial_analyst',
            contact_info: {
              name: 'Análise Comercial Geral',
              phone: 'commercial_analysis'
            },
            openai_config: {
              apiKey: config.openai.apiKey,
              model: config.openai.model || 'gpt-4o-mini',
              temperature: 0.7,
              maxTokens: 2000
            }
          }
        });

        if (error) {
          throw new Error(`Erro na análise: ${error.message}`);
        }

        if (!result?.success) {
          throw new Error(result?.error || 'Análise comercial falhou');
        }

        console.log('✅ Análise comercial real concluída');
        
        toast({
          title: "✅ Análise comercial concluída!",
          description: `Análise realizada com ${totalConversations} conversas. ${result.insights?.length || 0} insights gerados.`,
          duration: 4000
        });
      }

      // Recarregar após análise
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('❌ Erro na análise comercial:', error);
      
      toast({
        title: "❌ Erro na análise comercial",
        description: error.message || "Não foi possível executar a análise comercial. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    triggerCommercialAnalysis
  };
}

// Função auxiliar para gerar dados simulados
async function generateSimulatedCommercialData(userId: string) {
  try {
    // Limpar dados antigos
    await Promise.all([
      supabase.from('commercial_insights').delete().eq('user_id', userId),
      supabase.from('sales_metrics').delete().eq('user_id', userId),
      supabase.from('sales_funnel_data').delete().eq('user_id', userId)
    ]);

    const today = new Date().toISOString().split('T')[0];

    // Inserir métricas simuladas
    const { error: metricsError } = await supabase
      .from('sales_metrics')
      .insert([{
        user_id: userId,
        metric_date: today,
        leads_generated: 45,
        conversations_started: 38,
        qualified_leads: 32,
        conversions: 8,
        revenue_generated: 125000,
        conversion_rate: 17.8,
        average_deal_size: 15625,
        sales_cycle_days: 42
      }]);

    if (metricsError) throw metricsError;

    // Inserir dados do funil
    const funnelData = [
      { user_id: userId, stage_name: 'Lead', stage_order: 1, leads_count: 45, conversion_rate: 100.0, average_time_in_stage: 0 },
      { user_id: userId, stage_name: 'Qualificado', stage_order: 2, leads_count: 32, conversion_rate: 71.1, average_time_in_stage: 3 },
      { user_id: userId, stage_name: 'Reunião', stage_order: 3, leads_count: 24, conversion_rate: 53.3, average_time_in_stage: 7 },
      { user_id: userId, stage_name: 'Proposta', stage_order: 4, leads_count: 18, conversion_rate: 40.0, average_time_in_stage: 10 },
      { user_id: userId, stage_name: 'Negociação', stage_order: 5, leads_count: 12, conversion_rate: 26.7, average_time_in_stage: 14 },
      { user_id: userId, stage_name: 'Fechado', stage_order: 6, leads_count: 8, conversion_rate: 17.8, average_time_in_stage: 2 }
    ];

    const { error: funnelError } = await supabase
      .from('sales_funnel_data')
      .insert(funnelData);

    if (funnelError) throw funnelError;

    // Inserir insights simulados
    const insights = [
      {
        user_id: userId,
        insight_type: 'conversion',
        title: 'Taxa de Conversão Otimizada',
        description: 'Conversão de 17.8% está acima da média do mercado',
        sales_impact: 'high',
        priority: 'high',
        status: 'active'
      },
      {
        user_id: userId,
        insight_type: 'process',
        title: 'Oportunidade no Follow-up',
        description: 'Leads respondidos em 1h têm 3x mais chances de conversão',
        sales_impact: 'medium',
        priority: 'medium',
        status: 'active'
      }
    ];

    const { error: insightsError } = await supabase
      .from('commercial_insights')
      .insert(insights);

    if (insightsError) throw insightsError;

    console.log('✅ Dados comerciais simulados criados com sucesso');

  } catch (error) {
    console.error('❌ Erro ao criar dados simulados:', error);
    throw error;
  }
}
