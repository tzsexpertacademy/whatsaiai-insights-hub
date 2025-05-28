
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

    const {
      userId,
      openaiConfig,
      assistants,
      analysisType,
      timestamp
    }: AnalysisRequest = await req.json();

    // Validações de segurança
    if (!userId || !openaiConfig?.apiKey || !assistants?.length) {
      console.error('❌ Dados obrigatórios faltando');
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
    console.log('🤖 Assistentes configurados:', assistants.map(a => `${a.name} (${a.model})`));

    // Buscar conversações do usuário
    const { data: conversations, error: convError } = await supabaseClient
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (convError) {
      console.error('❌ Erro ao buscar conversações:', convError);
      throw new Error(`Erro ao buscar conversações: ${convError.message}`);
    }

    if (!conversations || conversations.length === 0) {
      console.log('ℹ️ Nenhuma conversação encontrada para análise');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Nenhuma conversação encontrada para análise' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Analisando ${conversations.length} conversações...`);

    // Preparar texto para análise
    const conversationText = conversations
      .map(conv => `[${conv.created_at}] ${conv.message}`)
      .join('\n');

    const insights = [];
    const assistantsUsed = [];
    const startTime = Date.now();

    // Processar com cada assistente configurado
    for (const assistant of assistants) {
      try {
        console.log(`🔄 Processando com ${assistant.name} (${assistant.model})...`);

        const systemPrompt = `${assistant.prompt}

INSTRUÇÕES ESPECÍFICAS PARA ANÁLISE:
- Analise as conversações do usuário
- Foque na área: ${assistant.area}
- Gere insights específicos e práticos
- Seja objetivo e construtivo
- Máximo 200 palavras por insight
- Responda em português brasileiro

DADOS PARA ANÁLISE:
${conversationText.substring(0, 3000)}`;

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
              { role: 'user', content: 'Gere insights baseados nas conversações fornecidas.' }
            ],
            temperature: openaiConfig.temperature,
            max_tokens: openaiConfig.maxTokens,
          }),
        });

        if (!response.ok) {
          console.error(`❌ Erro OpenAI para ${assistant.name}:`, response.status);
          continue;
        }

        const aiData = await response.json();
        const insight = aiData.choices[0]?.message?.content;

        if (insight) {
          insights.push({
            assistant_id: assistant.id,
            assistant_name: assistant.name,
            content: insight,
            area: assistant.area,
            model_used: assistant.model,
            generated_at: new Date().toISOString()
          });
          
          assistantsUsed.push(assistant.name);
          console.log(`✅ Insight gerado por ${assistant.name}`);
        }

      } catch (error) {
        console.error(`❌ Erro processando ${assistant.name}:`, error);
        continue;
      }
    }

    // Salvar insights no banco
    if (insights.length > 0) {
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
              analysis_type: analysisType
            }
          }))
        );

      if (insertError) {
        console.error('❌ Erro ao salvar insights:', insertError);
        throw new Error(`Erro ao salvar insights: ${insertError.message}`);
      }
    }

    const processingTime = Date.now() - startTime;
    
    console.log('✅ Análise concluída:', {
      insightsGenerated: insights.length,
      assistantsUsed: assistantsUsed.length,
      processingTime: `${processingTime}ms`
    });

    return new Response(
      JSON.stringify({
        success: true,
        insights: insights,
        assistantsUsed: assistantsUsed,
        processingTime: processingTime,
        conversationsAnalyzed: conversations.length
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
