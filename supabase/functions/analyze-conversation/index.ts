
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
  onlyRealData?: boolean;
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
      hasConversationsData: !!requestBody.conversationsData,
      hasChatHistoryData: !!requestBody.chatHistoryData,
      onlyRealData: requestBody.onlyRealData
    });

    const {
      userId,
      openaiConfig,
      assistants,
      analysisType,
      timestamp,
      conversationsData,
      chatHistoryData
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
    console.log(`📊 Total de dados para análise: ${totalDataSources} (conversas: ${conversations.length}, chat: ${chatHistory.length})`);

    // SEMPRE EXIGIR DADOS REAIS - NUNCA CRIAR DADOS DEMO
    if (totalDataSources === 0) {
      console.log('❌ Nenhum dado encontrado - análise cancelada');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Nenhum dado encontrado para análise. É necessário ter conversas do WhatsApp, comerciais ou histórico de chat com assistentes para executar a análise.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Preparar texto para análise
    let analysisText = '';
    
    // Adicionar conversas
    if (conversations.length > 0) {
      analysisText += conversations
        .map(conv => {
          const contactName = conv.contact_name || conv.participant_name || 'Contato';
          const content = conv.last_message || conv.content || `Conversa registrada em ${new Date(conv.created_at).toLocaleString('pt-BR')}`;
          return `[${contactName}]: ${content}`;
        })
        .join('\n') + '\n';
    }

    // Adicionar histórico de chat
    if (chatHistory.length > 0) {
      analysisText += chatHistory
        .map(chat => {
          return `[Usuário]: ${chat.user_message}\n[Assistente ${chat.assistant_id}]: ${chat.assistant_response}`;
        })
        .join('\n');
    }

    console.log(`📝 Texto preparado para análise: ${analysisText.length} caracteres`);

    if (analysisText.length === 0) {
      console.log('❌ Texto vazio para análise');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Dados insuficientes para análise - conteúdo vazio' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const insights = [];
    const assistantsUsed = [];
    const startTime = Date.now();

    // Processar com TODOS os assistentes configurados
    for (const assistant of assistants) {
      try {
        console.log(`🔄 Processando com ${assistant.name} (${assistant.model}) - Área: ${assistant.area}...`);

        const systemPrompt = `${assistant.prompt}

CONTEXTO DE ANÁLISE:
- Você é o assistente "${assistant.name}" especializado em "${assistant.area}"
- Sua função é analisar os dados reais do usuário e gerar insights específicos
- Foque na sua área de especialização: ${assistant.area}

INSTRUÇÕES ESPECÍFICAS:
- Analise os dados fornecidos (conversas e histórico de chat)
- Gere insights práticos e acionáveis baseados APENAS nos dados reais
- Seja objetivo e construtivo  
- Máximo 200 palavras
- Responda sempre em português brasileiro
- Identifique padrões comportamentais relevantes à sua área

DADOS REAIS PARA ANÁLISE:
${analysisText.substring(0, 3000)}`;

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
              { role: 'user', content: `Analise os dados reais e gere insights específicos para a área de ${assistant.area}.` }
            ],
            temperature: openaiConfig.temperature || 0.5,
            max_tokens: Math.min(openaiConfig.maxTokens || 250, 500),
          }),
        });

        console.log(`📥 Resposta OpenAI para ${assistant.name}: Status ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Erro OpenAI para ${assistant.name}:`, response.status, errorText);
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

    // SEMPRE EXIGIR INSIGHTS REAIS DOS ASSISTENTES
    if (insights.length === 0) {
      console.log('❌ Nenhum insight gerado pelos assistentes');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Nenhum insight foi gerado pelos assistentes. Verifique a configuração da OpenAI e os dados disponíveis.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Salvar insights no banco usando as colunas corretas
    console.log('💾 Salvando insights no banco de dados...');
    
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
            conversations_analyzed: conversations.length,
            chat_history_analyzed: chatHistory.length,
            total_data_sources: totalDataSources
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

    const processingTime = Date.now() - startTime;
    
    console.log('✅ Análise concluída:', {
      insightsGenerated: insights.length,
      assistantsUsed: assistantsUsed.length,
      processingTime: `${processingTime}ms`,
      conversationsAnalyzed: conversations.length,
      chatHistoryAnalyzed: chatHistory.length,
      totalDataSources: totalDataSources
    });

    return new Response(
      JSON.stringify({
        success: true,
        insights: insights,
        assistantsUsed: assistantsUsed,
        processingTime: processingTime,
        conversationsAnalyzed: conversations.length,
        chatHistoryAnalyzed: chatHistory.length,
        totalDataSources: totalDataSources,
        message: `Análise concluída com ${insights.length} insights gerados por ${assistantsUsed.length} assistentes baseados em dados reais`
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
