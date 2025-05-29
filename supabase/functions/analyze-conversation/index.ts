
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssistantData {
  id: string;
  name: string;
  prompt: string;
  model: string;
  area: string;
}

interface AnalysisRequest {
  userId: string;
  openaiConfig: {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
  };
  assistants: AssistantData[];
  analysisType: string;
  timestamp: string;
  conversationsData?: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 ANÁLISE POR IA - Iniciando processamento...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody = await req.json();
    console.log('📊 Dados recebidos:', {
      userId: requestBody.userId,
      assistantsCount: requestBody.assistants?.length,
      hasOpenAIKey: !!requestBody.openaiConfig?.apiKey,
      analysisType: requestBody.analysisType,
      hasConversationsData: !!requestBody.conversationsData
    });

    const {
      userId,
      openaiConfig,
      assistants,
      analysisType,
      timestamp,
      conversationsData
    }: AnalysisRequest = requestBody;

    // Validações de segurança
    if (!userId || !openaiConfig?.apiKey || !assistants?.length) {
      console.error('❌ Dados obrigatórios faltando:', {
        hasUserId: !!userId,
        hasOpenAIKey: !!openaiConfig?.apiKey,
        assistantsCount: assistants?.length || 0
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Dados obrigatórios: userId, openaiConfig e assistants' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se a chave OpenAI é válida
    if (!openaiConfig.apiKey.startsWith('sk-')) {
      console.error('❌ Chave OpenAI inválida');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Chave OpenAI inválida - deve começar com sk-' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('👤 Processando análise para usuário:', userId);
    console.log('🤖 Assistentes configurados:', assistants.map(a => `${a.name} (${a.model}) - ${a.area}`));

    // Usar dados de conversas fornecidos ou buscar do banco
    let conversations = conversationsData;

    if (!conversations || conversations.length === 0) {
      console.log('📋 Buscando conversas do WhatsApp no banco...');
      
      // Buscar conversações do WhatsApp
      const { data: whatsappConversations, error: convError } = await supabaseClient
        .from('whatsapp_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (convError) {
        console.error('❌ Erro ao buscar conversações WhatsApp:', convError);
      }

      conversations = whatsappConversations || [];
    }

    console.log(`📊 Total de conversas para análise: ${conversations.length}`);

    if (!conversations || conversations.length === 0) {
      console.log('ℹ️ Nenhuma conversação encontrada - criando insights demonstrativos');
      
      // Criar insights demonstrativos baseados nos assistentes
      const demoInsights = assistants.slice(0, 3).map((assistant, index) => ({
        user_id: userId,
        title: `Análise Demonstrativa - ${assistant.name}`,
        content: `Este é um insight demonstrativo gerado pelo assistente ${assistant.name}, especializado em ${assistant.area}. Em uma análise real, este assistente analisaria suas conversas para fornecer insights específicos sobre padrões comportamentais e oportunidades de melhoria.`,
        category: assistant.area,
        metadata: {
          assistant_id: assistant.id,
          assistant_name: assistant.name,
          model_used: assistant.model,
          generated_at: new Date().toISOString(),
          analysis_type: 'demo',
          demo_mode: true
        }
      }));

      // Salvar insights demonstrativos
      const { error: insertError } = await supabaseClient
        .from('insights')
        .insert(demoInsights);

      if (insertError) {
        console.error('❌ Erro ao salvar insights demo:', insertError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Erro ao salvar insights: ${insertError.message}` 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Insights demonstrativos criados com sucesso');

      return new Response(
        JSON.stringify({
          success: true,
          insights: demoInsights,
          assistantsUsed: assistants.map(a => a.name),
          processingTime: 500,
          conversationsAnalyzed: 0,
          message: `Insights demonstrativos criados por ${assistants.length} assistentes`,
          demoMode: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Preparar texto para análise
    const conversationText = conversations
      .map(conv => {
        if (conv.messages && Array.isArray(conv.messages)) {
          return conv.messages.map(msg => `[${conv.contact_name || 'Contato'}]: ${msg.text || msg.message_text || msg}`).join('\n');
        }
        return `[${conv.contact_name || 'Contato'}]: Conversa registrada em ${new Date(conv.created_at).toLocaleString('pt-BR')}`;
      })
      .join('\n');

    console.log(`📝 Texto preparado para análise: ${conversationText.length} caracteres`);

    const insights = [];
    const assistantsUsed = [];
    const startTime = Date.now();

    // Processar com cada assistente configurado
    for (const assistant of assistants.slice(0, 3)) { // Limitar a 3 assistentes para evitar timeout
      try {
        console.log(`🔄 Processando com ${assistant.name} (${assistant.model}) - Área: ${assistant.area}...`);

        const systemPrompt = `${assistant.prompt}

CONTEXTO DE ANÁLISE:
- Você é o assistente "${assistant.name}" especializado em "${assistant.area}"
- Sua função é analisar as conversações do usuário e gerar insights específicos
- Foque na sua área de especialização: ${assistant.area}

INSTRUÇÕES ESPECÍFICAS:
- Analise as conversações fornecidas
- Gere insights práticos e acionáveis
- Seja objetivo e construtivo  
- Máximo 200 palavras
- Responda sempre em português brasileiro
- Identifique padrões comportamentais relevantes à sua área

DADOS PARA ANÁLISE:
${conversationText.substring(0, 3000)}`;

        console.log(`📤 Enviando requisição para OpenAI - Assistente: ${assistant.name}`);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: assistant.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Analise as conversações e gere insights específicos para a área de ${assistant.area}.` }
            ],
            temperature: openaiConfig.temperature,
            max_tokens: Math.min(openaiConfig.maxTokens, 500),
          }),
        });

        console.log(`📥 Resposta OpenAI para ${assistant.name}: Status ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Erro OpenAI para ${assistant.name}:`, response.status, errorText);
          continue;
        }

