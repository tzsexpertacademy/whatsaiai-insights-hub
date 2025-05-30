
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
  chatHistoryData?: any[];
  useCache?: boolean;
  onlyRealData?: boolean;
}

// Função para gerar hash simples dos dados
function generateDataHash(data: any): string {
  const content = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Função para verificar cache de análise
async function checkAnalysisCache(
  supabaseClient: any,
  userId: string,
  analysisType: string,
  dataHash: string
) {
  try {
    const { data: existingSummary, error } = await supabaseClient
      .from('analysis_summaries')
      .select('*')
      .eq('user_id', userId)
      .eq('analysis_type', analysisType)
      .eq('data_hash', dataHash)
      .maybeSingle();

    if (error) {
      console.error('❌ Erro ao verificar cache:', error);
      return null;
    }

    if (existingSummary) {
      console.log('✅ Análise encontrada no cache:', existingSummary.created_at);
      
      // Atualizar estatísticas de cache hit
      await updateCostControl(supabaseClient, userId, { cache_hits: 1 });
      
      return existingSummary;
    }

    return null;
  } catch (error) {
    console.error('❌ Erro na verificação de cache:', error);
    return null;
  }
}

// Função para salvar resumo da análise
async function saveAnalysisSummary(
  supabaseClient: any,
  userId: string,
  analysisType: string,
  dataHash: string,
  summaryContent: string,
  stats: {
    conversationsAnalyzed: number;
    chatMessagesAnalyzed: number;
    insightsGenerated: number;
    costEstimate: number;
  }
) {
  try {
    const { data, error } = await supabaseClient
      .from('analysis_summaries')
      .insert({
        user_id: userId,
        analysis_type: analysisType,
        summary_content: summaryContent,
        data_hash: dataHash,
        conversations_analyzed: stats.conversationsAnalyzed,
        chat_messages_analyzed: stats.chatMessagesAnalyzed,
        insights_generated: stats.insightsGenerated,
        cost_estimate: stats.costEstimate
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao salvar resumo:', error);
      return null;
    }

    console.log('✅ Resumo da análise salvo:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Erro ao salvar resumo:', error);
    return null;
  }
}

// Função para atualizar controle de custos
async function updateCostControl(
  supabaseClient: any,
  userId: string,
  stats: {
    cache_hits?: number;
    cache_miss?: number;
    total_analyses?: number;
    total_cost_estimate?: number;
    conversations_processed?: number;
    insights_generated?: number;
  }
) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: existing, error: selectError } = await supabaseClient
      .from('analysis_cost_control')
      .select('*')
      .eq('user_id', userId)
      .eq('analysis_date', today)
      .maybeSingle();

    if (selectError) {
      console.error('❌ Erro ao buscar controle de custos:', selectError);
      return;
    }

    if (existing) {
      const updates = {
        total_analyses: (existing.total_analyses || 0) + (stats.total_analyses || 0),
        total_cost_estimate: parseFloat(existing.total_cost_estimate || '0') + (stats.total_cost_estimate || 0),
        conversations_processed: (existing.conversations_processed || 0) + (stats.conversations_processed || 0),
        insights_generated: (existing.insights_generated || 0) + (stats.insights_generated || 0),
        cache_hits: (existing.cache_hits || 0) + (stats.cache_hits || 0),
        cache_miss: (existing.cache_miss || 0) + (stats.cache_miss || 0)
      };

      await supabaseClient
        .from('analysis_cost_control')
        .update(updates)
        .eq('id', existing.id);
    } else {
      await supabaseClient
        .from('analysis_cost_control')
        .insert({
          user_id: userId,
          analysis_date: today,
          ...stats
        });
    }
  } catch (error) {
    console.error('❌ Erro no controle de custos:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 ANÁLISE POR IA COM CACHE - Iniciando processamento...');
    
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
      useCache: requestBody.useCache !== false,
      hasConversationsData: !!requestBody.conversationsData,
      hasChatHistoryData: !!requestBody.chatHistoryData
    });

    const {
      userId,
      openaiConfig,
      assistants,
      analysisType,
      timestamp,
      conversationsData,
      chatHistoryData,
      useCache = true
    }: AnalysisRequest = requestBody;

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

    // Preparar dados para análise
    let conversations = conversationsData || [];
    let chatHistory = chatHistoryData || [];

    // Se não há dados fornecidos, buscar do banco
    if (conversations.length === 0 && chatHistory.length === 0) {
      console.log('📋 Buscando dados do banco...');
      
      // Buscar conversações do WhatsApp
      const { data: whatsappConversations, error: whatsappError } = await supabaseClient
        .from('whatsapp_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (whatsappError) {
        console.error('❌ Erro ao buscar conversações WhatsApp:', whatsappError);
      } else {
        conversations = [...conversations, ...(whatsappConversations || [])];
      }

      // Buscar conversações comerciais
      const { data: commercialConversations, error: commercialError } = await supabaseClient
        .from('commercial_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (commercialError) {
        console.error('❌ Erro ao buscar conversações comerciais:', commercialError);
      } else {
        conversations = [...conversations, ...(commercialConversations || [])];
      }

      // Buscar histórico de chat
      const { data: chatHistoryFromDB, error: chatHistoryError } = await supabaseClient
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (chatHistoryError) {
        console.error('❌ Erro ao buscar histórico de chat:', chatHistoryError);
      } else {
        chatHistory = chatHistoryFromDB || [];
      }
    }

    const totalDataSources = conversations.length + chatHistory.length;
    console.log(`📊 Total de dados para análise: ${totalDataSources}`);

    if (totalDataSources === 0) {
      console.log('❌ Nenhum dado encontrado');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Nenhum dado encontrado para análise' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gerar hash dos dados para verificação de cache
    const allData = { conversations, chatHistory, assistants: assistants.map(a => a.id) };
    const dataHash = generateDataHash(allData);
    console.log('🔗 Hash dos dados:', dataHash);

    // Verificar cache se habilitado
    if (useCache) {
      console.log('🔍 Verificando cache de análise...');
      const cachedAnalysis = await checkAnalysisCache(supabaseClient, userId, analysisType, dataHash);
      
      if (cachedAnalysis) {
        console.log('⚡ Usando análise do cache');
        return new Response(
          JSON.stringify({
            success: true,
            fromCache: true,
            cachedAt: cachedAnalysis.created_at,
            summary: cachedAnalysis.summary_content,
            stats: {
              conversationsAnalyzed: cachedAnalysis.conversations_analyzed,
              chatHistoryAnalyzed: cachedAnalysis.chat_messages_analyzed,
              insightsGenerated: cachedAnalysis.insights_generated,
              costEstimate: cachedAnalysis.cost_estimate
            },
            message: `Análise recuperada do cache (${new Date(cachedAnalysis.created_at).toLocaleString('pt-BR')})`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('🆕 Dados novos detectados - executando nova análise');

    // Preparar texto para análise
    let analysisText = '';
    
    if (conversations.length > 0) {
      analysisText += conversations
        .map(conv => {
          const contactName = conv.contact_name || conv.participant_name || 'Contato';
          const content = conv.last_message || conv.content || `Conversa registrada em ${new Date(conv.created_at).toLocaleString('pt-BR')}`;
          return `[${contactName}]: ${content}`;
        })
        .join('\n') + '\n';
    }

    if (chatHistory.length > 0) {
      analysisText += chatHistory
        .map(chat => {
          return `[Usuário]: ${chat.user_message}\n[Assistente ${chat.assistant_id}]: ${chat.assistant_response}`;
        })
        .join('\n');
    }

    console.log(`📝 Texto preparado: ${analysisText.length} caracteres`);

    if (analysisText.length === 0) {
      console.log('❌ Texto vazio para análise');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Dados insuficientes para análise' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const insights = [];
    const assistantsUsed = [];
    const startTime = Date.now();
    let totalCostEstimate = 0;

    // Processar com todos os assistentes
    for (const assistant of assistants) {
      try {
        console.log(`🔄 Processando com ${assistant.name}...`);

        const systemPrompt = `${assistant.prompt}

CONTEXTO DE ANÁLISE:
- Você é o assistente "${assistant.name}" especializado em "${assistant.area}"
- Analise os dados reais fornecidos e gere insights específicos
- Foque na sua área de especialização: ${assistant.area}

INSTRUÇÕES:
- Analise os dados fornecidos (conversas e histórico de chat)
- Gere insights práticos e acionáveis baseados APENAS nos dados reais
- Seja objetivo e construtivo  
- Máximo 200 palavras
- Responda em português brasileiro

DADOS PARA ANÁLISE:
${analysisText.substring(0, 3000)}`;

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
              { role: 'user', content: `Analise os dados e gere insights para ${assistant.area}.` }
            ],
            temperature: openaiConfig.temperature || 0.5,
            max_tokens: Math.min(openaiConfig.maxTokens || 250, 500),
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
            model_used: assistant.model,
            generated_at: new Date().toISOString()
          };

          insights.push(insightData);
          assistantsUsed.push(assistant.name);
          
          // Estimar custo (aproximado)
          const tokensUsed = Math.ceil(systemPrompt.length / 4) + Math.ceil(insight.length / 4);
          const costPerToken = assistant.model === 'gpt-4o' ? 0.00001 : 0.000002; // Estimativa
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
    console.log('💾 Salvando insights...');
    
    const { error: insertError } = await supabaseClient
      .from('insights')
      .insert(
        insights.map(insight => ({
          user_id: userId,
          title: `Análise por ${insight.assistant_name}`,
          description: insight.content,
          content: insight.content,
          category: insight.area,
          insight_type: insight.area || 'geral',
          priority: 'medium',
          status: 'active',
          metadata: {
            assistant_id: insight.assistant_id,
            assistant_name: insight.assistant_name,
            model_used: insight.model_used,
            generated_at: insight.generated_at,
            analysis_type: analysisType,
            data_hash: dataHash,
            cache_enabled: useCache
          }
        }))
      );

    if (insertError) {
      console.error('❌ Erro ao salvar insights:', insertError);
    } else {
      console.log('✅ Insights salvos no banco');
    }

    // Criar resumo da análise
    const summaryContent = `Análise realizada com ${assistants.length} assistentes especializados. 
    Dados processados: ${conversations.length} conversas e ${chatHistory.length} mensagens de chat. 
    Insights gerados: ${insights.length}. 
    Assistentes utilizados: ${assistantsUsed.join(', ')}.`;

    // Salvar resumo para cache futuro
    if (useCache) {
      await saveAnalysisSummary(
        supabaseClient,
        userId,
        analysisType,
        dataHash,
        summaryContent,
        {
          conversationsAnalyzed: conversations.length,
          chatMessagesAnalyzed: chatHistory.length,
          insightsGenerated: insights.length,
          costEstimate: totalCostEstimate
        }
      );

      // Atualizar estatísticas
      await updateCostControl(supabaseClient, userId, {
        cache_miss: 1,
        total_analyses: 1,
        total_cost_estimate: totalCostEstimate,
        conversations_processed: conversations.length,
        insights_generated: insights.length
      });
    }

    const processingTime = Date.now() - startTime;
    
    console.log('✅ Análise concluída:', {
      insightsGenerated: insights.length,
      assistantsUsed: assistantsUsed.length,
      processingTime: `${processingTime}ms`,
      costEstimate: totalCostEstimate,
      dataHash
    });

    return new Response(
      JSON.stringify({
        success: true,
        fromCache: false,
        insights: insights,
        assistantsUsed: assistantsUsed,
        processingTime: processingTime,
        conversationsAnalyzed: conversations.length,
        chatHistoryAnalyzed: chatHistory.length,
        totalDataSources: totalDataSources,
        costEstimate: totalCostEstimate,
        dataHash: dataHash,
        summary: summaryContent,
        message: `Nova análise concluída com ${insights.length} insights gerados`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
