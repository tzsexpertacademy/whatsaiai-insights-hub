
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 ANÁLISE INDIVIDUAL DE CONVERSA - Iniciando...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody = await req.json();
    console.log('📊 Dados recebidos:', JSON.stringify(requestBody, null, 2));

    const {
      conversation_id,
      messages,
      analysis_prompt,
      analysis_type,
      assistant_id,
      contact_info
    } = requestBody;

    // Validações básicas
    if (!conversation_id) {
      console.error('❌ conversation_id obrigatório');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'conversation_id é obrigatório' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('❌ Mensagens inválidas ou vazias');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Mensagens da conversa são obrigatórias e devem ser um array não vazio' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!analysis_prompt) {
      console.error('❌ analysis_prompt obrigatório');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'analysis_prompt é obrigatório' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar configuração do usuário via header Authorization
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('❌ Token de autorização obrigatório');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Token de autorização obrigatório' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decodificar token para obter user_id
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error('❌ Erro ao verificar usuário:', userError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Usuário não autenticado' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;
    console.log('👤 Usuário autenticado:', userId);

    // Buscar configuração OpenAI do usuário
    const { data: configData, error: configError } = await supabaseClient
      .from('client_configs')
      .select('openai_config')
      .eq('user_id', userId)
      .single();

    if (configError || !configData?.openai_config?.apiKey) {
      console.error('❌ Configuração OpenAI não encontrada:', configError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Configuração da OpenAI não encontrada. Configure sua API key no painel de configurações.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiConfig = configData.openai_config;
    console.log('🔑 Configuração OpenAI encontrada');

    // Preparar texto da conversa para análise
    const conversationText = messages
      .filter(msg => msg.text && msg.text.trim() !== '' && msg.text !== 'Mensagem sem texto')
      .map(msg => {
        const sender = msg.fromMe ? 'Usuário' : (contact_info?.name || 'Contato');
        return `[${sender}]: ${msg.text}`;
      })
      .join('\n');

    console.log('📝 Texto preparado para análise:', {
      totalMessages: messages.length,
      validMessages: conversationText.split('\n').length,
      textLength: conversationText.length,
      firstChars: conversationText.substring(0, 100)
    });

    if (conversationText.length === 0) {
      console.error('❌ Nenhuma mensagem válida para análise');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Nenhuma mensagem válida encontrada para análise' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Chamar OpenAI para análise
    console.log('🧠 Iniciando análise com OpenAI...');
    console.log('📋 Prompt de análise:', analysis_prompt.substring(0, 200) + '...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: analysis_prompt
          },
          {
            role: 'user',
            content: `Analise esta conversa do WhatsApp:\n\n${conversationText}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    console.log('🔄 Resposta da OpenAI - Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da OpenAI:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Erro da OpenAI (${response.status}): ${errorText}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await response.json();
    console.log('📊 Dados da IA recebidos:', {
      hasChoices: !!aiData.choices,
      choicesLength: aiData.choices?.length || 0
    });

    const analysisResult = aiData.choices?.[0]?.message?.content;

    if (!analysisResult) {
      console.error('❌ Resposta vazia da OpenAI');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Resposta vazia da OpenAI' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Análise gerada com sucesso - Tamanho:', analysisResult.length);

    // Salvar insight gerado
    const insightData = {
      user_id: userId,
      title: `Análise: ${contact_info?.name || 'Conversa'}`,
      description: analysisResult.substring(0, 200) + (analysisResult.length > 200 ? '...' : ''),
      content: analysisResult,
      category: analysis_type || 'geral',
      insight_type: analysis_type || 'geral',
      priority: 'medium',
      status: 'active',
      metadata: {
        conversation_id,
        assistant_id,
        analysis_type,
        contact_info,
        generated_at: new Date().toISOString()
      }
    };

    console.log('💾 Salvando insight...');
    const { data: savedInsight, error: insightError } = await supabaseClient
      .from('insights')
      .insert(insightData)
      .select()
      .single();

    if (insightError) {
      console.error('❌ Erro ao salvar insight:', insightError);
    } else {
      console.log('✅ Insight salvo com sucesso:', savedInsight?.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        insights: [{
          id: savedInsight?.id || 'temp',
          title: insightData.title,
          description: insightData.description,
          content: analysisResult,
          priority: 'medium',
          insight_type: analysis_type || 'geral'
        }],
        message: 'Análise concluída com sucesso'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro geral na análise:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Erro interno: ${error.message || 'Erro desconhecido'}`
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