        const aiData = await response.json();
        const insight = aiData.choices[0]?.message?.content;

        if (insight) {
          const insightData = {
            assistant_id: assistant.id,
            assistant_name: assistant.name,
            content: insight,
            area: assistant.area,
            model_used: assistant.model,
            generated_at: new Date().toISOString()
          };

          insights.push(insightData);
          assistantsUsed.push(assistant.name);
          
          console.log(`✅ Insight gerado por ${assistant.name}: ${insight.substring(0, 100)}...`);
        } else {
          console.warn(`⚠️ Nenhum insight retornado pelo ${assistant.name}`);
        }

      } catch (error) {
        console.error(`❌ Erro processando ${assistant.name}:`, error.message);
        continue;
      }
    }

    console.log(`📊 Total de insights gerados: ${insights.length}`);

    // Salvar insights no banco
    if (insights.length > 0) {
      console.log('💾 Salvando insights no banco de dados...');
      
      const { error: insertError } = await supabaseClient
        .from('insights')
        .insert(
          insights.map(insight => ({
            user_id: userId,
            title: `Análise por ${insight.assistant_name}`,
            content: insight.content,
            category: insight.area,
            metadata: {
              assistant_id: insight.assistant_id,
              assistant_name: insight.assistant_name,
              model_used: insight.model_used,
              generated_at: insight.generated_at,
              analysis_type: analysisType,
              conversations_analyzed: conversations.length
            }
          }))
        );

      if (insertError) {
        console.error('❌ Erro ao salvar insights:', insertError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Erro ao salvar insights: ${insertError.message}` 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Insights salvos com sucesso no banco');
    }

    const processingTime = Date.now() - startTime;
    
    console.log('✅ Análise concluída:', {
      insightsGenerated: insights.length,
      assistantsUsed: assistantsUsed.length,
      processingTime: `${processingTime}ms`,
      conversationsAnalyzed: conversations.length
    });

    return new Response(
      JSON.stringify({
        success: true,
        insights: insights,
        assistantsUsed: assistantsUsed,
        processingTime: processingTime,
        conversationsAnalyzed: conversations.length,
        message: `Análise concluída com ${insights.length} insights gerados por ${assistantsUsed.length} assistentes`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erro na análise por IA:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
