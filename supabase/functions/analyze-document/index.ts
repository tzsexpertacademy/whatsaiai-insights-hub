
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocumentAnalysisRequest {
  userId: string;
  openaiConfig: {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
  };
  assistants: Array<{
    id: string;
    name: string;
    area: string;
  }>;
  analysisType: string;
  documentContent: string;
  documentName: string;
  documentHash: string;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📄 ANÁLISE DE DOCUMENTOS - Iniciando processamento...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody = await req.json();
    console.log('📊 Dados recebidos:', {
      userId: requestBody.userId,
      documentName: requestBody.documentName,
      assistantsCount: requestBody.assistants?.length,
      hasOpenAIKey: !!requestBody.openaiConfig?.apiKey,
      analysisType: requestBody.analysisType,
      documentSize: requestBody.documentContent?.length
    });

    const {
      userId,
      openaiConfig,
      assistants,
      analysisType,
      documentContent,
      documentName,
      documentHash,
      timestamp
    }: DocumentAnalysisRequest = requestBody;

    // Validações de segurança
    if (!userId || !openaiConfig?.apiKey || !assistants?.length || !documentContent) {
      console.error('❌ Dados obrigatórios faltando');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Dados obrigatórios: userId, openaiConfig, assistants e documentContent' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Verificar cache de documento
    console.log('🔍 Verificando cache de documento...');
    const { data: existingAnalysis, error: cacheError } = await supabaseClient
      .from('analysis_summaries')
      .select('*')
      .eq('user_id', userId)
      .eq('analysis_type', analysisType)
      .eq('data_hash', documentHash)
      .maybeSingle();

    if (cacheError) {
      console.error('❌ Erro ao verificar cache:', cacheError);
    }

    if (existingAnalysis) {
      console.log('⚡ Usando análise do cache');
      return new Response(
        JSON.stringify({
          success: true,
          fromCache: true,
          cachedAt: existingAnalysis.created_at,
          summary: existingAnalysis.summary_content,
          insights: [],
          stats: {
            conversationsAnalyzed: 0,
            documentAnalyzed: 1,
            insightsGenerated: existingAnalysis.insights_generated,
            costEstimate: existingAnalysis.cost_estimate
          },
          message: `Análise de documento recuperada do cache (${new Date(existingAnalysis.created_at).toLocaleString('pt-BR')})`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🆕 Executando nova análise de documento');

    const insights = [];
    const assistantsUsed = [];
    const startTime = Date.now();
    let totalCostEstimate = 0;

    // Processar com todos os assistentes
    for (const assistant of assistants) {
      try {
        console.log(`🔄 Processando documento com ${assistant.name}...`);

        const systemPrompt = `Você é um assistente especializado em "${assistant.area}" analisando o documento "${documentName}".

INSTRUÇÕES PARA ANÁLISE:
- Analise cuidadosamente o conteúdo do documento fornecido
- Gere insights específicos baseados na sua área de especialização: ${assistant.area}
- Seja objetivo, prático e acionável
- Foque em aspectos relevantes para ${assistant.area}
- Máximo 300 palavras
- Responda em português brasileiro

DOCUMENTO PARA ANÁLISE:
${documentContent.substring(0, 4000)}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: openaiConfig.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Analise este documento de ${assistant.area} e forneça insights específicos.` }
            ],
            temperature: openaiConfig.temperature || 0.5,
            max_tokens: Math.min(openaiConfig.maxTokens || 300, 500),
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Erro OpenAI para ${assistant.name}:`, errorText);
          continue;
        }

        const aiData = await response.json();
        const insight = aiData.choices?.[0]?.message?.content;

        if (insight && insight.trim().length > 0) {
          const insightData = {
            assistant_id: assistant.id,
            assistant_name: assistant.name,
            content: insight.trim(),
            area: assistant.area,
            model_used: openaiConfig.model,
            generated_at: new Date().toISOString()
          };

          insights.push(insightData);
          assistantsUsed.push(assistant.name);
          
          // Estimar custo (aproximado)
          const tokensUsed = Math.ceil(systemPrompt.length / 4) + Math.ceil(insight.length / 4);
          const costPerToken = openaiConfig.model === 'gpt-4o' ? 0.00001 : 0.000002;
          totalCostEstimate += tokensUsed * costPerToken;
          
          console.log(`✅ Insight gerado por ${assistant.name}`);
        }

      } catch (error) {
        console.error(`❌ Erro processando ${assistant.name}:`, error.message);
        continue;
      }
    }

    if (insights.length === 0) {
      console.log('❌ Nenhum insight gerado');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Nenhum insight foi gerado pelos assistentes' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Salvar insights no banco
    console.log('💾 Salvando insights do documento...');
    
    const { error: insertError } = await supabaseClient
      .from('insights')
      .insert(
        insights.map(insight => ({
          user_id: userId,
          title: `Análise de Documento: ${insight.assistant_name}`,
          description: insight.content,
          content: insight.content,
          category: insight.area,
          insight_type: insight.area || 'document',
          priority: 'medium',
          status: 'active',
          metadata: {
            assistant_id: insight.assistant_id,
            assistant_name: insight.assistant_name,
            model_used: insight.model_used,
            generated_at: insight.generated_at,
            analysis_type: analysisType,
            document_name: documentName,
            document_hash: documentHash,
            source: 'document_analysis'
          }
        }))
      );

    if (insertError) {
      console.error('❌ Erro ao salvar insights:', insertError);
    } else {
      console.log('✅ Insights do documento salvos no banco');
    }

    // Criar resumo da análise
    const summaryContent = `Análise de documento "${documentName}" realizada com ${assistants.length} assistentes especializados. 
    Insights gerados: ${insights.length}. 
    Assistentes utilizados: ${assistantsUsed.join(', ')}.
    Custo estimado: $${totalCostEstimate.toFixed(5)}.`;

    // Salvar resumo para cache futuro
    const { error: summaryError } = await supabaseClient
      .from('analysis_summaries')
      .insert({
        user_id: userId,
        analysis_type: analysisType,
        summary_content: summaryContent,
        data_hash: documentHash,
        conversations_analyzed: 0,
        chat_messages_analyzed: 0,
        insights_generated: insights.length,
        cost_estimate: totalCostEstimate
      });

    if (summaryError) {
      console.error('❌ Erro ao salvar resumo:', summaryError);
    }

    // Atualizar controle de custos
    const today = new Date().toISOString().split('T')[0];
    const { data: existingCost, error: costSelectError } = await supabaseClient
      .from('analysis_cost_control')
      .select('*')
      .eq('user_id', userId)
      .eq('analysis_date', today)
      .maybeSingle();

    if (!costSelectError && existingCost) {
      await supabaseClient
        .from('analysis_cost_control')
        .update({
          total_analyses: (existingCost.total_analyses || 0) + 1,
          total_cost_estimate: (existingCost.total_cost_estimate || 0) + totalCostEstimate,
          insights_generated: (existingCost.insights_generated || 0) + insights.length,
          cache_miss: (existingCost.cache_miss || 0) + 1
        })
        .eq('id', existingCost.id);
    } else {
      await supabaseClient
        .from('analysis_cost_control')
        .insert({
          user_id: userId,
          analysis_date: today,
          total_analyses: 1,
          total_cost_estimate: totalCostEstimate,
          insights_generated: insights.length,
          cache_miss: 1,
          cache_hits: 0,
          conversations_processed: 0
        });
    }

    const processingTime = Date.now() - startTime;
    
    console.log('✅ Análise de documento concluída:', {
      insightsGenerated: insights.length,
      assistantsUsed: assistantsUsed.length,
      processingTime: `${processingTime}ms`,
      costEstimate: totalCostEstimate,
      documentHash
    });

    return new Response(
      JSON.stringify({
        success: true,
        fromCache: false,
        insights: insights,
        assistantsUsed: assistantsUsed,
        processingTime: processingTime,
        documentAnalyzed: documentName,
        totalInsights: insights.length,
        costEstimate: totalCostEstimate,
        documentHash: documentHash,
        summary: summaryContent,
        message: `Análise de documento concluída com ${insights.length} insights gerados`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na análise de documento:', error);
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
